// Sector Rebound: CI-generated Android package attestation (public metadata only).
// Read-only. Never installs APKs, reads private keystores, or declares upgrade safety.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PACKAGE_ID, parseBadging, parseSigner } from './android-update-preflight.mjs';

export const OFFLINE_ASSETS = Object.freeze([
  'game.js','index.html','style.css','scored-match.js','dossier.js','save-backup.js'
]);
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const run = (cmd,args,opts={}) => execFileSync(cmd,args,{
  maxBuffer:16*1024*1024,timeout:30000,windowsHide:true,
  stdio:['ignore','pipe','pipe'],...opts
});
const text = (cmd,args) => run(cmd,args,{encoding:'utf8'});
export function zipEntries(output) {
  const entries=String(output).split(/\r?\n/).filter(Boolean);
  if (!entries.length) throw Error('EMPTY_ZIP_FILE_LIST');
  return entries;
}
export function assertAssetEntries(entries,prefix) {
  for(const name of OFFLINE_ASSETS) {
    const key=prefix+name;
    assert.equal(entries.filter(entry=>entry===key).length,1,'Missing or duplicate packaged asset: '+key);
  }
  return true;
}
export function verifyIdentity(actual,expectedCode,expectedName,signer) {
  assert.equal(actual.packageId,PACKAGE_ID,'Unexpected Android package identity');
  assert.equal(actual.versionCode,expectedCode,'Packaged versionCode differs from current source');
  assert.equal(actual.versionName,expectedName,'Packaged versionName differs from current source');
  assert.match(signer,/^[a-f0-9]{64}$/,'Verified signer digest must be available');
}
function sdkTool(name) {
  const sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT;
  if(!sdk)throw Error('ANDROID_SDK_NOT_CONFIGURED');
  const loc=path.join(sdk,'build-tools','35.0.0',name);
  if(!fs.existsSync(loc))throw Error('OFFICIAL_SDK_TOOL_NOT_FOUND_'+name);
  return loc;
}
function parseGradleVersion(src){
  const code=src.match(/^\s*def defaultPreviewVersionCode\s*=\s*(\d+)\s*$/m)?.[1];
  const name=src.match(/^\s*def defaultPreviewVersionName\s*=\s*'([^']+)'\s*$/m)?.[1];
  assert.ok(code&&name,'Expected version metadata missing from Android Gradle source');
  return {code:Number(code),name};
}
function readZipMember(zip,member){
  return run('unzip',['-p',zip,member]);
}
export function attest({apk='android/app/build/outputs/apk/debug/app-debug.apk',
                         aab='android/app/build/outputs/bundle/release/app-release.aab'}={}) {
  assert.ok(fs.statSync(apk).isFile()&&fs.statSync(apk).size>0,'Missing actual debug APK');
  assert.ok(fs.statSync(aab).isFile()&&fs.statSync(aab).size>0,'Missing actual unsigned AAB');
  const gradle=parseGradleVersion(fs.readFileSync('android/app/build.gradle','utf8'));
  const metadata=parseBadging(text(sdkTool('aapt'),['dump','badging',apk]));
  const signer=parseSigner(text(sdkTool('apksigner'),
    ['verify','--min-sdk-version','26','--print-certs',apk]));
  verifyIdentity(metadata,gradle.code,gradle.name,signer);
  const apkEntries=zipEntries(text('unzip',['-Z1',apk]));
  const aabEntries=zipEntries(text('unzip',['-Z1',aab]));
  assertAssetEntries(apkEntries,'assets/');
  assertAssetEntries(aabEntries,'base/assets/');
  const embedded=[];
  for(const name of OFFLINE_ASSETS){
    const web=fs.readFileSync(path.join('web',name));
    const android=fs.readFileSync(path.join('android/app/src/main/assets',name));
    const inApk=readZipMember(apk,'assets/'+name);
    const inAab=readZipMember(aab,'base/assets/'+name);
    assert.ok(web.equals(android),'Web/Android on-disk mismatch for '+name);
    assert.ok(web.equals(inApk),'Real APK packaged asset mismatch for '+name);
    assert.ok(web.equals(inAab),'Real unsigned AAB packaged asset mismatch for '+name);
    embedded.push({name,sha256:sha256(web),bytes:web.length});
  }
  const nativeLibraries=apkEntries.filter(x=>x.endsWith('.so'));
  const report={
    schemaVersion:1,
    type:'SECTOR_REBOUND_DEBUG_PACKAGE_ATTESTATION',
    sourceCommit:process.env.GITHUB_SHA||null,
    build:{
      packageId:metadata.packageId,versionCode:metadata.versionCode,versionName:metadata.versionName,
      targetApiSource:Number(fs.readFileSync('android/app/build.gradle','utf8').match(/targetSdk\s+(\d+)/)?.[1]||0)
    },
    realDebugApk:{
      sha256:sha256(fs.readFileSync(apk)),bytes:fs.statSync(apk).size,
      verifiedPublicCertificateSha256:signer,
      nativeLibraryCount:nativeLibraries.length,
      caveat:'CI debug signer only: device-installed signing certificate is UNKNOWN'
    },
    unsignedAab:{
      sha256:sha256(fs.readFileSync(aab)),bytes:fs.statSync(aab).size,
      caveat:'Bundle content checked; upload/Play signing and install readiness NOT verified'
    },
    embeddedGameAssets:embedded,
    sourceVsAndroidVsApkVsAab:'BYTE_IDENTICAL',
    installedDeviceDataVerified:false,
    realPhoneUpgradeVerified:false,
    realTwoPhoneLanVerified:false,
    decision:'PACKAGE_PROVENANCE_PASS_ONLY; NOT AN UPDATE-SAFETY OR GOOGLE PLAY RELEASE APPROVAL'
  };
  fs.mkdirSync('qa-results',{recursive:true});
  fs.writeFileSync('qa-results/android-ci-package-attestation.json',JSON.stringify(report,null,2)+'\n');
  return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const r=attest();
    console.log('ANDROID_PACKAGE_ATTESTATION_PASS '+JSON.stringify({
      source:r.sourceCommit,apk:r.realDebugApk.sha256,signer:r.realDebugApk.verifiedPublicCertificateSha256,
      assets:r.embeddedGameAssets.length,versionCode:r.build.versionCode,upgradeVerified:false
    }));
  }catch(e){
    console.error('ANDROID_PACKAGE_ATTESTATION_NO_GO '+String(e.message||e));
    process.exitCode=2;
  }
}

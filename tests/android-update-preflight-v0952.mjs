// No Android device needed: pure fail-closed APK update decision tests.
// Cryptographic verification uses Android SDK apksigner in the separate CI job.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
 PACKAGE_ID, parseBadging, parseSigner, parseInstalledPaths,
 assessUpdate, parseArguments, printInstructions
} from '../tools/android-update-preflight.mjs';

const a = 'a'.repeat(64), b = 'b'.repeat(64);
const apk = (versionCode, signer=a, packageId=PACKAGE_ID) => ({
 versionCode, signer, packageId, versionName:'v'+versionCode
});
assert.deepEqual(parseBadging("package: name='com.playereden.ricochetrumble' versionCode='49' versionName='test-49'\n"),
 {packageId:PACKAGE_ID,versionCode:49,versionName:'test-49'});
assert.equal(parseSigner('Signer #1 certificate SHA-256 digest: ' + a.toUpperCase()),a);
assert.equal(parseSigner('Signer #1 certificate SHA-256 digest: '+a.match(/../g).join(':')),a);
for(const invalid of [
 '', 'Signer #1 certificate SHA-256 digest: wrong',
 'Signer #1 certificate SHA-256 digest: '+a+'\nSigner #2 certificate SHA-256 digest: '+b
])assert.throws(()=>parseSigner(invalid),/SIGNER_CERTIFICATE_UNAVAILABLE_OR_MULTIPLE/);
for(const invalid of ['', 'package: name=\'x\' versionCode=\'NaN\'', 'package: name=\'x\' versionCode=\'0\''])
 assert.throws(()=>parseBadging(invalid),/INVALID_APK_PACKAGE_METADATA/);
assert.deepEqual(parseInstalledPaths('package:/data/app/~~abc/base.apk\npackage:/data/app/~~abc/split.apk'),[
 '/data/app/~~abc/base.apk','/data/app/~~abc/split.apk'
]);
assert.deepEqual(parseInstalledPaths(''),[]);
assert.throws(()=>parseInstalledPaths('Error: device offline'),/UNRECOGNIZED_ANDROID_PACKAGE_PATH_RESPONSE/);

const pair=(c,prev,allowFresh=false)=>assessUpdate(c,prev,{allowFresh});
assert.equal(pair(apk(49),apk(48)).reason,'STRICT_CERT_AND_VERSION_MATCH');
assert.equal(pair(apk(49,b),apk(48)).reason,'SIGNING_CERTIFICATE_MISMATCH_DO_NOT_UNINSTALL');
assert.equal(pair(apk(49),apk(49)).reason,'CANDIDATE_VERSION_CODE_NOT_HIGHER');
assert.equal(pair(apk(47),apk(48)).reason,'CANDIDATE_VERSION_CODE_NOT_HIGHER');
assert.equal(pair(apk(49),null).reason,'NO_PREVIOUS_APK_VERIFIED');
assert.equal(pair(apk(49),null,true).reason,'FRESH_INSTALL_ONLY_NO_EXISTING_PACKAGE');
assert.equal(pair(apk(49),apk(48),true).reason,'FRESH_INSTALL_REQUEST_BUT_PACKAGE_ALREADY_INSTALLED');
assert.equal(pair(apk(49),apk(48,b,'com.fake.app')).reason,'PREVIOUS_PACKAGE_ID_MISMATCH');
assert.equal(pair(apk(49,a,'com.fake.app'),apk(48)).reason,'CANDIDATE_PACKAGE_ID_MISMATCH');
assert.equal(pair(apk(49,null),apk(48)).reason,'SIGNER_CERTIFICATE_UNKNOWN');
assert.equal(pair(apk(49),apk(48,null)).reason,'SIGNER_CERTIFICATE_UNKNOWN');
assert.equal(pair(apk(49),apk(48)).ok,true);
for(const verdict of [
 pair(apk(49,b),apk(48)),pair(apk(49),apk(49)),pair(apk(49),null)
])assert.equal(verdict.ok,false);
assert.deepEqual(parseArguments(['--candidate','new.apk','--previous','old.apk']),{
 '--candidate':'new.apk','--previous':'old.apk'
});
assert.deepEqual(parseArguments(['--candidate','new.apk','--serial','Z123']),{
 '--candidate':'new.apk','--serial':'Z123'
});
assert.equal(parseArguments(['--help']).help,true);
assert.equal(parseArguments(['--candidate','new.apk','--fresh-install']).freshInstall,true);
for(const argv of [
 [],['--candidate'],['--candidate','new.apk','--previous'],
 ['--candidate','new.apk','--fresh-install','--previous','old.apk'],
 ['--candidate','new.apk','--serial','A','--previous','old.apk'],
 ['--candidate','new.apk','--candidate','other.apk'],
 ['--candidate','new.apk','--ignore-certificate']
])assert.throws(()=>parseArguments(argv));
assert.ok(printInstructions().includes('READ-ONLY'));
assert.ok(printInstructions().includes('does not guarantee local saves'));
const cli = fileURLToPath(new URL('../tools/android-update-preflight.mjs',import.meta.url));
const run = spawnSync(process.execPath,[cli,'--candidate','/not-a-real-signed-apk.apk'],
 {encoding:'utf8'});
assert.equal(run.status,2,'cannot validate missing candidate => fail closed');
assert.ok(run.stderr.includes('PREFLIGHT_NO_GO'),'missing input does not silently approve');
const source=await import('node:fs').then(x=>x.readFileSync(cli,'utf8'));
assert.ok(!/execFileSync\s*\(\s*['"]adb['"]\s*,\s*\[[^\]]*\binstall\b/.test(source),
 'preflight may NEVER install an app');
console.log('PASS v0.9.52: strict package/certificate/monotonic version contract, malformed APK metadata, offline ADB failure, read-only path and CLI failure all protected.');

#!/usr/bin/env node
/* Audit ORIGINAL GitHub release APKs, not rebuilt binaries.
 * Signing CERTIFICATE DIGESTS are public; private keystores are never accessed.
 * Does NOT infer the signature on a user's currently installed APK. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const expected=[
 {tag:'v0.9.32-vehicle-precision-test',file:'sector-rebound-v0.9.32-vehicle-precision-debug.apk'},
 {tag:'v0.9.37-scored-quick-play-test',file:'sector-rebound-v0.9.37-scored-quick-play-debug.apk'},
 {tag:'v0.9.39-player-dossier-test',file:'sector-rebound-v0.9.39-player-dossier-debug.apk'},
 {tag:'v0.9.40-upgrade-readiness-test',file:'sector-rebound-v0.9.40-upgrade-readiness-debug.apk'}
];
const EXPECTED_PACKAGE='com.playereden.ricochetrumble';
function parseCertificate(output){
 const matches=[...output.matchAll(/Signer\s*#\s*1\s*certificate\s*SHA-256\s*digest\s*:\s*([a-fA-F0-9:]+)/gi)];
 if(matches.length!==1)throw Error('Missing/ambiguous public SHA-256 signing certificate fingerprint');
 const fingerprint=matches[0][1].replace(/:/g,'').toLowerCase();
 if(!/^[0-9a-f]{64}$/.test(fingerprint))throw Error('Malformed signing SHA-256 certificate fingerprint');
 const other=[...output.matchAll(/Signer\s*#\s*(\d+)\s*certificate\s*SHA-256\s*digest/gi)].map(m=>Number(m[1]));
 if(other.some(n=>n!==1))throw Error('Multiple signers require explicit manual inspection');
 return fingerprint;
}
function parsePackage(output){
 const line=output.split(/\r?\n/).find(l=>/^package:\s+name=/.test(l));
 if(!line)throw Error('No package metadata in aapt badging');
 const get=k=>line.match(new RegExp(k+"='([^']*)'"))?.[1];
 const name=get('name'),versionCode=Number(get('versionCode')),versionName=get('versionName');
 if(!name||!Number.isSafeInteger(versionCode)||versionCode<1||!versionName)throw Error('Invalid APK package/version metadata');
 return {packageName:name,versionCode,versionName};
}
function manifestDigest(raw,name){
 const matches=raw.split(/\r?\n/).map(line=>line.trim().match(/^([a-fA-F0-9]{64})\s+\*?(.+)$/)).filter(Boolean);
 const specific=matches.filter(x=>path.basename(x[2])===name);
 if(specific.length!==1)throw Error('Checksum manifest has no unique entry for '+name);
 return specific[0][1].toLowerCase();
}
function analyze(inputDir){
 const records=[];
 for(const x of expected){
  const base=path.join(inputDir,x.tag);
  const cert=parseCertificate(fs.readFileSync(path.join(base,'certificate.txt'),'utf8'));
  const pkg=parsePackage(fs.readFileSync(path.join(base,'package.txt'),'utf8'));
  const apkSHA=fs.readFileSync(path.join(base,'apk-sha256.txt'),'utf8').trim().toLowerCase();
  const expectedSHA=manifestDigest(fs.readFileSync(path.join(base,'release-sha256.txt'),'utf8'),x.file);
  if(!/^[0-9a-f]{64}$/.test(apkSHA)||apkSHA!==expectedSHA)throw Error('Published asset hash mismatch '+x.tag);
  if(pkg.packageName!==EXPECTED_PACKAGE)throw Error('Unexpected installed application ID on '+x.tag+': '+pkg.packageName);
  records.push({...x,...pkg,certificateSHA256:cert,apkSHA256:apkSHA,
   source:'original immutable GitHub prerelease asset, apksigner verify --print-certs, aapt dump badging'});
 }
 const target=records.at(-1);
 const comparisons=records.slice(0,-1).map(old=>({
  from:old.tag,to:target.tag,signingCertificateMatches:old.certificateSHA256===target.certificateSHA256,
  versionCodeIncreases:target.versionCode>old.versionCode,
  packageMatches:old.packageName===target.packageName,
  updatePreflightCompatible:old.certificateSHA256===target.certificateSHA256&&target.versionCode>old.versionCode&&old.packageName===target.packageName,
  note:'APK-to-APK preflight only; user installed APK, Android device/ABI and data lifecycle have not been inspected'
 }));
 const report={schemaVersion:1,scope:'Archived public debug APKs. Not private key, installed app or real Android upgrade test',
  status:'AUTOMATED_CERTIFICATE_AND_VERSION_EVIDENCE_ONLY',expectedPackage:EXPECTED_PACKAGE,
  records,comparisons,manualStillRequired:[
   'Read certificate of APK currently installed on owner phone and compare with exact candidate',
   'Actual in-place install/update with data before/after on Android; NO uninstall to test update',
   'Owner-controlled durable upload signing key, Play App Signing and signed production AAB',
   'Old builds before v0.9.40 cannot export data through its new Backup UI'
  ]};
 const out='qa-results/apk-certificate-continuity-v0942.json';
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log('APK_CERTIFICATE_AUDIT '+JSON.stringify({records:records.map(x=>({tag:x.tag,package:x.packageName,code:x.versionCode,version:x.versionName,certificateSHA256:x.certificateSHA256})),comparisons}));
 return report;
}
function selfTest(){
 const sample='Signer #1 certificate DN: CN=Android Debug\nSigner #1 certificate SHA-256 digest: '+'ab'.repeat(32);
 assert.equal(parseCertificate(sample),'ab'.repeat(32));
 assert.equal(parseCertificate('Signer #1 certificate SHA-256 digest: '+('AB:'.repeat(31)+'AB')),'ab'.repeat(32));
 assert.throws(()=>parseCertificate('Signer #1 certificate SHA-1 digest: abc'));
 assert.throws(()=>parseCertificate(sample+'\nSigner #2 certificate SHA-256 digest: '+'cd'.repeat(32)));
 const p=parsePackage("package: name='com.playereden.ricochetrumble' versionCode='40' versionName='0.9.40-upgrade-test'");
 assert.equal(p.packageName,EXPECTED_PACKAGE);assert.equal(p.versionCode,40);assert.equal(p.versionName,'0.9.40-upgrade-test');
 assert.equal(manifestDigest('ab'.repeat(32)+'  folder/the.apk\n','the.apk'),'ab'.repeat(32));
 assert.throws(()=>manifestDigest('ab'.repeat(32)+'  wrong.apk\n','the.apk'));
 console.log('PASS certificate parser: exact signer identity, package metadata, source hash manifest and fail-closed malformed examples');
}
if(process.argv.includes('--self-test'))selfTest();
else{
 const index=process.argv.indexOf('--input');
 if(index<0||!process.argv[index+1])throw Error('Usage: node tools/audit-apk-certificate-continuity.mjs --input <path>');
 analyze(process.argv[index+1]);
}

// Keep install identity/version and upload-signing boundary reproducible.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const gradle=fs.readFileSync('android/app/build.gradle','utf8');
const manifest=fs.readFileSync('android/app/src/main/AndroidManifest.xml','utf8');
const identity='com.playereden.ricochetrumble';
assert.ok(gradle.includes("namespace '"+identity+"'"));
assert.ok(gradle.includes("applicationId '"+identity+"'"),'do not rename installed package');
assert.ok(gradle.includes('versionCode 46'),'must advance versionCode from old debug code 38');
assert.ok(gradle.includes("versionName '0.9.45.1-pilot-motion-test'"),'release tag and app name agree');
assert.ok(manifest.includes('android:label="Sector Rebound"'));
assert.ok(manifest.includes('android:allowBackup="false"'),'no automatic OS backup enabled before privacy review');
assert.ok(manifest.includes('android:usesCleartextTraffic="false"'));
for(const key of ['SR_UPLOAD_STORE_FILE','SR_UPLOAD_STORE_PASSWORD','SR_UPLOAD_KEY_ALIAS','SR_UPLOAD_KEY_PASSWORD','SR_TEST_STORE_FILE','SR_TEST_STORE_PASSWORD','SR_TEST_KEY_ALIAS','SR_TEST_KEY_PASSWORD'])
 assert.ok(gradle.includes(key),'upload signer is external only');
assert.ok(gradle.includes("throw new GradleException('Incomplete external upload signing configuration')"));
assert.ok(gradle.includes("throw new GradleException('Incomplete private TEST APK signing configuration')"));
assert.ok(gradle.includes('if (hasTestSigning) signingConfig signingConfigs.internalTest'));
assert.ok(gradle.includes('if (hasUploadSigning) signingConfig signingConfigs.releaseUpload'));
assert.ok(!gradle.includes('debug { signingConfig signingConfigs.releaseUpload'));

assert.ok(!gradle.includes("storePassword '")&&!gradle.includes("keyPassword '"),'no hardcoded secret');
assert.equal(fs.readFileSync('web/save-backup.js','utf8'),fs.readFileSync('android/app/src/main/assets/save-backup.js','utf8'));
assert.equal(fs.readFileSync('web/dossier.js','utf8'),fs.readFileSync('android/app/src/main/assets/dossier.js','utf8'));
for(const p of ['web/index.html','android/app/src/main/assets/index.html']){
 const html=fs.readFileSync(p,'utf8');
 assert.ok(html.includes('<script src="save-backup.js"></script>'));
 assert.ok(html.includes('data-action="backup-export"'));
 assert.ok(html.includes('data-action="backup-preview"'));
 assert.ok(html.includes('data-action="backup-restore"'));
}
console.log('PASS v0.9.40 Android package identity, monotonic version, fail-closed upload signing and backup module parity.');

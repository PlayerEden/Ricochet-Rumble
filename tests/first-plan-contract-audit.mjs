/* Cross-system first-development-plan audit — source contract and documentary evidence.
 * This is not a replacement for physical Android tests or owner acceptance. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8'),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const checks=[],manual=[];
function pass(name,detail){checks.push({name,status:'AUTOMATED_PASS',detail});}
function blocked(name,detail){manual.push({name,status:'MANUAL_PENDING',detail});}
const mirrored=['game.js','scored-match.js','dossier.js','save-backup.js','index.html','style.css'];
for(const file of mirrored){
 const web='web/'+file,android='android/app/src/main/assets/'+file;
 assert.equal(read(web),read(android),'Web/Android diverged: '+file);
 pass('Mirrored player asset: '+file,sha(web));
}
const html=read('web/index.html'),game=read('web/game.js'),manifest=read('android/app/src/main/AndroidManifest.xml'),
 gradle=read('android/app/build.gradle'),main=read('android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java');
const scripts=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(scripts,['save-backup.js','dossier.js','scored-match.js','game.js'],'scripts and dependency order');
pass('Correct offline gameplay script bundle',scripts.join(', '));
for(const id of ['solo','cqc','scored_ffa','scored_tdm','custom','nearby','dossier','settings']){
 assert.ok(html.includes('data-action="'+id+'"'),'missing real button '+id);
}
pass('All five playable offline mode entry points and nearby/LAN menu', 'Real menu action selectors exist; browser QA verifies behaviors');
for(const id of ['survival_ffa','survival_teams']){
 const tag=html.match(new RegExp('<input[^>]+data-playlist-mode="'+id+'"[^>]*>'))?.[0];
 assert.ok(tag&&/\schecked\b/.test(tag),'Survival default missing '+id);
}
for(const id of ['cqc','scored_ffa','scored_tdm']){
 const tag=html.match(new RegExp('<input[^>]+data-playlist-mode="'+id+'"[^>]*>'))?.[0];
 assert.ok(tag&&!/\schecked\b/.test(tag),'Scored mode must remain opt-in '+id);
}
pass('Legacy Survival-only Quick Play defaults and scored opt-in','2 checked legacy, 3 unchecked scoring trials');
for(const s of ['data-action="custom-preset-save"','data-action="custom-preset-load"','data-action="custom-preset-delete"','data-action="custom-reset"',
 'data-action="backup-export"','data-action="backup-preview"','data-action="backup-restore"'])
 assert.ok(html.includes(s),'missing interactive action '+s);
pass('Custom presets and manual backup/restore UI present','Buttons wired to registered handlers, validated in full Chromium QA');
const icons=JSON.parse(read('game-data/cosmetics/pilot_icons.v1.json'));
assert.equal(icons.authorizedForRuntime,false,'unapproved cosmetic catalog must not become player inventory');
assert.ok(icons.cosmetics.length>0);
assert.ok(icons.cosmetics.every(c=>c.selectable!==true),'concept-only cosmetics must not be selectable');
pass('Cosmetic economy remains concept-only',icons.cosmetics.length+' proposed assets, zero authorized');
const pkg='com.playereden.ricochetrumble';
assert.ok(gradle.includes("applicationId '"+pkg+"'"));assert.ok(gradle.includes("namespace '"+pkg+"'"));
assert.ok(gradle.includes('versionCode 48'));assert.ok(gradle.includes("versionName '0.9.51-corridor-prototype'"));
assert.ok(manifest.includes('android:label="Sector Rebound"'));
assert.ok(manifest.includes('android:allowBackup="false"'));
assert.ok(manifest.includes('android:usesCleartextTraffic="false"'));
assert.ok(manifest.includes('android:screenOrientation="sensorLandscape"'));
const auditedCode=Number(gradle.match(/versionCode\s+(\d+)/)?.[1]);
const auditedName=gradle.match(/versionName\s+'([^']+)'/)?.[1];
assert.ok(Number.isInteger(auditedCode)&&auditedCode>0&&auditedName,'installed version metadata must be parseable');
pass('Android app identity, version, backup posture and landscape',pkg+' / '+auditedName+' / code '+auditedCode);
for(const k of ['SR_UPLOAD_STORE_FILE','SR_UPLOAD_STORE_PASSWORD','SR_UPLOAD_KEY_ALIAS','SR_UPLOAD_KEY_PASSWORD','SR_TEST_STORE_FILE','SR_TEST_STORE_PASSWORD','SR_TEST_KEY_ALIAS','SR_TEST_KEY_PASSWORD'])
 assert.ok(gradle.includes(k));
assert.ok(!/storePassword\s+['"]|keyPassword\s+['"]/.test(gradle),'hardcoded signing credential');
assert.ok(gradle.includes('Incomplete external upload signing configuration'));
pass('Separate production-upload and owner-private test-signing source guards','external env credentials only; release bundle unverified as production signed');
for(const i of ['hostGame','findGames','joinGame','stopNetwork','sendPacket'])assert.ok(main.includes('@JavascriptInterface public void '+i+'('));
assert.ok(main.includes('web.getSettings().setAllowUniversalAccessFromFileURLs(false)'));
assert.ok(main.includes('web.getSettings().setAllowFileAccessFromFileURLs(false)'));
assert.ok(main.includes('web.getSettings().setBlockNetworkLoads(true)'));
assert.ok(main.includes('web.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW)'));
pass('Android offline WebView/LAN bridge and security toggles','LAN bridge present; physical device and security review still open');
for(const k of ['rr-options-v06','rr-custom-v1','rr-custom-presets-v1','rr-dossier-v1'])
 assert.ok(read('web/save-backup.js').includes(k));
assert.ok(read('web/save-backup.js').includes('rr-restore-recovery-v1'));
pass('Four independent local stores with recovery snapshot','Backup parser and failure cases separately verified by tests/save-backup.mjs');
const rd=read('web/dossier.js');assert.ok(rd.includes("const KEY='rr-dossier-v1'"));assert.ok(rd.includes('record(result,key)'));
pass('No invented remote account or player cosmetic inventory','Dossier is device-local, based on final match results');
for(const [name,detail] of [
 ['Owner physical install, touch accuracy, sound and frame pacing','Manual Android 740x360+ landscape, thermal/long session, controls, pilot silhouette, audio focus, app pause/resume; never simulated by CI'],
 ['Upgrade signer compatibility and existing v0.9.39 data','Old builds lack backup export, and new debug certificate may differ; compare real APK certificates and perform safe upgrade/restore'],
 ['Two-phone same-Wi-Fi LAN acceptance','Physical devices must verify NSD discovery, join by IP, gameplay sync, ejection/score and disconnect/reconnect'],
 ['Owner decision for v1 scope and visual/audio polish','Choose LAN must-have vs offline-first launch; inspect pilot art, accessibility, sound/music and match feel on actual devices'],
 ['Production signing, Play Console and privacy','No release upload key, signed AAB, verified developer package registration, public privacy policy, Data safety, store listing or account verification established'],
 ['Final integrated merge/release candidate','Multiple dependent experimental PRs remain unmerged; live dependency graph, owner approval and release-tagged rollback required']
 ])blocked(name,detail);
const report={schemaVersion:1,audit:'First development plan cross-system source and automated-contract audit',
 scope:'Current source-validated experimental development branch; not stable main and not a Play production build',
 mode:'source contract plus prior independent gameplay/Chromium/Android and natural-bot evidence',
 checks,manual,summary:{automatedPass:checks.length,automatedFail:0,manualPending:manual.length,releaseDecision:'NO_GO_PENDING_MANUAL_AND_SIGNING'},
 sourceHash:{game:sha('web/game.js'),androidGradle:sha('android/app/build.gradle'),offlineBackup:sha('web/save-backup.js')}};
fs.mkdirSync('qa-results',{recursive:true});
fs.writeFileSync('qa-results/first-plan-contract-audit.json',JSON.stringify(report,null,2)+'\n');
console.log('AUDIT_SUMMARY '+JSON.stringify(report.summary));
console.log('PASS first-plan source contracts: '+checks.length+' automated; '+manual.length+' explicitly unresolved release gates.');

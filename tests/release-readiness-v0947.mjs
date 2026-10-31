// v0.9.47 source-backed integration readiness gate. No game runtime changes.
// Separates executable source contracts from physical Android/Play acceptance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const checks=[],manual=[];
const yes=(name,detail)=>checks.push({name,status:'AUTOMATED_PASS',detail});
const pending=(priority,name,action)=>manual.push({priority,name,status:'PENDING_OR_BLOCKED',requiredEvidence:action});
const files=['game.js','style.css','index.html','scored-match.js','dossier.js','save-backup.js'];
for(const f of files){
 const web='web/'+f,app='android/app/src/main/assets/'+f;
 assert.equal(read(web),read(app),'Web/Android asset mismatch: '+f);
 yes('Mirrored offline asset '+f,hash(web));
}
const game=read('web/game.js'),html=read('web/index.html'),style=read('web/style.css');
const gradle=read('android/app/build.gradle'),manifest=read('android/app/src/main/AndroidManifest.xml');
const ver=Number(gradle.match(/versionCode\s+(\d+)/)?.[1]),name=gradle.match(/versionName\s+'([^']+)'/)?.[1];
assert.ok(Number.isInteger(ver)&&ver>=47,'Android versionCode must be >= prior v0.9.46 test');
assert.ok(name&&/^\d+\.\d+\.\d+(?:-[a-z0-9][a-z0-9.-]*)?$/.test(name),'Android versionName must be a valid explicit release or prerelease identifier');
assert.ok(gradle.includes("applicationId 'com.playereden.ricochetrumble'"),'Android package must not silently change');
assert.ok(manifest.includes('android:allowBackup="false"'));
assert.ok(manifest.includes('android:usesCleartextTraffic="false"'));
yes('Android package identity, monotonic preview metadata and defensive manifest',name+' code '+ver+'; NOT a Play-signed update');
for(const id of ['solo','cqc','scored_ffa','scored_tdm','custom','nearby','dossier','settings'])
 assert.ok(html.includes('data-action="'+id+'"'),'missing real mode/menu action: '+id);
yes('Live menu entry points', 'Survival/Quick Play, CQC, scored FFA, scored TDM, Custom, LAN, Dossier, Settings');
for(const id of ['survival_ffa','survival_teams','cqc','scored_ffa','scored_tdm']){
 const line=html.match(new RegExp('<input[^>]+data-playlist-mode="'+id+'"[^>]*>'))?.[0];
 assert.ok(line,'missing Quick Play selector '+id);
 assert.equal(/\schecked\b/.test(line),id.startsWith('survival_'),'Scored game modes must remain opt-in');
}
yes('Quick Play defaults preserve Survival-only baseline','3 scored options explicitly opt-in');
for(const token of ["const CQC_RULES","const VEHICLE_FFA_RULES","const VEHICLE_TDM_RULES","const SCORED_FFA_VEHICLE_PACE","aimTurnRate:1.8","turnRate:2.6","human:166","bot:136"])
 assert.ok(game.includes(token),'missing scored mode or precision contract: '+token);
yes('Existing scored modes and deliberate ricochet vehicle controls','10/180 CQC, 10/240 FFA, 15/300 TDM; scored tank 166/136 and precision AIM 1.8rad/s');
for(const token of ['FIELDGRID P-03','c.translate(-Math.abs(gait)*.18,gait*.32)','PILOT_MUZZLE_X','PILOT_MUZZLE_Y'])
 assert.ok(game.includes(token),'owner-approved P-03 visual/muzzle contract changed: '+token);
assert.ok(!game.includes('c.fillRect(-25,7,12,9)'),'rejected crawling boots reintroduced');
yes('Owner-locked P-03 design and walking movement contract','No detached boots; centered muzzle and velocity-driven vest sway');
for(const token of ['pauseAudioControls()',"data-action=\"toggle-sound\"","data-action=\"toggle-music\"","if(!comfort.sound)return false","if(!musicGesture||!comfort.music||document.hidden)return"])
 assert.ok(game.includes(token),'audio toggle/persistence contract missing: '+token);
assert.ok(style.includes('.pause-audio button[aria-pressed="true"]'),'pause audio pressed state missing');
yes('Owner-accepted v0.9.46 UI/audio in runtime','Quiet feedback, persisted pause SFX/MUSIC controls and mute gate');
const cosmetic=JSON.parse(read('game-data/cosmetics/pilot_icons.v1.json'));
assert.equal(cosmetic.authorizedForRuntime,false,'concept cosmetics must not become purchasable/equippable');
assert.ok(cosmetic.cosmetics.every(c=>c.selectable!==true));
yes('Cosmetic catalog remains non-shipping concept',String(cosmetic.cosmetics.length)+' non-selectable concepts');
for(const k of ['SR_TEST_STORE_FILE','SR_TEST_STORE_PASSWORD','SR_UPLOAD_STORE_FILE','SR_UPLOAD_STORE_PASSWORD'])
 assert.ok(gradle.includes(k),'missing separate signer env guard '+k);
assert.ok(gradle.includes('Incomplete private TEST APK signing configuration'));
yes('Private TEST vs Play UPLOAD signing declarations isolated','Declared in Gradle; no evidence credentials or upgrade test are configured');
for(const k of ['rr-options-v06','rr-custom-v1','rr-custom-presets-v1','rr-dossier-v1','rr-restore-recovery-v1'])
 assert.ok(read('web/save-backup.js').includes(k),'missing saved-data/restore contract '+k);
yes('Local saved-data and backup source keys','Actual old-APK-to-new-APK migration still physically unverified');
pending('P0','Owner-installed APK continuity','No uninstall: establish actual installed signer/data; owner-private test key; test TWO monotonic same-cert in-place APK upgrades with saved data verified');
pending('P0','Physical Android/gameplay signoff','Real handset sustained gameplay, on-foot/vehicle controls, 5-15 degree bank shots, Android background/resume and audible UX');
pending('P0','Two-phone LAN launch scope','Either pass real two-phone same-Wi-Fi discovery/join/eject/score/disconnect tests OR explicitly remove/defer LAN as launch promise');
pending('P0','Google Play production compliance','Owner-secured Play upload key and signed AAB, Play Console package, privacy policy/Data safety and accurate store disclosure');
pending('P1','Integration of experimental branch chain','Build/review one controlled integration candidate from main with 24-PR dependency graph, reconcile conflicting documentation; owner approval before any merge');
pending('P1','Natural scored match balance after release integration','Repeat measured AI-match fairness and seeded maze trials against final integration source if source logic differs');
pending('P2','Audit metadata hygiene','Retire stale references saying 0.9.40/code40 or nine draft PRs; use current dynamic version and live PR count');
const report={schemaVersion:1,audit:'Sector Rebound v0.9.47 source-level release-readiness gate',scope:'current experimental source branch; static contracts and manual GO/NO-GO verified without any production change',checks,manual,totals:{sourcePass:checks.length,manualGates:manual.length,gameplayCodeChanged:false,releaseDecision:'NO_GO_UNTIL_PHYSICAL_INTEGRATION_AND_SIGNING'},fingerprints:{gameJsSha256:hash('web/game.js'),stylesSha256:hash('web/style.css'),androidGradleSha256:hash('android/app/build.gradle')}};
fs.mkdirSync('qa-results',{recursive:true});
fs.writeFileSync('qa-results/release-readiness-v0947.json',JSON.stringify(report,null,2)+'\n');
console.log('AUDIT_V0947 '+JSON.stringify(report.totals));

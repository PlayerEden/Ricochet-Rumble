// v0.9.47 focused audits, all read-only with respect to game/runtime.
// Invoked by QA-only CI; never changes the Android app, menus, physics or signing.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
const name=process.argv[2];
const root='qa-results/targeted-v0947';
fs.mkdirSync(root,{recursive:true});
const rd=p=>fs.readFileSync(p,'utf8'),same=(a,b)=>assert.equal(rd(a),rd(b),a+' Android mirror divergence');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const check=(s,token,label=token)=>assert.ok(s.includes(token),'Missing '+label);
const execute=(args)=>{const c=spawnSync(process.execPath,args,{encoding:'utf8',timeout:420000,maxBuffer:1024*1024*4});
 fs.writeFileSync(root+'/'+args[0].replaceAll('/','_')+'.log',String(c.stdout||'')+'\n'+String(c.stderr||''));
 if(c.error||c.status!==0)throw new Error('Focused executable check failed: node '+args.join(' ')+'\n'+String(c.stderr||c.stdout).slice(-1200));
 return {command:'node '+args.join(' '),result:'AUTOMATED_PASS'};
};
const save=(n,obj)=>{fs.writeFileSync(root+'/'+n+'.json',JSON.stringify(obj,null,2)+'\n');console.log('FOCUSED_AUDIT '+n+' '+JSON.stringify({result:obj.result,tests:obj.tests?.length,observations:obj.observations?.length}));};
const game=rd('web/game.js'),html=rd('web/index.html'),css=rd('web/style.css');
if(name==='gameplay'){
 const tests=[
 execute(['tests/scored-match-kernel.mjs']),
 execute(['tests/smoke.mjs']),
 execute(['tests/natural-bot-audit.mjs','--seeds=8','--maze-seeds=100','--hz=30','--out='+root+'/natural-match-sample.json'])
 ];
 for(const t of ['const CQC_RULES','const VEHICLE_FFA_RULES','const VEHICLE_TDM_RULES','human:166','bot:136','turnRate:2.6','aimTurnRate:1.8','PILOT_MUZZLE_X','FIELDGRID P-03'])
  check(game,t);
 assert.ok(!game.includes('c.fillRect(-25,7,12,9)'),'Rejected crawling boots have returned');
 const sample=JSON.parse(rd(root+'/natural-match-sample.json'));
 assert.equal(sample.rounds.length,24,'8 rounds each across 3 modes');
 for(const size of ['small','standard','large'])assert.equal(sample.topology[size].unique,100,'non-unique '+size+' maze sample');
 assert.equal(sample.rounds.reduce((a,r)=>a+r.unsafeRespawns,0),0,'unsafe natural respawn');
 assert.ok(sample.rounds.every(r=>r.reason==='score_target'||r.reason==='time_limit'),'simulation did not complete normally');
 save('01-gameplay',{result:'AUTOMATED_PASS',tests,sourceSha256:sha('web/game.js'),sample:{physicsHz:30,rounds:sample.rounds.length,proceduralSeedsBySize:100,modeOverview:sample.overview},observations:[
 {status:'AUTOMATED_PASS',label:'scored modes, procedural connectivity, bot simulations and KO/timeout regression'},
 {status:'MANUAL_PENDING',label:'real finger aim accuracy, on-phone pacing and tank/mech pilot transitions'},
 {status:'LIMITATION',label:'bot-only sample simulates human seat with botInput; not a human-controlled match or broad balance proof'}
 ]});
}else if(name==='ui-data'){
 const tests=[execute(['tests/dossier.mjs']),execute(['tests/save-backup.mjs']),execute(['tests/first-plan-contract-audit.mjs'])];
 const mirrors=['game.js','index.html','style.css','scored-match.js','dossier.js','save-backup.js'];
 for(const p of mirrors)same('web/'+p,'android/app/src/main/assets/'+p);
 for(const t of ['pauseAudioControls()','togglePauseAudio(', 'data-action="toggle-sound"','data-action="toggle-music"','if(!comfort.sound)return false','if(!musicGesture||!comfort.music||document.hidden)return'])check(game,t);
 check(css,'.pause-audio button[aria-pressed="true"]');
 for(const mode of ['survival_ffa','survival_teams'])check(html,'data-playlist-mode="'+mode+'"');
 for(const key of ['rr-options-v06','rr-custom-v1','rr-custom-presets-v1','rr-dossier-v1'])check(rd('web/save-backup.js'),key);
 save('02-ui-data',{result:'AUTOMATED_PASS',tests,sourceSha256:sha('web/style.css'),mirroredAssets:mirrors,observations:[
 {status:'AUTOMATED_PASS',label:'all 6 Web/Android player asset mirrors, procedural music and SFX gating, UI toggle contracts'},
 {status:'AUTOMATED_PASS',label:'local dossier dedupe, corrupted/future saves handling, backup roundtrip and rollback on failed restore'},
 {status:'MANUAL_PENDING',label:'physical screen/audio comfort, lifecycle mute and actual save persistence after signed update'},
 {status:'RISK',priority:'P1',label:'legacy debug APK versions without manual backup UI cannot be assumed migratable'}
 ]});
}else if(name==='android-lan'){
 const tests=[execute(['tests/android-upgrade-readiness.mjs']),execute(['tests/test-signer-contract.mjs']),execute(['tests/scored-browser-parity.mjs'])];
 const java=rd('android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java');
 const manifest=rd('android/app/src/main/AndroidManifest.xml');
 const gradle=rd('android/app/build.gradle');
 const bridge=['hostGame()','findGames()','joinGame(String ip, int port)','stopNetwork()','sendPacket(String packet)'];
 for(const x of bridge)check(java,x,'bridge '+x);
 for(const x of ['SERVICE_TYPE = "_rrtank._tcp."','MAX_PACKET = 32768','new ServerSocket(0, 1)','nsd.discoverServices','sock.setTcpNoDelay(true)','if (line.length() > MAX_PACKET) break','onPause()','onStop()'])check(java,x);
 for(const x of ['android:allowBackup="false"','android:usesCleartextTraffic="false"','android:screenOrientation="sensorLandscape"'])check(manifest,x);
 for(const x of ["applicationId 'com.playereden.ricochetrumble'","SR_TEST_STORE_FILE","SR_UPLOAD_STORE_FILE","Incomplete private TEST APK signing configuration"])check(gradle,x);
 assert.ok(!/\bgh release create\b/.test(rd('.github/workflows/owner-pinned-test-apk.yml')),'private signed test auto release forbidden');
 save('03-android-lan',{result:'AUTOMATED_PASS',tests,sourceSha256:sha('android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java'),observations:[
 {status:'AUTOMATED_PASS',label:'native Android NSD discovery, manual local-IP join, foreground TCP bridge with 32K packet bound and command type filters present'},
 {status:'AUTOMATED_PASS',label:'external/segregated TEST and UPLOAD signer guards, restrictive WebView/manifest configurations'},
 {status:'BLOCKED',priority:'P0',label:'archived debug builds use incompatible signing certificates; owner-installed certificate, safe upgrade and saved-data continuity unverified'},
 {status:'MANUAL_PENDING',priority:'P0_IF_LAN_SHIPS',label:'no actual two-handset Wi-Fi discovery, session sync, disconnect/rejoin evidence'},
 {status:'MANUAL_PENDING',label:'Android app lifecycle, battery/heat, screen rotation and production Play signing/policy'}
 ]});
}else if(name==='overall'){
 const labels=['01-gameplay','02-ui-data','03-android-lan'];
 const audits=labels.map(n=>JSON.parse(rd(root+'/'+n+'.json')));
 assert.ok(audits.every(x=>x.result==='AUTOMATED_PASS'),'all focused audit automated gates must pass');
 const manual=audits.flatMap((a,i)=>a.observations.filter(x=>['BLOCKED','MANUAL_PENDING','RISK'].includes(x.status)).map(x=>({...x,area:labels[i]})));
 const overall={schemaVersion:1,method:'three executable targeted audit groups + previously verified integrated Chromium/Android suite; no runtime change',baseline:'integration/v0947-consolidated-preview',priorIntegratedFast:{run:41014535531,conclusion:'SUCCESS'},priorIntegratedFullAndroid:{run:41014535504,conclusion:'SUCCESS'},targetedAudits:labels.map((n,i)=>({area:n,result:audits[i].result,checks:audits[i].tests.length})),manual,engineering:'AUTOMATED_PASS',releaseDecision:'NO_GO',reasons:['safe same-certificate APK update + data persistence unverified','real physical two-phone LAN if v1 promises it','handset control/thermal/lifecycle validation outstanding','signed Play production AAB / privacy and policy outstanding','integration candidate must be explicitly approved and merged separately'],next:'Review targeted audit findings and decide which real-device or integration gate to prioritize; do not merge or publish automatically.'};
 save('04-overall',overall);
 let md='# Sector Rebound v0.9.47 — Targeted and overall QA\n\n';
 md+='**Automated focused audits: PASS (3/3). Overall engineering audit: PASS. Release readiness: NO-GO.**\n\n';
 for(const [i,n] of labels.entries()){
  const x=audits[i];md+='## '+['1. Gameplay, ricochets and procedural sectors','2. User interface, audio and local data','3. Android, LAN and signing'][i]+'\n\n';
  md+='Executed: '+x.tests.map(t=>'`'+t.command+'`').join('; ')+'.\n\n';
  if(x.sample)md+='Natural sample: 8 complete bot-driven matches per scored mode, at 30Hz; 100 generated topologies per size; zero unsafe respawns. **Not equivalent to physical player balance approval.**\n\n';
  for(const o of x.observations)md+='- **'+o.status+(o.priority?' / '+o.priority:'')+'** '+o.label+'\n';
  md+='\n';
 }
 md+='## Overall audit\n\n**Automated PASS, release NO-GO.** Previous [integration Fast PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41014535531) and [real Chromium + Android PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41014535504) were against exact original integrated source. The present audits change tests/documents only.\n\n';
 for(const reason of overall.reasons)md+='- OPEN: '+reason+'\n';
 md+='\n**Next decision belongs to the owner:** select which blocking physical/release issue to address next. No silent merge, APK resigner, or change to locked pilot/approved UI/audio.\n';
 fs.writeFileSync(root+'/FINAL_REPORT.md',md);
}else throw new Error('Run one of gameplay | ui-data | android-lan | overall');

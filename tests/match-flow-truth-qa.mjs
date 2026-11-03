// Real Chromium match-flow QA: once-only truthful fire coach, scored respawn
// status and safe-spawn waiting across CQC/FFA/TDM and phone landscapes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN required: match-flow QA must not skip');
const root=path.resolve('web'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
const trailer=/\}\)\(\);\s*$/;assert.ok(trailer.test(source),'actual game runtime trailer');
function hooks(){
 window.__flowQA={
  run(id,scheme){
   localStorage.clear();
   mode='solo';paused=false;connected=false;menu.classList.add('hidden');
   const scored=id!=='survival_ffa';
   state=initialState(0,{...selectedRules,matchModeId:id,pilotMode:true,botCount:id==='scored_tdm'?3:2,
    mapSize:'small',teamMode:id==='scored_tdm'?'teams':'ffa'},203);
   state.winner=-1;state.lives[0]=3;state.lives[1]=3;
   comfort.autoFire=scheme==='auto';comfort.releaseFire=scheme==='release';
   coachEnabled=false;coachRemaining=0;
   document.getElementById('field-coach').classList.add('hidden');
   const first=firstMatchHint(),hint=document.getElementById('field-coach').textContent;
   const second=firstMatchHint(),key='rr-coach-fire-v0965-'+
    (id==='cqc'?'cqc':id==='survival_ffa'?'survival':'scored-vehicle')+'-'+scheme;
   const saved=localStorage.getItem(key),status={};
   if(scored){
    const player=state.tanks[0];player.onFoot=true;player.vehicleId=null;
    state.lives[0]=0;player.respawnWait=1.24;
    refreshHUD();status.countdown=document.getElementById('round').textContent;
    status.countdownAria=document.getElementById('round').getAttribute('aria-label');
    player.respawnWait=0;
    refreshHUD();status.waiting=document.getElementById('round').textContent;
    status.waitingAria=document.getElementById('round').getAttribute('aria-label');
    status.waitingOnFoot=document.getElementById('round').classList.contains('on-foot');
    state.lives[0]=1;player.onFoot=true;
    refreshHUD();status.live=document.getElementById('round').textContent;
   }
   return {id,scheme,first,second,hint,key,saved,status};
  }
 };
}
const injected=source.replace(trailer,'\n('+hooks.toString()+')();\n})();');
const allowed=new Set(['index.html','style.css','game.js','scored-match.js','forward-bays.js',
 'dossier.js','save-backup.js','ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!allowed.has(pathname)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':pathname.endsWith('.js')?'text/javascript':
  pathname.endsWith('.css')?'text/css':'text/html'});
 res.end(pathname==='game.js'?injected:fs.readFileSync(path.join(root,pathname)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const cases=[],errors=[];
try{
 for(const viewport of [{width:568,height:320},{width:740,height:360},{width:960,height:540}]){
  const page=await browser.newPage({viewport});
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__flowQA);
  for(const id of ['survival_ffa','cqc','scored_ffa','scored_tdm'])
   for(const scheme of ['release','hold','auto']){
    const value=await page.evaluate(({id,scheme})=>window.__flowQA.run(id,scheme),{id,scheme});
    assert.equal(value.first,true,'first-ever scheme-specific instruction is shown');
    assert.equal(value.second,false,'same control scheme hint is only shown once');
    assert.equal(value.saved,'1','persistent hint flag matches actual mode and scheme');
    if(scheme==='release'){
     assert.match(value.hint,/DRAG FIRE TO AIM/,'release-mode coach teaches aiming');
     assert.match(value.hint,/RELEASE/,'release-mode coach explains when to shoot');
     assert.doesNotMatch(value.hint,/HOLD FIRE|TAP FIRE/,'no stale fire instruction');
    }else if(scheme==='hold'){
     assert.match(value.hint,/HOLD FIRE TO SHOOT/);
     assert.doesNotMatch(value.hint,/RELEASE TO SHOOT/);
    }else assert.match(value.hint,/AUTO FIRE ON/);
    if(id!=='survival_ffa'){
     assert.equal(value.status.countdown,'RESPAWNING · 1.2s');
     assert.equal(value.status.countdownAria,value.status.countdown);
     assert.equal(value.status.waiting,'WAITING FOR SAFE SPAWN');
     assert.equal(value.status.waitingAria,value.status.waiting);
     assert.equal(value.status.waitingOnFoot,false,'dead pilots not styled as alive');
     assert.match(value.status.live,/PILOT/,'live pilot HUD restores normally');
    }
    cases.push({viewport,id,scheme,passed:true});
   }
  await page.close();
 }
 assert.deepEqual(errors,[],'zero unhandled browser errors');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/match-flow-truth.json',JSON.stringify({cases},null,2));
 console.log('MATCH_FLOW_TRUTH_REAL_BROWSER_PASS '+JSON.stringify({
  fixtures:cases.length,viewports:3,modes:4,schemes:3,
  releaseAndHoldDistinct:true,autoFireRespected:true,
  oncePerScheme:true,accurateRespawnCountdown:true,safeSpawnWait:true,
  reentryRestoresLiveHUD:true}));
}finally{await browser.close();await new Promise(done=>server.close(done));}

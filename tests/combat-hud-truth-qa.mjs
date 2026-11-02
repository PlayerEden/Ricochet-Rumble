// Real-browser combat HUD truth fixture: simultaneous shell slots vs weapon cooldown.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN is required');
const root=path.resolve('web'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
const end=/\}\)\(\);\s*$/;
assert.ok(end.test(source));
function install(){
 window.__combatHudQA={
  setup(kind){
   mode='solo';paused=false;menu.classList.add('hidden');
   state=initialState(0,{mapSize:'small',matchModeId:kind==='pilot'?'cqc':'scored_ffa',
    pilotMode:true,botCount:1,teamMode:'ffa'},203);
   if(kind==='pilot')state.tanks[0].onFoot=true;
   else {
    state.tanks[0].onFoot=false;
    const v=state.vehicles[state.tanks[0].vehicleId];v.type=kind;v.armor=vehicleDef(v).armor;
   }
   state.lives[0]=3;state.winner=-1;state.bullets=[];fireCooldown.fill(0);
   return activeBulletCap(state.tanks[0]);
  },
  read(){
   refreshHUD();
   const e=document.getElementById('shell-meter');
   return {text:e.textContent,empty:e.classList.contains('empty'),
    cycling:e.classList.contains('cycling'),aria:e.getAttribute('aria-label')};
  },
  scenario(name,cap){
   state.bullets=[];fireCooldown[0]=0;
   if(name==='cycling')fireCooldown[0]=.24;
   if(name==='partial')state.bullets.push({owner:0,life:1});
   if(name==='full'){
    for(let i=0;i<cap;i++)state.bullets.push({owner:0,life:1});
    fireCooldown[0]=.24;
   }
   if(name==='expired')state.bullets.push({owner:0,life:0},{owner:1,life:1});
   return this.read();
  }
 };
}
const injected=source.replace(end,'\n('+install.toString()+')();\n})();');
const allowed=new Set(['index.html','style.css','game.js','scored-match.js',
 'forward-bays.js','dossier.js','save-backup.js','ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const file=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!allowed.has(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':
  file.endsWith('.css')?'text/css':'text/html'});
 res.end(file==='game.js'?injected:fs.readFileSync(path.join(root,file)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const cases=[],errors=[];
try{
 for(const viewport of [{width:568,height:320},{width:740,height:360},{width:960,height:540}]){
  const page=await browser.newPage({viewport});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__combatHudQA);
  for(const kind of ['pilot','tank','mech']){
   const cap=await page.evaluate(k=>window.__combatHudQA.setup(k),kind);
   assert.ok(cap>=1&&cap<=12,'supported projectile slot capacity');
   for(const scenario of ['ready','cycling','partial','full','expired']){
    const actual=await page.evaluate(({scenario,cap})=>
     window.__combatHudQA.scenario(scenario,cap),{scenario,cap});
    const available=scenario==='full'?0:scenario==='partial'?cap-1:cap;
    const suffix=scenario==='full'?'IN FLIGHT':scenario==='cycling'?'CYCLING':'READY';
    assert.equal(actual.text,available+'/'+cap+' '+suffix,kind+' '+scenario);
    assert.equal(actual.empty,scenario==='full',kind+' full-cap style');
    assert.equal(actual.cycling,scenario==='cycling',kind+' cooldown style');
    assert.ok(actual.aria.includes(available+' of '+cap),kind+' accessibility capacity');
    assert.ok(actual.aria.includes(suffix.toLowerCase()),kind+' accessibility status');
    cases.push({viewport,kind,scenario,cap});
   }
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no page errors');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/combat-hud-truth.json',JSON.stringify({cases},null,2));
 console.log('COMBAT_HUD_TRUTH_REAL_BROWSER_PASS '+JSON.stringify({checks:cases.length,
  viewports:3,weapons:3,states:5,shotAvailability:true,cooldownTrue:true,expiredIgnored:true}));
}finally{await browser.close();await new Promise(done=>server.close(done));}

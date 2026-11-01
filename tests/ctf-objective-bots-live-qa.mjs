import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
const chrome=process.env.CHROME_BIN;assert.ok(chrome,'CHROME_BIN required');
const dir=path.resolve('web'),source=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const ending=/\}\)\(\);\s*$/;assert.ok(ending.test(source));
const hook=
 "\nwindow.__ctfBotsQA={get state(){return state},"
 +"roles(){return [1,2,3].map(i=>window.SectorCtfAI.roleFor(i,state.humanCount,ctfActors()))},"
 +"choice(i){return window.SectorCtfAI.choose({index:i,humanCount:state.humanCount,actors:ctfActors(),flags:state.ctf.flags,bays:state.forwardBays.bays})},"
 +"input(i){return botInput(i,1/60)},"
 +"relocate(i,x,y,foot=true){const t=state.tanks[i],v=state.vehicles[t.vehicleId];if(foot&&v)v.occupant=-1;t.x=x;t.y=y;t.vx=0;t.vy=0;t.onFoot=foot;if(foot)t.vehicleId=null;t.shield=15;},"
 +"frame(){const old=paused;paused=false;step(1/60);paused=old;refreshHUD();},"
 +"restart(){resetAll();},"
 +"stress(count=45){const old=state,wasMode=mode,wasPause=paused,failures=[];let frames=0;"
 +"try{mode='solo';paused=false;for(let seed=1;seed<=count;seed++){const mapSize=['small','standard','large'][seed%3];"
 +"state=initialState(0,{mapSize,matchModeId:'scored_tdm',pilotMode:true,teamMode:'teams',botCount:3,botSkill:'normal',forwardBayExercise:true,ctfExercise:true,quickPlayMatch:false},seed);"
 +"for(let k=0;k<8;k++){step(1/60);frames++;for(let i=1;i<=3;i++){const t=state.tanks[i],u=botInput(i,1/60);"
 +"if(!Number.isFinite(t.x)||!Number.isFinite(t.y)||!Number.isFinite(u.moveX)||!Number.isFinite(u.moveY)||Math.hypot(u.moveX,u.moveY)>1.001||typeof u.fire!=='boolean')failures.push(seed+'/'+k+'/'+i);}}}}"
 +"finally{state=old;mode=wasMode;paused=wasPause;setArena(old.arenaId,old.mazeSeed,old.config.mapSize);botBrains.clear();}"
 +"return {count,frames,failures:failures.slice(0,12)};}};\n})();";
const instrumented=source.replace(ending,hook);
const allowed=new Set(['index.html','style.css','game.js','ctf-rules.js','ctf-ai.js','forward-bays.js','daily-sector.js','dossier.js','save-backup.js','scored-match.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(name==='game.js'?instrumented:fs.readFileSync(path.join(dir,name)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:740,height:360},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
 await page.locator('button[data-action="modes"]').click();
 await page.locator('.bay-exercise-fold summary').click();
 await page.locator('button[data-action="ctf"]').click();
 await page.waitForFunction(()=>window.__ctfBotsQA.state?.ctf&&window.SectorCtfAI&&document.querySelector('#menu').classList.contains('hidden'),null,{timeout:15000});
 assert.deepEqual(await page.evaluate(()=>window.__ctfBotsQA.roles()),['runner','escort','defender']);
 assert.deepEqual(await page.evaluate(()=>[1,2,3].map(i=>window.__ctfBotsQA.choice(i).kind)),['steal','escort','defend']);
 const exit=await page.evaluate(()=>{
  const qa=window.__ctfBotsQA,s=qa.state,blue=s.ctf.flags[0].home,red=s.ctf.flags[1].home;
  qa.relocate(0,red.x,red.y);qa.relocate(2,red.x+180,red.y+180);
  s.tanks[1].x=blue.x;s.tanks[1].y=blue.y;
  const before=s.tanks[1].onFoot;qa.input(1);
  return {before,after:s.tanks[1].onFoot};
 });
 assert.equal(exit.before,false,'runner initially drives tank');
 assert.equal(exit.after,true,'AI exits real tank using existing pilot control');
 const stress=await page.evaluate(()=>window.__ctfBotsQA.stress(45));
 assert.equal(stress.count,45);assert.equal(stress.frames,360);
 assert.deepEqual(stress.failures,[],'45 real maps/360 steps valid bot movement');
 // Start a genuinely fresh match before the scoring trial. The disembark
 // exercise placed the QA human on CORAL's flag, so that test may have
 // correctly caused Cyan to carry it. We cannot score until it is home.
 await page.evaluate(()=>window.__ctfBotsQA.restart());
 assert.deepEqual(await page.evaluate(()=>window.__ctfBotsQA.state.ctf.flags.map(f=>f.carrier)),[null,null],
  'fresh CTF round must start with both flags home');

 // Remove the QA pilot from Coral's flag: otherwise Cyan steals it while
 // Coral attempts a capture, correctly blocking the score as designed.
 await page.evaluate(()=>{
  const qa=window.__ctfBotsQA,s=qa.state,blue=s.ctf.flags[0].home,red=s.ctf.flags[1].home;
  const midX=(blue.x+red.x)/2,midY=(blue.y+red.y)/2;
  qa.relocate(0,midX,midY);
  qa.relocate(2,midX+100,midY+100);
 });
  const dossier=await page.evaluate(()=>localStorage.getItem('rr-dossier-v1'));
 const initialMatch=await page.evaluate(()=>window.__ctfBotsQA.state.matchId);
 for(let n=1;n<=3;n++){
  const homes=await page.evaluate(()=>window.__ctfBotsQA.state.ctf.flags.map(f=>f.home));
  await page.evaluate(p=>{window.__ctfBotsQA.relocate(1,p.x,p.y);window.__ctfBotsQA.frame();},homes[0]);
  assert.equal(await page.evaluate(()=>window.__ctfBotsQA.state.ctf.flags[0].carrier),1,'enemy bot took real flag');
  assert.equal(await page.evaluate(()=>window.__ctfBotsQA.choice(1).kind),'capture','bot plans home after pickup');
  await page.evaluate(p=>{window.__ctfBotsQA.relocate(1,p.x,p.y);window.__ctfBotsQA.frame();},homes[1]);
  const capture=await page.evaluate(()=>{const s=window.__ctfBotsQA.state;
   return {score:s.ctf.scores[1],flags:s.ctf.flags,runner:s.tanks[1],
    actors:s.tanks.map((a,i)=>({i,x:a.x,y:a.y,onFoot:a.onFoot,alive:s.lives[i]>0})),
    goal:window.__ctfBotsQA.choice(1)};});
  assert.equal(capture.score,n,'bot scores actual capture '+n+' '+JSON.stringify(capture));
 }
 assert.equal((await page.locator('#aa-outcome').textContent()).trim(),'DEFEAT');
 assert.deepEqual(await page.evaluate(()=>window.__ctfBotsQA.state.finalResult.scoreboard),[0,3]);
 assert.equal(await page.evaluate(()=>window.__ctfBotsQA.state.finalResult.reason),'capture_target');
 assert.equal(await page.evaluate(()=>localStorage.getItem('rr-dossier-v1')),dossier);
 fs.mkdirSync('qa-screens',{recursive:true});
 await page.screenshot({path:'qa-screens/ctf-bot-capture-740x360.png',animations:'disabled'});
 await page.locator('#quick-rematch').click();
 assert.notEqual(await page.evaluate(()=>window.__ctfBotsQA.state.matchId),initialMatch);
 assert.deepEqual(await page.evaluate(()=>window.__ctfBotsQA.state.ctf.scores),[0,0]);
 await page.locator('#menu-button').click();
 await page.locator('button[data-action="close"]').click();
 await page.locator('.home-deploy[data-action="solo"]').click();
 assert.equal(await page.evaluate(()=>window.__ctfBotsQA.state.ctf),null,'standard Quick Play unchanged');
 assert.deepEqual(errors,[]);
 console.log('CTF_OBJECTIVE_BOTS_REAL_BROWSER_PASS: actual disembark, red bot three real flag captures, Cyan defeat, 45 seeded maps/360 physics steps, Quick Play and Dossier isolation');
}finally{
 await browser.close();
 await new Promise(done=>server.close(done));
}

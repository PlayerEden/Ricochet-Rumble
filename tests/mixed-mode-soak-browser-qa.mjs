import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'Chromium required; no skipping stress audit');
const root=path.resolve('web'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
assert.match(source,/\}\)\(\);\s*$/);
const hook='window.__soak={start(id){newMatch(id);return this.read()},replay(next){resetAll(next);return this.read()},frames(n){for(let i=0;i<n;i++)step(1/60);return this.read()},read(){return {mode,paused,matchId:state.matchId,seed:state.mazeSeed,config:{...state.config},winner:state.winner,elapsed:state.elapsedSeconds,actors:state.tanks.map(t=>({x:t.x,y:t.y,a:t.a,vx:t.vx,vy:t.vy,onFoot:t.onFoot})),lives:state.lives.slice(),bullets:state.bullets.map(b=>({x:b.x,y:b.y,vx:b.vx,vy:b.vy})),fx:state.fxEvents.length,pickups:state.pickups.length,vehicles:state.vehicles.length,finalResult:!!state.finalResult,dom:document.querySelectorAll("*").length}}};})();';
const game=source.replace(/\}\)\(\);\s*$/,hook);
// Serve the actual runtime dependency chain; the old harness omitted the
// Forward Bays planner and gave a false failure when a team match spawned.
const names=new Set(['index.html','style.css','game.js','scored-match.js',
 'dossier.js','save-backup.js','forward-bays.js','lan-series.js','lan-room.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1/').pathname.replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 if(!names.has(name)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(name==='game.js'?game:fs.readFileSync(path.join(root,name)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:915,height:412}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const modes=['solo','scored_ffa','cqc','scored_tdm','custom'],results=[];
try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 await page.waitForFunction(()=>!!window.__soak);
 let prevId=0,prevSeed=0;
 for(let i=0;i<30;i++){
  const launch=i%6===0,which=modes[Math.floor(i/6)];
  const fresh=await page.evaluate(({launch,which,next})=>launch?window.__soak.start(which):window.__soak.replay(next),{launch,which,next:i%2===0});
  assert.ok(fresh.matchId>prevId,'increasing match ID');
  assert.notEqual(fresh.seed,prevSeed,'new procedural maze seed');
  assert.equal(fresh.paused,false,'new local round unpaused');
  assert.equal(fresh.mode,'solo');
  assert.equal(fresh.winner,-1);
  assert.equal(fresh.elapsed,0);
  assert.equal(fresh.bullets.length,0,'shells cleared');
  assert.equal(fresh.fx,0,'FX cleared');
  assert.equal(fresh.pickups,0,'pickups cleared');
  assert.equal(fresh.finalResult,false,'prior results cleared');
  assert.equal(fresh.actors.length,fresh.lives.length);
  if(fresh.config.matchModeId==='cqc'){assert.equal(fresh.vehicles,0);assert.ok(fresh.actors.every(t=>t.onFoot))}
  const run=await page.evaluate(n=>window.__soak.frames(n),240);
  assert.equal(run.matchId,fresh.matchId);
  assert.equal(run.seed,fresh.seed);
  // Browser requestAnimationFrame can advance extra real-engine ticks between calls.
  // This is a soak of live gameplay, NOT a frozen deterministic physics benchmark.
  assert.ok(Number.isFinite(run.elapsed)&&run.elapsed>=0&&run.elapsed<=6,'match clock bounded after four simulated seconds: '+run.elapsed);
  assert.ok(run.bullets.length<200,'bounded bullet count');
  assert.ok(run.fx<400,'bounded transient effects');
  assert.ok(run.dom<1500,'bounded UI elements');
  for(const t of run.actors)for(const key of ['x','y','a','vx','vy'])if(typeof t[key]==='number')assert.ok(Number.isFinite(t[key]),'valid player physics '+key);
  for(const b of run.bullets)for(const key of ['x','y','vx','vy'])if(typeof b[key]==='number')assert.ok(Number.isFinite(b[key]),'valid shell physics '+key);
  for(const l of run.lives)assert.ok(Number.isFinite(l)&&l>=0);
  results.push({round:i+1,start:launch?which:'rematch',matchId:run.matchId,mazeSeed:run.seed,mode:run.config.matchModeId||'survival',actors:run.actors.length,shells:run.bullets.length,effects:run.fx,dom:run.dom});
  prevId=run.matchId;prevSeed=run.seed;
 }
 assert.equal(new Set(results.map(x=>x.mazeSeed)).size,30);
 assert.deepEqual(errors,[],'no JS page/console errors');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/mixed-mode-soak.json',JSON.stringify({status:'PASS',rounds:30,physicsFrames:7200,modes,scope:'Browser real engine; no claims of device FPS, battery, latency or actual user touch',results},null,2)+'\n');
 console.log('MIXED_MODE_SOAK_REAL_BROWSER_PASS 30 starts/rematches across 5 modes; 7200 real physics steps, no invalid state, console errors or accumulated projectiles');
}finally{
 await page.close().catch(()=>{});
 await browser.close();
 await new Promise(ok=>server.close(ok));
}
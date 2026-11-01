import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
const chrome=process.env.CHROME_BIN;assert.ok(chrome,'CHROME_BIN required');
const dir=path.resolve('web'),source=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const ending=/\}\)\(\);\s*$/;assert.ok(ending.test(source));
const hooked=source.replace(ending,
 "\nwindow.__ctfQA={get state(){return state},exit(){return tryInteract(0)},"
 +"at(x,y){const t=state.tanks[0];t.x=x;t.y=y;t.onFoot=true;t.vehicleId=null;t.vx=0;t.vy=0;t.shield=15;"
 +"for(const v of state.vehicles)if(v.occupant===0)v.occupant=-1;},"
 +"stepOnce(){const old=paused;paused=false;step(1/60);paused=old;refreshHUD();},"
 +"timeout(){for(let i=0;i<36;i++)applyCtf(window.SectorFlags.tick(state.ctf,ctfActors(),10));finishCtf();refreshHUD();}};\n})();");
const allowed=new Set(['index.html','style.css','game.js','ctf-rules.js','forward-bays.js','daily-sector.js','scored-match.js','save-backup.js','dossier.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(name==='game.js'?hooked:fs.readFileSync(path.join(dir,name)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:740,height:360},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
 await page.locator('button[data-action="modes"]').click();
 assert.equal(await page.locator('.mode-grid button').count(),4);
 await page.locator('.bay-exercise-fold summary').click();
 assert.equal(await page.locator('button[data-action="ctf"]').isVisible(),true);
 const priorDossier=await page.evaluate(()=>localStorage.getItem('rr-dossier-v1'));
 await page.locator('button[data-action="ctf"]').click();
 await page.waitForFunction(()=>window.__ctfQA.state?.ctf&&document.querySelector('#menu').classList.contains('hidden'),null,{timeout:15000});
 const start=await page.evaluate(()=>({id:window.__ctfQA.state.matchId,seed:window.__ctfQA.state.mazeSeed,
  flags:window.__ctfQA.state.ctf.flags,config:window.__ctfQA.state.config}));
 assert.equal(start.config.ctfExercise,true);assert.equal(start.config.forwardBayExercise,true);
 assert.equal(start.config.botCount,3);assert.equal(start.flags.length,2);
 assert.equal((await page.locator('#mode-label').textContent()).trim(),'CAPTURE THE FLAG · TEST');
 assert.equal(await page.locator('#ctf-status').isVisible(),true);
 assert.match(await page.locator('#ctf-status').textContent(),/EXIT VEHICLE TO GRAB FLAG/);
 assert.equal(await page.evaluate(()=>window.__ctfQA.exit()),true,'real pilot exit');
 await page.evaluate(()=>window.__ctfQA.stepOnce());
 assert.match(await page.locator('#ctf-status').textContent(),/ON FOOT/);
 fs.mkdirSync('qa-screens',{recursive:true});
 for(const [width,height] of [[740,360],[915,412],[1280,720]]){
  await page.setViewportSize({width,height});
  await page.screenshot({path:'qa-screens/ctf-field-'+width+'x'+height+'.png',animations:'disabled'});
 }
 await page.setViewportSize({width:740,height:360});
 for(let round=1;round<=3;round++){
  const homes=await page.evaluate(()=>window.__ctfQA.state.ctf.flags.map(f=>f.home));
  await page.evaluate(p=>{window.__ctfQA.at(p.x,p.y);window.__ctfQA.stepOnce();},homes[1]);
  assert.equal(await page.evaluate(()=>window.__ctfQA.state.ctf.flags[1].carrier),0,'pilot took flag');
  await page.evaluate(p=>{window.__ctfQA.at(p.x,p.y);window.__ctfQA.stepOnce();},homes[0]);
  assert.equal(await page.evaluate(()=>window.__ctfQA.state.ctf.scores[0]),round,'flag capture '+round);
  assert.equal(await page.evaluate(()=>window.__ctfQA.state.ctf.flags[1].carrier),null,'flag resets home');
 }
 assert.equal(await page.locator('#after-action').isVisible(),true);
 assert.equal((await page.locator('#aa-outcome').textContent()).trim(),'VICTORY');
 assert.match(await page.locator('#aa-mode-label').textContent(),/CAPTURE THE FLAG/);
 assert.equal(await page.locator('#aa-lives-label').textContent(),'FLAG TARGET');
 assert.equal(await page.locator('#aa-lives').textContent(),'3');
 const result=await page.evaluate(()=>window.__ctfQA.state.finalResult);
 assert.deepEqual(result.scoreboard,[3,0]);assert.equal(result.objective,'flag_captures');
 assert.equal(result.reason,'capture_target');
 assert.equal(await page.evaluate(()=>localStorage.getItem('rr-dossier-v1')),priorDossier);
 assert.equal(await page.locator('#aa-rewards').isVisible(),false);
 await page.locator('#quick-rematch').click();
 const next=await page.evaluate(()=>({id:window.__ctfQA.state.matchId,seed:window.__ctfQA.state.mazeSeed,ctf:window.__ctfQA.state.ctf}));
 assert.notEqual(next.id,start.id);assert.notEqual(next.seed,start.seed);
 assert.deepEqual(next.ctf.scores,[0,0]);
 await page.evaluate(()=>window.__ctfQA.timeout());
 assert.equal((await page.locator('#aa-outcome').textContent()).trim(),'DRAW');
 assert.equal(await page.evaluate(()=>window.__ctfQA.state.finalResult.reason),'time_limit');
 await page.locator('#results-menu').click();
 await page.locator('.home-deploy[data-action="solo"]').click();
 assert.equal(await page.evaluate(()=>window.__ctfQA.state.ctf),null,'regular Quick Play unaffected');
 assert.deepEqual(errors,[]);
 console.log('CTF_REAL_BROWSER_PASS: pilot-only, three actual captures, real CTF scoreboard and results, timed draw, rematch reset, no Dossier inflation, three landscape screenshots');
}finally{
 await browser.close();
 await new Promise(done=>server.close(done));
}

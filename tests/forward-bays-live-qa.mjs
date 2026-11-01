// Forward Bay: real HTTP-loaded game.js/Chromium, 300 seeded generated mazes,
// 30 true vehicle+spawn initializations, match result/replay, no normal-mode leak.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
const chrome=process.env.CHROME_BIN;assert.ok(chrome,'CHROME_BIN required');
const dir=path.resolve('web'),source=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const ending=/\}\)\(\);\s*$/;assert.ok(ending.test(source),'real game closure');
const game=source.replace(ending,
 "\nwindow.__bayQA={get state(){return state},freeze(){paused=true},expire(s=301){paused=false;step(s);paused=true},sample(count=300){const original=state,wasMode=mode;let checked=0,full=0;const failures=[];try{mode='solo';for(let i=1;i<=count;i++){const size=['small','standard','large'][i%3],grid=createMaze(MAP_SIZES[size],i);const plan=window.SectorForwardBays.plan(grid,i);if(!plan){failures.push('missing '+i+'/'+size);continue;}const [a,b]=plan.bays;const routes=window.SectorForwardBays.routeDistances(grid.open,a.cellIndex);if(routes[b.cellIndex]!==plan.steps||plan.steps<5||a.team!==0||b.team!==1||a.exits<2||b.exits<2||a.cellIndex===b.cellIndex||plan.seed!==i||plan.bays.some(q=>q.spawnSlots.length!==2||q.entrances.length<2||q.parking.cellIndex===q.spawnSlots[1].cellIndex)){failures.push('invalid '+i+'/'+size);continue;}const repeat=window.SectorForwardBays.plan(grid,i);if(JSON.stringify(repeat)!==JSON.stringify(plan)){failures.push('unstable '+i);continue;}checked++;if(i<=30){const s=initialState(0,{mapSize:'standard',botCount:3,pilotMode:true,matchModeId:'scored_tdm',teamMode:'teams',forwardBayExercise:true},i);full++;if(!s.forwardBays||s.vehicles.length>10||s.tanks.some((t,j)=>blocked(t.x,t.y,21)||Math.hypot(t.x-s.forwardBays.bays[j%2].x,t.y-s.forwardBays.bays[j%2].y)>145)||s.forwardBays.bays.some(q=>{const v=s.vehicles[q.vehicleId];return !v||v.occupant!==-1||v.type!=='tank'||blocked(v.x,v.y,24)||Math.hypot(v.x-q.x,v.y-q.y)>220;}))failures.push('placement '+i);}}}finally{mode=wasMode;state=original;setArena(0,original.mazeSeed,original.config.mapSize)}return {checked,full,failures:failures.slice(0,20)};}};\n})();");
const allowed=new Set(['index.html','style.css','game.js','forward-bays.js','daily-sector.js','scored-match.js','save-backup.js','dossier.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(name==='game.js'?game:fs.readFileSync(path.join(dir,name)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:740,height:360},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
 assert.equal(await page.locator('.home-screen').isVisible(),true);
 await page.locator('button[data-action="modes"]').click();
 assert.equal(await page.locator('.mode-grid button').count(),4);
 assert.equal(await page.locator('.bay-exercise-fold').getAttribute('open'),null,'experimental feature collapsed');
 const priorDossier=await page.evaluate(()=>localStorage.getItem('rr-dossier-v1'));
 await page.locator('.bay-exercise-fold summary').click();
 assert.equal(await page.locator('button[data-action="forwardbay"]').isVisible(),true);
 const bounds=await page.locator('button[data-action="modes-back"]').boundingBox();
 assert.ok(bounds&&bounds.y>=-1&&bounds.y+bounds.height<=361,'Back remains visible at 740x360 with experiment expanded');
 await page.locator('button[data-action="forwardbay"]').click();
 await page.waitForFunction(()=>window.__bayQA.state.config.forwardBayExercise&&document.querySelector('#menu').classList.contains('hidden'));
 const first=await page.evaluate(()=>({state:window.__bayQA.state,body:document.querySelector('#mode-label').textContent}));
 assert.equal(first.state.config.matchModeId,'scored_tdm');
 assert.equal(first.state.config.botCount,3);
 assert.equal(first.state.forwardBays.bays.length,2);
 assert.match(first.body,/FORWARD BAY/);
 assert.equal(first.state.forwardBays.bays[0].team,0);
 assert.equal(first.state.forwardBays.bays[1].team,1);
 assert.equal(first.state.vehicles.filter(v=>v.occupant===-1).length,3,'existing spare vehicle count preserved');
 const stress=await page.evaluate(()=>window.__bayQA.sample(300));
 assert.equal(stress.checked,300,'all 300 real procedural maze graphs have valid opposite Forward Bays');
 assert.equal(stress.full,30,'30 genuine vehicle and spawn placement configurations');
 assert.deepEqual(stress.failures,[],'no connectivity, symmetry, parking, spawn or geometry failures');
 await page.evaluate(()=>window.__bayQA.freeze());
 await page.evaluate(()=>window.__bayQA.expire(301));
 assert.equal(await page.locator('#after-action').isVisible(),true,'real scored team match ends');
 assert.match(await page.locator('#aa-mode-label').textContent(),/FORWARD BAY EXERCISE/);
 assert.match(await page.locator('#aa-note').textContent(),/NO DOSSIER PROGRESS/);
 assert.equal(await page.evaluate(()=>localStorage.getItem('rr-dossier-v1')),priorDossier,'experimental FOB does not farm cosmetics');
 assert.equal(await page.locator('#aa-rewards').isVisible(),false);
 await page.locator('#quick-rematch').click();
 const next=await page.evaluate(()=>({id:window.__bayQA.state.matchId,seed:window.__bayQA.state.mazeSeed,bays:window.__bayQA.state.forwardBays?.bays?.length}));
 assert.notEqual(next.id,first.state.matchId,'new match ID');
 assert.notEqual(next.seed,first.state.mazeSeed,'new procedural map');
 assert.equal(next.bays,2,'rematch regenerates paired depots');
 await page.locator('#menu-button').click();
 await page.locator('button[data-action="close"]').click();
 await page.locator('.home-deploy[data-action="solo"]').click();
 assert.equal(await page.evaluate(()=>window.__bayQA.state.forwardBays),null,'regular Quick Play unchanged');
 assert.deepEqual(errors,[],'no uncaught runtime error');
 console.log('FORWARD_BAYS_REAL_BROWSER_PASS: 300 deterministic maze seeds, 30 team spawns/garages, 740x360 back, scored team result, no Dossier, fresh-map retry, normal Quick Play');
}finally{
 await browser.close();
 await new Promise(done=>server.close(done));
}

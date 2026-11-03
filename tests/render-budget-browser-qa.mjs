// Rendering cost observations from the real bundled canvas game.
// Results are comparative CI diagnostics, NOT claims about Android FPS or battery.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'Chromium required for real Canvas2D audit');
const root=path.resolve('web'),src=fs.readFileSync(path.join(root,'game.js'),'utf8');
const tail=/\}\)\(\);\s*$/;
assert.ok(tail.test(src));
const hook='window.__renderQA={sample(size,frames,seed){mode="solo";paused=true;state=initialState(0,{...selectedRules,mapSize:size,botCount:3,pilotMode:true},seed);camera.zoom=null;const samples=[];for(let n=0;n<frames;n++){const start=performance.now();render(1/60);samples.push(performance.now()-start)}samples.sort((a,b)=>a-b);return {size,frames,msMedian:samples[Math.floor(samples.length*.5)],msP95:samples[Math.min(samples.length-1,Math.floor(samples.length*.95))],msMax:samples.at(-1),walls:wallSet.length,actors:state.tanks.length,vehicles:state.vehicles.length,canvasPixels:canvas.width*canvas.height,canvasWidth:canvas.width,canvasHeight:canvas.height,dom:document.querySelectorAll("*").length}}};})();';
const game=src.replace(tail,hook);
// Serve every script dependency referenced by the actual current index.html.
const allowed=new Set(['index.html','style.css','game.js','scored-match.js','dossier.js','save-backup.js','forward-bays.js','lan-series.js','lan-room.js']);
const missing=[];
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1/').pathname.replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed.has(name)){missing.push(name);res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});
 res.end(name==='game.js'?game:fs.readFileSync(path.join(root,name)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:915,height:412}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const records=[];
try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 await page.waitForFunction(()=>!!window.__renderQA);
 for(const viewport of [{width:740,height:360},{width:915,height:412},{width:1280,height:720}]){
  await page.setViewportSize(viewport);
  for(const size of ['small','standard','large']){
   const x=await page.evaluate(({size,seed})=>window.__renderQA.sample(size,30,seed),{size,seed:157000+records.length});
   assert.equal(x.frames,30);
   for(const field of ['msMedian','msP95','msMax','walls','actors','canvasPixels'])assert.ok(Number.isFinite(x[field])&&x[field]>=0,field+' invalid');
   assert.ok(x.walls>0&&x.actors>=2,'real arena and actor objects rendered');
   assert.ok(x.canvasPixels>0&&x.canvasPixels<5000000,'canvas DPR bounded');
   assert.ok(x.dom<1500,'DOM does not multiply during redraw');
   records.push({viewport:viewport.width+'x'+viewport.height,...x});
  }
 }
 assert.deepEqual(errors,[],'no renderer JS exceptions');
 assert.deepEqual(missing,[],'no missing bundled assets');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/render-budget-observations.json',JSON.stringify({status:'PASS',kind:'HEADLESS_CHROMIUM_RENDER_OBSERVATIONS_NOT_ANDROID_BENCHMARK',samples:records},null,2)+'\n');
 console.log('RENDER_OBSERVATIONS_REAL_BROWSER_PASS: 9 size/viewport cases, 270 real Canvas2D frames, finite timings, stable DOM/canvas bounds, no exceptions');
}finally{
 await page.close().catch(()=>{});await browser.close();await new Promise(ok=>server.close(ok));
}
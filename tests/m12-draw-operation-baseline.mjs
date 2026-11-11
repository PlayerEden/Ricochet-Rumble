// M12-A: actual game Canvas operation-count baseline, NOT a physical Android benchmark.
// Instrumentation is injected into HTTP test responses only, not committed to production JS.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'Chromium required; no silent profiler skip');
const root=path.resolve('web'),original=fs.readFileSync(path.join(root,'game.js'),'utf8');
const trailer=/\}\)\(\);\s*$/;
assert.ok(trailer.test(original),'real engine IIFE required');
const instrumented=original.replace(trailer,"\nfunction m12CountDraws(frames,draw){\n const names=['fillRect','strokeRect','fillText','strokeText','beginPath','moveTo','lineTo','arc','ellipse','stroke','fill','drawImage','createLinearGradient','createRadialGradient','save','restore'];\n const proto=CanvasRenderingContext2D.prototype,originals={},hadOwn={},counts={};\n for(const name of names){\n  counts[name]=0;const orig=proto[name];if(typeof orig!=='function')continue;\n  originals[name]=orig;hadOwn[name]=Object.prototype.hasOwnProperty.call(proto,name);\n  proto[name]=function(...args){counts[name]++;return orig.apply(this,args)};\n }\n const times=[];\n try{for(let i=0;i<frames;i++){const start=performance.now();draw(i);times.push(performance.now()-start)}}\n finally{for(const name of Object.keys(originals)){if(hadOwn[name])proto[name]=originals[name];else delete proto[name]}}\n const sorted=[...times].sort((a,b)=>a-b),nth=p=>+sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))].toFixed(4);\n const ops=Object.fromEntries(Object.entries(counts).filter(([,v])=>v>0));\n return {frames,medianMs:nth(.5),p95Ms:nth(.95),maxMs:nth(1),\n   totalOperations:Object.values(counts).reduce((a,b)=>a+b,0),\n   operationsPerFrame:+(Object.values(counts).reduce((a,b)=>a+b,0)/frames).toFixed(2),\n   operationCounts:ops};\n}\nwindow.__m12DrawAudit={\n lobby(frames){\n  mode='idle';paused=true;menu.classList.remove('hidden');\n  if(!document.getElementById('menu-preview'))throw Error('real lobby preview missing');\n  drawLobbyPreview(.1);\n  return {screen:'lobby',...m12CountDraws(frames,()=>drawLobbyPreview(.05))};\n },\n hangar(frames){\n  if(!document.getElementById('hangar-unit-preview'))throw Error('real Hangar preview missing');\n  const result=m12CountDraws(frames,i=>{hangarPreviewUnit=i%2?'mech':'tank';drawHangarUnitPreview()});\n  return {screen:'hangar-on-change',...result,\n    paint:equippedPaint,canvasPixels:document.getElementById('hangar-unit-preview').width*document.getElementById('hangar-unit-preview').height};\n },\n arena(size,bots,seed,frames){\n  mode='solo';paused=true;connected=false;\n  state=initialState(0,{...selectedRules,mapSize:size,botCount:bots,pilotMode:true},seed);\n  camera.zoom=null;\n  for(let i=0;i<3;i++)render(1/60);\n  return {screen:'arena',size,bots,seed,walls:wallSet.length,actors:state.tanks.length,\n   canvasPixels:canvas.width*canvas.height,...m12CountDraws(frames,()=>render(1/60))};\n }\n};\n})();");
assert.notEqual(instrumented,original,'test-only source injected');
const allowed=new Set(['index.html','style.css','game.js','dossier.js','save-backup.js',
 'scored-match.js','forward-bays.js','lan-series.js','lan-room.js','ctf-rules.js','ctf-ai.js']);
const missing=[],errors=[];
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1/').pathname.replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return}
 if(!allowed.has(name)){missing.push(name);res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(name==='game.js'?instrumented:fs.readFileSync(path.join(root,name)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:915,height:412},deviceScaleFactor:1});
page.on('pageerror',e=>errors.push(e.message));
const url='http://127.0.0.1:'+server.address().port+'/';
const rows=[];
function check(raw){
 assert.ok(raw.frames>=10);
 assert.ok(Number.isFinite(raw.medianMs)&&Number.isFinite(raw.p95Ms)&&Number.isFinite(raw.maxMs));
 assert.ok(raw.medianMs>=0&&raw.medianMs<=raw.p95Ms&&raw.p95Ms<=raw.maxMs);
 assert.ok(raw.maxMs<1000,'unexpectedly slow synchronous browser render: '+JSON.stringify(raw).slice(0,300));
 assert.ok(raw.totalOperations>0&&raw.operationsPerFrame>0);
 assert.ok(raw.operationCounts.fillRect>0,'real procedural Canvas geometry should be measured');
 assert.ok(raw.operationCounts.drawImage===undefined||Number.isInteger(raw.operationCounts.drawImage));
 return raw;
}
try{
 for(const [width,height] of [[740,360],[915,412],[1280,720]]){
  await page.setViewportSize({width,height});
  await page.goto(url,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__m12DrawAudit);
  const viewport=width+'x'+height;
  rows.push({viewport,...check(await page.evaluate(()=>window.__m12DrawAudit.lobby(16)))});
  await page.locator('#menu button[data-action="hangar"]').click();
  rows.push({viewport,...check(await page.evaluate(()=>window.__m12DrawAudit.hangar(12)))});
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__m12DrawAudit);
  for(const [size,bots] of [['small',1],['standard',2],['large',4]]){
   const seed=170000+rows.length;
   const raw=await page.evaluate(({size,bots,seed})=>window.__m12DrawAudit.arena(size,bots,seed,32),{size,bots,seed});
   assert.ok(raw.walls>0&&raw.actors>=2&&raw.canvasPixels>0&&raw.canvasPixels<5000000);
   rows.push({viewport,...check(raw)});
  }
 }
 assert.equal(rows.length,15);
 assert.deepEqual(errors,[],'no real-game page exceptions');
 assert.deepEqual(missing,[],'all assets loaded offline from game source');
 fs.mkdirSync('qa-results/m12',{recursive:true});
 fs.writeFileSync('qa-results/m12/draw-operation-baseline.json',JSON.stringify({
  result:'PASS',
  type:'HEADLESS_CHROMIUM_TEST_ONLY_CANVAS_DRAW_CALLS_NOT_ANDROID_FPS',
  source:'Unmodified real web/game.js instrumented only in HTTP response',
  baseRecommendation:'Do not bake images until paired A/B timing, memory, quality and compressed bytes have been checked.',
  rowCount:rows.length,rows
 },null,2)+'\n');
 console.log('M12_DRAW_OPERATIONS_BASELINE_PASS '+JSON.stringify(rows.map(x=>({
  scene:x.screen,viewport:x.viewport,size:x.size||null,medianMs:x.medianMs,p95Ms:x.p95Ms,
  operationsPerFrame:x.operationsPerFrame,drawImage:x.operationCounts.drawImage||0
 }))));
}finally{await page.close().catch(()=>{});await browser.close();await new Promise(r=>server.close(r))}

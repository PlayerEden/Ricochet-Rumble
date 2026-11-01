// Real-source browser pipeline profiling. No game code or gameplay changes.
// This measures JS/Canvas/DOM work in headless Chromium, NOT Android frame pacing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';

assert.ok(process.env.CHROME_BIN,'CHROME_BIN required; no silent performance test skip');
const root=path.resolve('web'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
const trailer=/\}\)\(\);\s*$/;
assert.match(source,trailer,'real engine IIFE must be instrumentable');
const instrument=String.raw`
window.__pipelineProfile={
 run(size,bots,seed,frames){
  mode='solo';connected=false;paused=false;
  state=initialState(0,{...selectedRules,mapSize:size,botCount:bots,pilotMode:true},seed);
  state.tanks.forEach(t=>t.shield=300);
  const samples={physics:[],render:[],hud:[],wire:[],combined:[]};
  const sizeBytes=[];
  for(let i=0;i<frames;i++){
   const start=performance.now();
   step(1/60);
   const physics=performance.now();
   render(1/60);
   const renderEnd=performance.now();
   refreshHUD();
   const hudEnd=performance.now();
   const wire=JSON.stringify(serializeState());
   const end=performance.now();
   samples.physics.push(physics-start);samples.render.push(renderEnd-physics);
   samples.hud.push(hudEnd-renderEnd);samples.wire.push(end-hudEnd);
   samples.combined.push(end-start);sizeBytes.push(wire.length);
  }
  return {size,bots,frames,seed,walls:wallSet.length,actors:state.tanks.length,
    canvasPixels:canvas.width*canvas.height,
    jsonCharsMax:Math.max(...sizeBytes),samples};
 }
};
})();`;
const game=source.replace(trailer,instrument);
const allowed=new Set(['index.html','style.css','game.js','scored-match.js','dossier.js','save-backup.js']);
const missing=[];
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1/').pathname.replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return}
 if(!allowed.has(name)){missing.push(name);res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(name==='game.js'?game:fs.readFileSync(path.join(root,name)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:915,height:412}});
const errors=[];page.on('pageerror',err=>errors.push(err.message));
const percent=(sorted,p)=>sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))];
const stats=arr=>{const s=[...arr].sort((a,b)=>a-b);return {median:+percent(s,.5).toFixed(3),p95:+percent(s,.95).toFixed(3),max:+s.at(-1).toFixed(3)}};
const rows=[];
try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
 await page.waitForFunction(()=>!!window.__pipelineProfile);
 for(const viewport of [{width:740,height:360},{width:915,height:412},{width:1280,height:720}]){
  await page.setViewportSize(viewport);
  for(const [size,bots] of [['small',1],['standard',1],['large',4]]){
   const raw=await page.evaluate(v=>window.__pipelineProfile.run(v.size,v.bots,v.seed,v.frames),
    {size,bots,seed:400601+rows.length,frames:90});
   assert.equal(raw.frames,90);
   assert.ok(raw.walls>0&&raw.actors>=2,'real maze + actors');
   assert.ok(raw.canvasPixels>0&&raw.canvasPixels<=5000000,'bounded canvas size');
   assert.ok(raw.jsonCharsMax>0&&raw.jsonCharsMax<32768,'host packet size below native transport cap');
   const stages={};
   for(const [key,samples] of Object.entries(raw.samples)){
    assert.equal(samples.length,raw.frames);
    assert.ok(samples.every(v=>Number.isFinite(v)&&v>=0&&v<1000),key+' stage had invalid timing');
    stages[key]=stats(samples);
   }
   rows.push({viewport:viewport.width+'x'+viewport.height,size,bots,frames:raw.frames,walls:raw.walls,
      actors:raw.actors,canvasPixels:raw.canvasPixels,jsonCharsMax:raw.jsonCharsMax,stages});
  }
 }
 assert.deepEqual(errors,[],'no browser runtime exceptions');
 assert.deepEqual(missing,[],'no missing game assets');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/frame-pipeline-profile.json',JSON.stringify({
  status:'PASS',measurement:'HEADLESS_CHROMIUM_JS_STAGE_TIMINGS_NOT_ANDROID_FPS',
  source:'Actual game.js fixed 1/60 physics, Canvas2D render, DOM HUD, JSON LAN snapshot serialization',
  cases:rows.length,frames:rows.length*90,notes:'Tests run stage functions directly; do not infer real hardware frame pacing, thermal behavior, battery, input latency or user match experience.',rows},null,2)+'\n');
 console.log('FRAME_PIPELINE_REAL_BROWSER_PASS: '+rows.length+' scene combinations, '+rows.length*90+' frames; physics/render/HUD/JSON-stage histograms and native frame-size bound');
}finally{
 await page.close().catch(()=>{});
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
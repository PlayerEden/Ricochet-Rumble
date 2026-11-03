// Verify mobile canvas resize stability using the real browser game.
// Measurable claim: redundant orientation/resize events cause ZERO backing-store
// dimension writes, while actual viewport changes change only required dimensions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';

assert.ok(process.env.CHROME_BIN,'CHROME_BIN is required for real Chromium test');
const root=path.resolve('web');
const source=fs.readFileSync(path.join(root,'game.js'),'utf8');
assert.doesNotMatch(source,/for\(const dx of \[12,tile-16\]\)/,'floor rivets should not allocate arrays each frame');
const assets=new Set(['index.html','style.css','game.js','save-backup.js','dossier.js',
 'scored-match.js','forward-bays.js','lan-series.js','lan-room.js','ctf-rules.js','ctf-ai.js']);
const errors=[],missing=[];
const server=http.createServer((req,res)=>{
 const key=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\/+/, '')||'index.html';
 if(key==='favicon.ico'){res.writeHead(204);res.end();return}
 if(!assets.has(key)){missing.push(key);res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':key.endsWith('.js')?'text/javascript':key.endsWith('.css')?'text/css':'text/html'});
 res.end(fs.readFileSync(path.join(root,key)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const data=[];
try{
 for(const c of [{w:740,h:360,dpr:1},{w:915,h:412,dpr:3}]){
  const context=await browser.newContext({viewport:{width:c.w,height:c.h},deviceScaleFactor:c.dpr});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.__arenaBufferWrites={width:0,height:0};
   for(const name of ['width','height']){
    const desc=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,name);
    Object.defineProperty(HTMLCanvasElement.prototype,name,{
     configurable:true,enumerable:desc.enumerable,
     get(){return desc.get.call(this)},
     set(v){
      if(this.id==='arena')window.__arenaBufferWrites[name]++;
      return desc.set.call(this,v);
     }
    });
   }
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
  await page.waitForFunction(()=>document.querySelector('#arena')?.width>300);
  const read=()=>page.evaluate(()=>{
   const el=document.querySelector('#arena'),ctx=el.getContext('2d');
   const t=ctx.getTransform();
   return {width:el.width,height:el.height,writes:{...window.__arenaBufferWrites},
    cssW:window.innerWidth,cssH:window.innerHeight,scale:t.a,verticalScale:t.d};
  });
  const initial=await read(),ratio=Math.min(1.6,Math.max(1,c.dpr));
  assert.equal(initial.width,Math.round(c.w*ratio));
  assert.equal(initial.height,Math.round(c.h*ratio));
  assert.equal(initial.scale,ratio,'Canvas logical coordinate scale');
  assert.equal(initial.verticalScale,ratio);
  // System events and orientation callbacks can fire repeatedly with the
  // exact same viewport. None should reset the canvas bitmap or draw state.
  await page.evaluate(()=>{
   for(let i=0;i<12;i++){
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('orientationchange'));
   }
  });
  const redundant=await read();
  assert.deepEqual(redundant.writes,initial.writes,'24 unchanged events must never reallocate backing canvas');
  assert.equal(redundant.scale,ratio);
  // Real viewport width-only change: only the width buffer may be assigned.
  await page.setViewportSize({width:c.w+41,height:c.h});
  await page.waitForFunction(([width,scale])=>
   document.querySelector('#arena').width===Math.round(width*scale),[c.w+41,ratio]);
  const resized=await read();
  assert.equal(resized.width,Math.round((c.w+41)*ratio));
  assert.equal(resized.height,initial.height);
  assert.equal(resized.writes.width,redundant.writes.width+1,'real width change reallocates once');
  assert.equal(resized.writes.height,redundant.writes.height,'unchanged height should not be rewritten');
  assert.equal(resized.scale,ratio);
  await page.evaluate(()=>window.dispatchEvent(new Event('orientationchange')));
  assert.deepEqual((await read()).writes,resized.writes,'post-resize duplicate event does not reallocate');
  data.push({viewport:c.w+'x'+c.h,dpr:c.dpr,backingScale:ratio,unchangedEvents:24,unnecessaryBufferWrites:0,realResizeWidthWrites:1});
  await context.close();
 }
 assert.deepEqual(errors,[],'no runtime errors');
 assert.deepEqual(missing,[],'all game assets available');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/android-canvas-resize.json',JSON.stringify({result:'PASS',type:'REAL_CHROMIUM',cases:data},null,2)+'\n');
 console.log('ANDROID_CANVAS_RESIZE_PASS '+JSON.stringify(data));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}

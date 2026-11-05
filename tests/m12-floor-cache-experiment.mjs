// M12-D: real-game test-only floor stamp A/B experiment. Not production code or Android FPS.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'Chromium required');
const root=path.resolve('web'),game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const start='  for(let gy=ymin;gy<ymax;gy++)for(let gx=xmin;gx<xmax;gx++){';
const stop='  // Forward Bay markings sit UNDER solid walls';
const a=game.indexOf(start),b=game.indexOf(stop,a);
assert.ok(a>0&&b>a,'Real FIELDGRID loop not found');
const floor=game.slice(a,b);
const i=floor.indexOf("    c.fillStyle=hash%3===0?"),j=floor.lastIndexOf('\n  }');
assert.ok(i>0&&j>i,'Real floor painter changed; fail closed');
const interior=floor.slice(i,j);
const exterior=floor.match(/if\(x<0\|\|y<0\|\|x>=worldW\|\|y>=worldH\)\{([^}]+)continue;\}/);
assert.ok(exterior,'Real exterior tiles changed; fail closed');
const cacheSource=[
 'let __m12Stamps=null;',
 'function __m12BuildStamps(){',
 ' if(__m12Stamps)return __m12Stamps;',
 ' __m12Stamps=[];',
 ' for(let variant=0;variant<12;variant++){',
 "  const el=document.createElement('canvas');el.width=132;el.height=132;",
 "  const c=el.getContext('2d'),tile=132,x=0,y=0,hash=variant;",
 '  if(variant===11){'+exterior[1]+'}else{',
 interior,
 '  }__m12Stamps.push(el);',
 ' }return __m12Stamps;',
 '}'
].join('\n');
const cached=[
 '  if(window.__m12FloorCacheMode){',
 '   const stamps=__m12BuildStamps();',
 '   for(let gy=ymin;gy<ymax;gy++)for(let gx=xmin;gx<xmax;gx++){',
 '    const x=gx*tile,y=gy*tile,hash=(gx*19+gy*37+currentSeed%23)%11;',
 '    const outside=x<0||y<0||x>=worldW||y>=worldH;',
 '    const stamp=stamps[outside?11:hash];',
 "    if(!stamp)throw Error('M12 stamp index invalid: '+hash);",
 '    c.drawImage(stamp,x,y);',
 '   }',
 '  }else{',
 floor,
 '  }'
].join('\n');
const patched=game.slice(0,a)+cached+game.slice(b);
const hooks=String.raw`
function __m12Diff(first,second){
 let sum=0,large=0,changed=0;
 const total=first.length/4;
 for(let i=0;i<first.length;i+=4){
  let high=false,any=false;
  for(let k=0;k<4;k++){
   const delta=Math.abs(first[i+k]-second[i+k]);
   sum+=delta;if(delta>0)any=true;if(delta>20)high=true;
  }
  if(any)changed++;if(high)large++;
 }
 return {pixelCount:total,changedPixelPercent:+(100*changed/total).toFixed(3),
  largeErrorPixelPercent:+(100*large/total).toFixed(3),
  meanChannelError:+(sum/first.length).toFixed(4)};
}
function __m12Measure(enabled,frames){
 window.__m12FloorCacheMode=enabled;
 for(let i=0;i<4;i++)render(0);
 const names=['fillRect','strokeRect','fillText','drawImage'],counts={},originals={};
 for(const name of names){
  originals[name]=CanvasRenderingContext2D.prototype[name];counts[name]=0;
  CanvasRenderingContext2D.prototype[name]=function(...args){
   counts[name]++;return originals[name].apply(this,args);
  };
 }
 const times=[];
 try{for(let i=0;i<frames;i++){
  const start=performance.now();render(0);times.push(performance.now()-start);
 }}finally{for(const name of names)CanvasRenderingContext2D.prototype[name]=originals[name];}
 const sorted=times.sort((a,b)=>a-b),nth=q=>+sorted[Math.floor((sorted.length-1)*q)].toFixed(4);
 return {frames,medianMs:nth(.5),p95Ms:nth(.95),maxMs:nth(1),
  operationsPerFrame:Object.fromEntries(names.map(n=>[n,+(counts[n]/frames).toFixed(2)]))};
}
window.__m12FloorAudit={
 run(size,bots,seed,frames=72){
  mode='solo';paused=true;connected=false;
  state=initialState(0,{...selectedRules,mapSize:size,botCount:bots,pilotMode:true},seed);
  camera.zoom=null;camera.x=0;camera.y=0;screenKick=0;
  window.__m12FloorCacheMode=false;
  for(let i=0;i<12;i++)render(1/60);
  render(0);
  const original=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  __m12BuildStamps();window.__m12FloorCacheMode=true;render(0);
  const stamped=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  const visual=__m12Diff(original,stamped);
  const baseline=__m12Measure(false,frames),cache=__m12Measure(true,frames);
  return {size,bots,seed,canvasPixels:canvas.width*canvas.height,walls:wallSet.length,
   stamps:__m12Stamps.length,decodedBytes:__m12Stamps.reduce((n,t)=>n+t.width*t.height*4,0),
   baseline,cache,visual};
 },
 capture(enabled){window.__m12FloorCacheMode=enabled;render(0);return canvas.toDataURL('image/png');}
};
`;
assert.ok(/\}\)\(\);\s*$/.test(patched),'Real engine IIFE changed');
const instrumented=patched.replace(/\}\)\(\);\s*$/,'\n'+cacheSource+'\n'+hooks+'\n})();');
const allowed=new Set(['index.html','style.css','game.js','dossier.js','save-backup.js','scored-match.js',
 'forward-bays.js','lan-series.js','lan-room.js','ctf-rules.js','ctf-ai.js']);
const errors=[],missing=[],remote=[];
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1/').pathname.replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed.has(name)){missing.push(name);res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(name==='game.js'?instrumented:fs.readFileSync(path.join(root,name)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const out='qa-results/m12/floor-cache',rows=[];
fs.mkdirSync(out,{recursive:true});
try{
 for(const [w,h] of [[740,360],[915,412],[1280,720]]){
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(w+'x'+h+': '+e.message));
  page.on('request',r=>{if(!r.url().startsWith(origin))remote.push(r.url());});
  try{
   await page.goto(origin+'/',{waitUntil:'load'});
   await page.waitForFunction(()=>!!window.__m12FloorAudit);
   for(const [size,bots] of [['small',1],['standard',2],['large',4]]){
    const seed=610017+rows.length;
    const raw=await page.evaluate(({size,bots,seed})=>window.__m12FloorAudit.run(size,bots,seed),{size,bots,seed});
    assert.ok(raw.canvasPixels>0&&raw.walls>0&&raw.stamps===12);
    assert.ok(raw.decodedBytes<=1024*1024,'Texture memory budget exceeded');
    assert.ok(raw.baseline.operationsPerFrame.fillRect>raw.cache.operationsPerFrame.fillRect,'No floor draw reduction');
    assert.ok(raw.cache.operationsPerFrame.drawImage>0,'Cached floor images did not render');
    assert.ok(raw.visual.pixelCount>0&&Number.isFinite(raw.visual.meanChannelError));
    rows.push({viewport:w+'x'+h,...raw});
    if((w===740&&size==='standard')||(w===1280&&size==='large')){
     for(const [label,flag] of [['procedural',false],['cached',true]]){
      const data=await page.evaluate(enabled=>window.__m12FloorAudit.capture(enabled),flag);
      fs.writeFileSync(path.join(out,w+'x'+h+'-'+size+'-'+label+'.png'),
       Buffer.from(data.slice(data.indexOf(',')+1),'base64'));
     }
    }
   }
  }finally{await page.close();}
 }
 assert.equal(rows.length,9);
 assert.deepEqual(errors,[],'Real game page errors');
 assert.deepEqual(missing,[],'Missing offline game dependency');
 assert.deepEqual(remote,[],'Unexpected external URL');
 const report={type:'HEADLESS_CHROMIUM_TEST_ONLY_NOT_ANDROID_FPS',cases:rows.length,
  source:'Real renderer floor loop reused in a test-only cache; production Web/Android unchanged',
  cacheTextures:12,decodedRGBABytes:12*132*132*4,
  shippingDecision:'NOT APPROVED: evaluate median/P95, visual pixel delta, screenshots and phone GPU/heat',
  rows};
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log('M12_D_TILE_CACHE_EXPERIMENT_PASS '+JSON.stringify(rows.map(r=>({
  viewport:r.viewport,size:r.size,baselineFill:r.baseline.operationsPerFrame.fillRect,
  cachedFill:r.cache.operationsPerFrame.fillRect,cacheDrawImage:r.cache.operationsPerFrame.drawImage,
  medianBefore:r.baseline.medianMs,medianAfter:r.cache.medianMs,
  p95Before:r.baseline.p95Ms,p95After:r.cache.p95Ms,visual:r.visual}))));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}

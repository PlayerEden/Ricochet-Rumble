// Isolated Pixi renderer probe QA. This is not proof of production game performance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';

assert.ok(process.env.CHROME_BIN,'CHROME_BIN required: do not silently skip GPU/browser QA');
const root=path.resolve('experiments/pixi-probe/dist');
const allow=new Set(['index.html','style.css','bundle.js']);
const server=http.createServer((req,res)=>{
 const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!allow.has(file)){res.writeHead(404);res.end('Not found');return;}
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');
 res.end(fs.readFileSync(path.join(root,file)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({
 executablePath:process.env.CHROME_BIN,headless:true,
 args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
});
const results=[];
try {
 fs.mkdirSync('qa-results/pixi-probe',{recursive:true});
 for(const [width,height] of [[568,320],[740,360],[915,412]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'load'});
  await page.waitForFunction(()=>window.__pixiProbe?.ready&&window.__pixiProbe?.engine==='pixi'&&window.__pixiProbe?.frames>=8,null,{timeout:30000});
  let pixi=await page.evaluate(()=>window.__pixiProbe);
  assert.equal(pixi.engine,'pixi','Pixi renderer should start successfully');
  assert.match(pixi.backend,/webgl/i,'must use actual WebGL renderer');
  assert.ok(pixi.frames>=8,'actual requestAnimationFrame loop must run');
  const pixiCanvas=page.locator('#pixi-host canvas');
  assert.equal(await pixiCanvas.count(),1,'PixiJS creates a visible canvas');
  assert.ok(await pixiCanvas.isVisible(),'Pixi canvas must be visible');
  const frameBefore=pixi.frames;
  await page.locator('#fire').click({force:true});
  await page.waitForFunction(()=>window.__pixiProbe?.shots>=1&&window.__pixiProbe?.frames>0,null,{timeout:20000});
  pixi=await page.evaluate(()=>window.__pixiProbe);
  assert.ok(pixi.frames>frameBefore,'Pixi draw loop survives control interaction');
  assert.ok(pixi.shots>=1,'player control emitted a projectile');
  const pixiShot=await page.screenshot({path:'qa-results/pixi-probe/pixi-'+width+'x'+height+'.png'});
  assert.ok(pixiShot.byteLength>7000,'Pixi scene screenshot is not empty');
  await page.locator('#use-canvas').click();
  await page.waitForFunction(()=>window.__pixiProbe?.engine==='canvas'&&window.__pixiProbe?.frames>=8,null,{timeout:20000});
  const canvas=await page.evaluate(()=>window.__pixiProbe);
  assert.equal(canvas.engine,'canvas');
  assert.ok(canvas.frames>=8,'Canvas loop should render');
  assert.ok(await page.locator('#canvas2d').isVisible(),'baseline Canvas is visible');
  const canvasShot=await page.screenshot({path:'qa-results/pixi-probe/canvas-'+width+'x'+height+'.png'});
  assert.ok(canvasShot.byteLength>7000,'Canvas scene screenshot is not empty');
  await page.locator('#reset').click();
  await page.waitForTimeout(200);
  assert.equal(await page.locator('#kills').innerText(),'0','reset restores same starting scenario');
  await page.locator('#use-pixi').click();
  await page.waitForFunction(()=>window.__pixiProbe?.engine==='pixi'&&window.__pixiProbe?.frames>=8,null,{timeout:20000});
  assert.equal((await page.evaluate(()=>window.__pixiProbe)).engine,'pixi','repeat switch remains stable');
  assert.deepEqual(errors,[],'no runtime page exceptions');
  results.push({viewport:width+'x'+height,backend:pixi.backend,pixiFrames:pixi.frames,canvasFrames:canvas.frames,
   pixiRenderP95Ms:pixi.renderP95,canvasRenderP95Ms:canvas.renderP95,controls:'PASS',
   note:'These are synthetic desktop SwiftShader figures, not phone FPS'});
  await page.close();
 }
 console.log('PIXI_PROBE_BROWSER_QA_PASS '+JSON.stringify({scenes:results.length,results}));
 fs.writeFileSync('qa-results/pixi-probe/evidence.json',JSON.stringify({
  scope:'Isolated renderer-only microarena, not production Sector Rebound',
  caveat:'Chromium CI with software SwiftShader does not establish Android GPU speed, heat or battery results',
  results
 },null,2));
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}

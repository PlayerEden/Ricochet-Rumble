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
  await page.waitForFunction(()=>window.__pixiPremium?.ready&&window.__pixiPremium?.view==='menu'&&window.__pixiProbe?.frames>=8,null,{timeout:30000});
  assert.equal(await page.locator('#go-deploy').isVisible(),true,'primary deploy action visible');
  assert.equal(await page.locator('#menu-screen').isVisible(),true,'cinematic front-end visible at launch');
  assert.equal((await page.evaluate(()=>window.__pixiPremium)).shader,true,'actual WebGL hologram shader enabled on launch');
  const menuShot=await page.screenshot({path:'qa-results/pixi-probe/premium-MENU-'+width+'x'+height+'.png'});
  assert.ok(menuShot.byteLength>8000,'premium menu screenshot populated');
  await page.locator('#go-hangar').click();
  await page.waitForFunction(()=>window.__pixiPremium?.view==='hangar',null,{timeout:15000});
  assert.equal(await page.locator('#hangar-screen').isVisible(),true);
  assert.ok((await page.screenshot({path:'qa-results/pixi-probe/premium-HANGAR-'+width+'x'+height+'.png'})).byteLength>8000);
  await page.locator('#hangar-back').click();
  await page.locator('#go-settings').click();
  await page.waitForFunction(()=>window.__pixiPremium?.view==='settings',null,{timeout:15000});
  await page.locator('#quality-reduced').click();
  await page.waitForFunction(()=>window.__pixiPremium?.quality==='reduced'&&window.__pixiPremium?.shader===false,null,{timeout:15000});
  assert.equal(await page.locator('#quality-reduced').getAttribute('aria-pressed'),'true');
  const reducedShot=await page.locator('#pixi-host canvas').screenshot({path:'qa-results/pixi-probe/menu-REDUCED-'+width+'x'+height+'.png'});
  await page.locator('#quality-cinematic').click();
  await page.waitForFunction(()=>window.__pixiPremium?.quality==='cinematic'&&window.__pixiPremium?.shader===true,null,{timeout:15000});
  const premiumShot=await page.locator('#pixi-host canvas').screenshot({path:'qa-results/pixi-probe/menu-SHADER-'+width+'x'+height+'.png'});
  assert.equal(premiumShot.equals(reducedShot),false,'GLSL shader and atmospheric layers change the Pixi render');
  // A blank shader can differ from an unfiltered panel and still pass an A/B test.
  // Require real cyan vehicle-line detail INSIDE the filtered hologram itself.
  const sample=await page.evaluate(async base64=>{
   const im=new Image();im.src='data:image/png;base64,'+base64;await im.decode();
   const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;
   const g=c.getContext('2d');g.drawImage(im,0,0);
   const w=c.width,h=c.height;
   const data=g.getImageData(Math.floor(w*.78),Math.floor(h*.15),Math.floor(w*.175),Math.floor(h*.20)).data;
   let bright=0;for(let i=0;i<data.length;i+=4)
    if(data[i]>75&&data[i+1]>140&&data[i+2]>150)bright++;
   return {bright,width:w,height:h};
  },premiumShot.toString('base64'));
  assert.ok(sample.bright>30,'enabled GPU hologram must retain readable cyan art, not blank it: '+JSON.stringify(sample));
  await page.locator('#settings-back').click();
  await page.locator('#go-deploy').click();
  await page.waitForFunction(()=>window.__pixiPremium?.view==='combat'&&window.__pixiProbe?.engine==='pixi'&&window.__pixiProbe?.frames>=8,null,{timeout:20000});
  assert.equal(await page.locator('#front-end').isVisible(),false,'main menu removed from combat');
  assert.equal(await page.locator('#match-hud').isVisible(),true,'tactical combat overlay visible');

  await page.waitForFunction(()=>window.__pixiProbe?.ready&&window.__pixiProbe?.engine==='pixi'&&window.__pixiProbe?.frames>=8,null,{timeout:30000});
  let pixi=await page.evaluate(()=>window.__pixiProbe);
  assert.equal(pixi.engine,'pixi','Pixi renderer should start successfully');
  assert.match(pixi.backend,/webgl/i,'must use actual WebGL renderer');
  assert.equal(pixi.visuals,'production-path-art','actual mainline unit art contract must be used');
  assert.equal(pixi.bots,5,'normal scene must show representative combat workload');
  assert.equal(pixi.fxEnabled,true,'Pixi FX should initialize enabled');
  assert.equal(pixi.artMode,'layered','advanced rig mode should be the starting visual');
  assert.ok(pixi.artRigs>=8,'multiple layered unit rigs are present in rendered arena');
  assert.ok(pixi.pixelDensity>=1&&pixi.pixelDensity<=1.75,'bounded high-DPI rendering is initialized');
  assert.equal(pixi.zoom,.94,'combat camera initially selected');
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
  const dimensions=await page.locator('#field').boundingBox();
  assert.ok(dimensions?.height>=130,'compact landscape still leaves playable canvas');
  const pixiShot=await page.screenshot({path:'qa-results/pixi-probe/pixi-'+width+'x'+height+'.png'});
  await page.locator('#tools-toggle').click();
  assert.equal(await page.locator('#lab-tools').isVisible(),true,'diagnostics available but initially collapsed');
  assert.ok(pixiShot.byteLength>7000,'Pixi scene screenshot is not empty');
  await page.locator('#use-canvas').click();
  await page.waitForFunction(()=>window.__pixiProbe?.engine==='canvas'&&window.__pixiProbe?.frames>=8,null,{timeout:20000});
  const canvas=await page.evaluate(()=>window.__pixiProbe);
  assert.equal(canvas.engine,'canvas');
  assert.equal(await page.locator('#toggle-fx').isDisabled(),true,'GPU FX is explicitly unavailable in Canvas baseline');
  assert.equal(await page.locator('#toggle-art').isDisabled(),true,'layered Pixi rig is exclusive to WebGL showcase');
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
  assert.equal(await page.locator('#toggle-fx').isEnabled(),true,'Pixi FX toggle is active in WebGL mode');
  await page.locator('#use-stress').click();
  await page.waitForFunction(()=>window.__pixiProbe?.load==='stress'&&window.__pixiProbe?.frames>=8&&window.__pixiProbe?.shots>=25,null,{timeout:25000});
  const stress=await page.evaluate(()=>window.__pixiProbe);
  assert.equal(stress.bots,18,'stress contains expanded mixture of tanks, mechs, and pilots');
  // Freeze one exact stress combat state before making paired VFX screenshots.
  await page.evaluate(()=>window.__pixiProbeFreeze(true));
  await page.evaluate(()=>window.__pixiFxShowcase());
  await page.waitForFunction(()=>window.__pixiProbe?.activeFxSprites>=15&&window.__pixiProbe?.fxEvents>=5,null,{timeout:20000});
  assert.equal(await page.locator('#toggle-fx').getAttribute('aria-pressed'),'true');
  const fxOnCanvas=await pixiCanvas.screenshot({path:'qa-results/pixi-probe/fx-ON-'+width+'x'+height+'.png'});
  await page.locator('#toggle-fx').click();
  await page.waitForFunction(()=>window.__pixiProbe?.fxEnabled===false&&window.__pixiProbe?.activeFxSprites===0,null,{timeout:20000});
  const fxOffCanvas=await pixiCanvas.screenshot({path:'qa-results/pixi-probe/fx-OFF-'+width+'x'+height+'.png'});
  assert.equal(fxOnCanvas.equals(fxOffCanvas),false,'Pixi FX ON/OFF should visually differ for identical frozen combat state');
  assert.equal(await page.locator('#toggle-fx').getAttribute('aria-pressed'),'false');
  await page.locator('#toggle-fx').click();
  await page.waitForFunction(()=>window.__pixiProbe?.fxEnabled===true&&window.__pixiProbe?.activeFxSprites>=15,null,{timeout:20000});
  await page.waitForTimeout(100);
  // Art showcase uses the same frozen units and camera, only changes render design.
  const layeredArt=await pixiCanvas.screenshot({path:'qa-results/pixi-probe/layered-ART-'+width+'x'+height+'.png'});
  await page.locator('#toggle-art').click();
  await page.waitForFunction(()=>window.__pixiProbe?.artMode==='classic'&&window.__pixiProbe?.artRigs===0,null,{timeout:20000});
  const classicArt=await pixiCanvas.screenshot({path:'qa-results/pixi-probe/classic-ART-'+width+'x'+height+'.png'});
  assert.equal(layeredArt.equals(classicArt),false,'layered art should visibly differ from classic using frozen combat state');
  assert.equal(await page.locator('#toggle-art').getAttribute('aria-pressed'),'false');
  await page.locator('#toggle-art').click();
  await page.waitForFunction(()=>window.__pixiProbe?.artMode==='layered'&&window.__pixiProbe?.artRigs>=8,null,{timeout:20000});
  await page.locator('#zoom-in').click();
  await page.waitForFunction(()=>window.__pixiProbe?.zoom>1.25,null,{timeout:20000});
  assert.ok((await pixiCanvas.screenshot({path:'qa-results/pixi-probe/close-DETAIL-'+width+'x'+height+'.png'})).byteLength>7000);
  await page.locator('#zoom-out').click();
  await page.locator('#zoom-out').click();
  await page.waitForFunction(()=>window.__pixiProbe?.zoom<.70,null,{timeout:20000});
  assert.ok((await pixiCanvas.screenshot({path:'qa-results/pixi-probe/wide-ARENA-'+width+'x'+height+'.png'})).byteLength>7000);
  await page.locator('#zoom-in').click();
  await page.waitForFunction(()=>Math.abs(window.__pixiProbe?.zoom-.94)<.002,null,{timeout:20000});
  assert.ok((await page.screenshot({path:'qa-results/pixi-probe/pixi-STRESS-'+width+'x'+height+'.png'})).byteLength>7000);
  await page.locator('#use-canvas').click();
  await page.waitForFunction(()=>window.__pixiProbe?.engine==='canvas'&&window.__pixiProbe?.frames>=8,null,{timeout:25000});
  assert.ok((await page.screenshot({path:'qa-results/pixi-probe/canvas-STRESS-'+width+'x'+height+'.png'})).byteLength>7000);
  await page.evaluate(()=>window.__pixiProbeFreeze(false));
  await page.locator('#use-match').click();
  await page.waitForFunction(()=>window.__pixiProbe?.load==='match'&&window.__pixiProbe?.frames>=8,null,{timeout:25000});
  assert.equal((await page.evaluate(()=>window.__pixiProbe)).bots,5,'matching workload restored');
  await page.locator('#pause-btn').click();
  await page.waitForFunction(()=>window.__pixiPremium?.paused===true,null,{timeout:15000});
  assert.equal(await page.locator('#resume-btn').isVisible(),true,'in-match pause options usable');
  await page.locator('#resume-btn').click();
  await page.waitForFunction(()=>window.__pixiPremium?.paused===false,null,{timeout:15000});
  await page.locator('#pause-btn').click();
  await page.locator('#return-menu').click();
  await page.waitForFunction(()=>window.__pixiPremium?.view==='menu',null,{timeout:15000});
  assert.deepEqual(errors,[],'no runtime page exceptions');
  results.push({viewport:width+'x'+height,backend:pixi.backend,pixiFrames:pixi.frames,canvasFrames:canvas.frames,fxOnOff:'PASS',fxEventShowcase:'PASS',layeredArt:'PASS',cameraZoomPresets:'PASS',premiumMainMenu:'PASS',premiumHangar:'PASS',shaderQuality:'PASS',combatHUD:'PASS',pauseFlow:'PASS',
   pixiRenderP95Ms:pixi.renderP95,canvasRenderP95Ms:canvas.renderP95,matchBots:5,stressBots:18,productionArt:true,controls:'PASS',
   note:'These are synthetic desktop SwiftShader figures, not phone FPS'});
  await page.close();
 }
 console.log('PIXI_PREMIUM_VERTICAL_SLICE_QA_PASS '+JSON.stringify({scenes:results.length,results}));
 fs.writeFileSync('qa-results/pixi-probe/evidence.json',JSON.stringify({
  scope:'Isolated Pixi GPU visual-effects demo using FIELDGRID art, not production Sector Rebound',
  caveat:'Chromium CI with software SwiftShader does not establish Android GPU speed, heat or battery results',
  results
 },null,2));
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}

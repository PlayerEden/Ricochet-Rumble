// Actual Chromium color hierarchy and mobile-screen QA for the Sector Rebound menu identity.
// No game hooks or fake UI: load the real browser files and click real buttons.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright-core';
const chrome=process.env.CHROME_BIN;
assert.ok(chrome,'CHROME_BIN required for real rendered UI audit');
const sizes=[[568,320],[640,360],[740,360],[915,412],[1280,720]];
const dir=path.join('qa-screens','identity');
fs.mkdirSync(dir,{recursive:true});
const report={version:1,scope:'Actual rendered app CSS at real landscape viewports; no gameplay behavior changes',screens:[],issues:[]};
function rgb(value){
 const a=String(value).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
 return a?a.slice(1,4).map(Number):null;
}
function luminance(c){
 const x=c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
 return .2126*x[0]+.7152*x[1]+.0722*x[2];
}
function contrast(a,b){
 const L=[luminance(a),luminance(b)].sort((a,b)=>b-a);
 return (L[0]+.05)/(L[1]+.05);
}
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const [w,h] of sizes){
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(pathToFileURL(path.join(process.cwd(),'web','index.html')).href,{waitUntil:'load'});
  await page.waitForTimeout(220);
  const home=await page.evaluate(()=>{
   const style=s=>{const e=document.querySelector(s);if(!e)throw new Error('missing '+s);const c=getComputedStyle(e);return {bg:c.backgroundImage,color:c.color,border:c.borderColor,visible:e.getBoundingClientRect().width>1};};
   return {main:style('#panel .home-deploy'),modes:style('#panel .home-action-grid button.home-modes'),utility:style('#panel .home-utilities button'),actions:style('.home-actions'),panel:style('#panel'),teamBlue:style('.blue-tag'),teamRed:style('.pink-tag')};
  });
  const amber=rgb(home.main.bg),primaryText=rgb(home.main.color),secondary=rgb(home.modes.bg),secondaryText=rgb(home.modes.color);
  assert.deepEqual(amber,[255,207,116],'Quick Play must be warm amber, not turquoise');
  assert.deepEqual(secondary,[59,69,74],'Mode chooser should be neutral gunmetal, not teal');
  assert.ok(contrast(amber,primaryText)>=7,'Primary action text readability');
  assert.ok(contrast(secondary,secondaryText)>=7,'Secondary mode chooser text readability');
  assert.ok(contrast(amber,secondary)>=2,'Play must be perceptually distinct from adjacent grey buttons');
  assert.ok(rgb(home.teamBlue.color)[2]>rgb(home.teamBlue.color)[0],'Live blue team identity must be retained');
  assert.ok(rgb(home.teamRed.color)[0]>rgb(home.teamRed.color)[2],'Live red enemy identity must be retained');
  await page.screenshot({path:path.join(dir,w+'x'+h+'-home.png'),animations:'disabled'});
  await page.locator('#menu button[data-action="modes"]').click();
  const options=page.locator('.mode-grid button');
  assert.equal(await options.count(),4);
  assert.equal(await page.locator('.mode-grid .mode-icon[aria-hidden="true"]').count(),4);
  const cards=await options.evaluateAll(elements=>elements.map(e=>{
   const cs=getComputedStyle(e),r=e.getBoundingClientRect();
   return {label:e.textContent.trim(),background:cs.backgroundImage,rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom}};
  }));
  assert.ok(cards.every(c=>c.background.includes('rgb(48, 58, 63)')),'Mode cards remain neutral');
  assert.ok(cards.every(c=>c.rect.left>=-2&&c.rect.right<=w+2),'No mode card horizontal clipping');
  await page.screenshot({path:path.join(dir,w+'x'+h+'-modes.png'),animations:'disabled'});
  await page.locator('#menu button[data-action="modes-back"]').click();
  await page.locator('#menu button[data-action="hangar"]').click();
  const hangar=await page.locator('.hangar-grid button.selected').first().evaluate(el=>({border:getComputedStyle(el).borderColor,background:getComputedStyle(el).backgroundColor}));
  assert.deepEqual(rgb(hangar.border),[114,199,210],'Equipped cosmetic uses cyan selection, not amber CTA');
  await page.screenshot({path:path.join(dir,w+'x'+h+'-hangar.png'),animations:'disabled'});
  await page.locator('#menu button[data-action="hangar-back"]').click();
  await page.locator('#menu button[data-action="dossier"]').click();
  const dossier=await page.locator('.dossier-stats>div').first().evaluate(el=>getComputedStyle(el).backgroundColor);
  assert.deepEqual(rgb(dossier),[37,47,52],'Dossier tiles use graphite surface');
  await page.screenshot({path:path.join(dir,w+'x'+h+'-dossier.png'),animations:'disabled'});
  await page.locator('#menu button[data-action="dossier-back"]').click();
  await page.locator('#menu button[data-action="settings"]').click();
  const settings=await page.locator('button[data-action="settings-play"]').evaluate(el=>({bg:getComputedStyle(el).backgroundImage,color:getComputedStyle(el).color}));
  assert.deepEqual(rgb(settings.bg),[255,207,112],'Settings START MATCH remains a primary amber action');
  await page.screenshot({path:path.join(dir,w+'x'+h+'-settings.png'),animations:'disabled'});
  assert.deepEqual(errors,[],'No page errors');
  report.screens.push({viewport:w+'x'+h,heroPrimaryContrast:+contrast(amber,primaryText).toFixed(2),secondaryContrast:+contrast(secondary,secondaryText).toFixed(2),primaryVsSecondary:+contrast(amber,secondary).toFixed(2),modeCards:cards.length,equippedBorder:hangar.border,errors:errors.length});
  await page.close();
 }
}finally{await browser.close();}
fs.writeFileSync(path.join(dir,'visual-identity-report.json'),JSON.stringify(report,null,2));
console.log('PASS UI visual identity: '+report.screens.length+' real viewport flows, 25 screenshots; amber CTA distinct, neutral mode cards, cyan equipped, team HUD colors retained');

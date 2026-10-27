// Capture real game/browser screenshots at phone-landscape sizes.
// Runs only in CI with optional playwright-core and Chrome available.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright-core';

const root=process.cwd();
const chrome=process.env.CHROME_BIN;
if(!chrome){console.log('SKIP visual QA: no Chrome executable');process.exit(0);}
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const report=[];
const sizes=[[740,360],[915,412],[1280,720]];
try{
 for(const [name,rootDir] of [['before',path.join(root,'visual-baseline')],['after',root]]){
  if(!fs.existsSync(path.join(rootDir,'web/index.html')))continue;
  for(const [width,height] of sizes){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   // Identical procedural seeds for the old and new builds. Screenshot
   // comparisons must compare UI/camera, not two randomly different mazes.
   await page.addInitScript(()=>{
    let seed=0x5eed1937;
    Math.random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
   });
   const label=width+'x'+height;
   const out=path.join(root,'qa-screens',name);
   fs.mkdirSync(out,{recursive:true});
   await page.goto(pathToFileURL(path.join(rootDir,'web/index.html')).href,{waitUntil:'load'});
   await page.waitForTimeout(170);
   async function shot(stage){
    const panel=await page.locator('#panel').evaluate(el=>({scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,rect:(()=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()})).catch(()=>null);
    const canvas=await page.locator('#arena').boundingBox();
    const fullBleed=!!canvas&&Math.abs(canvas.x)<2&&Math.abs(canvas.y)<2&&Math.abs(canvas.width-width)<2&&Math.abs(canvas.height-height)<2;
    if(name==='after'&&['arena','moving-tank'].includes(stage)&&!fullBleed)throw new Error('Fullscreen arena regression at '+label+' / '+stage);
    if(name==='after'&&['home','settings'].includes(stage)&&panel&&panel.scrollHeight>panel.clientHeight+2)
      throw new Error('Unexpected primary-menu scrolling at '+label+' / '+stage);
    report.push({version:name,viewport:label,screen:stage,panel,scrollNeeded:!!panel&&panel.scrollHeight>panel.clientHeight+2,canvas,fullBleed});
    await page.screenshot({path:path.join(out,label+'-'+stage+'.png'),animations:'disabled'});
   }
   await shot('home');
   await page.locator('#menu button[data-action="settings"]').click();
   await shot('settings');
   await page.locator('#menu button[data-action="settings-back"]').click();
   await page.locator('#menu button[data-action="help"]').click();
   await shot('help');
   await page.locator('#menu button[data-action="help-back"]').click();
   await page.locator('#menu button[data-action="solo"]').click();
   await page.waitForTimeout(180);
   await shot('arena');
   // Movement footage as a deterministic held-key frame, not a mockup.
   await page.keyboard.down('d');
   await page.waitForTimeout(520);
   await shot('moving-tank');
   await page.keyboard.up('d');
   await page.locator('#menu-button').click();
   await shot('pause');
   await page.close();
  }
 }
 fs.writeFileSync(path.join(root,'qa-screens','layout-report.json'),JSON.stringify(report,null,2));
 console.log('PASS visual snapshots: '+report.length+' screens; fullscreen assertion plus overflow report');
 console.log(JSON.stringify(report.filter(x=>x.screen==='home'||x.screen==='settings').map(x=>({version:x.version,viewport:x.viewport,screen:x.screen,scrollNeeded:x.scrollNeeded}))));
}finally{await browser.close();}

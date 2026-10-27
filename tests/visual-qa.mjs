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
   if(name==='after'){
    const home=page.locator('.home-screen');
    if(!await home.isVisible())throw new Error('Modern game lobby missing at '+label);
    const deploy=await page.locator('.home-deploy').boundingBox();
    const actions=await page.locator('.home-action-grid').boundingBox();
    const stage=await page.locator('#menu-preview').boundingBox();
    if(!deploy||!actions||!stage||deploy.width<150||deploy.height<43||actions.height<41||stage.height<110)
      throw new Error('Main lobby lacks readable play target or featured unit at '+label);
    for(const rect of [deploy,actions,stage]){
     if(rect.x<0||rect.y<0||rect.x+rect.width>width+1||rect.y+rect.height>height+1)
      throw new Error('Home lobby control/stage clipped at '+label);
    }
    const preview=await page.locator('#menu-preview').evaluate(el=>{
     const {data}=el.getContext('2d').getImageData(0,0,el.width,el.height);
     let dark=0,bright=0;
     for(let i=0;i<data.length;i+=640){if(data[i]<40)dark++;if(data[i]>80)bright++;}
     return {dark,bright};
    });
    if(preview.bright<4)throw new Error('Live tank render missing from home stage at '+label);
   }
   await shot('home');
   if(name==='after'&&width===915&&height===412){
    // Real-time tank -> mech showcase, not a static design mockup.
    await page.waitForTimeout(8100);
    const unit=(await page.locator('#home-unit-name').textContent()||'').trim();
    if(unit!=='MECHANIZED RESPONSE')throw new Error('Showcase did not cycle into mech: '+unit);
    await shot('home-mech');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForTimeout(200);
    if((await page.locator('#home-unit-name').textContent()||'').trim()!=='ARMORED RESPONSE')
     throw new Error('Reduced-motion preview must hold stationary tank');
    await shot('home-reduced-motion');
    await page.emulateMedia({reducedMotion:'no-preference'});
   }
   await page.locator('#menu button[data-action="settings"]').click();
   await shot('settings');
   await page.locator('#menu button[data-action="settings-back"]').click();
   await page.locator('#menu button[data-action="help"]').click();
   await shot('help');
   await page.locator('#menu button[data-action="help-back"]').click();
   await page.locator('#menu button[data-action="solo"]').click();
   await page.waitForTimeout(180);
   await shot('arena');
   if(name==='after'){
    const coach=page.locator('#field-coach');
    if(!await coach.isVisible())throw new Error('First-match field guidance unavailable at '+label);
    const bounds=await coach.boundingBox();
    if(!bounds||bounds.x<0||bounds.y<0||bounds.x+bounds.width>width+1||bounds.y+bounds.height>height+1)
      throw new Error('Coach guidance clipped on '+label);
    await shot('context-coach');
   }
   // Movement footage as a deterministic held-key frame, not a mockup.
   await page.keyboard.down('d');
   await page.waitForTimeout(520);
   await shot('moving-tank');
   await page.keyboard.up('d');
   // Real on-foot character view, using actual game enter/exit controls.
   await page.locator('#interact-btn').click();
   await page.waitForTimeout(100);
   if(name==='after'&&(await page.locator('#interact-btn').textContent()||'').includes('EXIT'))
     throw new Error('Pilot did not dismount at '+label);
   await shot('on-foot-idle');
   await page.keyboard.down('w');
   await page.waitForTimeout(280);
   await shot('on-foot-walking');
   await page.keyboard.up('w');
   await page.locator('#menu-button').click();
   await shot('pause');
   if(name==='after'){
    // Layout fixture uses the *actual shipped* results HTML/CSS. Game-state
    // transitions and button behavior are tested separately in smoke.mjs.
    await page.locator('#menu button[data-action="resume"]').click();
    await page.evaluate(()=>{
     const $=id=>document.getElementById(id);
     $('game-screen').classList.add('match-finished');
     $('after-action').classList.remove('hidden');
     $('aa-title').textContent='SECTOR CLEARED';
     $('aa-event').textContent='CYAN WINS!';
     $('aa-kos').textContent='3';
     $('aa-lives').textContent='2';
     $('aa-outcome').textContent='SUCCESS';
     $('aa-note').textContent='NEW PROCEDURAL SECTOR READY';
     $('quick-rematch').classList.remove('hidden');
    });
    // In the layout-only fixture the actual solo simulation keeps running.
    // Keep our presentation visible even when its next HUD tick clears 'ended'.
    // This style is injected only into Chromium QA, never into the shipped game.
    await page.addStyleTag({content:[
     '#after-action.hidden{display:grid!important}',
     '#after-action .quick-rematch.hidden{display:block!important}',
     '.aa-actions:has(.quick-rematch.hidden){grid-template-columns:1fr 1fr!important}',
     '#game-screen .game-hud,#game-screen .battlefield>.touch-zone{display:none!important}'
    ].join('\n')});
    const rect=await page.locator('.aa-panel').boundingBox();
    const replay=await page.locator('#quick-rematch').boundingBox();
    const main=await page.locator('#results-menu').boundingBox();
    if(!rect||!replay||!main||rect.y<0||rect.y+rect.height>height+1||rect.x<0||rect.x+rect.width>width+1)
      throw new Error('After-action panel is clipped at '+label);
    if(replay.width<75||main.width<75||replay.height<37||main.height<37)
      throw new Error('After-action controls too small at '+label);
    if(!await page.locator('#after-action').isVisible()||!await page.locator('#quick-rematch').isVisible())
      throw new Error('After-action report not visually rendered at '+label);
    await shot('after-action-layout-fixture');
   }
   await page.close();
  }
 }
 fs.writeFileSync(path.join(root,'qa-screens','layout-report.json'),JSON.stringify(report,null,2));
 console.log('PASS visual snapshots: '+report.length+' screens; fullscreen assertion plus overflow report');
 console.log(JSON.stringify(report.filter(x=>x.screen==='home'||x.screen==='settings').map(x=>({version:x.version,viewport:x.viewport,screen:x.screen,scrollNeeded:x.scrollNeeded}))));
}finally{await browser.close();}

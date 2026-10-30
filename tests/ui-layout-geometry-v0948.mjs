// Sector Rebound v0.9.48 actual Chromium UI geometry audit.
// Diagnostic-only: never modifies runtime/app assets. Screenshots + JSON
// demonstrate clipped or overlapping buttons at real short landscape sizes.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright-core';

const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const sizes=[[568,320],[640,360],[740,360],[915,412],[1280,720]];
const out='qa-layout';
fs.mkdirSync(out,{recursive:true});
const report={version:1,scope:'Real rendered game DOM and in-app controls; diagnostic, no runtime change',scenes:[],issues:[]};
const intersect=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
try{
 for(const [width,height] of sizes){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.addInitScript(()=>{let seed=0x5eed1937;Math.random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};});
  await page.goto(pathToFileURL(path.join(process.cwd(),'web/index.html')).href,{waitUntil:'load'});
  await page.waitForTimeout(160);
  const vp=width+'x'+height;
  async function clickAction(action){
   const el=page.locator('#menu button[data-action="'+action+'"]').first();
   if(await el.count())await el.evaluate(e=>e.click());
   await page.waitForTimeout(65);
  }
  async function scene(stage,opts={}){
   const info=await page.evaluate(({stage,opts})=>{
    const round=x=>Math.round(x*10)/10;
    const rect=el=>{const r=el.getBoundingClientRect();return {left:round(r.left),top:round(r.top),right:round(r.right),bottom:round(r.bottom),width:round(r.width),height:round(r.height)};};
    const visible=el=>{
     // Native closed DETAILS contents and their controls are not actionable.
     // A hidden ancestor must never be misreported as an overlapping button.
     if(el.closest('details:not([open])')&&!el.matches('summary'))return false;
     for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden')return false;}
     return el.getBoundingClientRect().width>1&&el.getBoundingClientRect().height>1;
    };
    const panel=document.querySelector('#panel'),overlay=document.querySelector('#menu');
    const menuOpen=overlay&&!overlay.classList.contains('hidden');
    const scope=opts.gameplay?document.querySelector('.game-screen'):panel;
    const elems=[...scope.querySelectorAll('button,select,input,textarea,summary')].filter(visible);
    const bounds=elems.map((el,i)=>({id:el.id||el.dataset.action||el.getAttribute('aria-label')||el.textContent.trim().slice(0,28)||'control-'+i,tag:el.tagName,rect:rect(el),scrollW:el.scrollWidth,clientW:el.clientWidth}));
    const panelRect=rect(panel);
    const homeScroller=document.querySelector('.home-actions');
    const homeScroll=homeScroller?{usable:/auto|scroll/.test(getComputedStyle(homeScroller).overflowY),canScroll:homeScroller.scrollHeight>homeScroller.clientHeight+2,range:homeScroller.scrollHeight-homeScroller.clientHeight}:null;
    const clock=document.querySelector('#score-clock');
    const menuKey=document.querySelector('#menu-button');
    const brand=document.querySelector('.home-brand h2');
    const util=document.querySelector('.home-utilities');
    const homeHeading=document.querySelector('.home-actions h3');
    const decor={clock:clock&&visible(clock)?rect(clock):null,menuKey:menuKey&&visible(menuKey)?rect(menuKey):null,
      brand:brand&&visible(brand)?rect(brand):null,util:util&&visible(util)?rect(util):null,
      homeHeading:homeHeading&&visible(homeHeading)?rect(homeHeading):null};
    return {stage,menuOpen,panelRect,homeScroll,decor,scrollHeight:panel.scrollHeight,clientHeight:panel.clientHeight,scrollWidth:panel.scrollWidth,clientWidth:panel.clientWidth,
      scrollStyle:getComputedStyle(panel).overflowY,viewport:{width:innerWidth,height:innerHeight},
      elements:bounds,screenScroll:document.documentElement.scrollWidth>innerWidth+1};
   },{stage,opts});
   const issues=[];
   const screen=info.viewport;
   const outer=info.menuOpen?info.panelRect:{left:0,right:width,top:0,bottom:height};
   if(info.screenScroll)issues.push({level:'warn',type:'horizontal-page-overflow'});
   if(info.menuOpen&&info.scrollWidth>info.clientWidth+3)issues.push({level:'fail',type:'horizontal-panel-overflow',extra:info.scrollWidth-info.clientWidth});
   if(info.menuOpen&&stage==='home'&&info.scrollHeight>info.clientHeight+4)issues.push({level:'fail',type:'unscrollable-home-content',extra:info.scrollHeight-info.clientHeight});
   for(const x of info.elements){
    const r=x.rect;
    if(r.width<1||r.height<1)continue;
    // Focus on button visibility rather than scrollable content below viewport.
    if(r.right>width+2||r.left<-2)issues.push({level:'fail',type:'horizontal-control-offscreen',id:x.id,rect:r});
    if(info.menuOpen&&r.left<outer.left-2||info.menuOpen&&r.right>outer.right+2)
      issues.push({level:'fail',type:'button-beyond-panel-horizontally',id:x.id,rect:r});
    if(stage==='home'&&(r.bottom>outer.bottom+1||r.top<outer.top-1)){
      if(!info.homeScroll?.usable||!info.homeScroll?.canScroll)
       issues.push({level:'fail',type:'unreachable-home-button',id:x.id,rect:r});
     }
    if((x.tag==='BUTTON'||x.tag==='SELECT')&&r.height<30)
      issues.push({level:'warn',type:'small-target',id:x.id,height:r.height});
    if(x.scrollW>x.clientW+4&&x.tag==='BUTTON')
      issues.push({level:'warn',type:'button-label-overflow',id:x.id,delta:x.scrollW-x.clientW});
   }
   if(stage==='home'){
    const d=info.decor;
    if(d.brand&&d.util&&intersect(d.brand,d.util)>12)
      issues.push({level:'fail',type:'home-brand-overlaps-utility-navigation'});
    if(d.homeHeading&&d.util&&intersect(d.homeHeading,d.util)>12)
      issues.push({level:'fail',type:'home-heading-overlaps-topbar-navigation'});
   }
   if((stage==='scored-aim-hud'||stage==='survival-hud')&&info.decor.clock&&info.decor.menuKey&&intersect(info.decor.clock,info.decor.menuKey)>10)
    issues.push({level:'fail',type:'match-clock-overlaps-menu-button'});
   for(let i=0;i<info.elements.length;i++){
    const a=info.elements[i],ra=a.rect;
    for(let j=i+1;j<info.elements.length;j++){
     const b=info.elements[j],rb=b.rect;
     if(!['BUTTON','SELECT','TEXTAREA','INPUT'].includes(a.tag)||!['BUTTON','SELECT','TEXTAREA','INPUT'].includes(b.tag))continue;
     const overlap=intersect(ra,rb);
     if(overlap>Math.min(ra.width*ra.height,rb.width*rb.height)*.08)
      issues.push({level:'fail',type:'interactive-control-overlap',ids:[a.id,b.id],overlap:Math.round(overlap)});
    }
   }
   const row={viewport:vp,stage,panelScrollNeeded:info.scrollHeight>info.clientHeight+2,homeScroll:info.homeScroll,elementCount:info.elements.length,issues};
   report.scenes.push(row);
   report.issues.push(...issues.map(x=>({...x,viewport:vp,stage})));
   const dest=path.join(out,vp+'-'+stage+'.png');
   await page.screenshot({path:dest,animations:'disabled'});
  }
  await scene('home');
  // When compact home actions need internal scroll, the final actual mode key
  // must be reachable within that scroll viewport, not merely DOM-present.
  const homeScroller=page.locator('.home-actions');
  const scrollable=await homeScroller.evaluate(el=>el.scrollHeight>el.clientHeight+2);
  if(scrollable){
   await homeScroller.evaluate(el=>{el.scrollTop=el.scrollHeight;});
   await page.waitForTimeout(75);
   const last=await page.locator('#menu button[data-action="custom"]').boundingBox();
   const scroller=await homeScroller.boundingBox();
   if(!last||!scroller||last.y<scroller.y-2||last.y+last.height>scroller.y+scroller.height+2){
    report.issues.push({level:'fail',type:'home-last-button-not-scroll-reachable',viewport:vp});
   }
   await scene('home-scrolled');
   await homeScroller.evaluate(el=>{el.scrollTop=0;});
  }
  await clickAction('settings');await scene('settings');
  const details=page.locator('details.extra-rules');
  if(await details.count()){await details.locator('summary').evaluate(el=>el.click());await scene('settings-expanded');}
  await clickAction('settings-back');
  await clickAction('help');await scene('help');await clickAction('help-back');
  await clickAction('custom');await scene('custom');
  const preset=page.locator('details.custom-preset-fold');
  if(await preset.count()){await preset.locator('summary').evaluate(el=>el.click());await scene('custom-presets');}
  await clickAction('custom-back');
  await clickAction('dossier');await scene('dossier');
  await clickAction('backup');await scene('backup');
  await clickAction('backup-back');await clickAction('dossier-back');
  await clickAction('nearby');await scene('nearby');await clickAction('help-back');
  await clickAction('solo');
  await page.waitForTimeout(150);
  await scene('survival-hud',{gameplay:true});
  await page.locator('#menu-button').evaluate(el=>el.click());await scene('pause');await clickAction('resume');
  await page.locator('#interact-btn').evaluate(el=>el.click());await scene('pilot-hud',{gameplay:true});
  await page.locator('#menu-button').evaluate(el=>el.click());await clickAction('close');
  await clickAction('scored_ffa');await page.waitForTimeout(180);await scene('scored-aim-hud',{gameplay:true});
  await page.locator('#menu-button').evaluate(el=>el.click());await scene('scored-pause');
  if(errors.length)report.issues.push({level:'fail',type:'browser-console-errors',viewport:vp,errors:errors.slice(0,12)});
  await page.close();
 }
}finally{await browser.close();}
report.totals={scenes:report.scenes.length,fail:report.issues.filter(x=>x.level==='fail').length,warn:report.issues.filter(x=>x.level==='warn').length};
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log('LAYOUT_DIAGNOSTIC '+JSON.stringify(report.totals));
console.log('LAYOUT_FINDINGS '+JSON.stringify(report.issues.slice(0,65)));

// M9: real Chromium After Action readability and button geometry at
// small landscape sizes. Layout fixtures do not claim a gameplay victory.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';

assert.ok(process.env.CHROME_BIN,'CHROME_BIN needed');
assert.equal(fs.readFileSync('web/style.css','utf8'),
 fs.readFileSync('android/app/src/main/assets/style.css','utf8'),
 'Web/Android result styling must be byte-identical');
const root=path.resolve('web'),errors=[],missing=[];
const allowed=new Set(['index.html','style.css','game.js','save-backup.js','dossier.js',
 'scored-match.js','forward-bays.js','lan-series.js','lan-room.js','ctf-rules.js','ctf-ai.js']);
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://127.0.0.1').pathname;
 const name=decodeURIComponent(pathname).replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return}
 if(!allowed.has(name)){missing.push(name);res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});
 res.end(fs.readFileSync(path.join(root,name)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const cases=[],vps=[[568,320],[640,360],[740,360],[915,412]];
const variants=[
 {kind:'ordinary',custom:false,lan:false,rematch:true,outcome:'VICTORY'},
 {kind:'custom-three',custom:true,lan:false,rematch:true,outcome:'DEFEAT'},
 {kind:'lan-three',custom:false,lan:true,rematch:true,outcome:'DRAW'},
 {kind:'single-menu',custom:false,lan:false,rematch:false,outcome:'DEFEAT'}
];
try{
 for(const [width,height] of vps){
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
  await page.waitForFunction(()=>!!document.getElementById('after-action'));
  // The live idle game loop owns the 'hidden' flag and can overwrite our
  // synthetic result fixture between geometry capture and scroll assertions.
  // Keep only this diagnostic overlay visible with a test-scoped style rule;
  // production game/stylesheet behavior remains unchanged.
  await page.addStyleTag({content:'#after-action.hidden{display:grid!important}'});
  for(const config of variants){
   await page.evaluate(c=>{
    const $=id=>document.getElementById(id);
    $('menu').classList.add('hidden');
    $('game-screen').classList.add('match-finished');
    $('after-action').classList.remove('hidden');
    $('after-action').classList.toggle('lost',c.outcome==='DEFEAT');
    // Longer than normal: force truncation to test that status stays visible.
    $('aa-mode-label').textContent='CUSTOM · TEAM SURVIVAL · MAXIMUM DIFFICULTY · LARGE SECTOR · ADDITIONAL OPERATIONS';
    $('aa-outcome').textContent=c.outcome;
    $('aa-title').textContent=c.outcome==='VICTORY'?'SECTOR CLEARED':c.outcome==='DRAW'?'MATCH DRAW':'SECTOR LOST';
    $('aa-event').textContent='SECTOR EXERCISE COMPLETE · MAIN OPERATIONS';
    $('aa-kos').textContent='12';$('aa-deaths').textContent='3';
    $('aa-duration').textContent='08:59';$('aa-lives').textContent='0';
    $('aa-note').textContent='NEW PROCEDURAL SECTOR AVAILABLE';
    $('aa-rewards').classList.add('hidden');
    $('quick-rematch').classList.toggle('hidden',!c.rematch);
    $('custom-edit').classList.toggle('hidden',!c.custom);
    $('lan-edit-rules').classList.toggle('hidden',!c.lan);
   },config);
   const geometry=await page.evaluate(()=>{
    const box=x=>{const r=x.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
    const outer=document.querySelector('#after-action'),
     card=outer.querySelector('.aa-panel'),rail=outer.querySelector('.aa-rail'),
     mode=document.getElementById('aa-mode-label'),outcome=document.getElementById('aa-outcome'),
     actions=outer.querySelector('.aa-actions'),
     menu=document.getElementById('results-menu');
    const buttons=[...actions.querySelectorAll('button')].filter(b=>getComputedStyle(b).display!=='none');
    const stats=[...outer.querySelectorAll('.aa-stats span')].map(s=>parseFloat(getComputedStyle(s).fontSize));
    return {outer:box(outer),card:box(card),rail:box(rail),mode:box(mode),
     outcome:box(outcome),actions:box(actions),menu:box(menu),
     buttons:buttons.map(b=>({id:b.id,...box(b)})),outcomeDisplay:getComputedStyle(outcome).display,
     actionColumns:getComputedStyle(actions).gridTemplateColumns,minimumStats:Math.min(...stats),
     scrollHeight:card.scrollHeight,clientHeight:card.clientHeight,
     scrollWidth:card.scrollWidth,clientWidth:card.clientWidth,
     overflowY:getComputedStyle(card).overflowY,
     outcomeValue:outcome.textContent};
   });
   assert.notEqual(geometry.outcomeDisplay,'none','outcome not hidden on narrow phone');
   assert.equal(geometry.outcomeValue,config.outcome,'correct outcome visible');
   assert.ok(geometry.outcome.width>25,'outcome has visual width');
   assert.ok(geometry.outcome.right<=geometry.rail.right+1,'outcome fits rail horizontally');
   assert.ok(geometry.outcome.left>=geometry.mode.right-1,'mode context yields space to outcome');
   assert.ok(geometry.card.left>=-1&&geometry.card.right<=width+1,'result card within phone width');
   assert.ok(geometry.card.top>=-1&&geometry.card.bottom<=height+1,'result card within phone height');
   assert.ok(geometry.scrollWidth<=geometry.clientWidth+2,'no horizontal scroll');
   assert.ok(geometry.minimumStats>=9,'small-screen stats readable');
   assert.ok(geometry.buttons.every(b=>b.height>=43.5),'all action targets at least 44 px');
   const m=geometry.menu,other=geometry.buttons.filter(b=>b.id!==m.id);
   if(config.custom||config.lan){
    assert.equal(geometry.buttons.length,3,'results have three actions');
    assert.ok(m.width>=geometry.actions.width-3,'main menu fills complete second row');
    assert.ok(m.top>=Math.max(...other.map(b=>b.bottom))-1,'main menu below the action pair');
   }else if(config.rematch){
    assert.equal(geometry.buttons.length,2,'regular result has two actions');
    assert.ok(Math.abs(m.width-other[0].width)<=2,'default two equal actions');
    assert.ok(Math.abs(m.top-other[0].top)<=2,'default actions share a row');
   }else{
    assert.equal(geometry.buttons.length,1);
    assert.ok(m.width>=geometry.actions.width-3,'only menu action fills row');
   }
   if(geometry.scrollHeight>geometry.clientHeight+2){
    assert.match(geometry.overflowY,/auto|scroll/,'small result panel allows scrolling');
   }
   await page.locator('#results-menu').scrollIntoViewIfNeeded();
   const atBottom=await page.evaluate(()=>{
    const b=document.getElementById('results-menu').getBoundingClientRect();
    const p=document.querySelector('.aa-panel').getBoundingClientRect();
    return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,pLeft:p.left,pRight:p.right,pTop:p.top,pBottom:p.bottom};
   });
   assert.ok(atBottom.bottom<=atBottom.pBottom+2&&atBottom.top>=atBottom.pTop-2,
    'Main Menu reachable after scrolling results');
   cases.push({viewport:width+'x'+height,variant:config.kind,
    outcome:config.outcome,buttons:geometry.buttons.length,mainMenuWidth:Math.round(m.width),
    cardScrollable:geometry.scrollHeight>geometry.clientHeight+2});
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no app runtime errors');
 assert.deepEqual(missing,[],'all game assets loaded');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/m9-results-layout.json',JSON.stringify({result:'PASS',type:'REAL_CHROMIUM',cases},null,2)+'\n');
 console.log('M9_RESULTS_LAYOUT_PASS '+JSON.stringify({count:cases.length,cases}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

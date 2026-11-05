// M13-B: real Chromium 5-size match arc, saved preferences and HUD geometry.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'Real Chromium required');
const root=path.resolve('web'),source=fs.readFileSync('web/game.js','utf8');
const end=/\}\)\(\);\s*$/;assert.match(source,end);
function hooks(){
 window.__arcQa={
  start(id='survival_ffa'){
   mode='solo';paused=false;menu.classList.add('hidden');
   state=initialState(0,{...selectedRules,matchModeId:id,
    teamMode:['scored_tdm','survival_teams'].includes(id)?'teams':'ffa',
    mapSize:id==='cqc'?'small':'standard',botCount:3,startLives:3,pilotMode:true},12345);
   lastMatchArcStage=null;lastMatchArcId=state.matchId;state.elapsedSeconds=0;
   refreshHUD();return this.read();
  },
  stage(kind){
   if(kind==='engagement'){state.elapsedSeconds=27;
    if(state.scored)state.scored=Object.freeze({...state.scored,elapsedSeconds:27});
   }
   if(kind==='final'){
    state.elapsedSeconds=55;
    if(state.scored){
     const scores=[...state.scored.operatorKOs];scores[1]=Math.ceil(state.scored.scoreTarget*.8);
     state.scored=Object.freeze({...state.scored,elapsedSeconds:55,operatorKOs:Object.freeze(scores)});
    }else{state.lives[2]=0;state.lives[3]=0;state.deaths[2]=1;state.deaths[3]=1;}
   }
   if(kind==='pause')paused=true;
   if(kind==='resume')paused=false;
   refreshHUD();return this.read();
  },
  lan(){mode='host';paused=false;refreshHUD();return this.read()},
  read(){
   const clock=document.getElementById('score-clock'),phase=matchArcFor();
   return {phase:phase?.stage??null,text:clock.textContent,
    visible:!clock.classList.contains('hidden'),arc:clock.classList.contains('match-arc'),
    aria:clock.getAttribute('aria-label'),
    target:state.scored?.scoreTarget??null,cap:state.scored?.clockSeconds??null};
  }
 };
}
const injected=source.replace(end,'\n('+hooks.toString()+')();\n})();');
const allowed=new Set(['index.html','style.css','game.js','scored-match.js','dossier.js',
 'save-backup.js','forward-bays.js','ctf-rules.js','ctf-ai.js','daily-sector.js','lan-series.js','lan-room.js']);
const srv=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1').pathname.replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed.has(name)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});
 res.end(name==='game.js'?injected:fs.readFileSync(path.join(root,name)));
});
await new Promise(done=>srv.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const output='qa-results/m13-b';fs.mkdirSync(output,{recursive:true});
const sizes=[[568,320],[640,360],[740,360],[915,412],[1280,720]],results=[],errors=[];
const intersects=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&
 Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
try{
 for(const [w,h] of sizes){
  const ctx=await browser.newContext({viewport:{width:w,height:h}}),page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(w+'x'+h+' '+e.message));
  await page.goto('http://127.0.0.1:'+srv.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__arcQa);
  if(w===568){
   await page.locator('#menu button[data-action="settings"]').click();
   assert.equal(await page.locator('#map-size').inputValue(),'standard');
   assert.equal(await page.locator('#bot-count').inputValue(),'3');
   assert.equal(await page.locator('#lives-choice').inputValue(),'3');
   await page.evaluate(()=>localStorage.setItem('rr-options-v06',JSON.stringify({
    settings:{mapSize:'small',botCount:2,bulletCap:4,startLives:2,teamMode:'ffa',botSkill:'normal'},
    comfort:{sound:false},playlist:{version:1,enabled:['survival_ffa']}})));
   await page.reload({waitUntil:'load'});
   await page.locator('#menu button[data-action="settings"]').click();
   assert.equal(await page.locator('#map-size').inputValue(),'small');
   assert.equal(await page.locator('#bot-count').inputValue(),'2');
   assert.equal(await page.locator('#lives-choice').inputValue(),'2');
   await page.locator('#menu button[data-action="settings-back"]').click();
  }
  const before=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
  let row=await page.evaluate(()=>window.__arcQa.start('survival_ffa'));
  assert.equal(row.phase,'deployment');assert.equal(row.visible,true);assert.match(row.aria,/elapsed/);
  row=await page.evaluate(()=>window.__arcQa.stage('engagement'));
  assert.equal(row.phase,'engagement');
  row=await page.evaluate(()=>window.__arcQa.stage('final'));
  assert.equal(row.phase,'final');assert.match(row.text,/FINAL STAND/);
  await page.screenshot({path:output+'/survival-final-'+w+'x'+h+'.png',animations:'disabled'});
  for(const id of ['cqc','scored_ffa','scored_tdm']){
   row=await page.evaluate(id=>window.__arcQa.start(id),id);
   assert.equal(row.phase,'deployment');assert.ok(row.text.includes('0/'+row.target));
   assert.ok([10,15].includes(row.target));assert.ok([180,240,300].includes(row.cap));
   row=await page.evaluate(()=>window.__arcQa.stage('engagement'));
   assert.equal(row.phase,'engagement');
   row=await page.evaluate(()=>window.__arcQa.stage('final'));
   assert.equal(row.phase,'final');assert.match(row.text,/FINAL PUSH/);
   assert.ok(row.text.includes(Math.ceil(row.target*.8)+'/'+row.target));
   row=await page.evaluate(()=>window.__arcQa.stage('pause'));assert.equal(row.phase,'final');
   row=await page.evaluate(()=>window.__arcQa.stage('resume'));assert.equal(row.phase,'final');
  }
  await page.screenshot({path:output+'/scored-final-'+w+'x'+h+'.png',animations:'disabled'});
  const teams=await page.evaluate(()=>window.__arcQa.start('survival_teams'));
  assert.equal(teams.phase,'deployment');
  assert.ok(teams.text.includes('2 LEFT'),'team Survival shows 2 real enemy bots, not one enemy faction');
  await page.evaluate(()=>window.__arcQa.start('scored_ffa'));
  const rects=await page.evaluate(()=>Object.fromEntries(
   ['#score-clock','.scorestrip','#menu-button','.joystick','.fire-btn'].map(k=>
    [k,document.querySelector(k).getBoundingClientRect().toJSON()])));
  assert.ok(rects['#score-clock'].left>=-1&&rects['#score-clock'].right<=w+1);
  for(const other of ['.scorestrip','#menu-button','.joystick','.fire-btn'])
   assert.equal(intersects(rects['#score-clock'],rects[other]),false,
    'HUD collision '+other+' '+w+'x'+h);
  row=await page.evaluate(()=>window.__arcQa.lan());
  assert.equal(row.phase,null);assert.equal(row.arc,false,'LAN original presentation');
  const after=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
  assert.deepEqual(after,before,'No new save writes');
  results.push({viewport:w+'x'+h,stages:3,scoringUnchanged:true,savesSafe:true,lanUnchanged:true});
  await ctx.close();
 }
 assert.deepEqual(errors,[],'Browser exceptions');
 fs.writeFileSync(output+'/match-arc-qa.json',JSON.stringify({result:'PASS',results},null,2)+'\n');
 console.log('M13_B_MATCH_ARC_REAL_BROWSER_PASS '+JSON.stringify({viewports:results.length,
  stages:3,savesProtected:true,LANUnchanged:true}));
}finally{await browser.close();await new Promise(done=>srv.close(done))}

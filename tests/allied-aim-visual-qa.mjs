// B2 authentic Chromium rendering: faint ally traces only for nearby visible
// aiming teammates. No host AI target/angle disclosure to a LAN guest.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN required');
const root=path.resolve('web'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
const end=/\}\)\(\);\s*$/;assert.ok(end.test(source));
function hooks(){
 let draws=0;
 const original=drawAlliedAimTrace;
 drawAlliedAimTrace=function(...args){draws++;return original(...args)};
 window.__alliedQA={
  setup(){
   mode='solo';paused=false;menu.classList.add('hidden');
   state=initialState(0,{mapSize:'small',matchModeId:'scored_tdm',
    teamMode:'teams',botCount:3,pilotMode:true,botSkill:'normal'},202);
   // Freeze simulation ticks; renderer still runs, but A3 botInput must
   // not overwrite this controlled acquiring-shot brain between page calls.
   step=function(){};
   botBrains.clear();const me=state.tanks[0],ally=state.tanks[2];
   let lane=null;
   outer:for(let row=1;row<mazeGrid.rows-1;row++)
    for(let col=1;col<mazeGrid.cols-2;col++){
     const n=row*mazeGrid.cols+col;
     if(!mazeGrid.open[n].includes(n+1))continue;
     const ax=(col+.5)*mazeGrid.cell,ay=(row+.5)*mazeGrid.cell,
      bx=(col+1.5)*mazeGrid.cell;
     if(hasLineOfSight(ax,ay,bx,ay)){lane={ax,ay,bx};break outer;}
    }
   if(!lane)throw Error('no visible open maze passage');
   Object.assign(me,{x:lane.ax,y:lane.ay,a:0,shield:0,flash:0});
   Object.assign(ally,{x:lane.bx,y:lane.ay,a:Math.PI,shield:0,flash:0});
   state.winner=-1;state.lives.fill(1);
   botBrains.set(2,{fireTarget:1,fireAngle:Math.PI,fireTrack:.22,
    fireRecover:0,fireShots:0});
   comfort.alliedTraces=true;camera.zoom=1;
   camera.x=(lane.ax+lane.bx)/2-W/2;camera.y=lane.ay-H/2;
   return {gap:Math.abs(lane.bx-lane.ax),line:hasLineOfSight(me.x,me.y,ally.x,ally.y)};
  },
  scenario(kind){
   const ally=state.tanks[2],brain=botBrains.get(2),me=state.tanks[0];
   const save={x:ally.x,y:ally.y,track:brain.fireTrack,recover:brain.fireRecover,
    mode:state.config.teamMode,toggle:comfort.alliedTraces,mx:me.x,my:me.y};
   if(kind==='off')comfort.alliedTraces=false;
   if(kind==='recover')brain.fireRecover=.4;
   if(kind==='idle')brain.fireTrack=0;
   if(kind==='ffa')state.config.teamMode='ffa';
   if(kind==='far')ally.x=me.x+700;
   if(kind==='hidden'){
    let found=false;
    outer:for(let y=1;y<mazeGrid.rows-1;y++)for(let x=1;x<mazeGrid.cols-2;x++){
     const n=y*mazeGrid.cols+x;
     if(mazeGrid.open[n].includes(n+1))continue;
     const a=(x+.5)*mazeGrid.cell,b=(x+1.5)*mazeGrid.cell,v=(y+.5)*mazeGrid.cell;
     if(hasLineOfSight(a,v,b,v))continue;
     me.x=a;me.y=v;ally.x=b;ally.y=v;found=true;break outer;
    }
    if(!found)throw Error('no occluded maze position');
   }
   draws=0;render(0);
   const count=draws;
   Object.assign(ally,{x:save.x,y:save.y});me.x=save.mx;me.y=save.my;brain.fireTrack=save.track;
   brain.fireRecover=save.recover;state.config.teamMode=save.mode;
   comfort.alliedTraces=save.toggle;
   return count;
  }
 };
}
const injected=source.replace(end,'\n('+hooks.toString()+')();\n})();');
const files=new Set(['index.html','style.css','game.js','scored-match.js','forward-bays.js',
 'dossier.js','save-backup.js','ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const file=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!files.has(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':
  file.endsWith('.css')?'text/css':'text/html'});
 res.end(file==='game.js'?injected:fs.readFileSync(path.join(root,file)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const report=[],errors=[];
try{
 for(const viewport of [{width:740,height:360},{width:960,height:540}]){
  const page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__alliedQA);
  const base=await page.evaluate(()=>window.__alliedQA.setup());
  assert.ok(base.line&&base.gap>90,'actually visible allied actors in a separate maze cell');
  for(const name of ['visible','off','recover','idle','ffa','far','hidden']){
   const count=await page.evaluate(n=>window.__alliedQA.scenario(n),name);
   assert.equal(count,name==='visible'?1:0,name+' allied trace count');
   report.push({viewport,scenario:name,count});
  }
  // Occlusion is verified by line-of-sight in smoke; rendering must suppress it.
  // Save the positive display for human review in CI artifacts.
  await page.evaluate(()=>window.__alliedQA.scenario('visible'));
  fs.mkdirSync('qa-screens',{recursive:true});
  await page.locator('#arena').screenshot({path:'qa-screens/allied-aim-'+viewport.width+'x'+viewport.height+'.png'});
  await page.close();
 }
 assert.deepEqual(errors,[],'no browser errors');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/allied-aim-b2.json',JSON.stringify({report},null,2));
 console.log('ALLIED_AIM_VISUAL_BROWSER_PASS '+JSON.stringify({
  tested:report.length,viewports:2,realArena:true,hideOnIdleRecoveryFfaDistance:true}));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}

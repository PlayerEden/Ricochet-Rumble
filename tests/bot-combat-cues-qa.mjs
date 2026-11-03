// Deterministic real Chromium renderer: enemy combat tells must never leak
// through walls/offscreen or claim a shot aimed at a different opponent.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN is required');
const root=path.resolve('web'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
const end=/\}\)\(\);\s*$/;assert.ok(end.test(source));
function hooks(){
 window.__cueQA={
  setup(seed,kind,skill){
   // Freeze the simulated combat loop across asynchronous Playwright calls;
   // cue checks still run with an active, unpaused match.
   mode='solo';paused=true;menu.classList.add('hidden');
   state=initialState(0,{mapSize:'small',matchModeId:kind==='pilot'?'cqc':'scored_ffa',
    pilotMode:true,botCount:1,botSkill:skill,teamMode:'ffa'},seed);
   const human=state.tanks[0],enemy=state.tanks[1];
   for(const t of [human,enemy]){
    t.onFoot=kind==='pilot';t.shield=0;t.flash=0;t.a=0;
   }
   if(kind!=='pilot')for(const t of [human,enemy]){
    const v=state.vehicles[t.vehicleId];v.type=kind;v.armor=vehicleDef(v).armor;
   }
   human.x=mazeGrid.cell*3.5;human.y=mazeGrid.cell*2.5;
   enemy.x=human.x+55;enemy.y=human.y;enemy.a=Math.PI;
   state.lives[0]=state.lives[1]=3;state.winner=-1;state.bullets=[];
   botBrains.clear();
   botBrains.set(1,{fireTarget:0,fireTargetKind:kind==='pilot'?'pilot':'vehicle',
    fireAngle:Math.PI,fireTrack:skill==='casual'?.33:skill==='spicy'?.18:.24,
    fireRecover:0,lastShotTarget:-1});
   camera.zoom=1;
   camera.x=(human.x+enemy.x)/2-W/2;
   camera.y=human.y-H/2;
   return {clear:hasLineOfSight(enemy.x,enemy.y,human.x,human.y),
    visible:pilotInLocalView(enemy.x,enemy.y,0)&&pilotInLocalView(human.x,human.y,0)};
  },
  screenshotScene(){
   paused=false; // Evaluate actual game cues synchronously with live semantics.
   // Documentation screenshots use an actual open corridor, never actor
   // overlap deliberately created for the 55-unit first-shot test fixture.
   const human=state.tanks[0],enemy=state.tanks[1],brain=botBrains.get(1);
   let placed=false;
   for(let cy=1;cy<mazeGrid.rows-1&&!placed;cy++)
    for(let cx=1;cx<mazeGrid.cols-2&&!placed;cx++){
     const a=cy*mazeGrid.cols+cx,b=a+1;
     if(!mazeGrid.open[a]?.includes(b))continue;
     const ax=(cx+.5)*mazeGrid.cell,ay=(cy+.5)*mazeGrid.cell,
      bx=(cx+1.5)*mazeGrid.cell;
     if(!hasLineOfSight(ax,ay,bx,ay))continue;
     human.x=ax;human.y=ay;enemy.x=bx;enemy.y=ay;enemy.a=Math.PI;
     brain.fireAngle=Math.PI;brain.fireTarget=0;brain.fireTrack=.27;
     brain.fireRecover=0;enemy.flash=0;
     camera.zoom=1;camera.x=(ax+bx)/2-W/2;camera.y=ay-H/2;
     placed=true;
    }
   if(!placed)throw Error('No open corridor for aim cue screenshot');
   render(1/60);
   const cue=enemyBotCue(1,0);
   paused=true;
   return {placed,actorGap:Math.hypot(enemy.x-human.x,enemy.y-human.y),
    visible:!!cue&&cue.phase==='acquire'};
  },
  evaluate(){
   paused=false; // No intervening animation frame can fire a real bot shot.
   const human=state.tanks[0],enemy=state.tanks[1],brain=botBrains.get(1);
   const check=()=>enemyBotCue(1,0);
   const positive=check();const startAngle=enemy.a;
   const originalSkill=state.config.botSkill;
   brain.fireTrack=.001;const firstFrame=check();
   brain.fireTrack=.24;brain.fireRecover=.35;const recovering=check();
   brain.fireRecover=0;brain.fireTarget=-1;const unrelatedTarget=check();
   brain.fireTarget=0;enemy.flash=.11;brain.lastShotTarget=5;
   const wrongMuzzle=check();brain.lastShotTarget=0;const realMuzzle=check();
   enemy.flash=0;brain.lastShotTarget=-1;
   const savedX=camera.x;camera.x=100000;const offscreen=check();camera.x=savedX;
   const prevMode=mode;mode='guest';const guest=check();mode=prevMode;
   state.lives[1]=0;const dead=check();state.lives[1]=3;
   const saved={x:enemy.x,y:enemy.y,hx:human.x,hy:human.y};
   let behindWall=null;
   outer:for(let cy=1;cy<mazeGrid.rows-1;cy++)for(let cx=1;cx<mazeGrid.cols-2;cx++){
    const cell=cy*mazeGrid.cols+cx,next=cell+1;
    if(mazeGrid.open[cell]?.includes(next))continue;
    const ax=(cx+.5)*mazeGrid.cell,ay=(cy+.5)*mazeGrid.cell,
     bx=(cx+1.5)*mazeGrid.cell;
    if(hasLineOfSight(ax,ay,bx,ay))continue;
    enemy.x=ax;enemy.y=ay;human.x=bx;human.y=ay;
    camera.x=(ax+bx)/2-W/2;camera.y=ay-H/2;
    behindWall=check();break outer;
   }
   const coveredFound=enemy.x!==saved.x||enemy.y!==saved.y;
   Object.assign(enemy,{x:saved.x,y:saved.y,a:startAngle});
   Object.assign(human,{x:saved.hx,y:saved.hy});
   camera.x=savedX;camera.y=human.y-H/2;
   brain.fireTarget=0;brain.fireTrack=.24;
   // Real rendering, not only the helper's model.
   render(1/60);
   state.config.botSkill=originalSkill;
   paused=true;
   return {positive,firstFrame,recovering,unrelatedTarget,wrongMuzzle,
    realMuzzle,offscreen,guest,dead,behindWall,coveredFound};
  }
 };
}
const injected=source.replace(end,'\n('+hooks.toString()+')();\n})();');
const allowed=new Set(['index.html','style.css','game.js','scored-match.js',
 'forward-bays.js','dossier.js','save-backup.js','ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const file=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!allowed.has(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':
  file.endsWith('.css')?'text/css':'text/html'});
 res.end(file==='game.js'?injected:fs.readFileSync(path.join(root,file)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const cases=[],errors=[];
try{
 for(const viewport of [{width:740,height:360},{width:960,height:540},{width:800,height:400}]){
  const page=await browser.newPage({viewport});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__cueQA);
  for(const skill of ['casual','normal','spicy'])for(const kind of ['pilot','tank','mech']){
   const init=await page.evaluate(({kind,skill})=>window.__cueQA.setup(202,kind,skill),
    {kind,skill});
   assert.equal(init.clear,true,'clear view fixture requires true LOS');
   assert.equal(init.visible,true,'both actors are in actual screen');
   const result=await page.evaluate(()=>window.__cueQA.evaluate());
   assert.equal(result.positive?.phase,'acquire',kind+' '+skill+' shows actual readiness');
   assert.ok(result.positive.progress>=.23&&result.positive.progress<=1);
   for(const field of ['firstFrame','recovering','unrelatedTarget','wrongMuzzle',
    'offscreen','guest','dead','behindWall'])
    assert.equal(result[field],null,field+' must NEVER expose a combat cue');
   assert.equal(result.realMuzzle?.phase,'shot','actual local-target shot has brief flash');
   assert.equal(result.coveredFound,true,'real maze includes an occluded fixture');
   cases.push({viewport,kind,skill,progress:result.positive.progress});
   if(skill==='normal'&&kind==='tank'){
    const scene=await page.evaluate(()=>window.__cueQA.screenshotScene());
    assert.ok(scene.placed&&scene.visible&&scene.actorGap>=120,
     'real screenshots show separate actors in an open corridor');
    fs.mkdirSync('qa-screens',{recursive:true});
    await page.locator('#arena').screenshot({
     path:'qa-screens/enemy-aim-'+viewport.width+'x'+viewport.height+'.png'});
   }
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no runtime exceptions');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/bot-combat-cues.json',JSON.stringify({cases},null,2));
 console.log('BOT_VISIBLE_AIM_TELL_REAL_BROWSER_PASS '+JSON.stringify({
  fixtures:cases.length,viewports:3,weapons:3,difficulties:3,
  occlusionSafe:true,offscreenSafe:true,wrongTargetSafe:true,flashTruthful:true}));
}finally{await browser.close();await new Promise(done=>server.close(done));}

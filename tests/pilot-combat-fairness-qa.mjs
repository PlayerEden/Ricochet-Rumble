// Real game engine, controlled pilot duel fixtures. No claims of natural-match outcomes.
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN required');
const dir=path.resolve('web'),src=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const end=/\}\)\(\);\s*$/;assert.ok(end.test(src));
function hooks(){
 window.__pilotQA={
  setup(seed){
   mode='solo';paused=true;
   state=initialState(0,{pilotMode:true,matchModeId:'cqc',teamMode:'ffa',
    botCount:1,mapSize:'small',botSkill:'normal',quickPlayMatch:false},seed);
   const human=state.tanks[0],bot=state.tanks[1];
   human.onFoot=bot.onFoot=true;
   human.x=mazeGrid.cell*.5;human.y=mazeGrid.cell*.5;
   human.a=-4*Math.PI/180;human.vx=human.vy=0;human.shield=0;
   bot.x=human.x+50;bot.y=human.y;bot.a=Math.PI;
   bot.vx=bot.vy=0;bot.shield=0;state.lives[0]=state.lives[1]=1;
   state.bullets=[];camera.x=0;camera.y=0;camera.zoom=1.07;
   fireCooldown.fill(0);comfort.pilotAssist=false;
   return {line:hasLineOfSight(human.x,human.y,bot.x,bot.y),
    both:pilotInLocalView(human.x,human.y)&&pilotInLocalView(bot.x,bot.y)};
  },
  evaluate(){
   const human=state.tanks[0],bot=state.tanks[1];
   const offset=()=>softPilotAimOffset(human,0)*180/Math.PI;
   const off=offset();comfort.pilotAssist=true;
   const assisted=offset();
   human.a=-8*Math.PI/180;const outside=offset();human.a=-4*Math.PI/180;
   bot.onFoot=false;const vehicle=offset();bot.onFoot=true;
   bot.shield=1;const shield=offset();bot.shield=0;
   bot.x=human.x+210;const distant=offset();bot.x=human.x+50;
   camera.x=1000;const offscreen=offset();camera.x=0;
   const prior=human.a;
   tankMove(human,{moveX:0,moveY:0,fire:true},1/60,0);
   const headed=(human.a-prior)*180/Math.PI;
   const fired=shoot(0),bullet=state.bullets.at(-1);
   const bulletAngle=bullet?Math.atan2(bullet.vy,bullet.vx):null;
   fireCooldown[0]=.3;human.a=-4*Math.PI/180;
   tankMove(human,{moveX:0,moveY:0,fire:true},1/60,0);
   const cooled=human.a*180/Math.PI;
   camera.x=bot.x-5;
   const unseen=pilotBotFireFair(bot,human);
   camera.x=0;
   const seen=pilotBotFireFair(bot,human);
   const botFire=botInput(1,1/60).fire;
   const reaction={};
   for(const skill of ['casual','normal','spicy']){
    state.config.botSkill=skill;botBrains.delete(1);
    let first=-1;
    for(let n=1;n<=30;n++)if(botInput(1,1/60).fire&&first<0)first=n;
    camera.x=bot.x-5;
    const occluded=botInput(1,1/60).fire;
    camera.x=0;
    const instantAfterCover=botInput(1,1/60).fire;
    let reacquired=-1;
    for(let n=2;n<=30;n++)if(botInput(1,1/60).fire&&reacquired<0)reacquired=n;
    reaction[skill]={first,occluded,instantAfterCover,reacquired};
   }
   // A tank opponent is not subject to pilot-specific reaction tuning.
   human.onFoot=false;botBrains.delete(1);state.config.botSkill='normal';
   const vehicleImmediate=botInput(1,1/60).fire;
   let vehicleAcquired=-1;
   for(let n=2;n<=36;n++)if(botInput(1,1/60).fire&&vehicleAcquired<0)vehicleAcquired=n;
   human.onFoot=true;
   const old=mode;mode='host';
   const hostSame=pilotBotFireFair(bot,human);mode=old;
   return {off,assisted,outside,vehicle,shield,distant,offscreen,headed,
    fired,bulletAngle,cooled,unseen,seen,botFire,hostSame,kind:bullet?.kind,
    reaction,vehicleImmediate,vehicleAcquired};
  }
 };
}
const game=src.replace(end,'\n('+hooks.toString()+')();\n})();');
const names=new Set(['index.html','style.css','game.js','scored-match.js','forward-bays.js',
 'dossier.js','save-backup.js','ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!names.has(name)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});
 res.end(name==='game.js'?game:fs.readFileSync(path.join(dir,name)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[],cases=[];
try{
 for(const viewport of [{width:740,height:360},{width:915,height:412},{width:360,height:300}]){
  const page=await browser.newPage({viewport});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__pilotQA);
  await page.locator('button[data-action="settings"]').click();
  const option=page.locator('#pref-pilotAssist');
  assert.equal(await option.isChecked(),false,'soft assist defaults OFF');
  await option.check();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-options-v06')).comfort.pilotAssist),true);
  await option.uncheck();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-options-v06')).comfort.pilotAssist),false);
  await page.reload();
  await page.locator('button[data-action="settings"]').click();
  assert.equal(await page.locator('#pref-pilotAssist').isChecked(),false,'opt-out survives reload');
  for(const seed of [101,202,303]){
   const init=await page.evaluate(seed=>window.__pilotQA.setup(seed),seed);
   assert.equal(init.line,true,'real clear line-of-sight');
   assert.equal(init.both,true,'real camera shows both pilots');
   const x=await page.evaluate(()=>window.__pilotQA.evaluate());
   cases.push({viewport,seed,details:x});
   assert.equal(x.off,0);
   assert.ok(x.assisted>1.7&&x.assisted<=2.00001,'max 2 degree correction');
   for(const key of ['outside','vehicle','shield','distant','offscreen'])
    assert.equal(x[key],0,key+' suppresses assistance');
   assert.ok(x.headed>1.7&&x.headed<=2.00001,'actual pilot heading nudges on shot');
   assert.equal(x.fired,true);
   assert.equal(x.kind,'sidearm','normal sidearm bullet');
   assert.ok(Math.abs(x.bulletAngle-(-2*Math.PI/180))<.03,'bullet follows actual facing');
   assert.ok(Math.abs(x.cooled+4)<1e-4,'no correction during cooldown');
   assert.equal(x.unseen,false,'offscreen bot cannot fire at human pilot');
   assert.equal(x.seen,true);
   assert.equal(x.hostSame,true,'LAN host behavior unchanged');
   assert.equal(x.vehicleImmediate,false,'vehicle target now requires a deliberate acquisition, not instant autofire');
   assert.ok(x.vehicleAcquired>=13&&x.vehicleAcquired<=23,'vehicle aim commits within the normal difficulty reaction window');
   for(const [skill,min,max] of [['casual',19,21],['normal',14,16],['spicy',9,11]]){
    const r=x.reaction[skill];
    assert.ok(r.first>=min&&r.first<=max,skill+' reaction delay within skill band');
    assert.equal(r.occluded,false,skill+' stops shooting when out of view');
    assert.equal(r.instantAfterCover,false,skill+' must reacquire after cover');
    assert.ok(r.reacquired>=min&&r.reacquired<=max,skill+' reacquisition is consistent');
   }
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no browser script errors');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/pilot-combat-fairness.json',JSON.stringify({cases},null,2));
 console.log('PILOT_COMBAT_FAIRNESS_REAL_BROWSER_PASS '+JSON.stringify({
  cases:cases.length,viewports:3,seeds:3,defaultOff:true,maxNudgeDegrees:2,
  offscreenBotSuppressed:true,projectileUnchanged:true,lanUntouched:true,
  difficultyReactionWindowsVerified:true,occlusionReacquisitionVerified:true}));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}

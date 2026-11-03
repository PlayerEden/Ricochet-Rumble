import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
const chrome=process.env.CHROME_BIN;assert.ok(chrome,'CHROME_BIN required');
const dir=path.resolve('web');
const game=fs.readFileSync(path.join(dir,'game.js'),'utf8');
const ending=/\}\)\(\);\s*$/;assert.ok(ending.test(game));
const instrumented=game.replace(ending,
 "\nwindow.__roleQA={\n get state(){return state},botRoleFor,botInput,chooseBotObjective,\n sampleSeededMaps(count=300){\n  const oldState=state,oldMode=mode,oldPause=paused;\n  const problems=[];let steps=0;\n  try{\n   mode='solo';paused=false;\n   for(let seed=1;seed<=count;seed++){\n    const mapSize=['small','standard','large'][seed%3];\n    state=initialState(0,{mapSize,botCount:3,botSkill:'varied',customMatch:true,\n      matchModeId:'survival_ffa',teamMode:'ffa',pilotMode:true},seed);\n    for(let t=0;t<6;t++){\n     step(1/60);steps++;\n     for(let i=1;i<=3;i++){\n      const bot=state.tanks[i],input=botInput(i,1/60);\n      if(!Number.isFinite(bot.x)||!Number.isFinite(bot.y)||\n       !Number.isFinite(input.moveX)||!Number.isFinite(input.moveY)||\n       Math.hypot(input.moveX,input.moveY)>1.01||\n       botRoleFor(i)==='classic'||typeof input.fire!=='boolean'){\n       problems.push({seed,mapSize,t,i,x:bot.x,y:bot.y,moveX:input.moveX,moveY:input.moveY});\n      }\n     }\n    }\n   }\n  }finally{state=oldState;mode=oldMode;paused=oldPause;botBrains.clear();}\n  return {maps:count,steps,problems:problems.slice(0,10),bad:problems.length};\n }\n};\n})();");
const allowed=new Set(['index.html','style.css','game.js','save-backup.js','dossier.js','scored-match.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(name==='game.js'?instrumented:fs.readFileSync(path.join(dir,name)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:740,height:360},deviceScaleFactor:1});
 page.on('pageerror',err=>errors.push(err.message));
 const base='http://127.0.0.1:'+server.address().port+'/';
 await page.goto(base,{waitUntil:'load'});
 await page.locator('.home-deploy[data-action="solo"]').click();
 assert.equal(await page.evaluate(()=>window.__roleQA.botRoleFor(1)),'classic','Quick Play unchanged');
 await page.locator('#menu-button').click();
 await page.locator('button[data-action="close"]').click();
 await page.locator('button[data-action="modes"]').click();
 await page.locator('button[data-action="custom"]').click();
 assert.equal(await page.locator('#custom-skill').inputValue(),'normal','default Custom classic');
 await page.locator('#custom-mode').selectOption('scored_ffa');
 await page.locator('#custom-skill').selectOption('varied');
 assert.equal(await page.locator('#custom-skill').inputValue(),'varied');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-custom-v1')));
 assert.equal(saved.rules.botSkill,'varied','Custom style saved');
 await page.locator('button[data-action="custom-play"]').click();
 assert.equal(await page.locator('#menu').evaluate(e=>e.classList.contains('hidden')),true);
 const roles=await page.evaluate(()=>{
  const qa=window.__roleQA,s=qa.state;
  return {config:s.config,roles:[1,2,3].map(i=>qa.botRoleFor(i)),
   inputs:[1,2,3].map(i=>qa.botInput(i,1/60)),playerRole:qa.botRoleFor(0)};
 });
 assert.equal(roles.config.customMatch,true);
 assert.equal(roles.config.botSkill,'varied');
 assert.deepEqual(roles.roles,['hunter','sentinel','scavenger']);
 assert.equal(roles.playerRole,'classic');
 assert.ok(roles.inputs.every(a=>a.bot&&Number.isFinite(a.moveX)&&Number.isFinite(a.moveY)&&
  Math.hypot(a.moveX,a.moveY)<=1.01&&typeof a.fire==='boolean'),'real bot input bounded');
 const supply=await page.evaluate(()=>{
  const qa=window.__roleQA,s=qa.state,bot=s.tanks[3];
  const before=s.pickups;
  s.pickups=[{type:'speed',x:bot.x+390,y:bot.y}];
  const target={x:bot.x+500,y:bot.y};
  const classic=qa.chooseBotObjective(3,target,'normal','classic');
  const scavenger=qa.chooseBotObjective(3,target,'normal','scavenger');
  s.pickups=before;
  return [classic.kind,scavenger.kind];
 });
 assert.deepEqual(supply,['engage','supply'],'only scavenger chases far available supply');
 await page.locator('#menu-button').click();
 await page.locator('button[data-action="close"]').click();
 await page.reload({waitUntil:'load'});
 await page.locator('button[data-action="modes"]').click();
 await page.locator('button[data-action="custom"]').click();
 assert.equal(await page.locator('#custom-skill').inputValue(),'varied','Custom style persisted');
 const quick=await page.evaluate(()=>JSON.parse(localStorage.getItem('rr-options-v06')));
 assert.notEqual(quick.settings.botSkill,'varied','Quick Play preferences independent');
 await page.locator('.custom-preset-fold summary').click();
 await page.locator('#custom-reset').click();
 assert.equal(await page.locator('#custom-skill').inputValue(),'normal','reset restores classic');
 const sample=await page.evaluate(()=>window.__roleQA.sampleSeededMaps(300));
 assert.equal(sample.maps,300);
 assert.equal(sample.steps,1800,'six real physics steps per reproducible map');
 assert.deepEqual(sample.problems,[],'no invalid movement/position or role over 300 seeds');
 assert.equal(sample.bad,0,'300 reproducible seeded arenas have bounded bot movement');
  assert.deepEqual(errors,[],'no page errors');
 console.log('BOT_PERSONALITIES_LIVE_BROWSER_PASS: classic Quick Play, opt-in three distinct roles, bounded controls, scavenger supply, persisted Custom and reset, 300 seeded arenas');
}finally{
 await browser.close();
 await new Promise(done=>server.close(done));
}

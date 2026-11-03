// Real Chromium guest snapshot QA for combat-feedback parity.
// Uses the production WebView game and packet parser, not a mocked event handler.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN required for audible-feedback parity QA');
const root=path.resolve('web'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
const end=/\}\)\(\);\s*$/;
assert.ok(end.test(source),'game script trailer');
function hooks(){
 window.__combatFeedbackQA={
  setup(kind){
   mode='guest';connected=true;paused=false;lanLobby=null;
   menu.classList.add('hidden');
   state=initialState(0,{mapSize:'small',pilotMode:true,botCount:1,
    matchModeId:'survival_ffa',teamMode:'ffa'},203);
   state.lives[0]=state.lives[1]=3;state.winner=-1;
   state.fxEvents=[];
   const t=state.tanks[1];
   t.onFoot=kind==='pilot';
   if(!t.onFoot){
    const v=state.vehicles[t.vehicleId];
    v.type=kind;v.armor=vehicleDef(v).armor;
   }
   lastRemoteFxId=0;lastAudioCue.clear();
   damagePulse=0;screenKick=0;
   window.__audioStarts=0;
   return {tanks:state.tanks.length,kind};
  },
  send(kind,target=1,sound=true,shake=true){
   comfort.sound=sound;comfort.shake=shake;
   const snap=serializeState();
   const local=state.tanks[1];
   const evt={id:1,kind,x:local.x+20,y:local.y+20,
    color:'#ffcb89',owner:0,target,ttl:.4};
   snap.fxEvents=[evt];
   const pkt=JSON.stringify({type:'state',state:snap});
   window.RR.nativeMessage(pkt);
   const first={pulse:damagePulse,kick:screenKick,
    heard:[...lastAudioCue.keys()],audioStarts:window.__audioStarts,
    lastRemoteFxId};
   window.RR.nativeMessage(pkt);
   return {...first,duplicatesSilent:window.__audioStarts===first.audioStarts,
    duplicateEventId:lastRemoteFxId};
  }
 };
}
const injected=source.replace(end,'\n('+hooks.toString()+')();\n})();');
const allow=new Set(['index.html','style.css','game.js','scored-match.js',
 'forward-bays.js','dossier.js','save-backup.js','ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const file=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!allow.has(file)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':
  file.endsWith('.css')?'text/css':'text/html'});
 res.end(file==='game.js'?injected:fs.readFileSync(path.join(root,file)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const cases=[],errors=[];
try{
 for(const viewport of [{width:568,height:320},{width:740,height:360},{width:960,height:540}]){
  const page=await browser.newPage({viewport});
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.__audioStarts=0;
   window.AudioContext=class {
    state='running';currentTime=0;destination={};
    createOscillator(){
     return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},
      connect(){return this},start(){window.__audioStarts++},stop(){}};
    }
    createGain(){
     return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},
      exponentialRampToValueAtTime(){}},connect(){return this}};
    }
   };
  });
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__combatFeedbackQA);
  for(const weapon of ['pilot','tank','mech']){
   const setup=()=>page.evaluate(k=>window.__combatFeedbackQA.setup(k),weapon);
   const event=(kind,target=1,sound=true,shake=true)=>
    page.evaluate(p=>window.__combatFeedbackQA.send(...p),[kind,target,sound,shake]);
   await setup();
   const bounce=await event('bounce');
   assert.ok(bounce.heard.includes('ricochet'),weapon+' guest hears a bounce');
   assert.ok(bounce.audioStarts>0,weapon+' sound oscillator actually starts');
   assert.equal(bounce.pulse,0,'bounce does not signal direct damage');
   assert.equal(bounce.duplicatesSilent,true,'duplicate snapshot does not replay bounce');
   cases.push({viewport,weapon,event:'bounce',passed:true});
   await setup();
   const noSound=await event('bounce',1,false,false);
   assert.ok(!noSound.heard.includes('ricochet')&&!noSound.audioStarts,
    weapon+' respects SFX OFF');
   cases.push({viewport,weapon,event:'bounce-muted',passed:true});
   if(weapon==='pilot'){
    await setup();
    const hit=await event('hit');
    assert.equal(hit.pulse,.58,'guest pilot receives real hit pulse');
    assert.equal(hit.kick,3.2,'guest pilot shake parity');
    cases.push({viewport,weapon,event:'hit',passed:true});
    await setup();
    const other=await event('hit',0);
    assert.equal(other.pulse,0,'guest does not see remote-player damage as personal damage');
    cases.push({viewport,weapon,event:'other-hit',passed:true});
   }else{
    await setup();
    const armor=await event('armor');
    assert.equal(armor.pulse,.28,weapon+' guest armor has real local damage warning');
    assert.equal(armor.kick,2.3,weapon+' armor shake parity');
    assert.ok(armor.heard.includes('armor-hit'),weapon+' guest armor hit sound');
    cases.push({viewport,weapon,event:'armor',passed:true});
    await setup();
    const other=await event('armor',0);
    assert.equal(other.pulse,0,'not our armor, no personal damage pulse');
    cases.push({viewport,weapon,event:'other-armor',passed:true});
    await setup();
    const noShake=await event('armor',1,true,false);
    assert.equal(noShake.pulse,.28,'damage warning retained with camera shake off');
    assert.equal(noShake.kick,0,'shake preference respected');
    cases.push({viewport,weapon,event:'armor-no-shake',passed:true});
   }
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no JavaScript exceptions');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/combat-feedback-parity.json',JSON.stringify({cases},null,2));
 console.log('COMBAT_FEEDBACK_GUEST_REAL_BROWSER_PASS '+JSON.stringify({
  checks:cases.length,viewports:3,units:3,bounceAudible:true,
  armorDamageWarning:true,noRemoteFalseAlarms:true,sfxSettingHonored:true,
  shakeSettingHonored:true,noDuplicateReplay:true}));
}finally{await browser.close();await new Promise(done=>server.close(done));}

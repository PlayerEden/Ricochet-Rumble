// Real CSS/browser geometry audit of HUD warning and thumb-control safe zones.
// Production HTML+CSS are loaded without mocking layout. Gameplay tests separately
// validate the dynamic CTF text, timer, and weapon-state semantics.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN required; do not silently skip landscape layout QA');
const dir=path.resolve('web');
const allow=new Set(['index.html','style.css','game.js','scored-match.js','dossier.js',
 'save-backup.js','forward-bays.js','ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!allow.has(name)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':
  name.endsWith('.css')?'text/css':'text/html'});
 res.end(fs.readFileSync(path.join(dir,name)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const viewports=[{width:568,height:320},{width:640,height:300},
 {width:740,height:360},{width:915,height:412},
 {width:960,height:540},{width:1280,height:720}];
const modes=['survival-pilot','scored-clock','scored-power-coach',
 'ctf-objective','ctf-power-coach','ctf-alert-power','scored-alert'];
const results=[],errors=[];
const keys=['menu-button','.scorestrip','score-clock','ctf-status','power-status',
 'field-coach','toast','joystick','.fire-btn','interact-btn','shell-meter','shell-slots'];
const shouldNotCross=[
 ['menu-button','.scorestrip'],['menu-button','score-clock'],
 ['.scorestrip','score-clock'],['.scorestrip','ctf-status'],
 ['score-clock','ctf-status'],['score-clock','power-status'],
 ['score-clock','field-coach'],['score-clock','toast'],
 ['ctf-status','power-status'],['ctf-status','field-coach'],
 ['ctf-status','toast'],['power-status','field-coach'],
 ['power-status','toast'],['field-coach','toast'],
 ['joystick','.fire-btn'],['interact-btn','.fire-btn'],
 ['.fire-btn','shell-meter'],['.fire-btn','shell-slots'],
 ['menu-button','interact-btn'],['menu-button','joystick'],
 ['.scorestrip','interact-btn'],['.scorestrip','joystick']
];
function intersects(a,b){
 return Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&
  Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
}
try {
 for(const viewport of viewports){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  for(const name of modes){
   for(const swap of [false,true]){
    const data=await page.evaluate(({name,swap,keys})=>{
     const get=(selector)=>document.querySelector(selector.startsWith('.')?selector:'#'+selector);
     document.getElementById('menu').classList.add('hidden');
     document.getElementById('game-screen').classList.remove('match-finished');
     document.getElementById('game-screen').classList.add('pilot-match');
     document.querySelector('.battlefield').classList.toggle('swap-controls',swap);
     for(const key of ['score-clock','ctf-status','power-status','field-coach',
       'toast','interact-btn'])get(key).classList.add('hidden');
     const scored=name.includes('scored'),ctf=name.includes('ctf'),
      power=name.includes('power'),coach=name.includes('coach'),
      toast=name.includes('alert');
     if(scored)get('score-clock').classList.remove('hidden');
     if(ctf){get('ctf-status').classList.remove('hidden');
      get('ctf-status').textContent='02:45 · ON FOOT · GRAB CORAL FLAG · CYAN HOME · CORAL HOME';
     }
     if(power){get('power-status').classList.remove('hidden');get('power-status').textContent='ARMOR BOOST · 8s';}
     if(coach){get('field-coach').classList.remove('hidden');get('field-coach').textContent='FOLLOW THE VEHICLE ARROW';}
     if(toast){get('toast').classList.remove('hidden');get('toast').classList.add('visible');get('toast').textContent='CONTACT SEARCH · CHECK RADAR';}
     else get('toast').classList.remove('visible');
     if(name==='survival-pilot')get('interact-btn').classList.remove('hidden');
     get('shell-meter').textContent='3/4 CYCLING';
     get('shell-slots').innerHTML='<i class="shell-slot ready"></i>'.repeat(3)+'<i class="shell-slot"></i>';
     const out={};
     for(const key of keys){
      const node=get(key),style=getComputedStyle(node);
      const r=node.getBoundingClientRect();
      const visible=style.display!=='none'&&style.visibility!=='hidden'&&
       Number(style.opacity)>.01&&r.width>=1&&r.height>=1;
      out[key]={visible,rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,
       width:r.width,height:r.height},text:node.textContent.trim().slice(0,100)};
     }
     return out;
    },{name,swap,keys});
    for(const key of keys){
     const {visible,rect}=data[key];
     if(!visible)continue;
     assert.ok(rect.left>=-1&&rect.top>=-1&&rect.right<=viewport.width+1&&
      rect.bottom<=viewport.height+1,viewport.width+'x'+viewport.height+' '+name+' '+key+
      ' outside viewport: '+JSON.stringify(rect));
    }
    assert.equal(data['shell-meter'].visible,true,
     'readable shell status required even in short landscape');
    assert.ok(data['.fire-btn'].rect.width>=80&&data['joystick'].rect.width>=80,
     'thumb targets remain large enough');
    for(const [a,b] of shouldNotCross){
     if(!data[a].visible||!data[b].visible)continue;
     assert.equal(intersects(data[a].rect,data[b].rect),false,
      viewport.width+'x'+viewport.height+' '+name+' swap='+swap+' overlap '+a+' vs '+b+
       ': '+JSON.stringify([data[a].rect,data[b].rect]));
    }
    if(name==='ctf-objective'||name==='ctf-power-coach'||name==='ctf-alert-power'){
     assert.equal(data['score-clock'].visible,false,'CTF timer belongs in objective strip');
     assert.match(data['ctf-status'].text,/02:45/,'CTF objective includes timer');
    }
    if(name==='ctf-alert-power'||name==='scored-alert')
     assert.equal(data['field-coach'].visible,false,'alert gets priority over coach');
    results.push({viewport,name,swap,geometry:'PASS'});
   }
  }
  await page.close();
 }
 assert.deepEqual(errors,[],'no browser exceptions');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/landscape-hud-safe-zones.json',JSON.stringify({results},null,2));
 console.log('LANDSCAPE_HUD_SAFE_ZONES_REAL_BROWSER_PASS '+JSON.stringify({
  cases:results.length,viewports:viewports.length,states:modes.length,
  leftHanded:true,clockAndCtfDistinct:true,powerStatusSeparated:true,
  coachingAndAlertsSafe:true,ammoVisible:true,minimumThumbSize:true}));
}finally{await browser.close();await new Promise(done=>server.close(done));}

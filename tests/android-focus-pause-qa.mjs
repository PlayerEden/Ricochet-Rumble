// One-phone Android lifecycle contract: focus loss freezes play, duplicate
// pause signals do not resume, and device-local saved records stay untouched.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';

assert.ok(process.env.CHROME_BIN,'CHROME_BIN required');
const root=path.resolve('web');
const source=fs.readFileSync(path.join(root,'game.js'),'utf8');
const suffix=/\}\)\(\);\s*$/;
assert.match(source,suffix);
const hooks=[
'window.__focusQA={',
' status(){',
'  return {mode,paused,menuVisible:!menu.classList.contains("hidden"),',
'   matchId:state?.matchId,elapsed:state?.elapsedSeconds,',
'   lives:state?.lives?.slice(),actors:state?.tanks?.length,',
'   pressed:pressed.size,touched:touch.size,stickX:stick.x,stickY:stick.y,',
'   releaseShot:releaseShot!==null,fireAim:fireAim.pointerId,',
'   options:window.localStorage?.getItem(PREF_KEY)||null,',
'   dossier:window.localStorage?.getItem("rr-dossier-v1")||null,',
'   hangar:window.localStorage?.getItem(HANGAR_KEY)||null,',
'   custom:window.localStorage?.getItem(CUSTOM_PREF_KEY)||null,',
'   customPresets:window.localStorage?.getItem(CUSTOM_PRESETS_KEY)||null,',
'   cameraPilot:unitTargetZoom({onFoot:true})};',
' },',
' armControls(){pressed.add("KeyW");touch.add("fire");stick.x=.5;stick.y=.3;}',
'};})();'
].join('\n');
const injected=source.replace(suffix,hooks);
const allowed=new Set(['index.html','style.css','game.js','save-backup.js','dossier.js',
 'scored-match.js','forward-bays.js','lan-series.js','lan-room.js','ctf-rules.js','ctf-ai.js']);
const missing=[],jsErrors=[];
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\/+/,'')||'index.html';
 if(name==='favicon.ico'){res.writeHead(204);res.end();return;}
 if(!allowed.has(name)){missing.push(name);res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});
 res.end(name==='game.js'?injected:fs.readFileSync(path.join(root,name)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const rows=[];
try{
 for(const [width,height] of [[740,360],[915,412]]){
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>jsErrors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.waitForFunction(()=>!!window.__focusQA&&!!window.RR?.appPause);
  const idle=await page.evaluate(()=>window.__focusQA.status());
  await page.evaluate(()=>window.RR.appPause());
  assert.equal((await page.evaluate(()=>window.__focusQA.status())).mode,'idle');
  await page.locator('#menu button[data-action="modes"]').click();
  await page.locator('.practice-launch').click();
  const running=await page.evaluate(()=>window.__focusQA.status());
  assert.equal(running.mode,'solo');
  assert.equal(running.paused,false);
  assert.equal(running.actors,1);
  assert.equal(running.cameraPilot,.94);
  await page.evaluate(()=>window.__focusQA.armControls());
  // Equivalent to Android focus loss and Android.onPause dispatching appPause.
  await page.evaluate(()=>window.RR.appPause());
  const paused=await page.evaluate(()=>window.__focusQA.status());
  assert.equal(paused.paused,true,'active match freezes');
  assert.equal(paused.menuVisible,true,'pause screen shown');
  assert.equal(paused.matchId,running.matchId,'same match identity');
  assert.equal(paused.pressed,0,'held keys released');
  assert.equal(paused.touched,0,'held touch released');
  assert.equal(paused.stickX,0);
  assert.equal(paused.stickY,0);
  assert.equal(paused.releaseShot,false,'no pending shot');
  assert.equal(paused.fireAim,null,'drag aim cancelled');
  assert.equal(await page.locator('#menu button[data-action="resume"]').count(),1,'resume explicit');
  const pauseContent=await page.locator('#panel').innerText();
  for(let i=0;i<3;i++)await page.evaluate(()=>window.RR.appPause());
  await page.waitForTimeout(180);
  const steady=await page.evaluate(()=>window.__focusQA.status());
  assert.equal(steady.paused,true,'duplicate pauses never resume');
  assert.equal(steady.elapsed,paused.elapsed,'background game time frozen');
  assert.equal(await page.locator('#panel').innerText(),pauseContent,'no duplicate overlay');
  for(const key of ['options','dossier','hangar','custom','customPresets'])
   assert.equal(steady[key],idle[key],key+' unchanged in background');
  await page.locator('#menu button[data-action="resume"]').click();
  const resumed=await page.evaluate(()=>window.__focusQA.status());
  assert.equal(resumed.paused,false);
  assert.equal(resumed.menuVisible,false);
  assert.equal(resumed.matchId,running.matchId,'explicit resume keeps match');
  await page.evaluate(()=>window.RR.appPause());
  await page.locator('#menu button[data-action="close"]').click();
  const closed=await page.evaluate(()=>window.__focusQA.status());
  assert.equal(closed.mode,'idle');
  for(const key of ['options','dossier','hangar','custom','customPresets'])
   assert.equal(closed[key],idle[key],key+' preserved after lifecycle');
  rows.push({viewport:width+'x'+height,focusPause:true,repeatPauseIdempotent:true,explicitResume:true,savesIntact:true});
  await page.close();
 }
 const java=fs.readFileSync('android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java','utf8');
 const focus=java.match(/@Override public void onWindowFocusChanged\(boolean hasFocus\) \{[\s\S]*?\n    \}/)?.[0]||'';
 const pause=java.match(/@Override protected void onPause\(\) \{[\s\S]*?\n    \}/)?.[0]||'';
 const resume=java.match(/@Override protected void onResume\(\) \{[\s\S]*?\n    \}/)?.[0]||'';
 assert.match(focus,/else pauseGameForLifecycle\(\)/,'native focus-loss hook');
 assert.match(pause,/pauseGameForLifecycle\(\)/,'native Activity pause hook');
 assert.match(java,/private void pauseGameForLifecycle\(\)/,'shared lifecycle path');
 assert.doesNotMatch(resume,/window\.RR\.|openMenu\(|appResume\(/,'focus regain never auto-resumes');
 assert.deepEqual(missing,[],'all app assets served');
 assert.deepEqual(jsErrors,[],'no JS runtime errors');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/android-focus-pause.json',JSON.stringify({result:'PASS',type:'CHROMIUM_AND_ANDROID_SOURCE_CONTRACT',rows},null,2)+'\n');
 console.log('ANDROID_FOCUS_PAUSE_PASS '+JSON.stringify(rows));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}

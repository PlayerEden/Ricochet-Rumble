// D3-B1: real 2-browser host and spectator; only the Android TCP bridge is mocked.
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN required');
const root=process.cwd(),web=path.join(root,'web'),src=fs.readFileSync(path.join(web,'game.js'),'utf8');
const java=fs.readFileSync('android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java','utf8');
assert.equal((java.match(/"spectate"\.equals\(kind\)/g)||[]).length,2,'native sends/receives spectator notice');
assert.ok(java.includes('Socket peer = ss.accept()'),'B1 does not claim multi-accept');
const ending=/\}\)\(\);\s*$/;assert.ok(ending.test(src));
function hook(){
 window.__spec={
  get watching(){return lanSpectating},get pending(){return lanSpectatePending},
  get lobby(){return lanLobby},get paused(){return paused},get connected(){return connected},
  get state(){return state},snapshot(){return serializeState()},
  bot(){return botInput(1,1/60)},release(){return queuePilotRelease()},
  ready(){guestLanReady()},tick(){step(1/60)},
  control(){return {input:guestInput,shot:remoteReleaseShot}},
  finish(){state.winner=0;state.winnerTeam=teamOf(0,state);state.elapsedSeconds=95;refreshHUD()}
 };
}
const game=src.replace(ending,'\n('+hook.toString()+')();\n})();');
const allowed=new Set(['index.html','style.css','game.js','scored-match.js','forward-bays.js','dossier.js','save-backup.js','lan-room.js','lan-series.js','ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!allowed.has(p)){res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html'});
 res.end(p==='game.js'?game:fs.readFileSync(path.join(web,p)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const contexts=[],checks=[],errors=[];const check=(v,msg)=>{assert.ok(v,msg);checks.push(msg)};
async function page(viewport){
 const c=await browser.newContext({viewport});contexts.push(c);const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.__wire=[];window.AndroidBridge={hostGame(){},findGames(){},joinGame(){},stopNetwork(){},sendPacket(x){window.__wire.push(JSON.parse(x))}}});
 await p.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
 await p.waitForFunction(()=>!!window.__spec);return p;
}
async function send(p,x){return p.evaluate(v=>window.RR.nativeMessage(JSON.stringify(v)),x)}
async function packets(p,t){return p.evaluate(t=>window.__wire.filter(q=>q.type===t),t)}
async function last(p,t){const a=await packets(p,t);assert.ok(a.length,'expected '+t);return a.at(-1)}
async function inspect(p){return p.evaluate(()=>({watch:window.__spec.watching,pending:window.__spec.pending,
 busy:window.__spec.lobby?.hostBusy,active:window.__spec.lobby?.active,
 paused:window.__spec.paused,connected:window.__spec.connected,
 matchId:window.__spec.state.matchId,seed:window.__spec.state.mazeSeed,
 solo:window.__spec.state.config.lanHostSolo,actors:window.__spec.state.tanks.length,bot:window.__spec.bot().bot}))}
try{
 for(const viewport of [{width:915,height:412},{width:740,height:360}]){
  const host=await page(viewport),guest=await page(viewport);
  await host.locator('#menu [data-action="nearby"]').click();await host.locator('[data-action="host"]').click();
  await host.locator('[data-lan-setting="teamMode"]').selectOption('tdm');
  await host.locator('[data-lan-setting="botCount"]').selectOption('2');
  await host.locator('[data-lan-setting="hostSide"]').selectOption('coral');
  await host.locator('[data-lan-setting="mapSize"]').selectOption('large');
  await host.locator('[data-action="lan-start"]').click();
  const initial=await inspect(host);
  check(initial.solo&&initial.bot&&!initial.paused&&!initial.connected&&initial.actors===4,'host-alone 2v2 has AI in reserved seat');
  await guest.locator('#menu [data-action="nearby"]').click();await guest.locator('[data-action="find"]').click();
  await send(guest,{type:'connected'});await send(host,{type:'connected'});
  const lobby=await last(host,'lobby'),role=await last(host,'spectate'),frame=await last(host,'state');
  check(lobby.hostBusy&&role.version===2&&role.role==='spectator'&&role.revision===lobby.revision&&role.matchId===frame.state.matchId,
   'real host emits busy lobby, versioned role, match-bound snapshot');
  check(!(await inspect(host)).paused&&(await inspect(host)).solo,'late join never pauses host or steals bot seat');
  await send(guest,{...role,revision:role.revision+1});await send(guest,frame);
  check(!(await inspect(guest)).watch,'wrong revision and unsolicited snapshot do not grant spectator');
  await send(guest,lobby);check((await inspect(guest)).busy&&!(await guest.locator('[data-action="lan-ready"]').isEnabled()),'watcher cannot Ready mid-match');
  await send(guest,role);check(!(await inspect(guest)).watch&&!!(await inspect(guest)).pending,'notice alone cannot fake live view');
  await send(guest,{type:'state',state:{...frame.state,matchId:frame.state.matchId+1}});
  check(!(await inspect(guest)).watch,'wrong-match snapshot is ignored');
  await send(guest,frame);const info=await inspect(guest);
  check(info.watch&&!info.paused&&info.matchId===initial.matchId&&info.seed===initial.seed&&info.bot,
    'valid actual host snapshot starts real read-only spectator view with AI');
  check(await guest.locator('#spectator-status').isVisible()&&
    (await guest.locator('#spectator-status').textContent()).includes('READ ONLY'),'guest has clear read-only spectator label');
  check(await guest.locator('.touch-left').evaluate(x=>getComputedStyle(x).display)==='none'&&
    await guest.locator('.touch-right').evaluate(x=>getComputedStyle(x).display)==='none',
    'spectator controls genuinely hidden and non-clickable');
  check((await host.locator('#spectator-status').textContent()).includes('GUEST WATCHING'),'host sees watching status');
  check((await guest.locator('#player0-label').textContent()).includes('CYAN KOs')&&
    (await guest.locator('#player1-label').textContent()).includes('CORAL KOs'),
    'spectator sees factual Cyan/Coral KO scores, not a fake personal side');
  await new Promise(ok=>setTimeout(ok,170));
  check((await packets(guest,'input')).length===0,'spectator sends no input updates');
  check(await guest.evaluate(()=>window.__spec.release())===false,'spectator cannot queue shot');
  await guest.evaluate(()=>{window.__spec.ready();window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'}))});
  check((await packets(guest,'ready')).length===0&&(await packets(guest,'interact')).length===0&&(await packets(guest,'fire-request')).length===0,
   'watcher cannot Ready, interact, fire');
  await send(host,{type:'input',input:{moveX:1,moveY:1,fire:true}});
  await send(host,{type:'fire-request',seq:1,matchId:initial.matchId,aimX:1,aimY:0});
  await send(host,{type:'interact'});
  const control=await host.evaluate(()=>window.__spec.control());
  check(!control.input.fire&&control.input.moveX===0&&control.input.moveY===0&&control.shot===null,
   'host rejects spectator forged control packets');
  for(let i=0;i<12;i++)await host.evaluate(()=>window.__spec.tick());
  const fresh=await host.evaluate(()=>window.__spec.snapshot());await send(guest,{type:'state',state:fresh});
  check((await guest.evaluate(()=>window.__spec.state.elapsedSeconds))>frame.state.elapsedSeconds,'host live simulation continues and spectator observes it');
  fs.mkdirSync('qa-screens/d3-b1',{recursive:true});
  await guest.screenshot({path:'qa-screens/d3-b1/spectator-'+viewport.width+'x'+viewport.height+'.png',animations:'disabled'});
  await host.evaluate(()=>window.__spec.finish());await send(guest,{type:'state',state:await host.evaluate(()=>window.__spec.snapshot())});
  check(await guest.locator('#after-action').isVisible()&&(await guest.locator('#aa-outcome').textContent()).includes('MATCH COMPLETE'),
    'viewer sees real results without personal victory');
  await host.locator('#quick-rematch').click();const nextRole=await last(host,'spectate'),nextFrame=await last(host,'state');
  check(nextRole.matchId!==role.matchId&&nextRole.matchId===nextFrame.state.matchId,'rematch binds spectator to fresh authoritative match');
  await send(guest,nextRole);await send(guest,nextFrame);
  check((await inspect(guest)).watch&&(await inspect(guest)).matchId===nextRole.matchId,'viewer remains read-only across rematch');
  await host.evaluate(()=>window.__spec.finish());await send(guest,{type:'state',state:await host.evaluate(()=>window.__spec.snapshot())});
  await host.locator('#lan-edit-rules').click();await send(guest,await last(host,'lobby'));
  check(!(await inspect(guest)).watch&&(await inspect(guest)).active,'return to lobby clears spectator role only at safe boundary');
  check(await guest.locator('.lan-lobby').isVisible()&&await guest.locator('[data-action="lan-ready"]').isEnabled(),
    'former spectator can ready only for future match');
  await host.close();await guest.close();
 }
 check(errors.length===0,'no browser errors '+errors.join(' | '));
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/d3-b1-spectator.json',JSON.stringify({checks},null,2));
 console.log('D3_B1_REAL_SPECTATOR_BROWSER_PASS '+JSON.stringify({checks:checks.length,viewports:2,realLiveHost:true,readOnly:true,rematch:true}));
}finally{for(const c of contexts)await c.close().catch(()=>{});await browser.close();await new Promise(ok=>server.close(ok));}

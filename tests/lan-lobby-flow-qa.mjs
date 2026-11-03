// Real bundled game/WebView LAN lobby rehearsal in two independent Chromium windows.
// Native Wi-Fi is mocked ONLY at the bridge boundary. Host/guest menus,
// game state, match actors, packet validation and Android role contracts are real.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
const chrome=process.env.CHROME_BIN;
assert.ok(chrome,'CHROME_BIN required: never silently skip the LAN lobby release gate');
const root=process.cwd(),web=path.join(root,'web'),dir=path.join(root,'qa-screens','lan-lobby');
fs.mkdirSync(dir,{recursive:true});
const j=fs.readFileSync(path.join(root,'android','app','src','main','java','com','playereden','ricochetrumble','MainActivity.java'),'utf8');
assert.ok(j.includes('"ready".equals(kind)')&&j.includes('"lobby".equals(kind)')&&j.includes('"start".equals(kind)'),'native bridge recognizes only role-scoped lobby controls');
const original=fs.readFileSync(path.join(web,'game.js'),'utf8'),close=/\}\)\(\);\s*$/;
assert.ok(close.test(original),'actual game runtime IIFE found');
const game=original.replace(close,"window.__lanQA={get mode(){return mode},get paused(){return paused},get connected(){return connected},get lobby(){return lanLobby&&{...lanLobby,rules:{...lanLobby.rules}}},get state(){return state},refresh(){refreshHUD()},snapshot(){return serializeState()},credit(attacker,victim){return creditScoredPilotKO(attacker,victim)}};})();");
const files={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/game.js':'game.js','/scored-match.js':'scored-match.js','/dossier.js':'dossier.js','/save-backup.js':'save-backup.js'};
const server=http.createServer((req,resp)=>{let f=files[new URL(req.url,'http://localhost').pathname];if(!f){resp.writeHead(404);resp.end();return}resp.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});resp.end(f==='game.js'?game:fs.readFileSync(path.join(web,f)))});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const results={checks:[],screens:[],errors:[]};
const contexts=[];
let host,guest;
const CHECK=(yes,message)=>{assert.ok(yes,message);results.checks.push(message)};
async function bridgeSetup(page){
 await page.addInitScript(()=>{
  window.__packets=[];window.__bridgeCalls=[];
  window.AndroidBridge={hostGame(){window.__bridgeCalls.push('host')},findGames(){window.__bridgeCalls.push('find')},joinGame(ip,port){window.__bridgeCalls.push('join:'+ip+':'+port)},stopNetwork(){window.__bridgeCalls.push('stop')},sendPacket(x){window.__packets.push(JSON.parse(x))}};
 });
 page.on('pageerror',e=>results.errors.push(e.message));
 await page.goto(url,{waitUntil:'load'});
 await page.waitForFunction(()=>!!window.__lanQA);
}
async function receive(page,packet){return page.evaluate(p=>window.RR.nativeMessage(JSON.stringify(p)),packet)}
async function emitted(page,type){return page.evaluate(t=>window.__packets.filter(p=>p.type===t),type)}
async function lastPacket(page,type){let packets=await emitted(page,type);assert.ok(packets.length,'expected outgoing '+type);return packets.at(-1)}
async function change(page,key,val){let sel=page.locator('[data-lan-setting="'+key+'"]');await sel.selectOption(String(val));}
try{
 const hc=await browser.newContext({viewport:{width:915,height:412}}),gc=await browser.newContext({viewport:{width:915,height:412}});
 contexts.push(hc,gc);host=await hc.newPage();guest=await gc.newPage();
 await Promise.all([bridgeSetup(host),bridgeSetup(guest)]);
 await host.locator('#menu button[data-action="nearby"]').click();
 await host.locator('button[data-action="host"]').click();
 CHECK(await host.locator('.lan-lobby').isVisible(),'host lobby opens without automatically starting match');
 CHECK(await host.locator('[data-lan-setting="botCount"]').inputValue()==='0','host defaults to no AI');
 CHECK(await host.locator('[data-lan-setting="teamMode"]').inputValue()==='ffa','host defaults to human 1v1');
 CHECK(await host.locator('[data-lan-setting="botSkill"]').isVisible()===false,'AI-only skill hidden in no-bot 1v1');
 CHECK(await host.locator('button[data-action="lan-start"]').isDisabled(),'host cannot start without guest');
 CHECK(await host.evaluate(()=>window.__lanQA.paused),'host simulation paused during lobby');
 await receive(host,{type:'hosting',address:'192.168.1.20',port:47321});
 CHECK((await host.locator('#host-address').textContent()).includes('192.168.1.20:47321'),'host local address visible');
 await guest.locator('#menu button[data-action="nearby"]').click();
 await guest.locator('button[data-action="find"]').click();
 CHECK((await guest.evaluate(()=>window.__bridgeCalls)).includes('find'),'guest discovers hosts from Android bridge');
 await receive(guest,{type:'found',host:'192.168.1.20',port:47321,name:'Sector Rebound'});
 await guest.locator('#rooms button').click();
 CHECK((await guest.evaluate(()=>window.__bridgeCalls)).includes('join:192.168.1.20:47321'),'join uses host discovered IP/port');
 await receive(guest,{type:'connected'});
 await receive(host,{type:'connected'});
 CHECK(await host.locator('button[data-action="lan-start"]').isDisabled(),'joined guest has not readied');
 CHECK(await guest.locator('.lan-lobby').isVisible(),'guest sees lobby, not arena');
 CHECK((await emitted(host,'state')).length===0,'host does not stream combat snapshots before start');
 let lobby=await lastPacket(host,'lobby');await receive(guest,lobby);
 CHECK((await guest.locator('#lan-guest-rules').textContent()).includes('NO BOTS'),'guest sees real 1v1 no-AI rules');
 CHECK(await guest.locator('button[data-action="lan-ready"]').isEnabled(),'guest can ready after receiving host rules');
 await receive(guest,{type:'start',revision:lobby.revision});
 CHECK(await guest.evaluate(()=>window.__lanQA.paused),'unsolicited host START rejected if guest not ready');
 await guest.locator('button[data-action="lan-ready"]').click();
 let ready=await lastPacket(guest,'ready');await receive(host,ready);
 CHECK(await host.locator('button[data-action="lan-start"]').isEnabled(),'host can start once guest readies');
 await change(host,'botCount',2);
 CHECK(await host.locator('[data-lan-setting="botSkill"]').isVisible(),'AI skill appears once bots enabled');
 CHECK(await host.locator('button[data-action="lan-start"]').isDisabled(),'rule edit invalidates guest ready');
 const latestLobby=await lastPacket(host,'lobby');
 await receive(host,ready);
 CHECK(await host.locator('button[data-action="lan-start"]').isDisabled(),'stale ready revision cannot start changed rules');
 await receive(guest,latestLobby);
 CHECK((await guest.locator('#lan-guest-rules').textContent()).includes('2 BOTS'),'guest sees edited host AI count');
 CHECK((await guest.locator('button[data-action="lan-ready"]').textContent()).trim()==='READY','guest ready resets on rule edit');
 await change(host,'teamMode','coop');await change(host,'botCount',0);
 CHECK((await host.locator('#lan-lobby-message').textContent()).includes('REQUIRES AT LEAST ONE BOT'),'co-op cannot start with no enemies');
 await change(host,'teamMode','ffa');await change(host,'mapSize','standard');await change(host,'startLives',3);
 CHECK(await host.locator('[data-lan-setting="botSkill"]').isVisible()===false,'AI-only control hides again in no-bot duel');
 const safeLobby=await lastPacket(host,'lobby');await receive(guest,safeLobby);
 CHECK((await guest.locator('#lan-guest-rules').textContent()).includes('3 LIVES'),'guest sees host-selected lives');
 await guest.locator('button[data-action="lan-ready"]').click();await receive(host,await lastPacket(guest,'ready'));
 CHECK(await host.locator('button[data-action="lan-start"]').isEnabled(),'both players ready for human-only duel');
 await host.locator('button[data-action="lan-start"]').click();
 const start=await lastPacket(host,'start'),state=await lastPacket(host,'state');
 CHECK(start.revision===safeLobby.revision,'start matches exact ready rule revision');
 await receive(guest,start);await receive(guest,state);
 CHECK(await guest.locator('.lan-lobby').isVisible()===false,'guest exits visible lobby after explicit host start');
 CHECK(await host.locator('#menu').evaluate(el=>el.classList.contains('hidden')),'host enters arena when deploying');
 const hs=await host.evaluate(()=>({paused:window.__lanQA.paused,actors:window.__lanQA.state.tanks.length,bots:window.__lanQA.state.config.botCount,humans:window.__lanQA.state.humanCount,maze:window.__lanQA.state.mazeSeed,teams:window.__lanQA.state.config.teamMode}));
 const gs=await guest.evaluate(()=>({paused:window.__lanQA.paused,actors:window.__lanQA.state.tanks.length,bots:window.__lanQA.state.config.botCount,humans:window.__lanQA.state.humanCount,maze:window.__lanQA.state.mazeSeed}));
 CHECK(!hs.paused&&!gs.paused,'both players are unpaused only after Start');
 CHECK(hs.humans===2&&hs.actors===2&&hs.bots===0&&hs.teams==='ffa','true 1v1 has precisely two humans and zero AI actors');
 CHECK(gs.humans===2&&gs.actors===2&&gs.bots===0&&gs.maze===hs.maze,'guest receives same procedural arena and host-authoritative roster');
 // Simulate the authoritative final state at the rendering boundary; KO/win
 // combat logic is already independently exercised by actual game-flow tests.
 await host.evaluate(()=>{const qa=window.__lanQA,s=qa.state;s.winner=0;s.winnerTeam=0;s.kos[0]=1;s.deaths[1]=1;s.elapsedSeconds=84;qa.refresh();});
 await receive(guest,await host.evaluate(()=>({type:'state',state:window.__lanQA.snapshot()})));
 CHECK(await host.locator('#after-action').isVisible()&&await guest.locator('#after-action').isVisible(),'both human screens show final result');
 CHECK((await guest.locator('#aa-deaths').textContent()).trim()==='1','guest receives true authoritative death count');
 CHECK((await guest.locator('#aa-duration').textContent()).trim()==='01:24','guest receives authoritative match duration');
 CHECK((await guest.locator('#aa-note').textContent()).includes('WAITING FOR HOST'),'guest knows who controls next match');
 CHECK(await host.locator('#lan-edit-rules').isVisible(),'host can change LAN rules after a finished match');
 CHECK((await host.locator('#quick-rematch').evaluate(el=>getComputedStyle(el).gridColumnEnd))==='-1','LAN host rematch is full-width primary action above Change Rules and Main Menu');
 await host.locator('#lan-edit-rules').click();
 CHECK(await host.locator('.lan-lobby').isVisible(),'host returns to waiting room without disconnecting');
 const revised=await lastPacket(host,'lobby');
 CHECK(revised.postMatch===true&&revised.revision>start.revision,'postmatch lobby has strictly newer revision and explicit phase');
 await receive(guest,revised);
 CHECK(await guest.locator('.lan-lobby').isVisible(),'guest automatically returns to Ready lobby on new host phase');
 CHECK(await guest.locator('button[data-action="lan-ready"]').isEnabled(),'guest can ready again without reconnecting');
 await receive(host,{type:'ready',revision:start.revision,ready:true});
 CHECK(await host.locator('button[data-action="lan-start"]').isDisabled(),'old ready cannot start rematch');
 await guest.locator('button[data-action="lan-ready"]').click();
 await receive(host,await lastPacket(guest,'ready'));
 CHECK(await host.locator('button[data-action="lan-start"]').isEnabled(),'fresh Ready unlocks host rematch');
 await host.locator('button[data-action="lan-start"]').click();
 await receive(guest,await lastPacket(host,'start'));
 await receive(guest,await lastPacket(host,'state'));
 CHECK(await guest.locator('.lan-lobby').isVisible()===false,'guest enters new maze after host rematch');
 // Leave the real match ONCE; then inspect the same new waiting room
 // at four viewports. Never try to exit a second match while still in lobby.
 await host.evaluate(()=>window.RR.openMenu());await host.locator('button[data-action="close"]').click();
 await host.locator('#menu button[data-action="nearby"]').click();await host.locator('button[data-action="host"]').click();
 await guest.evaluate(()=>window.RR.openMenu());await guest.locator('button[data-action="close"]').click();
 await guest.locator('#menu button[data-action="nearby"]').click();await guest.locator('button[data-action="find"]').click();
 await receive(guest,{type:'connected'});await receive(host,{type:'connected'});await receive(guest,await lastPacket(host,'lobby'));
 CHECK(await host.locator('.lan-lobby').isVisible()&&await guest.locator('.lan-lobby').isVisible(),'both waiting rooms accessible after match');
 // D1: Two genuine independent browser game runtimes; only the native
 // Android LAN transport is mocked at the bridge boundary.
 await change(host,'teamMode','tdm');
 await change(host,'hostSide','coral');
 await change(host,'botCount',2);
 await change(host,'scoreTarget',30);
 await change(host,'friendlyFire','on');
 const tdmLobby=await lastPacket(host,'lobby');
 await receive(guest,tdmLobby);
 CHECK((await host.locator('#mode-label').textContent()).includes('CORAL'),'host lobby displays real Coral faction');
 CHECK((await guest.locator('#mode-label').textContent()).includes('CYAN'),'guest lobby displays real Cyan faction');
 CHECK((await guest.locator('#lan-guest-rules').textContent()).includes('FIRST TO 30 KOs'),'guest previews scored rules');
 CHECK((await guest.locator('#lan-guest-rules').textContent()).includes('HOST CORAL / GUEST CYAN'),'guest previews real factions');
 CHECK(await host.locator('[data-lan-setting="botCount"] option[value="3"]').evaluate(el=>el.disabled),'uneven bot count disabled for TDM');
 await guest.locator('button[data-action="lan-ready"]').click();
 await receive(host,await lastPacket(guest,'ready'));
 CHECK(await host.locator('button[data-action="lan-start"]').isEnabled(),'Ready unlocks scored team start');
 await host.locator('button[data-action="lan-start"]').click();
 await receive(guest,await lastPacket(host,'start'));
 await receive(guest,await lastPacket(host,'state'));
 const teams=await host.evaluate(()=>({ids:[...window.__lanQA.state.config.teamIds],scored:window.__lanQA.state.scored,ff:window.__lanQA.state.config.friendlyFire}));
 CHECK(JSON.stringify(teams.ids)===JSON.stringify([1,0,1,0]),'Coral host and bot versus Cyan guest and bot');
 CHECK(teams.scored.mode==='teams'&&teams.scored.scoreTarget===30&&teams.ff,'2v2 scored rules frozen in engine');
 CHECK(await guest.evaluate(()=>JSON.stringify(window.__lanQA.state.config.teamIds))===JSON.stringify(teams.ids),'host and guest share teams');
 CHECK((await guest.locator('#player0-label').textContent()).includes('CYAN KOs · YOU'),'guest scoreboard labels own Cyan side');
 CHECK((await host.locator('#player1-label').textContent()).includes('CORAL KOs · YOU'),'host scoreboard labels own Coral side');
 await host.evaluate(()=>{
   const qa=window.__lanQA;qa.state.tanks[1].onFoot=true;
   if(!qa.credit(0,1))throw Error('host did not record real pilot KO event');
 });
 await receive(guest,{type:'state',state:await host.evaluate(()=>window.__lanQA.snapshot())});
 CHECK((await guest.locator('#score1').textContent()).trim()==='1','guest displays host-owned Coral KO');
 CHECK((await host.locator('#score1').textContent()).trim()==='1','host sees same scored team total');
 await host.evaluate(()=>{
   const qa=window.__lanQA;
   for(let i=1;i<30;i++){
     qa.state.lives[1]=1;qa.state.tanks[1].onFoot=true;
     if(!qa.credit(0,1))throw Error('pilot KO failure '+i);
   }
 });
 await receive(guest,{type:'state',state:await host.evaluate(()=>window.__lanQA.snapshot())});
 CHECK((await guest.locator('#score1').textContent()).trim()==='30','guest receives final 30-KO authoritative score');
 CHECK(await guest.locator('#after-action').isVisible(),'guest receives scored TDM finish');
 CHECK((await host.locator('#aa-outcome').textContent()).includes('VICTORY'),'Coral host wins scored match');
 CHECK((await guest.locator('#aa-outcome').textContent()).includes('DEFEAT'),'Cyan guest loses scored match');
 await host.screenshot({path:path.join(dir,'915x412-tdm-final-host.png'),animations:'disabled'});
 await guest.screenshot({path:path.join(dir,'915x412-tdm-final-guest.png'),animations:'disabled'});
 results.screens.push('TDM final host','TDM final guest');
 await host.locator('#lan-edit-rules').click();
 await receive(guest,await lastPacket(host,'lobby'));
 CHECK(await guest.locator('.lan-lobby').isVisible(),'scored guest returns to rules after results');
 CHECK((await guest.locator('#lan-guest-rules').textContent()).includes('FIRST TO 30 KOs'),'postmatch lobby preserves scored rules');
 // End-to-end screenshots of both lobby roles and narrow-layout geometry.
 for(const [w,h] of [[568,320],[740,360],[915,412],[1280,720]]){
  await host.setViewportSize({width:w,height:h});
  await guest.setViewportSize({width:w,height:h});
  for(const [page,side] of [[host,'host'],[guest,'guest']]){
   let d=await page.evaluate(()=>({vw:innerWidth,scroll:document.documentElement.scrollWidth,rect:(()=>{let e=document.querySelector('#panel');let b=e.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom}})()}));
   CHECK(d.scroll<=w+2&&d.rect.left>=-2&&d.rect.right<=w+2,'no horizontal clipping '+side+' '+w+'x'+h);
   await page.screenshot({path:path.join(dir,w+'x'+h+'-'+side+'.png'),animations:'disabled'});
   results.screens.push(side+' '+w+'x'+h);
  }
 }
 CHECK(results.errors.length===0,'no real browser errors');
}finally{
 fs.writeFileSync(path.join(dir,'lan-lobby-proof.json'),JSON.stringify(results,null,2));
 for(const ctx of contexts)await ctx.close();
 await browser.close();await new Promise(resolve=>server.close(resolve));
}
console.log('PASS LAN pre-match lobby: '+results.checks.length+' real two-client checks; '+results.screens.length+' viewport screenshots; physical 2-phone Wi-Fi still pending.');

// D3-B2 real two-Chromium peer queue, host-authorized promotion and hostile replay QA.
// The Android bridge is mocked; actual game, DOM, scorer, physics and room are live.
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
import assert from 'node:assert/strict';import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'CHROME_BIN required');
const web=path.resolve('web'),src=fs.readFileSync(path.join(web,'game.js'),'utf8');
for(const name of ['game.js','index.html','style.css'])assert.equal(
 fs.readFileSync(path.join(web,name),'utf8'),
 fs.readFileSync(path.join('android/app/src/main/assets',name),'utf8'),'WebView byte mirror '+name);
const native=fs.readFileSync('android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java','utf8');
for(const wire of ['join-next','join-next-status','join-next-promote'])assert.ok(
 native.includes('"'+wire+'".equals(kind)'), 'Android TCP must explicitly route '+wire);
const tail=/\}\)\(\);\s*$/;assert.ok(tail.test(src),'actual JS closure expected');
function hook(){
 window.__b2={
  get state(){return state},get watching(){return lanSpectating},
  get queue(){return lanHostJoinNext},get clientRole(){return lanGuestJoinNext},
  get pending(){return lanGuestPromotePending},get hostMatch(){return lanHostPromotedMatchId},
  get guestInput(){return guestInput},get lobby(){return lanLobby},get paused(){return paused},
  get connected(){return connected},snapshot(){return serializeState()},
  bot(){return botInput(1,1/60)},tick(){step(1/60)},
  end(){
   if(state.lanSeries){
    const score={...state.scored,finished:true,
     result:{winningSide:0,isDraw:false,scores:[1,0],scoreTarget:state.scored.scoreTarget,reason:'score_target'}};
    state.scored=score;
    state.lanSeries=window.SectorLanSeries.awardRound(state.lanSeries,
      {matchId:state.matchId,winningSide:0});
   }
   state.winner=0;state.winnerTeam=0;state.elapsedSeconds=95;refreshHUD();
  }
 };
}
const game=src.replace(tail,'\n('+hook.toString()+')();\n})();');
const allowed=new Set(['index.html','style.css','game.js','scored-match.js','forward-bays.js','dossier.js','save-backup.js','lan-room.js','lan-series.js','ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});
 res.end(name==='game.js'?game:fs.readFileSync(path.join(web,name)));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const contexts=[],checks=[],errors=[];
function ok(value,why){assert.ok(value,why);checks.push(why);}
async function page(viewport){
 const ctx=await browser.newContext({viewport});contexts.push(ctx);const p=await ctx.newPage();
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.__wire=[];window.AndroidBridge={
  hostGame(){},findGames(){},joinGame(){},stopNetwork(){},
  sendPacket(s){window.__wire.push(JSON.parse(s))}
 };});
 await p.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
 await p.waitForFunction(()=>!!window.__b2);return p;
}
const send=(p,m)=>p.evaluate(msg=>window.RR.nativeMessage(JSON.stringify(msg)),m);
const packets=(p,type)=>p.evaluate(t=>window.__wire.filter(x=>x.type===t),type);
async function last(p,type){const arr=await packets(p,type);assert.ok(arr.length,'expected '+type);return arr.at(-1)}
async function inspect(p){return p.evaluate(()=>({id:window.__b2.state.matchId,
  solo:window.__b2.state.config?.lanHostSolo,side:window.__b2.state.config?.teamIds?.slice(),
  scored:window.__b2.state.scored?.operatorKOs?.slice(),
  kos:window.__b2.state.kos?.slice(),series:window.__b2.state.lanSeries,
  player:window.__b2.state.humanCount,queued:window.__b2.queue,
  guestRole:window.__b2.clientRole,watch:window.__b2.watching,
  pending:window.__b2.pending,hostMatch:window.__b2.hostMatch,
  paused:window.__b2.paused,connected:window.__b2.connected,
  move:window.__b2.guestInput,active:window.__b2.lobby?.active,
  bot:window.__b2.bot().bot}))}
try{
 for(const viewport of [{width:915,height:412},{width:740,height:360}]){
  const host=await page(viewport),guest=await page(viewport);
  await host.locator('#menu [data-action="nearby"]').click();await host.locator('[data-action="host"]').click();
  await host.locator('[data-lan-setting="teamMode"]').selectOption('tdm');
  await host.locator('[data-lan-setting="botCount"]').selectOption('2');
  await host.locator('[data-lan-setting="rounds"]').selectOption('3');
  await host.locator('[data-lan-setting="hostSide"]').selectOption('coral');
  await host.locator('[data-action="lan-start"]').click();
  const initial=await inspect(host);
  ok(initial.solo&&initial.bot&&!initial.paused&&initial.player===2&&initial.series?.round===1,
    'actual host starts fair bot-filled TDM with an unoccupied remote seat');
  await guest.locator('#menu [data-action="nearby"]').click();await guest.locator('[data-action="find"]').click();
  await send(guest,{type:'connected'});await send(host,{type:'connected'});
  const lobby=await last(host,'lobby'),role=await last(host,'spectate'),stateMsg=await last(host,'state');
  await send(guest,lobby);await send(guest,role);await send(guest,stateMsg);
  ok((await inspect(guest)).watch&&(await guest.locator('#spectator-queue').isVisible()),
    'actual guest watches host and sees JOIN NEXT, still read-only');
  await guest.locator('#spectator-queue').click();
  const req1=await last(guest,'join-next');
  ok(req1.matchId===initial.id&&req1.action==='join'&&req1.version===2&&req1.revision===role.revision,
    'JOIN NEXT request bound to live room, match and request sequence');
  await send(host,req1);
  const ack1=await last(host,'join-next-status');
  ok(ack1.role==='queued'&&ack1.boundary==='round'&&
    (await inspect(host)).queued?.queued===true,'host reserves next series round without interrupting combat');
  await send(guest,ack1);
  ok((await inspect(guest)).guestRole==='queued'&&
    (await guest.locator('#spectator-queue').textContent()).includes('CANCEL'),
    'guest receives authentic queue acknowledgment and can cancel');
  await send(guest,{...ack1,role:'player',seq:ack1.seq+1});
  ok((await inspect(guest)).guestRole==='queued',
    'forged or replayed queue status cannot grant the player role');
  ok((await guest.locator('#spectator-status').textContent()).includes('READ ONLY'),
    'queued participant remains a read-only spectator');
  const count1=(await packets(host,'join-next-status')).length;
  await send(host,req1);
  await send(host,{...req1,action:'cancel',seq:req1.seq+1,matchId:req1.matchId+5});
  await send(host,{...req1,action:'cancel',seq:req1.seq+1,revision:req1.revision+1});
  ok((await packets(host,'join-next-status')).length===count1,
    'replay, wrong match and wrong revision cannot mutate queue');
  await guest.locator('#spectator-queue').click();
  const req2=await last(guest,'join-next');await send(host,req2);
  const ack2=await last(host,'join-next-status');await send(guest,ack2);
  ok((await inspect(host)).queued===null&&(await inspect(guest)).guestRole==='spectator',
    'cancellation clears host and guest queue, leaving the fight untouched');
  await guest.locator('#spectator-queue').click();
  const req3=await last(guest,'join-next');await send(host,req3);
  await send(guest,await last(host,'join-next-status'));
  ok((await inspect(host)).queued?.queued&&(await inspect(guest)).guestRole==='queued',
    'new request after cancellation reserves exactly one place');
  const before=await inspect(host);
  await send(host,{type:'input',matchId:before.id,revision:role.revision,
   input:{moveX:1,moveY:0,fire:true}});
  await send(host,{type:'fire-request',matchId:before.id,revision:role.revision,seq:1,aimX:1,aimY:0});
  await send(host,{type:'interact',matchId:before.id,revision:role.revision});
  const unsafe=await inspect(host);
  ok(unsafe.solo&&unsafe.bot&&!unsafe.move.fire&&unsafe.move.moveX===0,
    'queued client cannot send gameplay controls during the live bot fight');
  await send(guest,{type:'join-next-promote',version:2,role:'player',revision:role.revision+1,
    previousMatchId:before.id,matchId:before.id+1,boundary:'round'});
  ok((await inspect(guest)).pending===null,'forged future role transition is rejected');
  await host.evaluate(()=>window.__b2.end());
  await host.locator('#quick-rematch').click();
  const promoted=await inspect(host);
  ok(promoted.id>before.id&&!promoted.solo&&promoted.player===2&&!promoted.paused,
    'host promotes only at the next real match/round boundary');
  ok(promoted.series?.round===2&&promoted.series?.wins?.[0]===1,
    'next Best-of-3 round retains team score, not the previous player identity');
  ok(promoted.kos?.[1]===0&&promoted.scored?.[1]===0&&
    JSON.stringify(promoted.side)===JSON.stringify(before.side),
    'fresh remote operator has zero personal KOs and unchanged team colors');
  const promotion=await last(host,'join-next-promote'),newState=await last(host,'state');
  ok(promotion.previousMatchId===before.id&&promotion.matchId===promoted.id&&
    promotion.boundary==='round'&&promotion.role==='player',
    'host sends versioned authorized promotion before the fresh state');
  await send(guest,{type:'state',state:newState});
  ok((await inspect(guest)).watch,'snapshot alone cannot turn a queued watcher into a human');
  await send(guest,{...promotion,revision:promotion.revision+1});
  ok((await inspect(guest)).pending===null,'stale promotion revision rejected');
  await send(guest,promotion);
  ok((await inspect(guest)).pending?.matchId===promoted.id,
    'valid promotion notice is held until matching source snapshot arrives');
  await send(guest,newState);
  const afterGuest=await inspect(guest);
  ok(!afterGuest.watch&&!afterGuest.solo&&afterGuest.id===promoted.id&&
    !(await guest.locator('#spectator-queue').isVisible()),
    'guest really becomes a controllable player only after new state is validated');
  ok((await guest.locator('.touch-left').evaluate(e=>getComputedStyle(e).display))!=='none',
    'player thumb controls return after the spectator seat is promoted');
  const staleBase=(await inspect(host)).move;
  await send(host,{type:'input',matchId:before.id,revision:promotion.revision,
    input:{moveX:1,moveY:0,fire:true}});
  await send(host,{type:'input',matchId:promoted.id,revision:promotion.revision+1,
    input:{moveX:1,moveY:0,fire:true}});
  ok((await inspect(host)).move.moveX===staleBase.moveX,
    'stale and wrong-revision human inputs rejected after promotion');
  await send(host,{type:'input',matchId:promoted.id,revision:promotion.revision,
    input:{moveX:.5,moveY:0,fire:false}});
  ok((await inspect(host)).move.moveX===.5,
    'valid match-bound input reaches actual host-controlled remote seat');
  await send(host,{type:'disconnected'});
  ok((await inspect(host)).solo&&!(await inspect(host)).paused&&
    (await inspect(host)).move.moveX===0,
    'guest disconnect returns exact same faction seat to live AI without freezing host');
  await host.evaluate(()=>window.__b2.tick());
  ok((await inspect(host)).bot,'real AI resumes the released seat after disconnect');
  ok(errors.length===0,'no page runtime errors '+errors.join(' | '));
  await host.close();await guest.close();
 }
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/d3-b2-join-next.json',JSON.stringify({checks},null,2));
 console.log('D3_B2_JOIN_NEXT_DUAL_BROWSER_PASS '+JSON.stringify({
  checks:checks.length,viewports:2,roundBoundary:true,queueCancel:true,
  staleControlRejected:true,realBotFallback:true}));
}finally{for(const ctx of contexts)await ctx.close().catch(()=>{});await browser.close();await new Promise(ok=>server.close(ok))}

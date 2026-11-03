// Real WebView engine with only the native Wi-Fi bridge mocked.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
const chrome=process.env.CHROME_BIN;
assert.ok(chrome,'D3-A1 requires real Chromium; no silent skip');
const root=process.cwd(),web=path.join(root,'web'),qa=path.join(root,'qa-screens','lan-host-bots');
fs.mkdirSync(qa,{recursive:true});
const source=fs.readFileSync(path.join(web,'game.js'),'utf8'),end=/\}\)\(\);\s*$/;
assert.ok(end.test(source));
const game=source.replace(end,"window.__a1={get state(){return state},get mode(){return mode},get connected(){return connected},get paused(){return paused},get lobby(){return lanLobby},get brains(){return botBrains},botInput,credit:creditScoredPilotKO,refreshHUD};})();");
const files={'/':'index.html','/index.html':'index.html','/game.js':'game.js','/style.css':'style.css','/lan-room.js':'lan-room.js','/lan-series.js':'lan-series.js','/scored-match.js':'scored-match.js','/forward-bays.js':'forward-bays.js','/dossier.js':'dossier.js','/save-backup.js':'save-backup.js'};
const server=http.createServer((req,res)=>{const f=files[new URL(req.url,'http://localhost').pathname];
 if(!f){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});
 res.end(f==='game.js'?game:fs.readFileSync(path.join(web,f)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext({viewport:{width:915,height:412}}),page=await context.newPage();
const errors=[];let checks=0;page.on('pageerror',e=>errors.push(e.message));
function CHECK(x,why){assert.ok(x,why);checks++;}
async function state(){return page.evaluate(()=>window.__a1.state);}
async function change(key,value){await page.locator('[data-lan-setting="'+key+'"]').selectOption(String(value));}
async function receive(packet){await page.evaluate(p=>window.RR.nativeMessage(JSON.stringify(p)),packet);}
async function score(attacker,victim,target=15){return page.evaluate(({attacker,victim,target})=>{
 const qa=window.__a1;for(let i=0;i<target;i++){
  qa.state.lives[victim]=1;qa.state.tanks[victim].onFoot=true;
  if(!qa.credit(attacker,victim))throw Error('failed actual pilot KO '+i);
 }
 return qa.state.lanSeries;
},{attacker,victim,target});}
try{
 await page.addInitScript(()=>{window.__calls=[];window.__packets=[];
  window.AndroidBridge={hostGame(){window.__calls.push('host')},findGames(){},
   joinGame(){},stopNetwork(){window.__calls.push('stop')},
   sendPacket(x){window.__packets.push(JSON.parse(x))}};
 });
 await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
 await page.waitForFunction(()=>!!window.__a1);
 CHECK(await page.evaluate(()=>!!window.SectorLanRoom),'D3-A0 module loaded before D3-A1 game');
 await page.locator('#menu button[data-action="nearby"]').click();
 await page.locator('button[data-action="host"]').click();
 await receive({type:'hosting',address:'192.168.1.20',port:47212});
 CHECK(await page.locator('.lan-lobby').isVisible(),'one-phone room visible');
 CHECK(await page.locator('button[data-action="lan-start"]').isEnabled(),'D3-A2 FFA now starts against an AI before guest joins');
 CHECK((await page.evaluate(()=>window.__calls)).filter(x=>x==='host').length===1,'one host socket created');
 await change('teamMode','tdm');
 CHECK(await page.locator('button[data-action="lan-start"]').isEnabled(),'TDM start enabled without guest');
 CHECK((await page.locator('button[data-action="lan-start"]').textContent()).includes('VS BOTS'),'button clearly offers bot play');
 CHECK((await page.locator('[data-lan-setting="botCount"] option[value="0"]').textContent()).includes('1 BOT'),'1v1 correctly counts AI guest seat');
 await change('hostSide','coral');await change('rounds','3');await change('friendlyFire','on');
 await page.locator('button[data-action="lan-start"]').click();
 let s=await state();
 CHECK(s.config.lanHostSolo===true&&s.config.lanScoredTdm===true,'host-only TDM frozen');
 CHECK(s.tanks.length===2&&s.humanCount===2&&s.config.botCount===0,'no ghost actor, reserved index maintained');
 CHECK(JSON.stringify(s.config.teamIds)==='[1,0]','host Coral opponent AI Cyan');
 CHECK(await page.evaluate(()=>!window.__a1.paused),'game running without connected guest');
 CHECK(await page.evaluate(()=>{const cmd=window.__a1.botInput(1,1/60);return cmd.bot===true&&window.__a1.brains.has(1)}),'reserved index 1 runs actual combat AI');
 await receive({type:'connected'});
 CHECK(await page.evaluate(()=>!window.__a1.paused),'late join never freezes solo-host battle');
 CHECK(await page.evaluate(()=>window.__packets.some(x=>x.type==='lobby'&&x.hostBusy)),'late join receives busy waiting lobby');
 await receive({type:'input',input:{moveX:1,moveY:0,fire:true}});
 await receive({type:'fire-request',matchId:s.matchId,seq:1,aimX:1,aimY:0});
 await receive({type:'interact'});
 CHECK(await page.evaluate(()=>window.__a1.botInput(1,1/60).bot===true),'remote commands do not hijack AI');
 await receive({type:'disconnected'});
 CHECK(await page.evaluate(()=>!window.__a1.paused&&!window.__a1.connected),'peer disconnect keeps host playing');
 let r=await score(0,1);
 CHECK(r.round===1&&r.wins[1]===1,'15 actual pilot KOs win Coral round 1');
 CHECK((await page.locator('#aa-title').textContent()).includes('ROUND CLEARED'),'round 1 honest result');
 CHECK(await page.locator('#lan-edit-rules').isVisible(),'host can edit rules without guest');
 await page.screenshot({path:path.join(qa,'915x412-round1.png'),animations:'disabled'});
 await page.locator('#quick-rematch').click();s=await state();
 CHECK(s.lanSeries.round===2&&s.lanSeries.wins[1]===1,'next round preserved score');
 CHECK(s.config.lanHostSolo&&await page.evaluate(()=>!window.__a1.paused),'next round runs host only');
 r=await score(1,0);
 CHECK(r.wins[0]===1&&r.wins[1]===1,'AI can win round 2');
 await page.locator('#quick-rematch').click();
 CHECK((await state()).lanSeries.round===3,'real decider opened');
 r=await score(0,1);
 CHECK(r.concluded&&r.winner===1,'host wins final series 2:1');
 CHECK((await page.locator('#aa-title').textContent()).includes('SERIES WON'),'series display accurate');
 await page.locator('#lan-edit-rules').click();
 CHECK(await page.locator('.lan-lobby').isVisible(),'back to persistent room');
 CHECK((await page.evaluate(()=>window.__calls)).filter(x=>x==='host').length===1,'no socket restart on rules');
 await change('botCount','2');await change('rounds','1');
 await page.locator('button[data-action="lan-start"]').click();s=await state();
 CHECK(s.tanks.length===4&&JSON.stringify(s.config.teamIds)==='[1,0,1,0]','2v2 correct factions 1 human 3 AI');
 CHECK(await page.evaluate(()=>window.__a1.botInput(1,1/60).bot&&window.__a1.botInput(2,1/60).bot),'enemy and ally real bot AI');
 await score(0,1);
 await page.locator('#lan-edit-rules').click();
 await change('botCount','4');
 await page.locator('button[data-action="lan-start"]').click();s=await state();
 CHECK(s.tanks.length===6&&JSON.stringify(s.config.teamIds)==='[1,0,1,0,1,0]','3v3 correct factions 1 human 5 AI');
 await page.screenshot({path:path.join(qa,'915x412-3v3.png'),animations:'disabled'});
 await page.evaluate(()=>window.RR.openMenu());
 await page.locator('button[data-action="close"]').click();
 CHECK(await page.locator('.home-screen').isVisible(),'explicitly closing room returns home');
 CHECK(errors.length===0,'no page runtime error: '+errors.join('; '));
 console.log('PASS D3-A1: '+checks+' full game one-phone host-vs-bots checks');
}catch(e){console.error('D3-A1 FAILED',e?.stack||e);throw e;}
finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

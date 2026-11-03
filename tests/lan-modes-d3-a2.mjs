// D3-A2: actual game survival outcomes in a single Chromium host. Only Wi-Fi bridge is mocked.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';
const chrome=process.env.CHROME_BIN;
assert.ok(chrome,'CHROME_BIN mandatory, no silently skipped LAN mode acceptance');
const root=process.cwd(),web=path.join(root,'web'),dest=path.join(root,'qa-screens','lan-modes-a2');
fs.mkdirSync(dest,{recursive:true});
const orig=fs.readFileSync(path.join(web,'game.js'),'utf8'),end=/\}\)\(\);\s*$/;
assert.ok(end.test(orig),'real game IIFE found');
const game=orig.replace(end,"window.__modeA2={get state(){return state},get mode(){return mode},get paused(){return paused},get connected(){return connected},get lobby(){return lanLobby},botInput,registerHit,refreshHUD,teamOf,opposingCount};})();");
const allow={'/':'index.html','/index.html':'index.html','/game.js':'game.js','/style.css':'style.css','/scored-match.js':'scored-match.js','/lan-series.js':'lan-series.js','/lan-room.js':'lan-room.js','/forward-bays.js':'forward-bays.js','/dossier.js':'dossier.js','/save-backup.js':'save-backup.js'};
const server=http.createServer((req,res)=>{const f=allow[new URL(req.url,'http://localhost').pathname];
 if(!f){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});res.end(f==='game.js'?game:fs.readFileSync(path.join(web,f)));});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await browser.newContext({viewport:{width:915,height:412}}),page=await ctx.newPage();
const errors=[];let checks=0;
page.on('pageerror',err=>errors.push(err.message));
function CHECK(ok,why){assert.ok(ok,why);checks++;}
async function change(k,value){await page.locator('[data-lan-setting="'+k+'"]').selectOption(String(value));}
async function state(){return page.evaluate(()=>window.__modeA2.state);}
async function inspect(){return page.evaluate(()=>{const a=window.__modeA2,s=a.state;
 return {mode:a.mode,paused:a.paused,connected:a.connected,seed:s.mazeSeed,matchId:s.matchId,
 cfg:s.config,humans:s.humanCount,teamIds:s.config.teamIds,players:s.tanks.length,
 AI:Array.from({length:s.tanks.length-1},(_,n)=>a.botInput(n+1,1/60).bot),
 score1:document.getElementById('score1').textContent,
 label1:document.getElementById('player1-label').textContent,
 rewards:localStorage.getItem('rr-dossier-v1')}});
}
async function finishByHuman(indices){return page.evaluate(targets=>{const api=window.__modeA2,s=api.state;
 for(const index of targets){s.lives[index]=1;s.tanks[index].onFoot=true;s.tanks[index].shield=0;
  if(!api.registerHit(0,index))throw Error('real survival hit rejected for bot '+index);
 }
 api.refreshHUD();
 return {winner:s.winner,winnerTeam:s.winnerTeam,kos:s.kos[0],
  remaining:api.opposingCount(0),matchId:s.matchId};
},indices);}
async function room(){await page.locator('#lan-edit-rules').click();CHECK(await page.locator('.lan-lobby').isVisible(),'same room restored after match');}
try{
 await page.addInitScript(()=>{window.__calls=[];window.AndroidBridge={
  hostGame(){window.__calls.push('host')},stopNetwork(){window.__calls.push('stop')},
  sendPacket(){},findGames(){},joinGame(){}};
 });
 await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
 await page.waitForFunction(()=>!!window.__modeA2);
 await page.locator('#menu button[data-action="nearby"]').click();
 await page.locator('button[data-action="host"]').click();
 CHECK(await page.locator('[data-lan-setting="teamMode"]').inputValue()==='ffa','default LAN rules remain FFA');
 CHECK(await page.locator('[data-lan-setting="botCount"]').inputValue()==='0','zero additional AI remains selected');
 CHECK(await page.locator('button[data-action="lan-start"]').isEnabled(),'host may start free-for-all without other phone');
 CHECK((await page.locator('button[data-action="lan-start"]').textContent()).includes('VS BOTS'),'correct host-only button');
 CHECK((await page.locator('[data-lan-setting="botCount"] option[value="0"]').textContent()).includes('1 AI OPPONENT'),'empty guest seat described as enemy AI');
 const beforeDossier=await page.evaluate(()=>localStorage.getItem('rr-dossier-v1'));
 await page.locator('button[data-action="lan-start"]').click();
 let s=await inspect();
 CHECK(s.players===2&&s.humans===2&&s.AI[0]===true,'FFA 1v1 has one human and genuine AI in seat 1');
 CHECK(JSON.stringify(s.teamIds)==='[0,1]'&&s.cfg.teamMode==='ffa','FFA unique teams, not an allied coop bot');
 CHECK(!s.paused&&!s.connected,'host battle running while not connected');
 CHECK(s.score1==='1'&&s.label1==='ENEMIES LEFT','FFA HUD counts opponent AI instead of fake guest lives');
 let done=await finishByHuman([1]);
 CHECK(done.winner===0&&done.remaining===0,'real FFA pilot death ends with human victory');
 CHECK((await page.locator('#aa-title').textContent()).includes('SECTOR CLEARED'),'FFA after-action human victory');
 CHECK((await page.locator('#score1').textContent()).trim()==='0','enemy count reaches zero');
 await page.screenshot({path:path.join(dest,'915x412-ffa-result.png'),animations:'disabled'});
 await page.locator('#quick-rematch').click();
 s=await inspect();CHECK(s.cfg.teamMode==='ffa'&&s.players===2&&s.matchId>done.matchId,'FFA rematch refreshes seed and match identity');
 done=await finishByHuman([1]);
 await room();
 await change('botCount',4);
 CHECK((await page.locator('[data-lan-setting="botCount"] option[value="4"]').textContent()).includes('5 AI'),'five actual AI opponents shown');
 await page.locator('button[data-action="lan-start"]').click();
 s=await inspect();
 CHECK(s.players===6&&s.AI.every(Boolean),'FFA six total actors, 1 real human and 5 AI');
 CHECK(new Set(s.teamIds).size===6,'FFA all six actor teams uniquely identified');
 done=await finishByHuman([1,2,3,4,5]);
 CHECK(done.winner===0&&done.remaining===0,'five real FFA kills conclude six-actor arena');
 await room();
 await change('teamMode','teams');await change('hostSide','coral');
 CHECK(await page.locator('[data-lan-setting="botCount"] option[value="3"]').evaluate(x=>x.disabled),'odd teams disabled for even squads');
 await change('botCount',2);
 CHECK((await page.locator('[data-lan-setting="botCount"] option[value="2"]').textContent()).includes('2v2'),'2v2 pair count shown');
 await page.locator('button[data-action="lan-start"]').click();
 s=await inspect();
 CHECK(s.cfg.teamMode==='teams'&&s.players===4&&s.AI.every(Boolean),'Team Survival 2v2 has host and three bots');
 CHECK(JSON.stringify(s.teamIds)==='[1,0,1,0]','Coral human, Cyan enemy AI, Coral allied AI, Cyan enemy AI');
 CHECK(s.score1==='2'&&s.label1==='CYAN · ENEMIES','team survival HUD counts enemy lives, excludes ally');
 done=await finishByHuman([1,3]);
 CHECK(done.winnerTeam===1&&done.remaining===0,'human/ally Coral team truly wins Survival');
 CHECK((await page.locator('#aa-title').textContent()).includes('SECTOR CLEARED'),'team survival true victory');
 await room();
 await change('botCount',0);
 CHECK(await page.locator('button[data-action="lan-start"]').isEnabled(),'team survival can be 1 human vs single enemy bot');
 await page.locator('button[data-action="lan-start"]').click();
 s=await inspect();
 CHECK(s.players===2&&s.AI[0]&&JSON.stringify(s.teamIds)==='[1,0]','balanced Team Survival 1v1 with AI guest seat');
 await finishByHuman([1]);await room();
 await change('botCount',4);
 await page.locator('button[data-action="lan-start"]').click();
 s=await inspect();CHECK(s.players===6&&JSON.stringify(s.teamIds)==='[1,0,1,0,1,0]','balanced 3v3 Survival with host +2 AI allies');
 await finishByHuman([1,3,5]);await room();
 await change('teamMode','coop');
 CHECK(await page.locator('[data-lan-setting="botCount"] option[value="0"]').evaluate(x=>x.disabled),'co-op cannot deploy without an enemy');
 CHECK(await page.locator('button[data-action="lan-start"]').isDisabled(),'invalid empty co-op Start blocked');
 await change('botCount',1);
 CHECK(await page.locator('button[data-action="lan-start"]').isEnabled(),'co-op unlocks with a real enemy bot');
 CHECK((await page.locator('[data-lan-setting="botCount"] option[value="1"]').textContent()).includes('1 ALLY + 1 ENEMY'),'co-op slot1 ally vs slot2 enemy labels accurate');
 await page.locator('button[data-action="lan-start"]').click();
 s=await inspect();
 CHECK(s.players===3&&s.cfg.teamMode==='coop'&&JSON.stringify(s.teamIds)==='[0,0,1]','one host, AI ally, AI opponent');
 CHECK(s.AI.every(Boolean)&&s.score1==='1'&&s.label1==='ENEMY BOTS','AI ally and enemy use real brain, HUD excludes ally');
 done=await finishByHuman([2]);
 CHECK(done.winnerTeam===0&&done.remaining===0,'co-op victory credits team zero when enemy falls');
 CHECK((await page.locator('#aa-title').textContent()).includes('SECTOR CLEARED'),'co-op match finishes visibly');
 await room();
 await change('botCount',4);
 await page.locator('button[data-action="lan-start"]').click();
 s=await inspect();
 CHECK(s.players===6&&JSON.stringify(s.teamIds)==='[0,0,1,1,1,1]','co-op max 1 host+1 ally vs four enemies');
 await finishByHuman([2,3,4,5]);
 CHECK((await page.locator('#after-action').isVisible()),'co-op multi-bot after-action available');
 const afterDossier=await page.evaluate(()=>localStorage.getItem('rr-dossier-v1'));
 CHECK(afterDossier===beforeDossier,'LAN-vs-bots grants no Solo dossier unlocks');
 CHECK((await page.evaluate(()=>window.__calls)).filter(x=>x==='host').length===1,'one room survived mode changes without socket restart');
 await page.screenshot({path:path.join(dest,'915x412-coop-result.png'),animations:'disabled'});
 await page.setViewportSize({width:412,height:915});
 await page.screenshot({path:path.join(dest,'412x915-coop-result.png'),animations:'disabled'});
 CHECK(errors.length===0,'no real browser pageerror: '+errors.join(' | '));
 console.log('PASS D3-A2 '+checks+' real-engine FFA/Team Survival/Co-op host-alone browser checks');
}catch(e){console.error('D3-A2 FAILED:',e?.stack||e);throw e;}
finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

// D3-C2A: real game+DOM LAN recovery UI, with only the native bridge mocked.
// No socket/session authority is assumed from the browser. Hardware remains a gate.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';

assert.ok(process.env.CHROME_BIN, 'CHROME_BIN required for real-browser QA');
const web=path.resolve('web');
const source=fs.readFileSync(path.join(web,'game.js'),'utf8');
for(const name of ['game.js','index.html','style.css'])assert.equal(
 fs.readFileSync(path.join(web,name),'utf8'),
 fs.readFileSync(path.join('android/app/src/main/assets',name),'utf8'),
 'Android/Web source must mirror '+name);
const allowed=new Set(['index.html','style.css','game.js','scored-match.js',
 'forward-bays.js','dossier.js','save-backup.js','lan-room.js','lan-series.js',
 'ctf-rules.js','ctf-ai.js','daily-sector.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':
  name.endsWith('.css')?'text/css':'text/html'});
 res.end(fs.readFileSync(path.join(web,name)));
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,
 headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[],passes=[];
const check=(condition,message)=>{assert.ok(condition,message);passes.push(message)};
const send=(page,msg)=>page.evaluate(m=>window.RR.nativeMessage(JSON.stringify(m)),msg);
try{
 for(const viewport of [{width:915,height:412},{width:740,height:360}]){
  const context=await browser.newContext({viewport});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
   window.__d3Calls=[];
   window.AndroidBridge={
    hostGame(){window.__d3Calls.push({type:'host'})},
    findGames(){window.__d3Calls.push({type:'find'})},
    joinGame(host,port){window.__d3Calls.push({type:'join',host,port})},
    stopNetwork(){window.__d3Calls.push({type:'stop'})},
    sendPacket(packet){window.__d3Calls.push({type:'packet',packet:JSON.parse(packet)})}
   };
  });
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'load'});
  await page.locator('#menu [data-action="nearby"]').click();
  await page.locator('[data-action="manual"]').click();
  await page.locator('#lan-address').fill('192.168.1.25:47321');
  await page.locator('[data-action="ip-join"]').click();
  const calls=()=>page.evaluate(()=>window.__d3Calls);
  const joinCalls=async()=> (await calls()).filter(x=>x.type==='join');
  check((await joinCalls()).length===1 &&
   (await joinCalls())[0].host==='192.168.1.25' &&
   (await joinCalls())[0].port===47321,'manual join records exact endpoint');
  await send(page,{type:'error',message:'Could not connect. Confirm both phones share Wi-Fi.'});
  check((await page.locator('h2').allTextContents()).some(x=>x.includes('CONNECTION FAILED')),
   'join failure has actionable user-facing screen');
  check(await page.locator('[data-action="lan-retry"]').isVisible(),
   'failed connection offers retry of known endpoint');
  await page.locator('[data-action="lan-retry"]').click();
  check((await joinCalls()).length===2,'one manual retry creates one fresh native join');
  check(await page.locator('h2').filter({hasText:'RECONNECTING'}).isVisible(),
   'retrying is not shown as a successfully resumed match');
  await send(page,{type:'connected'});
  check(await page.locator('[data-action="lan-ready"]').isVisible(),
   'fresh connected guest returns to host-authoritative lobby');
  await send(page,{type:'disconnected'});
  check((await page.locator('h2').allTextContents()).some(x=>x.includes('CONNECTION LOST')),
   'disconnect presents connection-lost recovery screen');
  await page.locator('[data-action="lan-retry"]').click();
  check((await joinCalls()).length===3,'disconnected guest can retry exact room again');
  await send(page,{type:'connected'});
  await send(page,{type:'busy',reason:'room-full'});
  await send(page,{type:'disconnected'});
  check((await page.locator('h2').allTextContents()).some(x=>x.includes('ROOM FULL')),
   'genuine native busy response is distinct from generic failure');
  await page.locator('[data-action="find"]').click();
  check((await calls()).some(x=>x.type==='find'),
   'full room offers new discovery instead of silently attaching another player');
  await send(page,{type:'error',message:'Discovery unavailable; use Join by IP.'});
  check(await page.locator('[data-action="lan-retry"]').count()===0,
   'new room search clears stale retry address');
  await page.locator('[data-action="close"]').click();
  await send(page,{type:'disconnected'});
  check(await page.locator('#menu [data-action="nearby"]').count()===1,
   'stale disconnect after leaving LAN does not hijack main menu');
  await page.locator('#menu [data-action="nearby"]').click();
  await page.locator('[data-action="host"]').click();
  await send(page,{type:'host-offline'});
  check(await page.locator('[data-action="host"]').isVisible(),
   'backgrounded host is correctly offered fresh-room restart');
  const hostsBefore=(await calls()).filter(x=>x.type==='host').length;
  await page.locator('[data-action="host"]').click();
  check((await calls()).filter(x=>x.type==='host').length===hostsBefore+1,
   'host re-open starts a fresh native host, not the stopped room');
  await context.close();
 }
 check(errors.length===0,'no browser page exceptions during recovery scenarios');
 console.log('D3_C2A_REAL_BROWSER_PASS: '+passes.length+' assertions, two phone-sized viewports');
} finally {await browser.close();await new Promise(done=>server.close(done));}

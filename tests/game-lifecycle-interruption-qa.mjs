import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
const exe=process.env.CHROME_BIN;
assert.ok(exe,'Chromium required; no skipped lifecycle test');
const root=path.resolve('web'),src=fs.readFileSync(path.join(root,'game.js'),'utf8');
assert.match(src,/\}\)\(\);\s*$/);
const instrumented=src.replace(/\}\)\(\);\s*$/,'\nwindow.__lifeQA=()=>({mode,paused,pressed:[...pressed],touch:[...touch],stickPointer:stick.pointerId,stickX:stick.x,stickY:stick.y,firePointer:fireAim.pointerId,fireActive:fireAim.active,input:makeControl(true)});\n})();');
const allowed=new Set(['index.html','game.js','style.css','dossier.js','save-backup.js','scored-match.js']);
const server=http.createServer((req,res)=>{
 const filename=new URL(req.url,'http://127.0.0.1/').pathname.replace(/^\/+/,'')||'index.html';
 if(!allowed.has(filename)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':filename.endsWith('.js')?'text/javascript':filename.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});
 res.end(filename==='game.js'?instrumented:fs.readFileSync(path.join(root,filename)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:exe,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:740,height:360}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const snap=()=>page.evaluate(()=>window.__lifeQA());
function neutral(s){
 assert.deepEqual(s.pressed,[],'keyboard released');
 assert.deepEqual(s.touch,[],'virtual controls released');
 assert.equal(s.stickPointer,null,'joystick released');
 assert.equal(s.stickX,0);assert.equal(s.stickY,0);
 assert.equal(s.firePointer,null);assert.equal(s.fireActive,false);
 assert.equal(s.input.moveX,0);assert.equal(s.input.moveY,0);
 assert.equal(s.input.fire,false,'no ghost firing');
}
try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 await page.waitForFunction(()=>!!window.__lifeQA);
 await page.locator('#menu button[data-action="solo"]').click();
 assert.equal((await snap()).mode,'solo');
 assert.equal((await snap()).paused,false);
 await page.keyboard.down('w');
 assert.ok((await snap()).pressed.includes('KeyW'));
 assert.ok((await snap()).input.moveY<0);
 await page.evaluate(()=>window.RR.appPause());
 assert.equal((await snap()).paused,true);
 neutral(await snap());
 assert.match(await page.locator('#panel').textContent(),/SECTOR\s*PAUSED/i);
 await page.keyboard.up('w');
 await page.locator('button[data-action="resume"]').click();
 assert.equal((await snap()).paused,false);
 neutral(await snap());
 const fire=page.locator('[data-key="fire"]'),f=await fire.boundingBox();
 assert.ok(f);
 await page.mouse.move(f.x+f.width/2,f.y+f.height/2);await page.mouse.down();
 assert.ok((await snap()).touch.includes('fire'));
 await page.evaluate(()=>window.RR.appPause());
 neutral(await snap());await page.mouse.up();
 await page.locator('button[data-action="resume"]').click();
 neutral(await snap());
 const joy=page.locator('#joystick'),r=await joy.boundingBox();assert.ok(r);
 await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
 await page.mouse.move(r.x+r.width*.75,r.y+r.height*.65,{steps:5});
 assert.notEqual((await snap()).stickPointer,null,'joystick captured');
 assert.ok(Math.hypot((await snap()).stickX,(await snap()).stickY)>.1);
 await page.evaluate(()=>window.RR.appPause());
 neutral(await snap());await page.mouse.up();
 await page.locator('button[data-action="resume"]').click();
 neutral(await snap());
 await page.keyboard.down('d');
 assert.ok((await snap()).pressed.includes('KeyD'));
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
 neutral(await snap());await page.keyboard.up('d');
 assert.deepEqual(errors,[]);
 console.log('GAME_LIFECYCLE_REAL_BROWSER_PASS: keyboard, FIRE, joystick, onPause/resume and blur all neutral at 740x360');
}finally{
 await page.close().catch(()=>{});
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
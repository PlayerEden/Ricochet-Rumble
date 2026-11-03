// Sector Rebound: real first-session Quick Play test using the bundled browser
// game. No test hooks modify the game and no saved data is overwritten.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright-core';

assert.ok(process.env.CHROME_BIN,'CHROME_BIN required: do not skip browser QA');
const root=path.resolve('web');
const names=new Set(['index.html','style.css','game.js','scored-match.js','forward-bays.js','dossier.js','save-backup.js','lan-series.js','lan-room.js']);
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://127.0.0.1').pathname.slice(1)||'index.html';
 if(!names.has(pathname)){res.writeHead(404);res.end();return}
 const mime=pathname.endsWith('.js')?'text/javascript':pathname.endsWith('.css')?'text/css':'text/html';
 res.writeHead(200,{'Content-Type':mime+'; charset=utf-8','Cache-Control':'no-store'});
 res.end(fs.readFileSync(path.join(root,pathname)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[];
try{
 const base='http://127.0.0.1:'+server.address().port+'/';
 // For a two-mode bag, shuffle random=0 normally puts Team Survival first.
 // New players should learn Solo Survival first, without removing Team.
 const ctx=await browser.newContext({viewport:{width:915,height:412}});
 await ctx.addInitScript(()=>{Math.random=()=>0});
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'load'});
 assert.equal(await page.locator('.home-screen').isVisible(),true);
 assert.equal(await page.evaluate(()=>localStorage.getItem('rr-coach-fire-v0965-survival-release')),null);
 await page.locator('.home-deploy[data-action="solo"]').click();
 assert.equal((await page.locator('#mode-label').textContent()).trim(),'SOLO SURVIVAL',
   'first default Quick Play is a straightforward Solo Survival match');
 assert.equal(await page.locator('#menu').evaluate(e=>e.classList.contains('hidden')),true);
 assert.match(await page.locator('#field-coach').textContent(),/DRAG FIRE TO AIM · RELEASE TO SHOOT/,
   'existing brief coach is presented without a separate tutorial modal');
 assert.equal(await page.evaluate(()=>localStorage.getItem('rr-coach-fire-v0965-survival-release')),'1',
   'first-play hint records the updated release-to-fire instruction flag');
 assert.equal(await page.evaluate(()=>localStorage.getItem('rr-coach-v0917')),'1',
   'legacy Quick Play onboarding milestone remains marked after truthful coach');
 await page.locator('#menu-button').click();
 assert.equal(await page.locator('button[data-action="resume"]').isVisible(),true);
 await page.locator('button[data-action="close"]').click();
 assert.equal(await page.locator('.home-screen').isVisible(),true);
 // After that first exposure, the original shuffle algorithm remains in
 // control; deterministic random=0 chooses Team Survival from the two options.
 await page.locator('.home-deploy[data-action="solo"]').click();
 assert.equal((await page.locator('#mode-label').textContent()).trim(),'TEAM SURVIVAL',
   'returning player uses unchanged shuffled playlist instead of forced Solo');
 assert.equal(await page.locator('#menu').evaluate(e=>e.classList.contains('hidden')),true);
 await ctx.close();

 // Explicit Team-only user selection has priority even before first play.
 const selected=await browser.newContext({viewport:{width:740,height:360}});
 await selected.addInitScript(()=>{Math.random=()=>0});
 const teamPage=await selected.newPage();
 teamPage.on('pageerror',e=>errors.push(e.message));
 await teamPage.goto(base,{waitUntil:'load'});
 await teamPage.locator('button[data-action="settings"]').click();
 await teamPage.locator('details.extra-rules summary').click();
 await teamPage.locator('input[data-playlist-mode="survival_ffa"]').uncheck();
 assert.equal(await teamPage.locator('input[data-playlist-mode="survival_teams"]').isChecked(),true);
 await teamPage.locator('button[data-action="settings-play"]').click();
 assert.equal((await teamPage.locator('#mode-label').textContent()).trim(),'TEAM SURVIVAL',
   'first play honors Team-only preference and does not inject unselected FFA');
 const saved=await teamPage.evaluate(()=>JSON.parse(localStorage.getItem('rr-options-v06')));
 assert.deepEqual(saved.playlist.enabled,['survival_teams'],'playlist data unchanged');
 await selected.close();
 assert.deepEqual(errors,[],'both journeys produce zero uncaught browser errors');
 console.log('FIRST_MATCH_ENTRY_REAL_BROWSER_PASS: fresh FFA first, quick deploy, old shuffle after return, explicit team-only choice and storage unchanged');
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}

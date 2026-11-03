// Real browser audit: a failed export must not leave stale backup text copyable.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
assert.ok(process.env.CHROME_BIN,'real Chromium required');
const root=path.resolve('web');
const allowed=new Set(['index.html','game.js','style.css','dossier.js','scored-match.js','save-backup.js','forward-bays.js','lan-series.js','lan-room.js']);
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1/').pathname.replace(/^\/+/,'')||'index.html';
 if(!allowed.has(name)){res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});
 res.end(fs.readFileSync(path.join(root,name)));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:915,height:412}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 await page.evaluate(()=>localStorage.setItem('rr-options-v06',JSON.stringify({settings:{mapSize:'standard',botCount:1},comfort:{sound:true}})));
 await page.reload();
 await page.locator('#menu button[data-action="dossier"]').click();
 await page.locator('button[data-action="backup"]').click();
 await page.locator('button[data-action="backup-export"]').click();
 const backup=await page.locator('#backup-output').inputValue();
 assert.ok(backup.includes('sector-rebound-local-v1'),'valid older export initially present');
 await page.evaluate(()=>{
  localStorage.setItem('rr-options-v06',JSON.stringify({settings:{extra:'A'.repeat(23000)},comfort:{sound:true}}));
  localStorage.setItem('rr-custom-v1',JSON.stringify({version:1,rules:{modeId:'survival_ffa',extra:'B'.repeat(23000)}}));
  localStorage.setItem('rr-custom-presets-v1',JSON.stringify({version:1,entries:[],extra:'C'.repeat(23000)}));
 });
 await page.locator('button[data-action="backup-export"]').click();
 assert.equal(await page.locator('#backup-output').inputValue(),'','failed export discards stale text');
 assert.match(await page.locator('#backup-message').textContent(),/BACKUP TOO LARGE TO RESTORE SAFELY/);
 await page.locator('button[data-action="backup-copy"]').click();
 assert.match(await page.locator('#backup-message').textContent(),/GENERATE BACKUP TEXT FIRST/);
 assert.equal(await page.locator('#backup-output').inputValue(),'');
 assert.deepEqual(errors,[]);
 console.log('BACKUP_STALE_EXPORT_REAL_BROWSER_PASS: oversized export clears prior copyable text, no progress mutation');
}finally{
 await page.close().catch(()=>{});
 await browser.close();
 await new Promise(r=>server.close(r));
}
// GitHub CI review-only Play candidate. Never substitutes for Android screenshots.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
const from=path.resolve(process.argv.find(x=>x.startsWith('--input='))?.slice(8)||'qa-screens/after');
const to=path.resolve(process.argv.find(x=>x.startsWith('--output='))?.slice(9)||'qa-results/play-store-candidate');
const names=[
 ['1280x720-moving-tank.png','01-real-tank-gameplay.png'],
 ['1280x720-pilot-fire.png','02-real-pilot-gameplay.png'],
 ['1280x720-arena.png','03-real-procedural-maze.png'],
 ['1280x720-home.png','04-real-menu.png']];
fs.mkdirSync(path.join(to,'screenshots'),{recursive:true});
const report={status:'REVIEW_ONLY_NOT_PLAY_APPROVED',source:'Chromium game QA screenshots',screenshots:[]};
for(const [src,dest] of names){
 const bytes=fs.readFileSync(path.join(from,src));
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20),bytes[24],bytes[25]],[1280,720,8,2]);
 fs.writeFileSync(path.join(to,'screenshots',dest),bytes);
 report.screenshots.push({name:dest,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
const game=fs.readFileSync(path.join(from,names[0][0])).toString('base64');
const html=String.raw`<!doctype html><html><head><style>
*{box-sizing:border-box}html,body{margin:0;width:1024px;height:500px;overflow:hidden}
body{font-family:Arial,sans-serif;color:#f2f5f3;background:#0c151b}
.game{position:absolute;left:340px;top:-23px;width:760px;height:548px;background:url("data:image/png;base64,SCREENSHOT_DATA") left top/760px 548px no-repeat;filter:contrast(1.12)}
.fade{position:absolute;inset:0;background:linear-gradient(90deg,#0c151b 0%,#0c151b 26%,#0c151bf8 34%,#0c151bdb 44%,#0c151b78 55%,#0c151b15 78%)}
.bar{position:absolute;left:0;top:0;width:10px;height:500px;background:#f2ae51}
.mark{position:absolute;top:43px;left:32px;width:64px;height:4px;background:#f2ae51}
.eyebrow{position:absolute;left:32px;top:66px;font:14px monospace;color:#c6d7d8}
.title{position:absolute;left:31px;font:bold 73px/1.1 Arial,sans-serif;letter-spacing:-3px;white-space:nowrap}
.first{top:123px}.second{top:207px;font-size:65px;color:#f4ad50}
.rule{position:absolute;left:34px;top:301px;width:375px;height:2px;background:#64777c}
.tag{position:absolute;left:34px;top:335px;font:bold 23px/1.45 Arial,sans-serif}
.footer{position:absolute;left:35px;bottom:38px;font:12px monospace;color:#b7c9ca}
.topline,.bottomline{position:absolute;left:515px;width:465px;height:2px;background:#729aa2}
.topline{top:30px}.bottomline{top:470px}
</style></head><body><div class="game"></div><div class="fade"></div><div class="bar"></div>
<div class="mark"></div><div class="eyebrow">FIELDGRID / ARCADE COMBAT</div>
<div class="title first">SECTOR</div><div class="title second">REBOUND</div>
<div class="rule"></div><div class="tag">AIM THE ANGLE.<br>OWN THE MAZE.</div>
<div class="footer">PROCEDURAL / RICOCHET / SURVIVE</div><div class="topline"></div><div class="bottomline"></div>
</body></html>`.replace('SCREENSHOT_DATA',game);
assert.ok(process.env.CHROME_BIN,'CHROME_BIN needed to render genuine game-capture feature');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1024,height:500},deviceScaleFactor:1});
 await page.setContent(html,{waitUntil:'load'});
 await page.evaluate(()=>document.fonts.ready);
 const jpeg=await page.screenshot({type:'jpeg',quality:95});
 assert.equal(jpeg.subarray(0,2).toString('hex'),'ffd8');
 fs.writeFileSync(path.join(to,'feature-graphic-1024x500.jpg'),jpeg);
 report.feature={name:'feature-graphic-1024x500.jpg',width:1024,height:500,format:'JPEG',sha256:crypto.createHash('sha256').update(jpeg).digest('hex')};
 report.provenanceCommit=process.env.GITHUB_SHA||'local';
 report.realDeviceEvidence=false;
 report.productionReady=false;
 fs.writeFileSync(path.join(to,'provenance.json'),JSON.stringify(report,null,2)+'\n');
 await page.close();
 console.log('PLAY_STORE_CANDIDATE_PASS: genuine 4 game captures and 1024x500 JPEG; review-only, NOT approved for Play');
}finally{await browser.close();}

// Real browser verification of user-initiated offline backup sharing.
// Tests actual menu controls. No network, accounts, or implicit share.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright-core';

const chrome=process.env.CHROME_BIN;
if(!chrome)throw Error('CHROME_BIN required for backup UI test');
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const cases=[];
try{
 for(const native of [true,false]){
  const page=await browser.newPage({viewport:{width:915,height:412}});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(({native})=>{
   window.__shareCalls=[];
   if(native)window.AndroidBridge={shareBackup(text){window.__shareCalls.push(text)}};
  },{native});
  await page.goto(pathToFileURL(path.join(process.cwd(),'web/index.html')).href,{waitUntil:'load'});
  // Save a real local record through the actual Settings UI instead of injecting
  // invalid fake import data. Android and web backups use identical core module.
  await page.locator('#menu button[data-action="settings"]').click();
  await page.locator('#menu button[data-action="settings-back"]').click();
  await page.locator('#menu button[data-action="dossier"]').click();
  await page.locator('#menu button[data-action="backup"]').click();
  assert.equal(await page.locator('#menu button[data-action="backup-share"]').count(),1);
  // Cannot share before export, even with the native bridge present.
  await page.locator('#menu button[data-action="backup-share"]').click();
  assert.match(await page.locator('#backup-message').textContent(),/GENERATE BACKUP TEXT FIRST/);
  assert.equal(await page.evaluate(()=>window.__shareCalls.length),0);
  await page.locator('#menu button[data-action="backup-export"]').click();
  const text=await page.locator('#backup-output').inputValue();
  assert.ok(text.length>20);
  assert.equal(await page.evaluate(t=>window.SectorBackup.checkedEntries(t).ok,text),true);
  assert.equal(await page.evaluate(()=>window.__shareCalls.length),0,'export does not share');
  await page.locator('#menu button[data-action="backup-share"]').click();
  const shared=await page.evaluate(()=>window.__shareCalls.slice());
  if(native){
   assert.deepEqual(shared,[text],'native share passes exact validated backup once per click');
   assert.match(await page.locator('#backup-message').textContent(),/CHOOSE AN APP/);
  }else{
   assert.equal(shared.length,0);
   assert.match(await page.locator('#backup-message').textContent(),/SHARE NOT SUPPORTED|CHOOSE WHERE TO SAVE/);
  }
  // A stale/edited backup in DOM must be refused, even when native sharing
  // is available; no new chooser is launched and previous bytes are untouched.
  await page.locator('#backup-output').evaluate(el=>{el.value='bad'});
  await page.locator('#menu button[data-action="backup-share"]').click();
  assert.equal(await page.evaluate(()=>window.__shareCalls.length),native?1:0);
  assert.match(await page.locator('#backup-message').textContent(),/INVALID|NOT VALID JSON/);
  assert.deepEqual(errors,[]);
  cases.push({native,records:Object.keys(JSON.parse(text).entries).length,userClickOnly:true,invalidBlocked:true});
  await page.close();
 }
 const java=fs.readFileSync('android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java','utf8');
 assert.match(java,/@JavascriptInterface public void shareBackup\(String text\)/);
 assert.match(java,/Intent\.ACTION_SEND/);
 assert.match(java,/Intent\.createChooser/);
 assert.match(java,/runOnUiThread\(\(\) -> shareOfflineBackup\(text\)\)/);
 assert.match(java,/sector-rebound-local-v1/);
 assert.ok(!java.includes('shareOfflineBackup(text); // auto'),'share must remain explicitly requested');
 fs.mkdirSync('qa-results',{recursive:true});
 fs.writeFileSync('qa-results/backup-share-ui.json',JSON.stringify({result:'PASS',cases},null,2)+'\n');
 console.log('BACKUP_SHARE_UI_PASS '+JSON.stringify(cases));
}finally{await browser.close()}

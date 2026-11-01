// EMULATOR-ONLY CDP WebView localStorage upgrade probe.
// Patches debug instrumentation into two temporary CI worktrees, never the repo's
// published Java. No credentials, owner data or production signing keys used.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const mode=process.argv[2];
const out='qa-results/emulator-upgrade';
const keys=['rr-options-v06','rr-custom-v1','rr-custom-presets-v1','rr-dossier-v1','rr-hangar-paint-v1'];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));

if(mode==='patch'){
  assert.equal(process.argv.length,5,'patch <baseline worktree> <current worktree>');
  for(const root of process.argv.slice(3)){
    const java=path.join(root,'android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java');
    const orig=fs.readFileSync(java,'utf8');
    const needle='        web = new WebView(this);';
    assert.equal(orig.split(needle).length,2,'expected single WebView init');
    assert.equal(orig.includes('setWebContentsDebuggingEnabled'),false,'do not silently double-patch');
    const patched=orig.replace(needle,
      '        // CI debug APK only: enable CDP to measure REAL Android WebView localStorage.\n'+
      '        if ((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0)\n'+
      '            WebView.setWebContentsDebuggingEnabled(true);\n'+needle);
    fs.writeFileSync(java,patched);
    assert.equal(fs.readFileSync(java,'utf8').includes('WebView.setWebContentsDebuggingEnabled(true);'),true);
  }
  console.log('WEBVIEW_CI_DEBUG_INSTRUMENTATION_READY: only two temporary build worktrees');
  process.exit(0);
}
assert.ok(mode==='seed'||mode==='verify','expected seed/verify');
assert.ok(typeof WebSocket==='function','Node 22 built-in WebSocket is required');
fs.mkdirSync(out,{recursive:true});
const beforeFile=path.join(out,'webview-before.json');
const afterFile=path.join(out,'webview-after.json');

async function pageTarget(){
  let lastError='';
  for(let i=0;i<35;i++){
    try{
      const rsp=await fetch('http://127.0.0.1:9222/json',{signal:AbortSignal.timeout(2000)});
      if(!rsp.ok)throw new Error('HTTP '+rsp.status);
      const tabs=await rsp.json();
      const tab=tabs.find(t=>t.type==='page'&&t.url?.includes('android_asset/index.html')&&t.webSocketDebuggerUrl);
      if(tab)return tab;
      lastError='No game WebView debugging page in '+JSON.stringify(tabs.map(t=>({type:t.type,url:t.url})));
    }catch(e){lastError=String(e.message||e)}
    await pause(400);
  }
  throw Error('WebView CDP not accessible: '+lastError);
}
class CDP {
  constructor(ws){this.ws=ws;this.id=0;this.pending=new Map();
    ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch{return}
      const p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);
      if(m.error)p.reject(new Error(JSON.stringify(m.error)));else p.resolve(m.result);
    };
    ws.onclose=()=>{for(const p of this.pending.values())p.reject(Error('CDP connection closed'));this.pending.clear()};
  }
  call(method,params={}){
    const id=++this.id;
    return new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{this.pending.delete(id);reject(new Error('CDP timeout '+method))},12000);
      this.pending.set(id,{resolve:v=>{clearTimeout(timeout);resolve(v)},reject:e=>{clearTimeout(timeout);reject(e)}});
      this.ws.send(JSON.stringify({id,method,params}));
    });
  }
  async eval(expression){
    const answer=await this.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(answer.exceptionDetails)throw Error('WebView JS exception: '+JSON.stringify(answer.exceptionDetails));
    return answer.result?.value;
  }
  close(){this.ws.close()}
}
async function connection(){
  const target=await pageTarget();
  const ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('WebView WebSocket timeout')),12000);
    ws.onopen=()=>{clearTimeout(timer);resolve()};
    ws.onerror=()=>{clearTimeout(timer);reject(Error('WebView WebSocket failure'))};
  });
  return new CDP(ws);
}
const dossier={schemaVersion:1,matches:6,wins:5,losses:1,draws:0,kos:11,deaths:2,seconds:410,
  byMode:{survival_ffa:{matches:6,wins:5,losses:1,draws:0,kos:11,deaths:2,seconds:410}},recentKeys:[]};
const rules={modeId:'survival_ffa',mapSize:'large',botCount:1,botSkill:'casual',startLives:3,bulletCap:2};
const fixture={
 'rr-options-v06':{settings:{mapSize:'standard',botCount:1,bulletCap:3,startLives:2,teamMode:'ffa',botSkill:'casual'},comfort:{sound:true,music:false,shake:false,autoFire:false,leftHanded:false},playlist:{version:1,enabled:['survival_ffa']}},
 'rr-custom-v1':{version:1,rules},
 'rr-custom-presets-v1':{version:1,entries:[{name:'Maze Duel',rules}]},
 'rr-dossier-v1':dossier,
 'rr-hangar-paint-v1':{version:1,equipped:'fieldgrid.moss',emblem:'mark.vector'}
};
const raw=Object.fromEntries(Object.entries(fixture).map(([k,v])=>[k,JSON.stringify(v)]));
const readExpr='(() => ({href:location.href,keys:Object.fromEntries('+JSON.stringify(keys)+'.map(k=>[k,localStorage.getItem(k)])),gameTitle:document.title,hasDossier:!!document.querySelector(\'button[data-action="dossier"]\')}))()';
const session=await connection();
try{
  if(mode==='seed'){
    const values=JSON.stringify(raw);
    const result=await session.eval('(() => {for(const [k,v] of Object.entries('+values+'))localStorage.setItem(k,v); return true;})()');
    assert.equal(result,true,'initial seed failed');
    // Reload the actual bundled game, so its own save loaders consume the data.
    await session.eval('location.reload(); true').catch(()=>{});
    await pause(1700);
  }
  let state=null,error='';
  for(let i=0;i<22;i++){
    try{state=await session.eval(readExpr);if(state?.hasDossier)break}catch(e){error=String(e.message||e)}
    await pause(400);
  }
  assert.ok(state?.hasDossier,'real WebView page did not load: '+error);
  assert.ok(state.href.startsWith('file:///android_asset/index.html'),'wrong WebView origin');
  assert.equal(state.gameTitle,'Sector Rebound');
  const expected=mode==='seed'?raw:JSON.parse(fs.readFileSync(beforeFile,'utf8')).keys;
  for(const k of keys)assert.equal(state.keys[k],expected[k],'real WebView storage mismatch '+mode+' '+k);
  // Click the game's real Dossier entry and inspect its rendered totals.
  const visible=await session.eval('(() => {const btn=document.querySelector(\'button[data-action="dossier"]\');btn.click();return {matches:document.querySelector("#dossier-matches")?.textContent?.trim(),kos:document.querySelector("#dossier-kos")?.textContent?.trim()};})()');
  assert.equal(visible.matches,'6','Dossier UI did not recover matches');
  assert.equal(visible.kos,'11','Dossier UI did not recover KOs');
  const result={status:'PASS',stage:mode,package:'com.playereden.ricochetrumble.preview',
    origin:state.href,records:keys.length,keys:state.keys,visibleDossier:visible,
    note:'Synthetic values only. Test-instrumented debug APKs; not physical phone evidence.'};
  fs.writeFileSync(mode==='seed'?beforeFile:afterFile,JSON.stringify(result,null,2)+'\n');
  console.log(mode==='seed'?'ANDROID_WEBVIEW_LOCAL_SAVE_SEEDED':'ANDROID_WEBVIEW_LOCAL_SAVE_UPGRADE_PASS',
    'five exact localStorage records and real Dossier UI matches 6, KOs 11');
}finally{session.close()}

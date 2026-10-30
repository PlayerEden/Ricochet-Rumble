// v0.9.39 real local dossier state contract. No external runtime deps.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync(new URL('../web/dossier.js',import.meta.url),'utf8');
const win={};vm.runInNewContext(code,{window:win});const P=win.SectorDossier;
assert.equal(P.VERSION,1);
const memory=new Map(),storeApi={
 getItem(k){return memory.get(k)??null},setItem(k,v){memory.set(k,String(v))}
},store=P.createStore(storeApi);
assert.equal(store.snapshot().matches,0);
assert.equal(store.canWrite,true);
const valid=(id=1,mode='scored_tdm')=>({version:1,matchId:id,mazeSeed:7788+id,matchModeId:mode,
 outcome:'victory',operatorKOs:3,deaths:2,durationSeconds:122.7});
assert.equal(store.record(valid(1),'test-session:1:7789').ok,true);
assert.equal(store.snapshot().matches,1);assert.equal(store.snapshot().wins,1);
assert.equal(store.snapshot().kos,3);assert.equal(store.snapshot().seconds,122);
assert.equal(store.snapshot().byMode.scored_tdm.matches,1);
assert.equal(store.record(valid(1),'test-session:1:7789').reason,'duplicate');
assert.equal(store.snapshot().matches,1,'repeat refresh/HUD must not farm wins');
const saved=JSON.parse(memory.get(P.KEY));
assert.equal(saved.schemaVersion,1);assert.equal(saved.recentKeys.length,1);
const resumed=P.createStore(storeApi);
assert.equal(resumed.snapshot().matches,1,'persists after reload');
assert.equal(resumed.record(valid(1),'test-session:1:7789').reason,'duplicate','dedupe across reload');
const loss={...valid(2,'survival_ffa'),outcome:'defeat',operatorKOs:0,deaths:4};
assert.equal(resumed.record(loss,'test-session:2:7790').ok,true);
const draw={...valid(3,'cqc'),outcome:'draw',operatorKOs:2,deaths:1};
assert.equal(resumed.record(draw,'test-session:3:7791').ok,true);
const sums=resumed.snapshot();
assert.equal(sums.matches,3);assert.equal(sums.wins,1);assert.equal(sums.losses,1);assert.equal(sums.draws,1);
assert.equal(sums.kos,5);assert.equal(sums.deaths,7);assert.equal(sums.byMode.cqc.draws,1);
for(const bad of [
 {...valid(4),matchModeId:'fake_mode'}, {...valid(4),version:7},
 {...valid(4),durationSeconds:-2},{...valid(4),operatorKOs:NaN},
 {...valid(4),outcome:'unfinished'},{...valid(4),matchId:0}
]) assert.equal(resumed.record(bad,'test-session:4:7792').reason,'invalid_result');
assert.equal(resumed.snapshot().matches,3);
const eligibility=resumed.eligibility();
assert.equal(eligibility.length,3);
assert.ok(eligibility.every(x=>x.available===false),'none of the catalog is approved/runtime selectable');
assert.equal(eligibility[1].current,null,'do not fake vehicle recoveries');
// Allowlisted and bounded read; never trust arbitrary JSON object properties.
const invalid=P.normalized({schemaVersion:1,matches:999999999999,byMode:{fake:{matches:30},scored_tdm:{matches:4,kos:8}},recentKeys:['valid:1','valid:1',43]});
assert.equal(invalid.matches,0);assert.equal(invalid.byMode.fake,undefined);
assert.equal(invalid.byMode.scored_tdm.kos,8);assert.equal(invalid.recentKeys.length,1);
// Protected future format must never be downgraded or overwritten.
const futureRaw='{"schemaVersion":99,"profile":{"hasPurchases":true}}';
const futureMap=new Map([[P.KEY,futureRaw]]);
const future=P.createStore({getItem:k=>futureMap.get(k)??null,setItem:(k,v)=>futureMap.set(k,String(v))});
assert.equal(future.canWrite,false);
assert.equal(future.record(valid(),'future-session:1').ok,false);
assert.equal(futureMap.get(P.KEY),futureRaw);
// Damage must be backed up *before* writing a new v1 save.
const badMap=new Map([[P.KEY,'{broken-json']]);
const recover=P.createStore({getItem:k=>badMap.get(k)??null,setItem:(k,v)=>badMap.set(k,String(v))});
assert.equal(badMap.get('rr-dossier-v1-recovery-backup'),'{broken-json');
assert.equal(recover.record(valid(),'recovered:1').ok,true);
assert.equal(JSON.parse(badMap.get(P.KEY)).matches,1);
// If backup denied, do not overwrite damaged data.
const blocked={getItem:k=>k===P.KEY?'{old':null,setItem(){throw Error('denied')}};
const noRecovery=P.createStore(blocked);
assert.equal(noRecovery.canWrite,false);assert.equal(noRecovery.record(valid(),'blocked:1').ok,false);
const failing={getItem(){return null},setItem(){throw Error('quota')}};
const writeFail=P.createStore(failing);
assert.equal(writeFail.record(valid(),'fail:1').reason,'write_failed');
assert.equal(writeFail.snapshot().matches,0,'never tell UI a failed write succeeded');
assert.equal(P.createStore(null).canWrite,false);
assert.equal(memory.get('rr-options-v06'),undefined,'Quick Play store untouched');
assert.equal(memory.get('rr-custom-v1'),undefined,'Custom Match draft untouched');
console.log('PASS dossier v0.9.39: immutable real result dedupe, per-mode accounting, safe versions/corruption/denied storage, concept-only cosmetic eligibility.');

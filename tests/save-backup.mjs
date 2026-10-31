// Release-readiness: real offline recovery, no cloud I/O or fabricated entitlements.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const w={};vm.runInNewContext(fs.readFileSync('web/dossier.js','utf8'),{window:w});
vm.runInNewContext(fs.readFileSync('web/save-backup.js','utf8'),{window:w});
const B=w.SectorBackup,P=w.SectorDossier;
const storage=(seed={})=>{const entries=new Map(Object.entries(seed));return {
 entries,getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,String(v)),removeItem:k=>entries.delete(k)
}};
const prefs=JSON.stringify({settings:{botCount:2,mapSize:'small'},comfort:{sound:true},playlist:{version:1,enabled:['survival_ffa']}});
const draft=JSON.stringify({version:1,rules:{modeId:'survival_ffa',mapSize:'small'}});
const presets=JSON.stringify({version:1,entries:[{name:'Maze Duel',rules:{modeId:'scored_tdm'}}]});
const profile=P.empty();
profile.matches=2;profile.wins=1;profile.losses=1;profile.kos=3;
const dossier=JSON.stringify(profile);
const original=storage({'rr-options-v06':prefs,'rr-custom-v1':draft,'rr-custom-presets-v1':presets,'rr-dossier-v1':dossier});
const exp=B.makeBackup(original);
assert.equal(exp.ok,true);assert.equal(exp.count,4);
assert.equal(exp.text.includes('rr-dossier-v1'),true);
assert.equal(exp.text.includes('rr-options-v06'),true);
const fresh=storage();
assert.equal(B.previewImport(fresh,exp.text).ok,true);
const imported=B.restore(fresh,exp.text);
assert.equal(imported.ok,true);assert.equal(imported.count,4);
assert.equal(fresh.getItem('rr-dossier-v1'),dossier,'exact raw stats preserved');
assert.equal(fresh.getItem('rr-options-v06'),prefs,'original prefs preserved');
assert.equal(fresh.getItem('rr-custom-presets-v1'),presets);
assert.ok(fresh.getItem(B.RECOVERY_KEY),'snapshot always precedes import');
assert.equal(B.makeBackup(fresh).ok,true);
assert.equal(B.previewImport(fresh,'{bad').ok,false);
assert.equal(B.previewImport(fresh,JSON.stringify({format:B.FORMAT,version:100,entries:{}})).ok,false);
const wrapped=JSON.parse(exp.text);
wrapped.entries['malicious'] = JSON.stringify({evil:true});
assert.equal(B.previewImport(fresh,JSON.stringify(wrapped)).ok,false,'unknown keys rejected');
delete wrapped.entries.malicious;
wrapped.entries['rr-dossier-v1']=JSON.stringify({schemaVersion:9});
assert.equal(B.previewImport(fresh,JSON.stringify(wrapped)).ok,false,'unknown future imported schema rejected');
const newer=storage({'rr-dossier-v1':JSON.stringify({schemaVersion:8,special:'must_preserve'})});
assert.equal(B.previewImport(newer,exp.text).ok,false,'future local save protected from downgrade');
assert.equal(B.restore(newer,exp.text).ok,false);
assert.equal(JSON.parse(newer.getItem('rr-dossier-v1')).schemaVersion,8);
const damaged=storage({'rr-custom-v1':'{broken'});
const beforeDamaged=damaged.getItem('rr-custom-v1');
assert.equal(B.restore(damaged,exp.text).ok,true,'damaged target also preserved in recovery snapshot');
assert.equal(JSON.parse(damaged.getItem(B.RECOVERY_KEY)).entries['rr-custom-v1'],beforeDamaged);
const quota=storage({'rr-options-v06':'old'});
let trigger=true;
const failing={getItem:quota.getItem,removeItem:quota.removeItem,setItem:(key,val)=>{
 if(key==='rr-custom-v1'&&trigger){trigger=false;throw new Error('quota')}
 quota.setItem(key,val);
}};
const fail=B.restore(failing,exp.text);
assert.equal(fail.ok,false);
assert.equal(quota.getItem('rr-options-v06'),'old','partial changes rolled back');
assert.equal(quota.getItem('rr-custom-v1'),null,'absent keys remain absent on rollback');
assert.ok(quota.getItem(B.RECOVERY_KEY),'recovery snapshot preserved even after failure');
const cannotSnapshot=storage({'rr-options-v06':prefs});
const blocked={getItem:cannotSnapshot.getItem,setItem:(k,v)=>{if(k===B.RECOVERY_KEY)throw Error('denied');cannotSnapshot.setItem(k,v)},removeItem:cannotSnapshot.removeItem};
assert.equal(B.restore(blocked,exp.text).ok,false);
assert.equal(cannotSnapshot.getItem('rr-options-v06'),prefs,'never mutate before recovery copy');
assert.equal(B.makeBackup(storage({'rr-dossier-v1':JSON.stringify({schemaVersion:9})})).ok,false,'cannot silently export unknown future data');
const badDossier=JSON.stringify({...profile,matches:1,wins:9});
assert.equal(B.validJson('rr-dossier-v1',badDossier),false,'inconsistent stats not restorable');
const unknownFormat=JSON.stringify({format:'other',version:1,entries:{'rr-options-v06':prefs}});
assert.equal(B.previewImport(fresh,unknownFormat).ok,false);
console.log('PASS v0.9.40 backup: full roundtrip, all four stores, future versions, corruption, restore snapshot, partial-write rollback, denied backup, invalid input.');

const equipped=JSON.stringify({version:1,equipped:'fieldgrid.moss'});
const painted=storage({'rr-options-v06':prefs,'rr-dossier-v1':dossier,'rr-hangar-paint-v1':equipped});
const paintBackup=B.makeBackup(painted);
assert.equal(paintBackup.ok,true,'free offline Hangar appears in backup');
assert.equal(paintBackup.count,3);
const newPhone=storage();
assert.equal(B.restore(newPhone,paintBackup.text).ok,true);
assert.equal(newPhone.getItem('rr-hangar-paint-v1'),equipped,'export/restore preserves selected paint');
for(const invalid of [{version:2,equipped:'fieldgrid.moss'},{version:1,equipped:'fieldgrid.unknown'},{version:1,equipped:'fieldgrid.moss',admin:true}]){
 assert.equal(B.validJson('rr-hangar-paint-v1',JSON.stringify(invalid)),false,'reject invalid cosmetic IDs and unknown keys');
}
const futurePaint=storage({'rr-hangar-paint-v1':JSON.stringify({version:3,equipped:'fieldgrid.moss'})});
assert.equal(B.previewImport(futurePaint,paintBackup.text).ok,false,'future cosmetic schema never overwritten');
console.log('PASS local Hangar backup/restore, unknown IDs and future-version protection.');

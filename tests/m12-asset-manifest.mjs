// M12-A manifest contract; no production asset integrations yet.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const m=JSON.parse(read('docs/M12_ASSET_MANIFEST_2026-11-04.json'));
assert.equal(m.schemaVersion,1);assert.equal(m.stage,'M12-A-baseline');
assert.equal(m.runtimeAssetIntegration,'none');assert.equal(m.allCategoriesOptIn,true);
assert.equal(m.defaultGameArtPreserved,true);
const ids=m.categories.map(x=>x.id);
assert.equal(ids.length,6);assert.equal(new Set(ids).size,ids.length);
assert.deepEqual(ids.slice(0,3),['hangar-background','mode-card-illustration','emblem-study']);
for(const a of m.categories){
 assert.ok(Number.isSafeInteger(a.instances)&&a.instances>0);
 assert.ok(a.dimensions.length===2&&a.dimensions.every(x=>Number.isSafeInteger(x)&&x>0&&x<=2048));
 assert.ok(Number.isSafeInteger(a.maxCompressedBytesPerAsset)&&a.maxCompressedBytesPerAsset>0);
 assert.equal(a.decodedRGBABytesPerAsset,a.dimensions[0]*a.dimensions[1]*4,'memory budget for '+a.id);
 assert.ok(['concept-only','deferred','blocked-on-profiling'].includes(a.runtimeStatus));
}
const js=read('web/game.js'),css=read('web/style.css'),html=read('web/index.html');
for(const f of ['index.html','style.css','game.js'])
 assert.equal(read('web/'+f),read('android/app/src/main/assets/'+f),'asset parity '+f);
for(const name of ['drawHangarUnitPreview','drawTopTank','drawTopMech','drawLobbyPreview','render'])
 assert.ok(js.includes('function '+name+'('),'authentic renderer preserved '+name);
assert.ok(html.includes('id="hangar-unit-preview"'));
assert.ok(css.includes('#menu .hangar-bay[data-hangar-study="warm"]')&&css.includes('#menu .hangar-bay[data-hangar-study="blueprint"]'));
assert.ok(js.includes('const tile=132')&&js.includes('for(const w of wallSet)'),'M12-A does not mutate arena rendering');
for(const id of ["'fieldgrid.standard'","'fieldgrid.moss'","'mark.field'","'mark.vector'"])
 assert.ok(js.includes(id),'real cosmetic ID '+id);
// The first two empty industrial bay studies are review-only SVG source,
// not loaded from a player screen or packaged into the Android app.
for(const variant of ['warm','blueprint']){
 const svg=read('docs/m12-art-studies/hangar-'+variant+'-empty-v1.svg');
 assert.match(svg,/<svg\b[^>]*width="1024"[^>]*height="576"/);
 assert.ok(svg.length<15000,'concept SVG is compact');
 assert.ok(!/<(?:script|text|image|foreignObject)\b/i.test(svg),'empty stage contains no UI, text or embedded image');
 assert.ok(!/\b(?:https?:)?\/\/[^"']+/.test(svg.replace('http://www.w3.org/2000/svg','')),
   'no external image/font/CDN dependencies in asset concept');
}
console.log('M12_ASSET_CONTRACT_PASS '+JSON.stringify({stage:m.stage,categories:ids,
 maxBatchCompressedKiB:Math.round(m.categories.filter(a=>a.priority<=3).reduce((n,a)=>n+a.instances*a.maxCompressedBytesPerAsset,0)/1024)}));

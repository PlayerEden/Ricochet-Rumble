// M12-A manifest contract; no production asset integrations yet.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const m=JSON.parse(read('docs/M12_ASSET_MANIFEST_2026-11-04.json'));
assert.equal(m.schemaVersion,1);assert.equal(m.stage,'M12-F-packaging-and-release-audit');
assert.equal(m.runtimeAssetIntegration,'m12visual-debug-only-android-assets');assert.equal(m.allCategoriesOptIn,true);
assert.equal(m.defaultGameArtPreserved,true);
const ids=m.categories.map(x=>x.id);
assert.equal(ids.length,6);assert.equal(new Set(ids).size,ids.length);
assert.deepEqual(ids.slice(0,3),['hangar-background','mode-card-illustration','emblem-study']);
for(const a of m.categories){
 assert.ok(Number.isSafeInteger(a.instances)&&a.instances>0);
 assert.ok(a.dimensions.length===2&&a.dimensions.every(x=>Number.isSafeInteger(x)&&x>0&&x<=2048));
 assert.ok(Number.isSafeInteger(a.maxCompressedBytesPerAsset)&&a.maxCompressedBytesPerAsset>0);
 assert.equal(a.decodedRGBABytesPerAsset,a.dimensions[0]*a.dimensions[1]*4,'memory budget for '+a.id);
 assert.ok(['concept-only','opt-in-test','deferred','blocked-on-profiling'].includes(a.runtimeStatus));
}
const js=read('web/game.js'),css=read('web/style.css'),html=read('web/index.html');
for(const f of ['index.html','style.css','game.js'])
 assert.equal(read('web/'+f),read('android/app/src/main/assets/'+f),'asset parity '+f);
for(const name of ['drawHangarUnitPreview','drawTopTank','drawTopMech','drawLobbyPreview','render'])
 assert.ok(js.includes('function '+name+'('),'authentic renderer preserved '+name);
assert.ok(html.includes('id="hangar-unit-preview"'));
assert.ok(css.includes('#menu .hangar-bay[data-hangar-study="warm"]')&&css.includes('#menu .hangar-bay[data-hangar-study="blueprint"]'));
assert.ok(js.includes('const tile=132')&&js.includes('for(const w of wallSet)'),'M12-C does not mutate arena rendering');
assert.ok(js.includes('function refreshM12HangarStudy()')&&js.includes('if(!M12_ART_PARAM)'),
 'M12 art is opt-in and has a no-art default');
assert.ok(css.includes('data-m12-art="warm"')&&css.includes('data-m12-art="blueprint"'),
 'both art variants must be scoped to explicit test attribute');
assert.ok(html.includes('data-action="m12-art-next"')&&html.includes('class="m12-art-cycle"')&&html.includes(' hidden>ART: WARM'),
 'test-only cycling control absent or visible by default');
assert.ok(read('android/app/build.gradle').includes("applicationIdSuffix '.m12visual'"),
 'isolated test identity must never replace an owner or hybrid build');
assert.ok(read('android/app/build.gradle').includes("assets.srcDir 'src/m12Visual/assets'") &&
 read('android/app/build.gradle').includes("if (m12VisualLabPackage == 'true')"),
 'only dedicated test package may include M12 SVG assets');
assert.equal(fs.existsSync(new URL('../android/app/src/main/assets/assets/m12',import.meta.url)),false,
 'regular Android assets must contain zero M12 studies');
assert.ok(read('android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java').includes('m13Preview=1'),
 'dedicated test app should enable its own opt-in visual URL');
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
 for(const path of ['web/assets/m12/hangar-'+variant+'-empty-v1.svg',
  'android/app/src/m12Visual/assets/assets/m12/hangar-'+variant+'-empty-v1.svg'])
  assert.equal(read(path),svg,'Web/Android visual art must be exact original source: '+path);
}

for(const name of ['cqc','ffa','tdm','custom','ctf','forward-bays']){
 const doc=read('docs/m12-art-studies/mode-'+name+'-study-v1.svg');
 assert.match(doc,/<svg\b[^>]*width="512"[^>]*height="288"/);
 assert.ok(doc.length<76800&&doc.length>800,'compact original vector');
 assert.ok(!/<(?:script|text|image|foreignObject)\b/i.test(doc),'no baked UI, actors or code');
 assert.ok(!/https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(doc),'no remote dependency');
 for(const p of ['web/assets/m12/','android/app/src/m12Visual/assets/assets/m12/'])
  assert.equal(read(p+'mode-'+name+'-study-v1.svg'),doc,'mirrored offline mode art '+name);
 assert.ok(css.includes('mode-'+name+'-study-v1.svg'),'visual study CSS referenced '+name);
}
for(const name of ['field','vector','ace','command']){
 const svg=read('docs/m12-art-studies/insignia-'+name+'-study-v1.svg');
 assert.match(svg,/<svg\b[^>]*width="96"[^>]*height="96"/);
 assert.ok(svg.length<5120);
 assert.ok(!/<(?:script|text|image|foreignObject)\b/i.test(svg));
 assert.ok(html.includes('id="sr-mark-'+name+'"'),'existing insignia remains canonical');
 for(const prefix of ['web/assets/m12/','android/app/src/m12Visual/assets/assets/m12/'])
  assert.equal(read(prefix+'insignia-'+name+'-study-v1.svg'),svg,'insignia mirror '+name);
 assert.ok(css.includes('insignia-'+name+'-study-v1.svg'),'study CSS references '+name);
}
assert.ok(js.includes("if(!M12_ART_PARAM){screen.removeAttribute('data-m12-mode-art')"),'default mode art must fail closed');
assert.ok(js.includes("m12ModeStudyEnabled=!m12ModeStudyEnabled")&&js.includes('function refreshM12ModeStudy()'),
 'test-only on/off comparison should be user-controlled');
assert.ok(html.includes('data-action="m12-mode-art-next"')&&html.includes('hidden>ART: STUDY'), 'art toggle must start hidden');
assert.ok(css.includes('.mode-screen[data-m12-mode-art="on"]'),'art selectors must require opt-in');
assert.ok(js.includes('function refreshM12InsigniaStudy()')&&js.includes('m12InsigniaStudyEnabled=!m12InsigniaStudyEnabled'),
 'insignia art must toggle only in isolated visual review');
assert.ok(css.includes('.hangar-screen[data-m12-insignia-art="on"]'),'insignia CSS must require opt-in');
assert.ok(html.includes('data-action="m12-insignia-art-next"')&&html.includes('hidden>BADGES: STUDY'),
 'default badge button must be hidden');

console.log('M12_ASSET_CONTRACT_PASS '+JSON.stringify({stage:m.stage,categories:ids,
 maxBatchCompressedKiB:Math.round(m.categories.filter(a=>a.priority<=3).reduce((n,a)=>n+a.instances*a.maxCompressedBytesPerAsset,0)/1024)}));

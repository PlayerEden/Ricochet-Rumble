// FIELDGRID concept roster consistency checks.
// Intentionally Node built-ins only: no npm, browser, game state or billing dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
const roster=JSON.parse(load('game-data/cosmetics/pilot_icons.v1.json'));
const markdown=load('docs/design/11_PILOT_ROSTER_LAUNCH.md');
const related=[
 'docs/design/README.md',
 'docs/design/00_FIELDGRID_VISUAL_SYSTEM.md',
 'docs/design/10_PILOT_ICON_BIBLE.md',
 'docs/design/11_PILOT_ROSTER_LAUNCH.md',
 'docs/design/12_COSMETIC_EXTENSION_BIBLE.md',
 'docs/design/90_DESIGN_BIBLE_TEMPLATE.md',
 'docs/design/CHANGELOG.md'
];
for(const p of related)assert.ok(load(p).length>200,p+' should be substantive');
assert.equal(roster.schemaVersion,1);
assert.equal(roster.implementationStatus,'concept_only');
assert.equal(roster.authorizedForRuntime,false,'draft catalog must never be treated as live entitlements');
assert.equal(roster.cosmetics.length,18);
assert.deepEqual(roster.launchTargets,{starter:5,earned:3,premium:10});
const found={starter:0,earned:0,premium:0};
const ids=new Set(),names=new Set();
const prefixes={starter:'pilot.st.',earned:'pilot.er.',premium:'pilot.pr.'};
for(const item of roster.cosmetics){
 assert.ok(Object.hasOwn(found,item.category),'unknown tier '+item.category);
 found[item.category]++;
 assert.match(item.id,/^pilot\.(st|er|pr)\.\d{3}$/);
 assert.ok(item.id.startsWith(prefixes[item.category]),'wrong tier ID: '+item.id);
 assert.ok(!ids.has(item.id),'duplicate ID '+item.id);ids.add(item.id);
 assert.ok(!names.has(item.displayName.toLowerCase()),'duplicate name '+item.displayName);
 names.add(item.displayName.toLowerCase());
 assert.ok(markdown.includes(String.fromCharCode(96)+item.id+String.fromCharCode(96)),item.id+' missing from roster document');
 assert.ok(markdown.includes('**'+item.displayName+'**')||markdown.includes('| '+item.displayName+' |'),item.displayName+' missing from roster');
 assert.ok(item.design.silhouette.length>=20,'insufficient silhouette direction '+item.id);
 assert.equal(item.design.crop,'fixed-bust-3q-right');
 assert.equal(item.design.lighting,'upper-left-3-value');
 assert.ok(Array.isArray(item.gameplayModifiers)&&item.gameplayModifiers.length===0,'cosmetics are non-pay-to-win');
 assert.equal(item.selectable,false,'not approved for game UI yet');
 assert.equal(item.purchasable,false,'not authorized as an offer yet');
 assert.equal(item.billingProductId,null,'no invented SKU');
 assert.ok(['not_created','style_review'].includes(item.art.status),'only missing or review-stage art allowed in this archive');
 assert.equal(item.art.approvedExportPath,null,'no unapproved export can be advertised');
 if(item.art.status==='style_review'){
  assert.equal(typeof item.art.sourcePath,'string');
  const master=load(item.art.sourcePath);
  assert.ok(master.startsWith('<svg')&&master.includes('viewBox="0 0 512 512"'),'prototype must be a 512-square editable SVG');
  assert.ok(!master.includes('<text')&&!master.includes('foreignObject'),'no AI-esque tiny text or remote HTML in artwork');
 }else assert.equal(item.art.sourcePath,null);
 if(item.category==='starter')assert.equal(item.acquisition.type,'free_immediate');
 if(item.category==='earned'){
  assert.equal(item.acquisition.type,'earned_stat');
  assert.ok(Number.isInteger(item.acquisition.threshold)&&item.acquisition.threshold>0);
  assert.equal(item.acquisition.ruleStatus,'proposal');
 }
 if(item.category==='premium'){
  assert.equal(item.acquisition.type,'planned_direct_purchase');
  assert.equal(item.acquisition.fulfillment,'permanent_non_consumable');
  assert.equal(item.acquisition.skuStatus,'not_registered');
 }
}
assert.deepEqual(found,roster.launchTargets);
assert.deepEqual(roster.portraitSpecification.exportPx,[256,128,64]);
assert.deepEqual(roster.portraitSpecification.actualUiTestPx,[48,32]);
assert.ok(load('docs/design/10_PILOT_ICON_BIBLE.md').includes('32'), 'small-size icon legibility belongs in Bible');
console.log('PASS FIELDGRID design archive: '+roster.cosmetics.length+' conceptual icons ('+found.starter+' free / '+found.earned+' earned / '+found.premium+' planned premium), 7 linked design documents; zero live products or art represented.');

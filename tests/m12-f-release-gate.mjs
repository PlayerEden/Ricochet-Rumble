// M12-F fail-closed scope and packaging audit. Audit passing != release approval.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const m=JSON.parse(fs.readFileSync('docs/M12_ASSET_MANIFEST_2026-11-04.json','utf8'));
const base=m.baselineCommit,head=git('rev-parse','HEAD');
assert.match(base,/^[a-f0-9]{40}$/);
assert.match(head,/^[a-f0-9]{40}$/);
if(process.env.M12_EXPECTED_PR_BASE)
 assert.equal(process.env.M12_EXPECTED_PR_BASE,base,
 'Mainline PR base changed, manual review/rebase required');
git('cat-file','-e',base+'^{commit}');
assert.equal(git('merge-base',base,head),base,'Pinned original main must be ancestor');
assert.equal(git('diff','--check',base,head),'','Patch has whitespace errors');
const diff=git('diff','--name-status',base,head).split('\n').filter(Boolean)
 .map(x=>{const parts=x.split('\t');return {status:parts[0],file:parts.at(-1)}});
const mainAllowed=new Set([
 'web/index.html','web/game.js','web/style.css',
 'android/app/src/main/assets/index.html',
 'android/app/src/main/assets/game.js',
 'android/app/src/main/assets/style.css',
 'android/app/build.gradle',
 'android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java'
]);
const safeFile=p=>mainAllowed.has(p)||
 /^\.github\/workflows\/m12-[a-z0-9.-]+\.yml$/.test(p)||
 /^docs\/M12_[A-Za-z0-9_.-]+$/.test(p)||
 /^docs\/m12-art-studies\/[a-z0-9-]+\.svg$/.test(p)||
 /^tests\/m12-[a-z0-9-]+\.mjs$/.test(p)||
 /^web\/assets\/m12\/[a-z0-9-]+\.svg$/.test(p)||
 /^android\/app\/src\/m12Visual\/assets\/assets\/m12\/[a-z0-9-]+\.svg$/.test(p);
assert.deepEqual(diff.filter(x=>!safeFile(x.file)),[],
 'M12 unexpectedly changed protected gameplay, LAN, save or signing source');
const protectedPaths=[
 'web/save-backup.js','web/dossier.js','web/scored-match.js','web/forward-bays.js',
 'web/ctf-rules.js','web/ctf-ai.js','web/lan-room.js','web/lan-series.js',
 'android/app/src/main/AndroidManifest.xml'
];
for(const file of protectedPaths){
 const current=fs.readFileSync(file,'utf8').trimEnd();
 assert.equal(current,git('show',base+':'+file),
  'Protected baseline file was changed: '+file);
}
for(const file of ['index.html','style.css','game.js'])
 assert.equal(fs.readFileSync('web/'+file,'utf8'),
  fs.readFileSync('android/app/src/main/assets/'+file,'utf8'),
  'Ordinary game Web and Android source drift: '+file);
const gradle=fs.readFileSync('android/app/build.gradle','utf8');
assert.ok(gradle.includes("applicationId 'com.playereden.ricochetrumble'"),
 'Canonical Android package ID drift');
assert.ok(gradle.includes('sourceSets {')&&gradle.includes('debug {')&&
 gradle.includes("if (m12VisualLabPackage == 'true')")&&
 gradle.includes("assets.srcDir 'src/m12Visual/assets'"),
 'M12 offline study artwork must only package in dedicated debug app');
assert.ok(!fs.existsSync('android/app/src/main/assets/assets/m12'),
 'Default Android sourceSet still includes experimental M12 art');
const dir='android/app/src/m12Visual/assets/assets/m12';
const names=[
 'hangar-warm-empty-v1.svg','hangar-blueprint-empty-v1.svg',
 ...['cqc','ffa','tdm','custom','ctf','forward-bays'].map(x=>'mode-'+x+'-study-v1.svg'),
 ...['field','vector','ace','command'].map(x=>'insignia-'+x+'-study-v1.svg')
].sort();
assert.deepEqual(fs.readdirSync(dir).sort(),names,'Missing/unplanned isolated SVG assets');
for(const name of names)
 assert.deepEqual(fs.readFileSync(dir+'/'+name),fs.readFileSync('web/assets/m12/'+name),
  'Test-only Android/Web asset mismatch '+name);
const activity=fs.readFileSync(
 'android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java','utf8');
assert.ok(activity.includes('getPackageName().endsWith(".m12visual")')&&
 activity.includes('index.html?hybridMenu=1&m13Preview=1')&&
 activity.includes('file:///android_asset/index.html";'),
 'Original Android launch path must remain preserved');
assert.ok(fs.readFileSync('web/game.js','utf8').includes("const M13_PROMOTION_PREVIEW="),
 'M13 art preview must not silently become the default');
const report={
 result:'SCOPE_PASS_RELEASE_BLOCKED',baselineSha:base,checkedHeadSha:head,
 changedFiles:diff.length,diff,protectedBaselineFiles:protectedPaths,
 canonicalAppId:'com.playereden.ricochetrumble',
 labAppId:'com.playereden.ricochetrumble.m12visual',
 debugOnlyAssets:names.length,ordinaryMainAssetsM12:false,
 sourceScopePass:true,releaseApproved:false,
 prohibitedOptimization:'floor tile cache experiment remains test-only',
 physicalAndroidQa:'NOT_VERIFIED',twoPhoneLanQa:'NOT_VERIFIED',
 signerUpgradeCompatibility:'NOT_VERIFIED',ownerApproval:'PENDING',
 note:'Scope and code-source safety is not evidence of Play readiness.'
};
fs.mkdirSync('qa-results/m12/release-gate',{recursive:true});
fs.writeFileSync('qa-results/m12/release-gate/source-scope-audit.json',
 JSON.stringify(report,null,2)+'\n');
console.log('M12_F_SOURCE_SCOPE_PASS '+JSON.stringify({
 base,head,changed:diff.length,protected:protectedPaths.length,
 isolatedArt:names.length,releaseApproved:false
}));

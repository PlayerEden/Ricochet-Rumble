// Sector Rebound: read-only Play Store readiness inventory.
// This is NOT a Play policy certification and never signs, uploads or releases.
// In review mode, expected NO_GO is not a CI failure. --require-ready blocks release.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(),has=p=>fs.existsSync(path.join(root,p));
const read=p=>has(p)?fs.readFileSync(path.join(root,p),'utf8'):'';
const gradle=read('android/app/build.gradle');
const manifest=read('android/app/src/main/AndroidManifest.xml');
const activity=read('android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java');
const html=read('web/index.html');
const workflow=read('.github/workflows/build-apk.yml');
const checks=[];
function add(id,kind,ok,detail,action=''){
 checks.push({id,kind,status:ok?'PASS':'PENDING',detail,action:ok?'':action});
}
function png(file){
 if(!has(file))return null;
 const b=fs.readFileSync(path.join(root,file));
 if(b.length<26||b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')return null;
 return {width:b.readUInt32BE(16),height:b.readUInt32BE(20),bitDepth:b[24],colorType:b[25],size:b.length};
}
const storeIcon=png('store-listing/play-icon.png');
const feature=png('store-listing/feature-graphic.png');
const screenshotsDir=path.join(root,'store-listing/screenshots');
const screenshotFiles=fs.existsSync(screenshotsDir)?fs.readdirSync(screenshotsDir).filter(n=>/\.png$/i.test(n)):[];
const validScreens=screenshotFiles.filter(n=>{const x=png('store-listing/screenshots/'+n);return x&&x.width>=320&&x.height>=320;});
const permissions=[...manifest.matchAll(/<uses-permission\s+android:name="([^"]+)"/g)].map(m=>m[1]);
const expectedPermissions=['android.permission.INTERNET','android.permission.ACCESS_NETWORK_STATE','android.permission.ACCESS_WIFI_STATE'];
add('target_api_36','automatic',/\btargetSdk\s+36\b/.test(gradle)&&/\bcompileSdk\s+36\b/.test(gradle),
 'Build targets and compiles against API 36, the required Google Play phone target effective August 31, 2026.',
 'Update and retest Android API level before release.');
add('prod_id_isolated_preview','automatic',
 /applicationId 'com\.playereden\.ricochetrumble'/.test(gradle)&&/applicationIdSuffix '\.preview'/.test(gradle)&&/Preview versions require isolated \.preview app identity/.test(gradle),
 'Production app ID remains separate from the disposable preview package.',
 'Fix app ID and preview identity isolation.');
add('android_webview_privacy_baseline','automatic',
 manifest.includes('android:allowBackup="false"')&&manifest.includes('android:usesCleartextTraffic="false"')&&activity.includes('setBlockNetworkLoads(true)')&&activity.includes('setAllowUniversalAccessFromFileURLs(false)'),
 'Android disables system backup and cleartext app traffic; the bundled WebView blocks network loads and universal local-file access.',
 'Audit data persistence and WebView security configuration.');
add('permission_scope','automatic',
 permissions.length===expectedPermissions.length&&permissions.every(n=>expectedPermissions.includes(n)),
 'Current manifest permissions: '+permissions.join(', ')+'. No location, microphone, camera or ad ID permission declared.',
 'Review each added Android permission before releasing.');
add('source_asset_parity','automatic',
 ['game.js','index.html','style.css','scored-match.js','dossier.js','save-backup.js'].every(n=>has('web/'+n)&&has('android/app/src/main/assets/'+n)&&fs.readFileSync(path.join(root,'web',n)).equals(fs.readFileSync(path.join(root,'android/app/src/main/assets',n)))),
 'Web and packaged Android game assets are byte-for-byte identical.',
 'Restore source/Android WebView parity.');
add('release_aab_workflow','automatic',
 workflow.includes(':app:bundleRelease')&&gradle.includes("SR_UPLOAD_STORE_FILE")&&gradle.includes('Incomplete external upload signing configuration')&&gradle.includes('signingConfigs.releaseUpload'),
 'AAB build task and externally supplied, fail-closed upload signing are configured. Does NOT prove a signed bundle exists.',
 'Add a release AAB workflow with external upload signing.');
add('store_icon_512','store_asset',
 !!storeIcon&&storeIcon.width===512&&storeIcon.height===512&&storeIcon.bitDepth===8&&storeIcon.colorType===6&&storeIcon.size<=1024*1024,
 'Google Play listing icon must be a 512x512 32-bit PNG <=1024KB.'+(storeIcon?' Found '+JSON.stringify(storeIcon):' Missing store-listing/play-icon.png.'),
 'Export approved Version A art into a 512x512 RGBA PNG at store-listing/play-icon.png.');
add('feature_graphic_1024x500','store_asset',
 !!feature&&feature.width===1024&&feature.height===500&&feature.bitDepth===8&&feature.colorType===2,
 'Store feature graphic must be 1024x500 24-bit PNG (no transparency).'+(feature?' Found '+JSON.stringify(feature):' Missing.'),
 'Prepare owner-approved 1024x500 PNG at store-listing/feature-graphic.png.');
add('store_screenshots','store_asset',
 validScreens.length>=2,'Authentic in-game screenshots: '+validScreens.length+' tracked PNGs (at least two required).',
 'Capture and approve real in-game landscape screenshots under store-listing/screenshots/.');
const privacyUrl=read('store-listing/privacy-policy-url.txt').trim();
add('public_privacy_policy_url','policy',
 /^https:\/\/[^\s/]+\.[^\s/]+\/\S*$/.test(privacyUrl),
 'Google Play requires a public privacy policy URL; HTTPS URL file '+(privacyUrl?'present':'missing')+'. Availability/content MUST be manually checked even if present.',
 'Host an app-specific privacy policy accessible worldwide; record its HTTPS URL in store-listing/privacy-policy-url.txt.');
const listingData=(()=>{try{return JSON.parse(read('store-listing/metadata.en-US.json'))}catch(_){return null}})();
add('store_listing_draft_valid','automatic',
 !!listingData&&listingData.title==='Sector Rebound'&&listingData.title.length<=30&&listingData.shortDescription?.length<=80&&listingData.fullDescription?.length<=4000&&listingData.fullDescription?.length>=300&&listingData.approval==='DRAFT_NOT_FOR_PLAY',
 'English listing fields meet store limits and remain marked for owner review.',
 'Add accurate draft listing metadata and confirm limits.');
const page=read('store-listing/privacy-policy.html');
add('staged_privacy_policy_html','automatic',
 page.includes('<title>Sector Rebound')&&page.includes('Nearby Wi-Fi play')&&page.includes('Retention and deletion')&&page.includes('[[PUBLIC_CONTACT_REQUIRED]]'),
 'Self-contained, source-backed policy HTML draft staged with deliberately unfilled contact.',
 'Create an app-specific static policy draft; do not publish placeholders.');
add('privacy_in_app','policy',
 /PRIVACY POLICY/i.test(html),"App's HTML "+(/PRIVACY POLICY/i.test(html)?'includes':'does not include')+' a privacy policy entry or text.',
 'Provide accessible in-game privacy text or an in-app link to the policy before publishing.');
const manual=[
 ['data_safety_review','Play Console data-safety disclosures verified against actual APK, SDKs and LAN data flows'],
 ['signed_production_aab','Production package signed with private Play upload key; separately verified package and certificate'],
 ['physical_save_upgrade','Owner confirmed on-device update without uninstall and retention of Dossier, Hangar and settings'],
 ['two_phone_lan_or_scope','Real Wi-Fi two-phone test passed OR owner explicitly removed LAN from launch scope'],
 ['play_console_setup','Google Play account, content declarations, availability and testing-track eligibility complete'],
 ['owner_release_signoff','Owner reviewed release candidate and approved promotion from draft integration branch']
];
for(const [id,detail] of manual)add(id,'manual',false,detail,'Record genuine evidence and owner approval; never infer from automated tests.');
const blocking=checks.filter(c=>c.status!=='PASS');
const result={project:'Sector Rebound',type:'source-backed preliminary release preflight',releaseVerdict:blocking.length?'RELEASE_NO_GO':'RELEASE_REVIEW_REQUIRED',summary:{pass:checks.length-blocking.length,pending:blocking.length,total:checks.length},checks,limitations:[
 'Manual gates never pass automatically; release requires verified evidence outside this repository.',
 'This script does not verify Google Play policy approval, signed APK/AAB authenticity, a real Android install, or LAN hardware behavior.',
 'Android 17/API 37 has new local network permissions; current API 36 should not request ACCESS_LOCAL_NETWORK.'
]};
const arg=process.argv.find(x=>x.startsWith('--output='));
if(arg){const out=path.resolve(root,arg.slice(9));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n')}
console.log('PLAY_RELEASE_PREFLIGHT '+result.releaseVerdict+' '+result.summary.pass+' PASS / '+result.summary.pending+' PENDING; no Play submission authorized');
for(const x of blocking)console.log('  PENDING '+x.id+': '+x.action);
if(process.argv.includes('--json'))console.log(JSON.stringify(result));
if(process.argv.includes('--require-ready')&&blocking.length)process.exitCode=2;

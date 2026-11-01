// Guard the owner-approved Version A adaptive launcher art and app identity.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const base='android/app/src/main/res/';
const manifest=readFileSync('android/app/src/main/AndroidManifest.xml','utf8');
assert.match(manifest,/android:icon="@mipmap\/ic_launcher"/);
assert.match(manifest,/android:roundIcon="@mipmap\/ic_launcher_round"/);
assert.match(manifest,/android:label="Sector Rebound"/);
const icon=readFileSync(base+'drawable-nodpi/ic_launcher_foreground.webp');
assert.equal(icon.subarray(0,4).toString('ascii'),'RIFF');
assert.equal(icon.subarray(8,12).toString('ascii'),'WEBP');
assert.equal(createHash('sha256').update(icon).digest('hex'),'3467962178347f9043a5c1983485f4962f041aa49962cf0970ee14767491d1f7');
for(const name of ['ic_launcher','ic_launcher_round']){
 const xml=readFileSync(base+'mipmap-anydpi-v26/'+name+'.xml','utf8');
 assert.match(xml,/<adaptive-icon\b/);
 assert.match(xml,/@drawable\/ic_launcher_foreground/);
 assert.match(xml,/@drawable\/ic_launcher_monochrome/);
 assert.match(xml,/@color\/sector_launcher_background/);
}
assert(existsSync(base+'drawable-nodpi/ic_launcher.png'),'Preserve old icon as rollback');
console.log('LAUNCHER_ICON_A_CONTRACT_PASS');

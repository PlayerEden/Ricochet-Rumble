// Shared M11 packaging gate: fail closed if the Android APK contains the
// placeholder Canvas-fallback file or stale/nonmatching Pixi source bytes.
// Usage: node tools/verify-hybrid-menu-bundle.mjs [--apk=...]
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const web='web/hybrid-menu-pixi.bundle.js';
const android='android/app/src/main/assets/hybrid-menu-pixi.bundle.js';
const read=x=>fs.readFileSync(x);
const validate=(buffer,where)=>{
 assert.ok(buffer.byteLength>150000,where+' must be a compiled Pixi v8 bundle, not a placeholder');
 assert.ok(buffer.includes(Buffer.from('SR_HYBRID_PIXI_V1')),where+' missing expected app marker');
 assert.ok(!buffer.includes(Buffer.from("build:'placeholder'")),where+' contains fallback stub');
 return crypto.createHash('sha256').update(buffer).digest('hex');
};
const webBytes=read(web),androidBytes=read(android);
const expected=validate(webBytes,web);
assert.equal(validate(androidBytes,android),expected,'Android bundle must match web bundle exactly');
const arg=process.argv.slice(2).find(x=>x.startsWith('--apk='));
if(arg){
 const name=arg.slice(6);
 assert.ok(name && fs.statSync(name).size>0,'APK must exist');
 const packaged=execFileSync('unzip',['-p',name,'assets/hybrid-menu-pixi.bundle.js'],{maxBuffer:5_000_000});
 assert.equal(validate(packaged,name),expected,'APK included different Pixi bundle');
}
console.log('SR_HYBRID_PACKAGING_PASS bytes='+webBytes.length+' sha256='+expected+(arg?' APK=EXACT':''));

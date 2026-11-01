// Pure safeguards for artifact verification; no APK, phone or private signing materials.
import assert from 'node:assert/strict';
import { zipEntries, assertAssetEntries, verifyIdentity, OFFLINE_ASSETS } from '../tools/attest-android-ci-package.mjs';
import { PACKAGE_ID } from '../tools/android-update-preflight.mjs';
const assets = prefix => OFFLINE_ASSETS.map(x=>prefix+x);
assert.equal(OFFLINE_ASSETS.length,6);
assert.equal(zipEntries('assets/game.js\nother/file\n').length,2);
assert.throws(()=>zipEntries(''),/EMPTY_ZIP_FILE_LIST/);
assert.equal(assertAssetEntries(assets('assets/'),'assets/'),true);
assert.equal(assertAssetEntries(assets('base/assets/'),'base/assets/'),true);
assert.throws(()=>assertAssetEntries(assets('assets/').slice(1),'assets/'),/Missing or duplicate/);
assert.throws(()=>assertAssetEntries([...assets('assets/'),'assets/game.js'],'assets/'),/Missing or duplicate/);
const meta={packageId:PACKAGE_ID,versionCode:50,versionName:'0.9.54-lan-timeout-test'};
verifyIdentity(meta,50,meta.versionName,'f'.repeat(64));
assert.throws(()=>verifyIdentity({...meta,packageId:'bad.package'},50,meta.versionName,'f'.repeat(64)));
assert.throws(()=>verifyIdentity({...meta,versionCode:49},50,meta.versionName,'f'.repeat(64)));
assert.throws(()=>verifyIdentity({...meta,versionName:'bad'},50,meta.versionName,'f'.repeat(64)));
assert.throws(()=>verifyIdentity(meta,50,meta.versionName,'unknown'));
console.log('PASS CI package attestation fail-closed metadata, signer digest, asset completeness and duplication.');

// Release-gated source validation for Google Play metadata and privacy webpage.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const metadata=JSON.parse(fs.readFileSync('store-listing/metadata.en-US.json','utf8'));
assert.equal(metadata.locale,'en-US');
assert.equal(metadata.title,'Sector Rebound');
assert.ok(metadata.title.length<=30);
assert.ok(metadata.shortDescription.length<=80&&metadata.shortDescription.length>=15);
assert.ok(metadata.fullDescription.length<=4000&&metadata.fullDescription.length>=300);
assert.ok(metadata.fullDescription.includes('Survival'));
assert.ok(metadata.fullDescription.includes('Close Quarters'));
for(const claim of [/online ranked/i,/global matchmaking/i,/cross-platform/i,/unlimited multiplayer/i]){
 assert.equal(claim.test(metadata.fullDescription),false,'unsupported promotional claim: '+claim);
}
const html=fs.readFileSync('store-listing/privacy-policy.html','utf8');
for(const phrase of ['Privacy Policy','Local game data','Nearby Wi-Fi play','Retention and deletion','Privacy inquiries','User-controlled backup','Security'])
 assert.ok(html.includes(phrase),'policy missing section '+phrase);
assert.ok(html.includes('[[PUBLISHER_NAME_REQUIRED]]'),'must not silently invent publisher');
assert.ok(html.includes('[[PUBLIC_CONTACT_REQUIRED]]'),'must not silently invent contact');
assert.ok(/noindex,nofollow/.test(html),'draft must stay non-indexable');
assert.ok(!/<script\b/i.test(html),'static policy must not run scripts');
assert.ok(!/<iframe\b/i.test(html),'static policy must not embed trackers');
const strict=process.argv.includes('--publish');
if(strict){
 assert.ok(!html.includes('[['),'publisher/contact placeholders block publication');
 assert.ok(!html.includes('Unpublished draft'),'draft notice blocks publication');
 assert.ok(!/noindex,nofollow/.test(html),'production must not have draft robots meta');
}
console.log('PLAY_STORE_COPY_POLICY_DRAFT_PASS title='+metadata.title.length+' short='+metadata.shortDescription.length+' full='+metadata.fullDescription.length+' draft-not-published');

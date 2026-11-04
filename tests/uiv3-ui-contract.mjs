// UIV3 menu safety contract: no external dependencies, run by tests/smoke.mjs.
// Checks exact Web/Android asset parity and the preservation of touch-first
// controls, all real mode IDs, protected save fields, and silent/reduced-motion UI.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const pairs=['index.html','game.js','style.css'];
for(const file of pairs){
 assert.equal(read('web/'+file),read('android/app/src/main/assets/'+file),
  file+' must be byte-identical in browser and packaged WebView');
}
const html=read('web/index.html'),js=read('web/game.js'),css=read('web/style.css');
const custom=html.match(/<template id="custom-template">([\s\S]*?)<\/template>/)?.[1];
assert.ok(custom,'Custom Match template is bundled');
const essentials=custom.match(/<div class="custom-grid">([\s\S]*?)<\/div>/)?.[1];
const advanced=custom.match(/<details class="custom-advanced">([\s\S]*?)<\/details>/)?.[1];
assert.ok(essentials&&advanced,'Custom separates essentials from optional advanced rules');
for(const id of ['custom-mode','custom-size','custom-bots','custom-skill']){
 assert.ok(essentials.includes('id="'+id+'"'),'essential real selector missing: '+id);
}
for(const id of ['custom-lives','custom-shells','custom-friendly','custom-side']){
 assert.ok(advanced.includes('id="'+id+'"'),'advanced real selector missing: '+id);
}
assert.ok(custom.includes('class="custom-actions"')&&
 custom.includes('data-action="custom-play"')&&custom.includes('data-action="custom-back"'),
 'Custom retains pinned Start/Back controls');
assert.ok(custom.includes('custom-preset-save')&&custom.includes('custom-preset-load')&&
 custom.includes('custom-preset-delete')&&custom.includes('custom-preset-name'),
 'Custom presets remain saved and editable on-device');
for(const action of ['solo','settings','nearby','modes','cqc','scored_ffa','scored_tdm',
 'practice','daily','forwardbay','ctf','hangar','dossier','help']){
 assert.ok(html.includes('data-action="'+action+'"'),'mode/navigation missing: '+action);
}
assert.ok(html.includes('Drag FIRE to aim; release to shoot.'),
 'Help must preserve approved aim-and-release instructions');
assert.ok(html.includes('class="privacy-more"'),'privacy disclosure remains available');
for(const id of ['aa-outcome','aa-kos','aa-deaths','aa-duration','aa-lives',
 'quick-rematch','results-menu','custom-edit','lan-edit-rules']){
 assert.ok(html.includes('id="'+id+'"'),'real After Action field/action missing: '+id);
}
assert.ok(js.includes("function pausePanelHTML(")&&
 js.includes('data-action="resume"')&&js.includes('data-action="restart"')&&
 js.includes('data-action="close"')&&js.includes("mode==='guest'"),
 'Pause keeps real solo, host and guest actions');
assert.ok(js.includes("menu.addEventListener('change'")&&
 js.includes("audioCue('ui-select')")&&js.includes("if(!comfort.sound)return false;"),
 'menu feedback must use the existing SOUND FX gate');
assert.ok(css.includes('#menu .mode-screen{animation:none;transform:none}'),
 'Mode buttons must not move while the player taps');
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)')&&
 css.includes('animation:none!important'),
 'reduced motion must disable UI reveal animation');
console.log('UIV3_UI_CONTRACT_PASS — real controls, save UI, accessibility, audio and native parity');

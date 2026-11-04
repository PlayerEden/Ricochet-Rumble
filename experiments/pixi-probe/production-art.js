// COPIED from the production Sector Rebound main game.js 2026-11-03 art contract.
// Identical original unit paths and material presets. Derived only for isolated
// renderer fidelity tests: prerender sprites once, then reuse in BOTH renderers.
const PILOT_MUZZLE_X=28,PILOT_MUZZLE_Y=2;
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
const FIELDGRID_UNIT_SKINS=Object.freeze({
 'fieldgrid.standard':{
  pilot:{armor:'#607a85',shadow:'#294650',light:'#9fb7bc',trim:'#78949b'},
  tank:{armor:null,shadow:'#193845',light:'#bfe3e6',trim:null},
  mech:{armor:null,shadow:'#243d55',light:'#e5e5ff',trim:null}},
 'fieldgrid.moss':{
  pilot:{armor:'#71866f',shadow:'#354b3f',light:'#b5c6a0',trim:'#98ad7c'},
  tank:{armor:'#759376',shadow:'#354e42',light:'#c6d9ad',trim:'#93b58f'},
  mech:{armor:'#779480',shadow:'#3a5145',light:'#c2d3ae',trim:'#93ae96'}},
 'fieldgrid.dune':{
  pilot:{armor:'#b49c74',shadow:'#5e5142',light:'#ead8aa',trim:'#d2b788'},
  tank:{armor:'#c0a675',shadow:'#5c4f40',light:'#f0dfb0',trim:'#d5be89'},
  mech:{armor:'#b6a27f',shadow:'#615548',light:'#f0e0bd',trim:'#d3c398'}},
 'fieldgrid.oxide':{
  pilot:{armor:'#9e6858',shadow:'#512f31',light:'#d9a18c',trim:'#bf795f'},
  tank:{armor:'#a66d5b',shadow:'#573637',light:'#e5b5a2',trim:'#c4836f'},
  mech:{armor:'#a46c64',shadow:'#573940',light:'#dfaaa1',trim:'#be8479'}},
 'fieldgrid.vanguard':{
  pilot:{armor:'#648f9d',shadow:'#253f4d',light:'#a5cbd1',trim:'#80b5bd'},
  tank:{armor:'#5d8899',shadow:'#254454',light:'#afd5db',trim:'#78aebe'},
  mech:{armor:'#688c9d',shadow:'#2b4359',light:'#b9d4e1',trim:'#80acbb'}},
 'fieldgrid.veteran':{
  pilot:{armor:'#9e9070',shadow:'#514a3b',light:'#dbcaa0',trim:'#d1b873'},
  tank:{armor:'#9a8b67',shadow:'#4b4639',light:'#e0d5ac',trim:'#c0a468'},
  mech:{armor:'#a09470',shadow:'#534a3d',light:'#dfd1a6',trim:'#c4af77'}}
});
function resolveUnitMaterials(unit,teamPaint,skinId='fieldgrid.standard'){
 const preset=FIELDGRID_UNIT_SKINS[skinId]||FIELDGRID_UNIT_SKINS['fieldgrid.standard'];
 const role=preset[unit]||preset.pilot;
 return {armor:role.armor||teamPaint,shadow:role.shadow,light:role.light,
         trim:role.trim||teamPaint,team:teamPaint};
}

function drawTopTank(c,paint,parked=false,trackLeft=0,trackRight=0,recoil=0,suspension=0,skinId='fieldgrid.standard'){
 const skin=resolveUnitMaterials('tank',paint,skinId);
 // Art contract v0.9.6: vehicle local +X is FORWARD (toward the barrel).
 // Tracks run parallel to +X at BOTH sides of the hull. Mirror them from
 // one geometry definition, never draw the right tread with separate offsets.
 c.save();c.translate(-2.2*recoil,Math.sin((trackLeft+trackRight)*.35)*suspension*.35);c.lineJoin='miter';c.lineWidth=2;c.strokeStyle='#071820';
 for(const side of [-1,1]){
   c.save();c.scale(1,side);
   // Road track and six identically-spaced treads: all seams are perpendicular to travel.
   c.fillStyle='#091b25';c.fillRect(-27,15,54,12);
   c.strokeStyle='#06131c';c.strokeRect(-27,15,54,12);
   c.fillStyle='#36505d';c.fillRect(-24,17,48,8);
   c.fillStyle='#7b929b';
   const phase=side<0?trackLeft:trackRight;
   const offset=((phase%8)+8)%8;
   for(let n=0;n<6;n++){const x=-24+((3+n*8+offset)%48);c.fillRect(x,16,2,10);}
   // Dark end caps mask the cycling belt seams at either end.
   c.fillStyle='#091b25';c.fillRect(-27,15,3,12);c.fillRect(24,15,3,12);
   c.fillStyle='#142b38';c.fillRect(-20,25,40,2);
   c.restore();
 }
 // Center chassis is bilaterally symmetric; armor plate has a visible forward nose.
 c.fillStyle='#0a1d27';c.fillRect(-23,-16,46,32);
 c.fillStyle=skin.armor;c.fillRect(-22,-15,43,30);c.strokeStyle='#071a22';c.strokeRect(-22,-15,43,30);
 c.fillStyle=skin.shadow;c.fillRect(-17,-11,34,22);
 c.fillStyle='#3d6673';c.fillRect(-17,-11,7,22);
 c.fillStyle=skin.armor;c.fillRect(-12,-10,24,20);c.strokeRect(-12,-10,24,20);
 c.fillStyle=skin.light;c.fillRect(-7,-5,8,10);
 // A single centerline weapon (not an extra sideways track or misaligned gun).
 c.fillStyle='#081924';c.fillRect(10,-6,25,12);c.strokeRect(10,-6,25,12);
 c.fillStyle='#477e8b';c.fillRect(13,-3,22,6);
 c.fillStyle=skin.armor;c.fillRect(33,-5,6,10);
 c.fillStyle='#eaf9f5';c.fillRect(38,-3,3,6);
 if(parked){c.strokeStyle='#83bba9';c.lineWidth=1.7;c.strokeRect(-29,-30,58,60)}
 c.restore();
}
function drawTopMech(c,paint,parked=false,stride=0,recoil=0,bob=0,skinId='fieldgrid.standard'){
 const skin=resolveUnitMaterials('mech',paint,skinId);
 // True top-down walker: two separate articulated legs, shoulders and central cockpit.
 // Readable at phone scale; the dark gaps distinguish the mech from tracked tanks.
 // Weight is subtle and only affects this unit's own art, not physics.
 c.save();c.translate(-1.3*recoil,bob);c.lineWidth=2;c.strokeStyle='#071723';
 for(const side of [-1,1]){
   c.save();c.scale(1,side);
   // Alternating walking gait; mirrored limbs retain their geometry at rest.
   c.translate(side*stride,0);
   c.fillStyle='#111f2c';c.fillRect(-25,12,17,12);c.fillRect(-22,19,15,17);
   c.fillStyle=skin.armor;c.fillRect(-23,15,12,9);c.strokeRect(-23,15,12,9);
   c.fillStyle='#6c84a0';c.fillRect(-20,28,16,7);c.strokeRect(-20,28,16,7);
   // Forward shoulder/arm, separated visibly from the torso.
   c.fillStyle=skin.armor;c.fillRect(2,17,17,12);c.strokeRect(2,17,17,12);
   c.fillStyle='#192a3e';c.fillRect(13,19,12,7);c.strokeRect(13,19,12,7);
   c.restore();
 }
 c.fillStyle='#17283a';c.fillRect(-14,-17,32,34);
 c.fillStyle=skin.armor;c.fillRect(-13,-15,27,30);c.strokeRect(-13,-15,27,30);
 c.fillStyle=skin.shadow;c.fillRect(-8,-10,16,20);
 c.fillStyle=skin.light;c.fillRect(-3,-8,9,16);
 c.fillStyle='#162639';c.fillRect(12,-6,20,12);c.strokeRect(12,-6,20,12);
 c.fillStyle=skin.armor;c.fillRect(27,-5,8,10);c.fillStyle='#e6f8ff';c.fillRect(33,-3,5,6);
 if(parked){c.strokeStyle='#cfb4fd';c.lineWidth=2;c.strokeRect(-29,-38,67,76)}
 c.restore();
}

function drawTopPilot(c,paint,shooting=false,stride=0,recoil=0,bob=0,skinId='fieldgrid.standard',squadPaint=false){
 // v0.9.45 FIELDGRID P-03: compact overhead operator; no exposed legs.
 // +X is forward for the pilot, tank, mech AND the real projectile muzzle.
 // Only shoulders and short arms mirror across Y; two hands hold ONE pistol.
 // No foreshortened face/profile, segmented circles, fake depth or glow rings.
 const skin=resolveUnitMaterials('pilot',paint,skinId);
 const armorPaint=squadPaint&&skinId==='fieldgrid.standard'?paint:skin.armor;
 // Movement rhythm is driven by real velocity in render(), not fake foot steps.
 // Only the unified vest and shoulder plates move. Helmet, hands, pistol,
 // muzzle and projectile origin stay on the exact same forward axis.
 const gait=clamp(stride,-3.5,3.5);
 c.save();c.translate(-recoil*.15,bob*.25);
 c.lineJoin='miter';c.lineWidth=1.6;c.strokeStyle='#071923';
 // Tiny grounded upper-body sway while moving, zero movement at rest.
 // The rear vest sways as ONE solid block; no boots/knees are drawn.
 c.save();c.translate(-Math.abs(gait)*.18,gait*.32);
 c.fillStyle='#071923';c.fillRect(-20,-10,28,20);
 c.fillStyle=armorPaint;c.fillRect(-18,-8,24,16);
 c.fillStyle=skin.shadow;c.fillRect(-16,-7,8,14);
 c.fillStyle=skin.light;c.fillRect(-14,-8,3,15);
 c.fillStyle='#132c38';c.fillRect(-19,-5,4,10);
 c.fillStyle=skin.trim;c.fillRect(-17,-8,2,3);
 c.restore();
 // Mirrored shoulder plates gently counter-shift along the pilot's forward
 // axis; the actual two-hand gun hold remains fixed and fully aligned.
 // There is deliberately no counterstepping lower-body animation.
 for(const side of [-1,1]){
  c.save();c.scale(1,side);
  // Both shoulders subtly travel in opposing phases. No leg geometry.
  c.save();c.translate(side*gait*.5,0);
  c.fillStyle='#071923';c.fillRect(-9,11,17,11);
  c.fillStyle=armorPaint;c.fillRect(-7,13,14,7);
  c.fillStyle=skin.light;c.fillRect(-6,13,10,2);
  c.fillStyle=skin.team;c.fillRect(-7,19,6,2);
  c.restore();
  // Weapon-gripping forearms do not move with the animated shoulder plates,
  // so drawn muzzle position stays in sync with actual sidearm projectiles.
  // Each arm is one angular armored bent limb — not a second barrel.
  c.fillStyle='#071923';c.beginPath();
  c.moveTo(6,16);c.lineTo(11,15);c.lineTo(20,6);
  c.lineTo(20,3);c.lineTo(16,3);c.lineTo(8,12);c.closePath();c.fill();
  c.fillStyle=armorPaint;c.beginPath();
  c.moveTo(9,14);c.lineTo(12,14);c.lineTo(19,6);
  c.lineTo(19,5);c.lineTo(17,5);c.lineTo(9,12);c.closePath();c.fill();
  c.fillStyle=skin.light;c.fillRect(16,6,3,2);
  // One glove per hand on a shared centerline sidearm.
  c.fillStyle='#071923';c.fillRect(16,2,8,6);
  c.fillStyle='#bdcac8';c.fillRect(18,3,5,3);
  c.restore();
 }
 // Compact chamfered helmet, viewed entirely from above — no face in profile.
 c.fillStyle='#071923';c.beginPath();
 c.moveTo(-11,-7);c.lineTo(-7,-12);c.lineTo(6,-12);
 c.lineTo(12,-7);c.lineTo(12,7);c.lineTo(6,12);
 c.lineTo(-7,12);c.lineTo(-11,7);c.closePath();c.fill();
 c.fillStyle=armorPaint;c.fillRect(-8,-9,17,18);
 c.fillStyle=skin.shadow;c.fillRect(-7,4,15,4);
 c.fillStyle=skin.light;c.fillRect(-6,-9,11,3);
 // Narrow forward visor band makes facing direction visible at zoomed-out scale.
 c.fillStyle='#112a36';c.fillRect(6,-6,5,12);
 c.fillStyle=skin.trim;c.fillRect(9,-5,2,10);
 c.fillStyle='#d5eeea';c.fillRect(10,-3,1,6);
 // Shared real weapon muzzle remains exactly local-space (28,2).
 c.fillStyle='#071923';c.fillRect(17,0,11,4);
 c.fillStyle='#849fa8';c.fillRect(19,0,7,1);
 c.fillStyle='#3f5963';c.fillRect(18,4,5,2);
 c.fillStyle='#e1f3d8';c.fillRect(PILOT_MUZZLE_X-1,PILOT_MUZZLE_Y-1,2,2);
 if(shooting){c.fillStyle='#ffda91';c.beginPath();
  c.moveTo(PILOT_MUZZLE_X+1,2);c.lineTo(PILOT_MUZZLE_X+5,-2);
  c.lineTo(PILOT_MUZZLE_X+4,2);c.lineTo(PILOT_MUZZLE_X+5,6);
  c.closePath();c.fill();}
 c.restore();
}

export {drawTopTank,drawTopMech,drawTopPilot,FIELDGRID_UNIT_SKINS};

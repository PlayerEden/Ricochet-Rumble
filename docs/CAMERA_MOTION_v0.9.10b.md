# Sector Rebound v0.9.10b — Camera & Multi-Unit Motion QA

## Player feedback addressed
The v0.9.10 fullscreen build looked much better on a real Android phone, but the player requested a very slight camera pullback, less tank movement shake, and visual-motion consistency for mechs, pilots, AI and multiplayer actors.

## Camera tuning
- Base maze camera zoom 1.28 → **1.20** (6.25% lower zoom factor); responsive canvas and fullscreen HUD remain.
- Important: the old `Math.max(1.28,W/worldW,H/worldH)` could remain width-limited on a wide phone. Therefore the effective formula is now `Math.max(1.20,W/(worldW+160),H/(worldH+120))` rather than simply replacing 1.28.
- Permit ~80 world-unit scenic apron around the world boundary. Paint continuation tiles beyond playable edges so the slight pullback doesn't introduce blank letterboxing. Wall collisions, match dimensions, spawns and maze topology are unchanged.

## Unit-motion treatment
- **Tank:** keep speed/turn-driven mirrored track animation, reduce suspension lateral bob from 0.65 to 0.35 and normalize motion amplitude by speed/240 instead of speed/170. Recoil peak 1.0 → 0.72 and rendered translation scale 3.0 → 2.2.
- **Mech:** retain alternating left/right leg stride, slightly reduce stride intensity, add speed-scaled body weight (~0.65 px max) and recoil peak 0.56. Active mechs and bots use exactly the same renderer.
- **Pilot:** retain animated alternating footfalls, add tiny speed-scaled bob (~0.45 px max) and pistol recoil peak 0.28. All on-foot players and bots get the same treatment.
- **Common:** effects are visual only; no changes to movement speed, tank collisions, health, weapon ballistics, bot behavior, or multiplayer protocol. Recoil is serialized in existing actor-state messages, so remote clients also render it.

## UI refinement
- Reduce border/glow prominence and dark panel opacity on match HUD, joystick, fire button and interact button without reducing any finger hit areas.
- Keep original fullscreen field, title-free live HUD, radar and safe-area handling.

## Verification
- Gameplay smoke tests: camera zoom calculation, overscan policy, animation displacement, tank/mech/pilot recoil tiers, unchanged track scrolling and previous collision/gameplay tests.
- Chromium QA now generates six screens per viewport: home/settings/help/arena/moving-tank/pause at 740×360, 915×412, 1280×720 in both before and after versions (36 total). Fullscreen pixel bounds of the *after* arena are asserted.
- Automated Android APK build and artifact upload run from `dev/sector-rebound-motion-polish-v0910b`.
- Manual Android QA still required for real motion feel, precise safe-area interaction, on-device frame rate, and host/guest multiplayer on two physical phones.

Rollback branch: `dev/sector-rebound-fullscreen-v0910`.

## Release gate
Review screenshots, gameplay checks, Android APK; obtain a physical phone playtest before merging.

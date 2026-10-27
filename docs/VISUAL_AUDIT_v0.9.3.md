# FIELDGRID v0.9.3 — In-engine visual audit and implementation

**Status:** Experimental visual-system branch, actual source changes. No generated mockups or image-based gameplay.

## Problems in 0.9.2

1. The floor was a uniform teal grid; walls were plain outlined teal rectangles with little material identity.
2. Player tank, parked tank, mech, and pilot were visually drawn with different outline and detail conventions.
3. Menu and control styling mixed glossy gradients, rounded-corner UI, and utilitarian simulator typography.
4. The old home-screen launcher artwork did not share a visual system with the game.
5. The How to Play help text incorrectly claimed every hit cost a life, despite vehicle armor.

## Changes in v0.9.3

- A unified top-down schematic style: consistent 2px object outlines, cyan/neutral tank colors, lilac mech, no camera perspective or asset imports.
- Batched, camera-culled procedural facility floor panels, deterministic micro-decals, controlled amber hazard accents, modular metallic walls with top edges, fastener details and subtle shadows.
- Distinct top-down tank, walker-mech, and pilot silhouettes; empty vehicles use understated landing markers, with prompt still appearing only near usable vehicles.
- Consistent graphite/cyan/coral menu, HUD, and two-thumb control styling with reduced glossy effects, simpler corners, shared spacing language.
- A new code-drawn 512px RR launcher icon that uses the same FIELDGRID colors and ricochet trail. This file is embedded in the Android APK, not shown as a proposal.
- Updated help text describing armor and pilot lives correctly.

## Verification performed

- `node tests/smoke.mjs` passes the existing gameplay, vehicle, maze generation, recovery, network-input and 1,500-frame stress regressions.
- 740×360, 915×412 and 1280×720 Chrome landscape rendering checks: no JavaScript errors, document scrolling, or hidden settings actions.
- Settings field hit targets: 44px at 740×360; 48px at larger tested sizes.
- `before_after_actual_gameplay.png` captures old and new game engines using the exact same maze seed (9151337), not synthetic artwork.
- Browser and APK assets are identical by source; Android build result must be separately checked in GitHub Actions.

## Deliberately not changed

- Combat mechanics, weapon timings, bot AI and armor values; changing feel and visuals simultaneously would invalidate comparison.
- Local Wi-Fi protocol and device permissions.
- Match mode count or new user settings.
- Replacing 2D code-rendered assets with a heavy sprite-pack/rendering engine, which needs a future measured performance and art-direction review.

## Outstanding acceptance checks

- Real Android devices: HUD/safe-area readability, tap comfort and FPS on a large arena with four bots.
- Human playtest: pilot/mech/tank recognition in motion, walls versus passable floor, teammate versus enemy colors.
- Same-Wi-Fi multiplayer on two phones is still not proven.
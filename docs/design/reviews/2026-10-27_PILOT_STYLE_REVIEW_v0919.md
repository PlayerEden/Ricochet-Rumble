# FIELDGRID Pilot Character & Portrait Style-Review Pass — v0.9.19

**Status:** Experimental art and gameplay visuals. **Not approved or published** as a final avatar range.  
**Baseline:** \`design/fieldgrid-cosmetics-bible-v1\`; keeps v0.9.18 Android API 36 / AAB work.

## Player feedback / what was wrong

At normal camera distance, the on-foot pilot was hard to read as a person. The original drawing consisted of two side rectangles for boots, one body rectangle, an overlapping circular helmet and a long horizontal bar for the sidearm. The resulting silhouette could resemble a small drone, crosshair, tank-like marker, or anonymous machinery rather than a human outside a vehicle.

The goal is **recognition and personality**, not a larger character, different hitbox or a new 3D model.

## On-foot gameplay sprite v0.9.19

In \`drawTopPilot\` (both \`web/game.js\` and the mirrored Android game):
- maintain **true overhead (+X forward)** alignment and actual actor rotation/aim
- separate two small boots, animate independent front/back swing, keep a visible gap between legs
- show a compact rear utility pack and vest instead of an overlarge flat torso slab
- place distinct shoulder pads/forearms on both sides and keep team-color accent on their surface
- emphasize one large helmet rim, clear *forward* visor and subtle shine
- make the sidearm physically short/narrow, with a defined grip and muzzle
- keep 3-value graphic shading with no random microtext or faux dirt

**Unchanged gameplay:** pilot collision radius, walking speed/aim rotation, armor/ejection rules, sidearm fire rate, hitboxes, HUD labels, camera, matchmaking, multiplayer state and audio. No new mechanics.

### Readability test
Check idle and walking images at 740×360, 915×412 and 1280×720. Compare the actual screenshot **before** and **after** at the same maze seed, including a visible shoulder separation and two independently moving boots. At actual phone size the avatar should first read as "a helmeted person holding a short sidearm." If it still reads as a little tank or four-legged robot, iterate again.

## Portrait prototypes (editable source, not store art)

Three **self-contained 512-square SVG vector masters** were added:
- \`assets/source/pilots/pilot.st.001/pilot.st.001.svg\` — Recruit, standard helmet + cool visor, cyan signals
- \`assets/source/pilots/pilot.st.002/pilot.st.002.svg\` — Relay, visible adult face, headset, orange details
- \`assets/source/pilots/pilot.pr.001/pilot.pr.001.svg\` — Cold Cell, thermal hood, narrow sealed visor

These use finite deliberate paths/shapes, controlled material shading and common backgrounds, with no embedded text. SVGs are editable directly and can be exported again later. They are **style-review candidates** only; no consumer has an entitlement to any icon, no asset is included in the shipped profile UI, no paid SKU is configured, and no checkout exists.

The accompanying automated \`tests/pilot-art-review.mjs\` renders an honest contact sheet from these exact SVG source files at **240, 64, 48 and 32 px**. This is not a composited illustration pretending to be running code. It can be inspected in the CI visual-archive artifact.

### Known concerns to judge when we review the contact sheet
- The baseline vector portraits are intentionally simplified and currently closer to symmetrical frontal layouts than the Bible's strict 10–15° three-quarter camera. Judge whether subtle side-plane asymmetry is needed before style lock.
- Relay's facial geometry and headset attachments deserve a careful realism audit.
- Premium Cold Cell should feel like **a better design idea**, not a brighter or overproduced portrait.
- At 32px, verify that helmet/visor silhouettes are truly distinct without depending on the text label.
- A real portrait of a human and an anonymous full-face pilot should look like part of **the same art department**.

## Approval gate

**Do not mark these icons ART APPROVED yet.** Compare on actual phone UI; review each against Bible sections for consistent crop, lighting, believable visor/headset materials, crisp edges, adult proportions, non-trademarked symbols and commercial-rights tracking. Adjust prototypes first and only then expand the remaining 15 roster entries.

## Verification gate
- Gameplay regression tests including the updated gait pair and motion-center check
- identical Android/Web game source
- first-match tutorial, basic combat and LAN tests remain
- Chromium screenshot QA: 3 phone-landscape sizes; new on-foot idle and walking stages
- 3-icon source vector contact sheet
- build installable debug APK and unsigned Android App Bundle; latter not Play-uploadable

This is an intentionally scoped **visual prototype**, not a complete product/profile release.


## Screenshot-driven follow-up — labeling collision found

The actual 915×412 captured dismount shows why art alone cannot fix readability: \`ENTER · TANK\` was drawn almost directly on top of the pilot, and the \`P1\` identity marker/triangle could overlap the parked tank. Revised the world annotation:
- Nearby usable vehicle now has only a thin entry ring; the existing HUD ENTER control remains the actionable text.
- On-foot player/bot IDs render alongside the character rather than across the empty vehicle.
- The local on-foot chevron sits nearer the actor instead of hovering above the parked hull.
- Tank/mech labels and default HUD remain unchanged.

This fixes competing interface layers without hiding vehicle affordance or changing input hit targets. The new CI images include the true dismounted pilot state rather than only the tank-spawn state. Ground-view camera and hitboxes are unmodified.

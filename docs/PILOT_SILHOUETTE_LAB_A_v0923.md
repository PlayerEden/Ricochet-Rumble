# FIELDGRID — v0.9.23 Pilot Silhouette Lab A

**Status:** Experimental visual slice. Not user-approved, not merged, and **must not be attached to existing draft PR #24**.  
**Base:** `prototype/pilot-human-silhouette-v0923` forked from PR #24's tested game head `6399a0b9bd499839500cc647b2bd9f4c427ecca3`; dependency on PR #24 must be resolved before merging art into main.

## Why
Real owner Android screenshots showed the pilot still resembles a technical turret/vehicle more than a human. The owner has accepted the camera: on foot 1.07, tank 0.82, mech 0.77. The existing icon/dossier portrait Bible is **not** a gameplay-sprite specification. This is original procedural Canvas art, retaining FIELDGRID's restrained shapes, three value planes and cyan/coral team affiliation.

## Prototype A — Field Operator (in-game Canvas)
- Two separated counter-moving boots behind the torso, a narrow tapered vest with readable shoulders, a distinct **faceted helmet** and small forward visor.
- Upper support arm and bent lower firing arm, with a pistol deliberately **offset from the head**, ending in a muzzle flash below the heading. This breaks the straight-on turret/barrel optical illusion.
- All player and bot units use the same geometric function with their existing team `paint` color, so no unfair silhouette advantage.
- Preserve existing +X forward art convention, head direction and true 2D top-down pose.
- NO changes to actor collision radius, movement, projectiles, game mode, damage, session results, HUD or mobile buttons.
- No downloaded/copyrighted sprites or third-party asset requirements. Drawings are created using the existing Canvas API, not generated 512×512 dossier portraits.

## Checkpoint QA and acceptance
- Existing comprehensive game regression suite remains authoritative. Add focused draw-call invariants for two boots, angled arms, offset pistol, controlled flash, mirrored gait, balanced Canvas save/restore and fixed pilot camera.
- Extend Chromium actual-game visual QA with on-foot walking, east/west orientations and pistol fire at 740×360, 915×412 and 1280×720. Comparison baseline is current PR #24 head, using the same seeded gameplay.
- Capture original true-size screenshots; judge visual readability at real phone resolution, color affiliation, movement, vehicle ejection and recoil with the original renderer. **Screenshot review and owner's actual-device playtest required**; automated pass alone is not art approval.
- Continue to lock camera 1.07/0.82/0.77; do not tune zoom simply to compensate for weak sprite art.
- Do not auto-merge or claim finished pilot art. If A fails, iterate on this isolated prototype branch, compare another candidate and retain baseline.
- No new sound, LAN/online, scored CQC, or store cosmetics in this pass.

## Current dependency
Draft PR #24 still awaits remaining manual Quick Play results acceptance. Prototype branch is intentionally **not a new stacked merge PR**; upon accepting #24, rebase/cherry-pick only the approved pilot art/test changes onto the integrated mainline. Until then this branch is a safe visual experiment.

## True-phone screenshot audit refinement
The first 915×412 side-by-side screenshots exposed a real visibility issue: despite the new anatomy, the legacy selection arrow, P1 label and shield ring still crowded the soldier at actual screen size. Lab A now moves the on-foot player pointer left of the boots, the callsign label farther right/up, lightens upper/lower arm surfaces and makes the on-foot ring/shield more subdued. Vehicle pointers, tank/mech shield strokes and their labels remain unchanged. These are **visual-only** adjustments; shield duration/radius, pilot collisions and gameplay effects remain the same. Re-capture screenshots and obtain owner judgment, not a claim that the drawing is fully approved.

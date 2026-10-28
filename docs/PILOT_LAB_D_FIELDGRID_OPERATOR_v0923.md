# Pilot Lab D — FIELDGRID Operator Visual Cohesion

**Date:** 2026-10-27  
**Branch:** `prototype/pilot-fieldgrid-lab-d-v0923`  
**Base:** `prototype/pilot-two-hand-muzzle-v0923` (Lab C2 exact tested predecessor)  
**Status:** CODED PROTOTYPE; **automated QA / physical Android acceptance PENDING**. Not merged to `main` or Quick Play PR #24.

## Why

Owner's actual Lab C2 phone screenshot showed the right top-down human pose and working two-handed gun, but rounded circular shoulder caps, a smooth helmet, an always-on selection ring and temporary shield circle conflicted with FIELDGRID's angular military/industrial tank and arena rendering.

## What Lab D changes

- Procedural Canvas renderer `drawTopPilot`: polygonal compact vest, symmetrical plated shoulders, angular upper arms and bent forearms, two polygon gloves, faceted helmet top and restrained team paint. Head is viewed from DIRECTLY ABOVE; no boots, low crawling, 2.5D face or profile.
- Keeps a compact distinct pistol connected to the hands. **Uses existing shared `PILOT_MUZZLE_X=28,PILOT_MUZZLE_Y=2`**, with the SAME wall-safe projectile origin and unchanged physics.
- Replaces the routine on-foot ring with `drawPilotLocator` -- four *world-space* corner brackets, independent of facing. Team matches use team-colored brackets rather than stacking player and team circles.
- **Temporary** spawn/ejection shield still uses a separate ring so genuine invulnerability is visible; ejection pulses also remain. Parked vehicle interaction circles are untouched.
- Web and embedded Android JS are exact mirrors; no changes to other HTML/CSS assets.

## Explicitly unchanged

Locked camera pilot **1.07** / tank **0.82** / mech **0.77**, apron **420**; combat hitboxes, movement, aim, pistol speed, muzzle trace through cover, tank/mech art, touch controls, on-foot respawn mechanics, mode/result logic, local multiplayer packets, audio, signing and package ID.

## Evidence and acceptance gates

- [ ] Node syntax, seeded gameplay, four-rotation barrel-origin test and FIELDGRID cosmetic validation.
- [ ] Byte-identical web/Android assets.
- [ ] Real Chromium before/after **at 740×360, 915×412, 1280×720** using Lab C2 as before (record any tooling limitations).
- [ ] Actual standing, aiming, firing, moving and ejected pilot screenshots: helmet/shoulders visible at regular landscape phone scale; no arm overlap, shield/locator ambiguity or wrong-handed rotations.
- [ ] Debug Android APK and unsigned AAB compile (not signed Play release). Permanent dated screenshot/APK archive only after QA passes.
- [ ] Owner physical device playtest and visual approval. **Do not merge based on automated assertions alone.**

## Rollback and branch discipline

Lab C2 [permanent test release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.23-pilot-lab-c2-two-hand-test) and QA SHA `455fe51736e651741ddb47ee9f07d770d22a6307` remain unmodified. The v0.9.22-dev5 camera baseline is [permanently archived](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev5-final-camera-test). Draft PR #24 still awaits full Quick Play/results phone acceptance; this prototype must not silently merge into it or stable `main`.

## Next visual review

Review the real gameplay screenshots at **natural scale first**. If a helmet silhouette is too busy, simplify polygon facets rather than increasing character size or adding decoration. Do not spend time on rifle variations until this pistol silhouette is approved.

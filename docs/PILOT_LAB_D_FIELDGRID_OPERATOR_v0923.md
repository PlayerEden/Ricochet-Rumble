# Pilot Lab D — FIELDGRID Operator Visual Cohesion

**Date:** 2026-10-27  
**Branch:** `prototype/pilot-fieldgrid-lab-d-v0923`  
**Base:** `prototype/pilot-two-hand-muzzle-v0923` (Lab C2 exact tested predecessor)  
**Status:** CODED PROTOTYPE; **automated smoke, Chromium visuals and Android packaging PASSED on exact code SHA `b6d143cd752b3d5019571429e247ea5f01cf6cc5`**. Human visual/Android acceptance PENDING. Not merged to `main` or Quick Play PR #24.

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

- [x] Node syntax, seeded gameplay, four-rotation barrel-origin test and FIELDGRID cosmetic validation. [Fast CI PASS 40621728359](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40621728359).
- [x] Byte-identical web/Android assets.
- [x] Real Chromium scenes captured at **740×360, 915×412, 1280×720**, [full QA PASS 40621728355](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40621728355). **Caution:** automatic workflow baseline is historical v0.9.20, not C2; Lab C2 screenshot release is separately retained for owner visual comparison.
- [ ] Actual standing, aiming, firing, moving and ejected pilot screenshots: helmet/shoulders visible at regular landscape phone scale; no arm overlap, shield/locator ambiguity or wrong-handed rotations.
- [x] Debug Android APK and unsigned AAB compiled, and exact debug APK + original phone-size screenshots permanently archived in [immutable Lab D prerelease](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.23-pilot-lab-d-fieldgrid-test). Not signed for Play.
- [ ] Owner physical device playtest and visual approval. **Do not merge based on automated assertions alone.**

## Rollback and branch discipline

Lab C2 [permanent test release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.23-pilot-lab-c2-two-hand-test) and QA SHA `455fe51736e651741ddb47ee9f07d770d22a6307` remain unmodified. The v0.9.22-dev5 camera baseline is [permanently archived](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev5-final-camera-test). Draft PR #24 still awaits full Quick Play/results phone acceptance; this prototype must not silently merge into it or stable `main`.

## Next visual review

Review the real gameplay screenshots at **natural scale first**. If a helmet silhouette is too busy, simplify polygon facets rather than increasing character size or adding decoration. Do not spend time on rifle variations until this pistol silhouette is approved.

## Verified checkpoint — 2026-10-27

- [Full Android, actual Chromium screenshots and gameplay run 40621728355 PASSED](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40621728355) on exact source SHA `b6d143cd752b3d5019571429e247ea5f01cf6cc5` after older tests were updated from circular Lab C assertions.
- [Fast Node smoke/catalog/Android parity run 40621728359 PASSED](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40621728359) on that same source.
- [Permanent debug test APK and original screenshots](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.23-pilot-lab-d-fieldgrid-test), released *without rebuilding* the passing APK. Screenshots include 915×412 on-foot idle, aiming east, and firing, plus full multi-viewport ZIP and hashes.
- No manual human visual conclusion is implied: assess FIELDGRID proportions at normal device size, rotated facings, shield overlap and visible muzzle vs actual shot. **Owner approval still pending.**
- Release tag points at tested source SHA; subsequent documentation-only commits on this branch do not replace the released code or update its APK.

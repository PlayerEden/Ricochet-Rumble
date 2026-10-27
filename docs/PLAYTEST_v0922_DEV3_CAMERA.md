# Sector Rebound — v0.9.22-dev3 CAMERA Phone Acceptance

**Source:** `dev/sector-rebound-quick-play-v0922`, commit `6f5fd183def8596eca6bce42b4997aa5f08eace3` (last commit only changes docs; actual zoom logic committed at `252765216388a29515204ae94e7de363f88c2a9b`).
**PR:** [#24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24)
**Owner report:** 2026-10-27 actual dev2 phone screenshot: startup and menu acceptable, gameplay fun but needs wider view; pilot looks less like human than intended. Music and 2-device LAN deferred.
**Scope:** ONLY global tactical camera zoom-out and textured outer apron. No physics, hitbox, minimap, HUD, overlay touch target, pilot art or LAN modifications.

## Exact changes
Previous: mech 1.08, tank 1.13, pilot 1.22; fallback 1.15. New: mech 0.94, tank 0.98, pilot 1.07; fallback 1.00. Wider rendered apron from 112 to 260 world units; tile draw boundaries adjust automatically. All classes now see approximately 14–15% more area in each dimension at a non-clamped viewport.

## Phone test
- [ ] Launch in landscape and play at least one tank, one mech and one on-foot run. All should visibly show *more arena* than [dev2 test release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev2-test), without shrinking gameplay HUD/buttons.
- [ ] Confirm arrows, enemy labels, minimap and interactive ENTER/EXIT still appear where expected.
- [ ] Drive to all four edges and corners of a **small** map, and inspect for naked black/untextured gutters, incomplete floor tiles, strange jump when camera follows.
- [ ] Switch from tank to pilot to mech and back. Camera should ease smoothly and remain centered; no instant snap or edge jerk.
- [ ] Test standard and large maps with 2–4 bots; ensure contacts, walls and projectiles remain legible and fights feel tactically manageable.
- [ ] Check narrow/tall landscape and any rotation, notch/navigation areas, and settings/result screens.
- [ ] Play for a few minutes and report FPS stutters/performance, joystick feel and whether the zoom now feels right / is too far.
- [ ] Record whether the pilot still looks too turret-like. **The actual pilot art is not changed**; improvements are issue [#26](https://github.com/PlayerEden/Ricochet-Rumble/issues/26).

## QA expectations
- [ ] CI smoke plus Android bundled `game.js` parity.
- [ ] Real Chromium screenshot comparison at 740x360, 915x412, 1280x720, including world apron and no errors.
- [ ] Debug APK packaging; link exact artifact SHA and test release (do not reuse an earlier dev2 APK).
- [ ] Human acceptance screenshot and brief observations. No 2-phone multiplayer claims.
- [ ] Keep PR draft until manual acceptance and merge review.

## Product direction and constraints
A stronger pilot art pass uses original top-down silhouettes and walking/aiming animation; see [pilot issue #26](https://github.com/PlayerEden/Ricochet-Rumble/issues/26). A later feel/impact pass is [#27](https://github.com/PlayerEden/Ricochet-Rumble/issues/27). Avoid adding sound/music prematurely; user may create original music later. Avoid architecture churn or accidental mutation of v0.9.21 known-good baseline.

**Signing warning:** Debug APKs built on different hosted runners may not update the installed app in place, even if `versionCode` stays identical; uninstalling deletes local data. Do not instruct a user to wipe the existing install without that warning.

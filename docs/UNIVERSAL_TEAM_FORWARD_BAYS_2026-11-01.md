# Sector Rebound — Universal Team Forward Bays, Safe Squad Spawns & Home Respawns

**Status:** isolated experimental gameplay checkpoint, automated Chromium/Node regression **PASS**.
Tested complete source commit: `08c7a16a0cc8fe730b7cfedb18a2be822c51768a`.
[GitHub Actions QA 41344581392](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41344581392) |
[Geometry telemetry/screenshots artifact 13099240081](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41344581392/artifacts/13099240081).

## Physical player feedback motivating this change

Player liked CTF's recognisable bases but reported general team matches spawning everywhere, vehicle clutter/accessibility, mobile pilot aiming precision and AI off-screen awareness. This checkpoint addresses the **first** concern and related starting garage safety. Pilot aiming/AI perception remain untouched and need a separate controlled A/B audit.

## Actual code changes

- `web/index.html` and mirrored Android HTML load existing 3.5kB `forward-bays.js` before `game.js`. The CTF rules/AI remain lazy-loaded.
- `web/game.js` and Android mirror use existing `SectorForwardBays.plan` for normal `teams` and `coop` modes, including Team Survival, Custom team settings, scored TDM, Forward Bay exercise and CTF. FFA/Solo Survival/CQC do not have team bases.
- New `teamForDeployment` respects coop team identity (both human seats vs bot team) rather than blindly assigning `i%2`; two-human team modes keep existing seat mapping.
- New `deploySquadsAtBays` preserves the original two-player positions, then searches connected maze cells with physical actor clearance (>=67 units) for additional teammates. No duplicate tank positions even in uneven 1v4 coop team setup.
- Scored pilot respawns use the existing `SectorScored.chooseSafeScoreSpawn` safety checks but prioritize connected home-bay cells within 2, 4, then 7 corridor steps. If no safe slot exists, they defer respawn rather than teleport into danger or respawn at the enemy's base.
- Legacy survival respawns first prefer available home-side cells from the pre-existing safe candidate pool; if crowded they use the old fallback rather than risk physical overlap. Full anti-camping design requires another scenario audit.
- Two Forward Bay garages are stocked with tanks; remaining neutral reserve retains at least one mech when available (fixed after actual regression exposed the disappearing mech).
- Importantly, new `teamBasesEnabled` is **distinct** from `forwardBayExercise`. Ordinary team modes still award existing Dossier progress; explicitly opt-in CTF/exercise remains excluded exactly as before.

## Targeted QA and regression

`tests/team-forward-bays-seed-matrix.mjs` runs **216 actual Chromium-loaded initialState** scenarios, with 12 procedural seeds × 3 map sizes × 6 cases (Team Survival, coop, scored TDM, CTF, FFA, pilot-only CQC).

Observed stats:
- 216 complete cases: 144 valid team-base scenarios and 72 baseline FFA/CQC isolation scenarios.
- 288 checked parked team garages, no garage/actor overlap failures.
- Closest two actors at creation: **132 world units** in this seeded sample; starting team occupants were all in connected cells **within 3 maze steps** of their own bay.
- 72 pilot respawn tests: **72 successful**, none deferred in this sample, all **within 2 maze steps** of the appropriate bay.
- No errors/violations from tested walls, garage collision, overlapping actors or mode isolation.

The original Forward Bay browser test also passed **300 maze seeds** and 30 independent full setups. CTF objective bots, 3-seed natural matches, and actual joystick-driven flag theft all passed; Quick Play, returning-player onboarding, stale backup export, pure scoring/flag rules, and real browser visual regressions passed.

**Do not interpret these tests as competitive balance proven:** neutral spares still need objective route-distance fairness checks, CTF 1v3 is deliberately asymmetric, physical touch/FPS and real LAN are unverified, and a 216-case matrix is not exhaustive.

## Release/rollback

This is on `experiment/team-forward-bays-spawn-v1` only. Stable main, draft integration PR #85, previous CTF experiments, and installed owner preview versionCode **200003** are unchanged. No Android APK has been built or delivered from this new implementation yet. Before a new device preview, require the same package `com.playereden.ricochetrumble.preview`, the existing exact test signing certificate `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`, version code strictly above 200003, matching embedded assets, and actual physical install-over verification. Never ask owner to uninstall the preview.

Previous owner-test source branch `test/ctf-overall-android-apk-2026-11-01` remains available for revert. Previous actual game checkpoint `678fc213e7bd8460f0e9a325ecb57a7d53777205` retains CTF behavior without universal team spawns.

## Next scoped major tasks

1. **Vehicle fairness audit:** measure shortest path from each team's bay to parked and neutral vehicles over broad maze seeds; ensure neutral vehicle placement isn't advantageously close to Blue and replenish consistently away from active spawn lanes. Audit after implementation.
2. **Pilot combat fairness:** quantify bot engagement beyond actual player camera, line-of-sight hit rates, and prototype small optional aim assist only for already-visible pilots, never off-screen lock-on or homing.
3. **UI geometry audit:** screenshot physical-size layouts and test controls/HUD/garage/flag overlaps, then cross-mode soak and owner's real Android acceptance.

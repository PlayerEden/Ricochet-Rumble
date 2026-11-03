# M2 camera-awareness pass — 2026-11-03

**Scope:** first owner playtest after v0.9.76-d3c.1 (Android code 380001). **Only camera magnification changed**; the existing v0.9.76 pilot silhouette, human input, AI acquisition, physical aiming, match rules, projectile velocities and LAN authority remain untouched.

## Camera tuning

| Unit | v0.9.76 | First-pass candidate | Approx. extra visible span |
| --- | ---: | ---: | ---: |
| Pilot (on foot) | 1.07 | **0.98** | **+9.2%** |
| Tank | 0.82 | **0.75** | **+9.3%** |
| Mech | 0.77 | **0.71** | **+8.5%** |

Units stay differentiated: **pilot closest, tank wider, mech widest**. Existing camera smoothing, world-boundary floor and painted exterior apron are preserved. This does not shrink physics or characters in world space. In special non-maze layouts the existing 1× fallback remains unchanged.

## Why this is first

The user confirmed current mobile v0.9.76 gameplay feels good and AI is fair but somewhat easy. A slightly wider tactical field can make incoming ricochets, approach routes and muzzle cues more readable; tune awareness first, then judge whether AI decision-making needs improvement. Do not introduce faster AI aim or invisible extra bot vision in this same pass.

## QA and owner acceptance

- Exact-byte mirrored `web/game.js` and Android embedded `game.js`.
- Real Chromium `tests/m2-camera-widen-qa.mjs` samples **4 portrait/landscape viewports × 2 map sizes × 3 player-unit types**; measures the live camera target/zoom, confirms ≥7.5% world-span widening, order pilot/tank/mech, preserved camera floor/edge apron and no script/resource errors. Standard canonical browser combat/AI/visual/LAN QA still runs.
- On physical Android: compare legibility of tank, mech, pilot, wall gaps, bullet traces and directional indicators; phone portrait AND landscape, movement/fire drag precision, stage edges, 10-minute heat/FPS, host vs bots. No gameplay acceptance based solely on CI.
- If the view feels too small or changes make precision aiming harder, restore original target values (pilot 1.07/tank .82/mech .77) from the protected v0.9.76 source checkpoint before attempting independent AI tactical changes.
- Owner preview must use identical `com.playereden.ricochetrumble.preview` package + pinned public AOSP test signer and **versionCode >380001**; do not uninstall the existing game. Never claim Play Store production release.

**Exit condition:** device owner confirms or rejects the wider field; if accepted, lock camera values and only then pursue bot defensive/positioning behavior on its own PR.

## Verified source and internal APK (added after CI)

- [Merged camera PR #115](https://github.com/PlayerEden/Ricochet-Rumble/pull/115) · source merge `820f588474d5340b2e6e767c595b3e5b66401028`; **six applicable PR checks PASS** and nonapplicable Android workflow skipped. [Canonical source & Chromium regression PASS #41705609374](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41705609374), including this 24-case new camera browser test, bot aiming and LAN.
- [Merged one-shot signing PR #116](https://github.com/PlayerEden/Ricochet-Rumble/pull/116), resulting `main` source `e118a4303894551f03f610b46b800a8af18fb6b5`. [Owner Android workflow PASS #41706608997](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41706608997) confirms Android package `com.playereden.ricochetrumble.preview`, versionName `0.9.77-camera.1`, code `390001`, same AOSP development certificate as previous code `380001`, actual APK WebView parity.
- [APK artifact #13266060199](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41706608997/artifacts/13266060199) (ZIP containing `sector-rebound-camera-390001.apk` and `verification.txt`), expires 2026-11-17. Exact APK SHA-256 `5a72a788e0986017b48cede1d6f00c3b4c4a107c26b0e0cb78379480e6b546ee`; source-only rollback previous signed v0.9.76 checkpoint `checkpoint/sector-rebound-d3c-380001-signed-ci`. This test key is **not** production/private signing.
- User's actual phone v0.9.77 installation, Dossier save continuity, landscape/portrait readability and AI feel have **not yet been reported/verified**; do not declare owner acceptance or Play readiness.

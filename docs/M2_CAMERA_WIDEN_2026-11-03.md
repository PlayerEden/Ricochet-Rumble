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

## Owner phone feedback and M2 Camera Fine-Tune v2 — 2026-11-03

**Actual owner-tested v0.9.77 feedback:** the first zoom-out **feels good**. It also made the AI difficulty **noticeably better**, now **almost a perfect balance between easy and challenging**. The pilot still feels comparatively too close when switching from vehicle views; owner asks for slightly wider tank and mech as well.

**Protect the existing AI as owner-accepted for now:** no changes to bot skill, acquisition, projectile prediction, decision-making, aim delay, speeds, physics, controls or host authority in v2. Widen camera first, then review on the same phone. Do not interpret this as authorization to buff bots.

| Unit | v0.9.77 owner-tested | v2 owner-approved target | Extra scene span vs v0.9.77 |
| --- | ---: | ---: | ---: |
| Pilot | **0.98** | **0.94** | **+4.3%** |
| Tank | **0.75** | **0.73** | **+2.7%** |
| Mech | **0.71** | **0.69** | **+2.9%** |

Preserve pilot > tank > mech magnification and the current camera smoothing, field apron, zoom floor and orientations. Updated `tests/m2-camera-widen-qa.mjs` compares directly against v0.9.77 with a narrow 2.5–4.5% extra field-of-view band, 4 phone-oriented viewports, two map sizes, three units and no runtime errors. `tests/smoke.mjs` rebaselines only established camera expectations; no actual movement, combat or multiplayer rules changed.

**Owner next APK:** v0.9.78 candidate, preview code **400001**, same `com.playereden.ricochetrumble.preview` app ID and public AOSP development test signer as 390001. Must validate after fully green source PR, signed exact embedded asset parity and checksum. Install on top of current v0.9.77 after backing up Dossier; **never uninstall** to bypass a mismatch. Test both orientations, pilot visibility, mech/tank readability and AI feel. On-phone acceptance still pending until owner reports.

## M2 v2 signed owner-preview verification

- [M2 v2 source PR #118](https://github.com/PlayerEden/Ricochet-Rumble/pull/118) **merged** at `a31499ac67ebdf099ae8a2cea79dd91ef24b5195`. All six applicable exact-source GitHub PR checks PASS: canonical (including actual Chromium orientations/AI), B1, B2, C1, C2A and fast smoke; generic full Android workflow marked skipped (not a pass claim).
- [One-shot owner APK PR #119](https://github.com/PlayerEden/Ricochet-Rumble/pull/119) **merged**, source SHA `e548e3e27d53675fab372cccb8404b20ddff55e2`. [Signed Android workflow PASS #41709421916](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41709421916) attested cert, version, app ID, web asset parity and actual APK bytes. [Archive artifact #13265922502](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41709421916/artifacts/13265922502) expires **2026-11-17**.
- APK `sector-rebound-camera-v2-400001.apk`, **`0.9.78-camera2.1`**, code **400001**, app ID `com.playereden.ricochetrumble.preview`; same public AOSP test signer SHA-256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc` as 390001. Independently verified extracted file SHA-256 `6ab003ae8690d114677b5de30e143726bb90913f82af22b5b3dfe9b4e995adad`.
- Preserved checkpoint `checkpoint/sector-rebound-m2-camera-v2-400001-signed-ci` points to precisely the signing workflow source; old v0.9.76 and v0.9.77 signed artifacts/checkpoints retain provenance.
- **Still pending:** owner installs v0.9.78 over current preview without uninstall, confirms existing Dossier/Hangar/presets retained and new pilot/tank/mech views in portrait/landscape; independently 2 physical Android phones for LAN. No Google Play release approval.

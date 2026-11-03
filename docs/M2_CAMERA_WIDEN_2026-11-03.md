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

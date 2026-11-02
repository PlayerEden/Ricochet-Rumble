# v0.9.22-dev5 — Final vehicle-only camera notch

**Date:** 2026-10-27 · **Development:** draft PR #24 on `dev/sector-rebound-quick-play-v0922`; no main gameplay merge

## Actual Android feedback

After playing the dev4 build on an actual Android phone, owner said: "We're almost there. Leave pilot an zoom out a notch for everything else and I'd say we are good." Treat this as a deliberate final, small vehicle adjustment. No pilot change: preserve the closer foot perspective for future pilot-only Close Quarters, which is not a playable mode yet.

| Camera | dev4 | dev5 |
|---|---:|---:|
| Pilot | 1.07 | **1.07 unchanged** |
| Tank | 0.87 | **0.82** |
| Mech | 0.82 | **0.77** |
| Fallback | 1.00 | **1.00 unchanged** |
| Rendered exterior apron | 380 | **420** |

The target pullback means roughly 6% additional world width for tank and 6.5% for mech, unless constrained by screen/map. With a small 9×6 cell maze on a 1536×672 screen, the new width floor is 1536/(1188+840)=0.7574, below the new mech target 0.77. Exterior floor rendering already derives from the apron value. Smooth camera follow, collision, touch controls, pilot drawing and all gameplay remain identical.

## Quality gates and release

- Headless regression, Web/Android exact game.js parity, viewport classes at 740×360/915×412/1280×720/1536×672 and specific wide-small-maze FOV test.
- Real Chromium screenshot diff and actual Gradle debug APK/AAB packaging before giving user a new test APK. Preserve [dev4](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev4-vehicle-camera-test) and [dev3](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev3-camera-test) known-good comparison builds.
- Owner device acceptance pending: pilot zoom same, tank/mech now sufficient, edge/corner tiles and camera transitions correct, no drop in smoothness.
- After confirming camera, prioritize original pilot art [#26](https://github.com/PlayerEden/Ricochet-Rumble/issues/26) and later combat feel [#27](https://github.com/PlayerEden/Ricochet-Rumble/issues/27). Audio/music and two-phone LAN remain deferred. Do not declare new CQC mode or merge PR from this camera pass alone.

# v0.9.22-dev4 — Vehicle-only wider tactical camera

**Date:** 2026-10-27. **Branch:** `dev/sector-rebound-quick-play-v0922`; draft PR [#24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24). **No change to main gameplay release until owner acceptance.**

## Latest real-phone direction
The owner tested the [v0.9.22-dev3-camera-test APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev3-camera-test) on a physical Android phone, supplied a clear screenshot of on-foot play with two nearby tanks visible, and **likes the overall zoom now**. They specifically request **further zoom-out for tank and mech, not the pilot**, because future **Close Quarters** should be pilot-only and benefit from a closer perspective.

## Implemented candidate
- **Pilot stays 1.07×**, unchanged. Do not silently zoom the CQC pilot out.
- **Tank 0.98× → 0.87×; mech 0.94× → 0.82×**. Mech retains slightly broader awareness than tank. This increases world width about **12.6% for tanks and 14.6% for mechs**, when not viewport-limited.
- **CAMERA_APRON 260 → 380 world units**, keeping full vehicle zoom available on a 1536×672 landscape phone even for the real SMALL 9×6 cell maze. Exterior floor tiles already render dynamically from CAMERA_APRON. No blank gutters from unrendered tile rows should appear.
- Game mode selection, victory conditions, touch controls, physics, collision shapes, bullets, current pilot art and HUD all stay unchanged. This is not an implemented CQC mode.
- Keep spectator fallback at 1.00× and camera easing as in dev3.

## QA contract
- Smoke tests must cover pilot zoom equality with dev3, both vehicle targets, transition monotonicity, width floors across 740×360, 915×412, 1280×720, 1536×672, including SMALL arena where old apron would cap mech at about 0.90.
- Browser and bundled Android `game.js` must be byte-identical.
- Full Chromium screenshots + seeded headless gameplay + Gradle debug APK and unsigned AAB on exact commit before publishing test APK.
- Human phone test: tank/mech feel tactical without making targets tiny; pilot foot view identical to dev3; field walls/vehicle arrows remain readable and exterior never blanks near maze corners. Test meaningful 3–5 minute sessions and return feedback. Preserve known-good [dev3 camera APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev3-camera-test) and [dev2 result APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev2-test).

## Later development
- Pilot appearance / top-down human silhouette is issue [#26](https://github.com/PlayerEden/Ricochet-Rumble/issues/26). It should be tested at pilot zoom 1.07 and appropriate real screen resolutions.
- Future pilot-only Close Quarters requires its own actual rules, spawn/equipment/respawn/victory mechanics and a separate QA gate. It is a DESIGN DIRECTION ONLY, not a new mode in this build.
- Combat game-feel enhancements issue [#27](https://github.com/PlayerEden/Ricochet-Rumble/issues/27). Audio and two-phone LAN remain intentionally deferred by owner.

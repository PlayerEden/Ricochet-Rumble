# Sector Rebound — v0.9.12a Camera Tune & Two-Phone QA Handoff

## Scope of this build
Tiny camera adjustment only: pilot **1.36**, tank **1.26**, mech **1.20**, fallback **1.28**. All four increased by exactly 0.04 from v0.9.12. Smooth easing, world apron, fullscreen HUD, controls, procedural maze generation, combat, and LAN packet formats were not changed.

## Verification contract
- Game smoke suite checks camera target order, ease-in/out, Android/web game source parity, 180 deterministic procedural seeds, 1,500-frame simulation stability, vehicle ejection/re-entry, bot behaviors and LAN serialization.
- Real Chromium before/after screenshots of the same deterministic maze: home, settings, help, arena, moving tank and pause at 740×360, 915×412, and 1280×720. No primary-menu overflow, no missing fullscreen arena.
- Native Android APK compile and upload must pass.
- All those checks are automated, not a substitute for physical LAN sessions or Android cutout/touch QA.

## Later: a practical two-phone smoke test (not required today)
On two Android phones on the same Wi-Fi, both running **the same APK**:
1. On one phone use **PLAY TOGETHER → HOST GAME**; on the other use **FIND GAME**. If discovery fails, use **JOIN BY IP** and the displayed host address/port. Record whether discovery or manual IP was needed.
2. Verify both phones load the same maze and can steer/fire independently, with no mirrored or swapped controls.
3. Exit a tank on each phone, walk, enter a parked tank or mech, and confirm armor and visual occupancy agree on both devices.
4. Test bullets and armor loss, pilot ejection and a life loss. Ensure both see the same event and final result.
5. Host pauses/restarts to a **new maze**; guest should show pause and then correct new field without blank view/camera jump.
6. Suspend/background one phone and reconnect. A failure here is useful diagnostic information even if ordinary gameplay works.

Notes to collect when possible: device models, Android versions, how they joined (discovery vs IP), whether host and guest saw different results, and the step that first broke. Do not need to do an exhaustive stress test immediately.

## Release posture
Treat v0.9.12a as **candidate for playtesting, not declared multiplayer-verified**. Keep v0.9.12 on `dev/sector-rebound-qa-v0912` as a rollback branch. Avoid large new gameplay changes before feedback from the two-phone session.

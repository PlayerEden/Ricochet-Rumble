# Sector Rebound — v0.9.22-dev5 final camera phone acceptance

**Status:** Follow-up to owner's real-device dev4 camera feedback, not yet human-accepted. Draft PR [#24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24) contains proposed dev5 code; earlier v0.9.21 main remains preserved.

## Exactly what changed
- Pilot on-foot stays at **1.07** (do not zoom further out).
- Tank changes **0.87 → 0.82**; mech **0.82 → 0.77**, approximately 6% wider world view than dev4.
- World exterior rendering apron **380 → 420**, protecting target view on a small maze / wide phone.
- No combat, UI, controls, spawn, rendering art, physics, network, audio or game mode changes; no functional Close Quarters mode shipped.

## Phone checklist
- [ ] Eject pilot first and compare to the v0.9.22-dev4 screenshot: character and world should appear at exactly the same scale, with joystick and fire controls unchanged.
- [ ] Drive a tank and feel whether the extra ~6% visible world improves tactical perception without making bullets, walls and enemies too small.
- [ ] Board a mech: it should show slightly more battlefield than the tank, while aim and collisions remain intuitive.
- [ ] Switch between on-foot, tank and mech 5 times and confirm smooth camera easing, no zoom jumps.
- [ ] On SMALL field, drive to corners and along all four outer walls, checking for untextured gaps, missing tiles and HUD/mini-map obstruction.
- [ ] Run 2–3 Quick Play rounds in different procedural fields, confirm Next Match works and close-range on-foot fights retain the same feel.
- [ ] Try 3–4 bots for several minutes, report camera jitter, visual clutter or performance drops with larger view.
- [ ] Report whether camera now feels final: pilot **yes/no**, tank **good/too far/too close**, mech **good/too far/too close**.

## Installation / rollback
Compare against preserved [dev4 Android test APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev4-vehicle-camera-test) and [dev3 camera APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev3-camera-test). A separately numbered dev5 test APK should only be published when exact full Chromium/Android QA passes.

All are *debug-signed* builds and Android's internal versionName may still show `0.9.21-game-feel` despite newer game code. GitHub runner signing certificates can differ; **uninstalling an old build deletes local app data**. Do not assume the new APK will update in place; consider backup before removal.

## Next work after acceptance
- Mark camera targets stable in [PROJECT_STATUS](PROJECT_STATUS.md), keep a rollback release.
- Continue original pilot silhouette/gait redesign as a separate, controlled [issue #26](https://github.com/PlayerEden/Ricochet-Rumble/issues/26), evaluating readability at the locked pilot 1.07 scale.
- Later: [combat game feel issue #27](https://github.com/PlayerEden/Ricochet-Rumble/issues/27). Audio and two-phone LAN stay deferred until owner is ready. Pilot-only Close Quarters requires real mode mechanics and acceptance, not just camera values.

# Sector Rebound — Actual Android WebView Save Persistence Rehearsal

**Date:** 2026-11-01  
**Status:** PASS — Android API 35 emulator, synthetic saves, test-only debug instrumentation. **Physical owner-phone acceptance still PENDING.**  
**Reviewed development source:** [PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85), feature/test source `017f414f44384b567daa45d29b733173d08e09a6`.  
**Verified [GitHub Actions run 41274922759](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41274922759) (SUCCESS)**, [retained evidence artifact 13071077143](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41274922759/artifacts/13071077143).

## Why this matters

The earlier emulator install-over [41273751498](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41273751498) verified Android package upgrade and a manually created app-private canary file but **not** real WebView/localStorage progress. The new test checks the game's actual five local saved-record keys plus the Dossier interface.

## Exact verified scenario

- **Same package:** `com.playereden.ricochetrumble.preview`, same pinned PUBLIC AOSP development test certificate (not a production/security credential).
- **Both signed APKs compiled during CI:** baseline `versionCode 100041` at historical source `55c91024`; later `versionCode 100050` at current integration source. Run on real Android API 35 x86_64 emulator.
- **Only temporary CI worktree patches:** `qa/android-webview-upgrade-probe.mjs patch` enables Android WebView debugging for both test debug builds. The live repository's MainActivity.java, approved game source, installed phone APK and Play release identity were **NOT modified**. ADB localhost CDP connects to `file:///android_asset/index.html` inside the **actual running Android WebView**.
- **Five synthetic game records seeded with localStorage:** `rr-options-v06` (settings/comfort/playlist); `rr-custom-v1` (Custom rules); `rr-custom-presets-v1` (saved named preset); `rr-dossier-v1` (six matches, five wins, 11 operator KOs); `rr-hangar-paint-v1` (moss paint and VECTOR emblem). Never seed real personal data or credentials.
- **Baseline close/reopen control:** after allowing WebView to flush storage and sending Android Home to pause the activity, force-stop and reopen **the same version**. `ANDROID_WEBVIEW_LOCAL_SAVE_RELAUNCH_PASS`: five exact raw stored JSON strings preserved, reopened Dossier UI shows **6 MATCHES / 11 KOs**.
- **Android in-place upgrade:** force-stop, `adb install -r` version 100050 over 100041 (no uninstall, app data clear or cert change), reopen app. `ANDROID_WEBVIEW_LOCAL_SAVE_UPGRADE_PASS`: all five exact raw JSON strings retained and Dossier UI again shows **6 MATCHES / 11 KOs**.
- **Prior file-only checks remain:** `ANDROID_EMULATOR_PACKAGE_UPGRADE_PASS`, app-private canary preserved, both activities launch. The successful run uploaded `webview-before.json`, `webview-baseline-relaunch.json`, `webview-after.json`, screenshots, signer/badging/install logs and README.

## Failed explorations retained transparently

1. [Run 41274406056](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41274406056) failed because the newly injected data was judged against the old in-memory Dossier state **before the baseline game was properly restarted**. A baseline read at that point does not prove save loss; the test was corrected.
2. [Run 41274646541](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41274646541) confirmed the injected raw data but found the first settings record missing after an **abrupt** force-stop/upgrade. The initial harness did not allow the asynchronous WebView storage writer to complete nor exercise normal Android backgrounding. This is evidence of a potential shutdown/storage timing risk, **not** evidence that normal app updates always erase progress. The next, controlled test introduced Home/pause, flush delay, and same-version restart as a diagnostic control.

Both earlier failures are kept; neither was silently marked green. The final successful test establishes a controlled, real-emulator persistence case, **not arbitrary abrupt process termination durability**.

## Remaining boundaries and player release implication

- **Not proved:** real Android phone installation data persistence, device-specific WebView versions, immediate power loss/crash behavior, actual user tapping and completing a round, sustained FPS/thermals, two physical LAN phones, privacy/production signed Play AAB or private keystore maintenance.
- **Do not use** the generic CI `debug-apk` as if it were compatible with an installed `.preview`. Inspect package, versionCode and cert before install; if meaningful on-phone progress exists, make an in-game backup before changing versions.
- **Next owner check** follows [physical Android acceptance card](OWNER_ANDROID_ACCEPTANCE_2026-10-31.md): record installed app identity; save real Dossier/Hangar/Settings/Custom values; switch Home/reopen; install a *same-certificate higher-versionCode* preview without uninstall; verify actual saved values; report and preserve rollback. Do not mark this manual gate completed until owner confirms.

**Repository:** stable `main` untouched; PR #85 remains DRAFT. No game controls, pilot art, visuals, scoring or Android production IDs changed in this pass.

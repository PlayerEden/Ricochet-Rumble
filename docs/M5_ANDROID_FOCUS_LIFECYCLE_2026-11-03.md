# M5 — Android window focus and one-phone pause resilience

**Date:** 2026-11-03  
**Source:** focused PR from current `main`; no alternate game branch to maintain, no immediate new owner APK.  
**Owner baseline:** v0.9.80 compatible preview / code 420001, accepted pilot/tank/mech zoom 0.94 / 0.73 / 0.69, current AI fairness and controls unchanged.

## Observation and fix

Android `Activity.onPause()` was already calling the game’s `window.RR.appPause()`, and browser `visibilitychange` also requests it when hidden. However, an Android window can briefly lose focus (notifications, system overlays) **without** transitioning through activity pause. The previous `onWindowFocusChanged(false)` did not notify the game, while a general browser `blur` cleared controls without freezing the Solo simulation. That could leave the arena running while it was obstructed.

The Android activity now calls the same **idempotent pause path** on focus loss; `onPause` still calls it as a fallback. `onResume` **does not automatically restart the match**, so the player must press **RESUME MATCH**. No changes to game speed, aiming, AI timing, WebView persistence keys or LAN host/disconnect policy.

## QA gates

- `tests/android-focus-pause-qa.mjs`: real Chromium game with 740×360 and 915×412 viewports; starts actual bot-free Practice, injects simulated held controls, calls the game lifecycle hook as Android would, checks controls/aim cleared, paused scene time frozen, one pause panel, 3 repeated signals idempotent, exact save-record values unchanged, explicit Resume continues the same match, Main Menu exits without rewriting progress.
- The same test asserts Java source wiring: `onWindowFocusChanged(false)` and `onPause` both route through `pauseGameForLifecycle()`, and `onResume` never unpauses the game.
- CI must also compile the Android Java code and pass existing mainline AI, LAN and visual regressions.
- **Limit:** Chromium plus Java static assertions and Gradle compilation do not prove actual notification shade, screen lock, call interruption or Android WebView scheduling on the owner's physical phone.

## Single-phone manual acceptance (when next consolidated owner preview is available)

1. Start a Solo match; while moving/aiming, pull down the notification shade. Return to the game. **The field should show a pause menu and must not move/shoot until Resume is tapped.**
2. Repeat using Home → reopen, screen lock → unlock, and (if desired) the native Share Backup chooser. The pause behavior should be consistent without duplicate dialogs or accidental auto-resume.
3. Resume each time and check the same match remains active, movement/fire inputs are no longer stuck and Dossier/Hangar/Custom data were not altered.
4. For LAN hosting, the prior onStop policy still deliberately stops hosting; do **not** claim host room retention on Home. Physical two-phone LAN remains explicitly deferred until the owner has hardware access.

**Status:** engineering source and automated QA only until the user reports an actual Android test. Do not distribute a new per-feature APK or treat the milestone as a Play release.

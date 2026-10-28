# Sector Rebound — Quick Play + Lab E Integration Gate

**Date:** 2026-10-27. **Integration branch:** `integration/sector-rebound-quickplay-labe-v0924`  
**Review PR:** [#34](https://github.com/PlayerEden/Ricochet-Rumble/pull/34) -- **DRAFT, not merged**.  
**Gameplay source:** stacked from [owner-accepted Lab E preview source](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.24-pilot-lab-e-arcade-test), which already contains draft Quick Play/After Action source from PR #24.  
**Production main:** v0.9.21 stable, intentionally retained until acceptance.  
**Known physical Android candidate:** [Lab E v0.9.24 debug APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/download/v0.9.24-pilot-lab-e-arcade-test/sector-rebound-v0.9.24-pilot-lab-e-arcade-debug.apk) (exact tested earlier source; QA browser test commits do not modify game JS or Android assets).

## Why this gate exists

The owner accepts the pilot Lab E block-arcade artwork for now and wants to advance to reliable gameplay. Quick Play has real two-option survival playlist logic and actual After Action counters, but automated browser screenshot coverage had previously shown only a **layout fixture** for results. The design and original source had already been thoroughly tested with headless gameplay; the remaining automation gap was **the connection** between real engine finalization, actual HTML text, and the NEXT MATCH UI.

The new **`tests/quick-play-live-flow-qa.mjs`** serves *unmodified compiled game source except for one transient browser-only read/trigger hook* from a local test-only HTTP server. The hook is never committed into production `web/game.js` or Android. All original UI, listeners, match logic, camera, rendering and assets execute unchanged. It uses actual `ejectPilot` and `registerHit` to create real engine victories/losses without waiting for nondeterministic AI.

## Browser integration assertions — **ALL PASSED**

- [x] Start real Chromium at 915×412, game loaded and home screen visible.
- [x] Uncheck both mode choices; disabled START and persisted empty selection; re-enable one and both.
- [x] Choose one real bot and begin a real solo match with a supported mode.
- [x] Engine-driven ejection, two actual pilot hits, real match finalization; **VICTORY**, operator KO/death counts and NEXT MATCH appear in the live UI. The test does NOT inject fabricated scoreboard text.
- [x] Click actual NEXT MATCH; verify fresh map seed and match ID, non-repeating mode when both modes enabled, cleared old result and current match active.
- [x] Cause actual player defeat; results show **DEFEAT**, 2 deaths, 0 lives, true KO value; MAIN MENU returns to lobby.
- [x] Reload the real browser; two chosen mode checkboxes remain selected.
- [x] Existing procedural combat smoke, **68** real Chromium layout/gameplay screenshots, embedded asset parity, Android debug APK and unsigned AAB build passed.

**Evidence:** [integration full QA run 40626315482 — SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40626315482), test/CI code commit `e1040bfa72565e0bfe79847b800887ded4f14309`; [fast regression 40626315451 — SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40626315451). The integration candidate's shipped browser game, Android bundled game, HTML and CSS blobs were independently verified **byte-identical to the accepted Lab E source**. New changes are only extra tests, workflow step, and documentation. Original prior [QA-passed Lab E APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.24-pilot-lab-e-arcade-test) therefore remains a valid Android acceptance build, without redundant APK republication.

## Exact human phone acceptance still required (short)

1. Open Lab E APK on physical Android. Check new game's mode checkboxes under Match Settings → Quick Play Modes + Advanced; 0 disabled, 1 available, 2 available. Quit and relaunch: settings persist.
2. With 2 bots and both modes selected, play through at least two naturally finished rounds. Verify real KO/death/lives/time results, no invented KOs for armor-only hits, and mode switch on NEXT MATCH. A new battlefield should appear **every time**, not merely a camera shift.
3. Try one selected mode only and finish twice: same mode, new sectors. Check restart vs NEXT MATCH difference and no results remaining at a fresh match.
4. Review physical Android actual 915×412-style display, touch placement/notch/safe areas, resume/background behavior and game feel. Note if the pilot against occupied tanks is frustrating; this mixed-mode balance is [deferred issue #33](https://github.com/PlayerEden/Ricochet-Rumble/issues/33), not an unapproved hidden patch.
5. Two-phone LAN and soundtrack deliberately deferred. Do not count simulator-only tests as physical LAN success.

## Branch safety and rollout

- [#24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24) Quick Play and After Action are **still draft**, even though QA has repeatedly passed.
- [#31](https://github.com/PlayerEden/Ricochet-Rumble/pull/31) Lab D art is an intermediate prototype, [#32](https://github.com/PlayerEden/Ricochet-Rumble/pull/32) Lab E art is the **preferred accepted** candidate. Their history is stacked; do not blindly click Merge on each.
- Use #34 as **single explicit candidate for review**, not as evidence it can be merged without natural Android review or clean integration strategy.
- No changes in this candidate to player damage, tank armor, ejection immunity, physical pistol muzzle, camera 1.07/0.82/0.77, skins selection or real scored modes.
- Backups: [mainline v0.9.21](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.21-polish-preview), [v0.9.22 dev5 accepted camera](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev5-final-camera-test), [Lab E exact original APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.24-pilot-lab-e-arcade-test).

**Release note:** Android runner debug signing may differ from user's previously installed APK. Uninstall can wipe stored game data. Internal Android `versionName` still trails actual experimental code. Fix production signing/version migration in a separate controlled release gate, not inside this test change.

# Sector Rebound — Phase 2D: truthful first-match guidance & safe respawn state

**Date:** 2026-11-02.  
**Branch:** `experiment/match-flow-truth-v1`.  
**Rollback:** previous full-regression passing checkpoint `experiment/landscape-combat-hud-safe-zones-v1` at `25871f948ed2927995b48cb53dc8d412677acbe0`.  
**Stable `main`, player data and installed Android v0.9.64:** untouched. No new APK created.

## Targeted game source findings

1. **Obsolete instructions at first deployment:** `firstMatchHint()` still instructed default players to **HOLD FIRE TO SHOOT** in Survival and **TAP FIRE TO SHOOT** in vehicle-scored matches. Default mobile control has instead been **DRAG FIRE TO AIM / RELEASE TO FIRE** since the earlier universal firing pass. Even CQC text mentioned drag without explaining release. New users could reasonably conclude the game was unresponsive.
2. **Misleading respawn blocker:** When the scored respawn delay hit zero but `chooseSafeScoreSpawn()` had no safe spot (including contested Forward Bays), the HUD showed `RESPAWNING · 0.0s` indefinitely while the engine rightly retried. The player couldn't tell a safety delay from a stuck match. The dead pilot was also styled as an active `on-foot` operator and the accessibility label still said `Pilot on foot`.

## Implementation

- First-use coaching now reflects the **actual saved control scheme**: release-to-fire teaches press/drag/release; legacy hold mode says hold; opt-in auto-fire says AUTO FIRE ON. The one-time key is per **mode family + fire control scheme**, so changing controls or coming from an older misleading hint allows one accurate new briefing, but never spams each rematch. Normal Solo Survival, CQC, scored vehicles and Quick Play remain playable exactly as before.
- **Quick Play compatibility:** `firstQuickPlayMode()` still uses the existing `rr-coach-v0917` storage milestone to distinguish brand-new players from returning players. The new accurate Survival briefing keeps marking that **legacy onboarding flag**, separately from the new scheme-specific coaching key. This prevents the first-session Solo Survival override from repeatedly resetting the user's Quick Play rotation after returning to Home. The real first-match browser test now verifies both flags and the returning Team Survival shuffle.
- For a **scored** local player whose life is zero, the HUD reports `RESPAWNING · 1.2s` while the countdown runs; once the delay is complete but a safe spawn is unavailable it reports `WAITING FOR SAFE SPAWN`. The aria-label reports the same truthful state and active-on-foot visual treatment is disabled while dead. Once placed safely, normal pilot/vehicle HUD returns. The game **does not** loosen spawn safety, speed up respawns, change scoring or add persistent timers.
- `web/game.js` and Android-embedded `game.js` share identical source; code stays on a single isolated experimental branch. Existing Quick Play first-session browser QA updated for the now-accurate default hint.

## QA gates

- New `tests/match-flow-truth-qa.mjs`: real Chromium runtime, **36 fixtures** (3 mobile landscapes × 4 modes × 3 fire schemes) checking first-time versus repeat guidance, accurate release/hold/auto words and persistent one-time scheme keys; scored-mode waiting/countdown/aria and normal on-foot status restoration.
- Existing real first-deployment user flow; Android asset/source parity, 84 HUD layout cases, 27 perception cases, 42 guest FX cases, 45 shell state cases, 27 shot warning cases, 18 actual bot firing cases, 48 touch cases, team vehicle/Forward Bay/CTF/Quick Play and visual screenshots must all remain green.
- Full CI run is at [GitHub Actions 41477616550](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41477616550). The preceding test-file-absent push correctly failed the required test-file invocation; the test was added on the following commit. Use only the green full run for release evidence.

## Still unverified

Real Android input feel, particularly death/respawn timing, audio and one-phone visual convenience. These require the owner's later combined-preview APK test. Package only after successful automation, with the existing preview package, identical signer and `versionCode` greater than **260001**.

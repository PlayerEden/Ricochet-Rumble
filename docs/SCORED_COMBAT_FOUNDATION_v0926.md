# Scored Combat Foundation — Rules Kernel v1

**Work date:** 2026-10-27. **Status: IMPLEMENTED + CI TESTING, NOT PLAYABLE.**  
**Branch:** `feature/scored-deathmatch-kernel-v0926`, based on exact [QA-passed v0.9.25 Team Survival source](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.25-team-survival-allies-test) (SHA `96be4c0540419d909a5ca20b444a1841d7354834`).  
**Owner decision:** Polish a small set of core mode rules (Survival and real scored Deathmatch) and expose compatible tuning through future Custom Match, instead of creating many bespoke modes. [Mode benchmarks and balance plan](https://github.com/PlayerEden/Ricochet-Rumble/blob/main/docs/research/DEATHMATCH_BENCHMARKS_AND_BALANCE_V1_2026-10-27.md).

## Actual implemented code

- `game-data/rules/scored-match.v1.mjs`: a pure, immutable scored-combat rules state. Includes validated schema (mode, player count, Blue/Red team membership for TDM, score target, seconds, match ID), data-only initial CQC/FFA/TDM trial values, genuine registered pilot-KO attribution, stable incident-ID duplicate prevention, team score aggregation, per-player deaths/respawns, time-limit winner or **explicit DRAW**, correct individual/team outcome, and conservative covered spawn-position ranking.
- `tests/scored-match-kernel.mjs`: 20 test groups checking standard trials, score attribution vs armor/ejection/shields, stale/duplicate incidents, allied hit rejection, self/env death, score-cap winner, time expiration and tie, no post-final result changes, validated team membership, respawn bookkeeping, and safe/blocked/occupied/covered spawn ranking.
- `.github/workflows/ci-smoke.yml`: new mandatory Node regression step alongside original browser/Android parity and gameplay suite.

## Strong scope boundaries

**NO new selectable game mode, browser script import, APK, results HUD, saved playlist, login, online multiplayer, production signing or Android gameplay change** in this increment. The JS module is intentionally separate from the existing IIFE until it can be safely adapted to the current match lifecycle without breaking survival or a future LAN host/guest. The module is TESTED SOURCE for a future scored mode, not proof a real match can reach 10 KOs with respawns.

The `chooseSafeScoreSpawn` function rejects blocked positions, too-close actors or active bullets and prefers distance/cover where maze LOS is supplied. It returns **null** if it cannot find an allowed position: the future engine must hold a respawn pending and retry, not spawn a player in danger. No 300-seed maze/real AI spawn-camping audit has yet been performed.

The source-based rules include a stable match ID and `incidentId` contract, but current game event paths do not yet supply authoritative incident IDs. Future adapter must mint IDs only on a *real pilot death*, and must not credit armor damage, an ejection, or an unconfirmed collision.

## Next implementation steps

1. Adapt `recordPilotKO` to actual `registerHit` exclusively after a successful on-foot elimination (and before any early-return). Wire one authoritative `matchId` and monotonic per-match incident sequence. Avoid duplicate score in simultaneous substeps. Preserve old survival path **unchanged**.
2. Pilot-only **Close Quarters** preset (first real score-mode proof): no vehicle spawns, no boarding, no vehicle replacement, on-foot deployment; 10 KOs / 3-min test target. Use `chooseSafeScoreSpawn` with current maze collision and LOS callback, brief visible shield, and a safe retry when no candidate is valid. Keep a separate clock that pauses with the game.
3. Add score and clock HUD, full real winner/time/draw After Action fields and mode-specific NEXT MATCH. Existing outcome screenshots and Quick Play settings must not be lied to.
4. Deterministic unit, 300+ connected seed checks and 50+ bot matches per preset; headless Chromium real gameplay 740×360/915×412/1280×720 and Android debug APK/unsigned AAB; owner natural phone acceptance.
5. Extend the SAME scored engine to vehicle FFA [#37](https://github.com/PlayerEden/Ricochet-Rumble/issues/37), then honest balanced TDM [#36](https://github.com/PlayerEden/Ricochet-Rumble/issues/36). Keep old finite-life Survival; later build Custom Match [#38](https://github.com/PlayerEden/Ricochet-Rumble/issues/38) against *validated* ruleset IDs and actual supported score ranges.
6. Do not merge the dependent prototype branches into stable `main` without deliberate dependency-aware integration and user real-Android acceptance. Current [#35](https://github.com/PlayerEden/Ricochet-Rumble/pull/35) remains open/draft and latest Android v0.9.25 is preserved.

**QA evidence:** Record actual CI run URL/SHA and result here once verified, distinguish between pure rules tests and live browser/phone tests.

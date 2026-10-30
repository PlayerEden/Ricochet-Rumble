# Sector Rebound — v0.9.51 Corridor-Aware Vehicle Recovery Prototype

**2026-10-30 · Experimental gameplay change on isolated draft [PR #80](https://github.com/PlayerEden/Ricochet-Rumble/pull/80).** This is the first real-game implementation after [3,000-map fairness baseline](MAP_FAIRNESS_BASELINE_v0950.md) and [3,000-map hypothetical garage A/B](RECOVERY_PLACEMENT_AB_v09501.md). Parent [draft #79](https://github.com/PlayerEden/Ricochet-Rumble/pull/79) is the byte-accurate gameplay rollback point. Stable `main` runtime is **not merged or modified**.

## What actually changed

- Normal `createMaze()`, vehicle count/types, actor initial positions, score mode, tank/mech dynamics, P-03 pilot, menu spacing/audio, camera, combat shells, powerups, LAN protocol and user saves **unchanged**.
- The real `spawnVehicles()` still creates the same seeded garage inventory; **only then** an optional deterministic `corridor-v1` planner may relocate spare sites using actual maze corridor graph shortest-path distance rather than minimap Euclidean distance.
- **Solo:** If player 0 already has a spare within 8 graph cells, preserve the original site. When farther, try moving at most one existing spare to a **4–8-cell walking route**, not a 2-cell instant bail-out. Require wall clearance, 150px distance from occupied actors and other spares, and avoid materially worsening the worst initial seat route. If no safe candidate, retain original location.
- **Scored/two-human:** up to **two** garage relocations, optimizing the longest initial actor-to-spare corridor walk, with non-worsening objective and no trivial spawn within 4 corridor cells of any actor.
- Explicit `recoveryPolicy:'legacy'` invokes the untouched original placement logic for **exact seeded rollback and QA A/B**. This draft branch defaults to `corridor-v1` to produce an experimental actual-game build.
- Web and Android `game.js` are exact mirrors; Android debug metadata code **48**, name `0.9.51-corridor-prototype`. An Android debug certificate may differ from all earlier builds: **CLEAN-INSTALL TEST ONLY**, no safe in-place progress upgrade claim.

## Measured source-level comparisons: ACTUAL new production code vs original

[Test-only actual runtime and full regression CI 41024297470 — SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41024297470), original source+tests SHA `5e66c816dbe148da5038493e68984456ef9432cc`. The test executes the real `initialState()`, `spawnVehicles()` and real maze graph for **1,000 seeds per map size in Solo plus 200 seeds per map size in scored FFA**, comparing `legacy` and `corridor-v1` on identical seeds. All maps and occupied vehicles unchanged, same count/types of spare vehicles, verified safe wall and actor separation, deterministic repeat outputs. Previous scored, save/backup and gameplay smoke checks pass.

| Size | Solo original player p95 (cells) | New Solo p95 | Max original → new | Solo seed layouts changed |
|---|---:|---:|---|---:|
| Small | 10 | **8** | 22 → 14 | 113 / 1,000 |
| Standard | 14 | **8** | 32 → 8 | 138 / 1,000 |
| Large | 15 | **8** | 35 → 8 | 190 / 1,000 |

| Size | Scored worst-seat p95: original | New | Max original → new (200 seeds/size) |
|---|---:|---:|---|
| Small | 13 | **6** | 18 → 10 |
| Standard | 19 | **8** | 28 → 12 |
| Large | 29 | **12** | 42 → 15 |

**Engineering and design caveats:** These are cell graph path lengths, not seconds to actually reboard or subjective difficulty. Small-map candidate constraints prevent some outliers from hitting the 8-step target. The worst-seat metric includes all actors/bots, not a controlled two-human Wi-Fi match. Actor/pilot ejection timing, route visibility, active enemy fire, real network latency, physical Android FPS and player's preferred risk/reward **have not been physically tested**. This experiment does not prove competitive balance or justify a mainline merge.

## QA gates / integration decision

- **PASS:** actual 3,600 seeded live-game placement A/B; deterministic legacy rollback; previous gameplay, score/save and Web/Android parity regression.
- **FULL QA:** [Chromium + Android debug APK + unsigned AAB run 41024682060](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41024682060) (verify final conclusion before calling it passed). First run 41024532107 failed because generated workflow encoded a shell command separator literally as `\n`; this was corrected in full QA workflow. This failure was in test orchestration, not source gameplay.
- **Manual phone PENDING:** compare classic vs new garage distances after pilot ejection; ensure player must still traverse meaningful danger, spare navigation indicator points to a reachable route rather than misleading straight line; no unintended easy KOs or unfair vehicle access.
- **Still independent release P0:** same-cert Android data-safe updates, 2-phone LAN input parity/connection, long-session performance, Play signing/policy.

**Decision:** retain **draft / isolated test candidate** until reviewed, do not merge PR #80 or ancestor stack into `main`; preserve owner-locked P-03/UI and v0.9.48 responsive layout. No player-facing polishing or new vehicle types were introduced.

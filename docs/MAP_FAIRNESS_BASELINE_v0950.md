# Sector Rebound v0.9.50 — Procedural fairness audit (3,000 real maps)

**Executed 2026-10-30** as the next work package in [owner-approved development plan](DEVELOPMENT_EXECUTION_PLAN_POST_AUDIT_2026-10-30.md) and [tracker #76](https://github.com/PlayerEden/Ricochet-Rumble/issues/76). **Status: engine/source invariants PASS; competitive spawn/recovery fairness NEEDS targeted design review.** No game logic, art, movement, generator, Web/Android assets, saved data, or release signing was changed.

## Reproducible source, CI, artifacts
- [Focused tests-only draft PR #78](https://github.com/PlayerEden/Ricochet-Rumble/pull/78) child of [v0.9.49 source-baseline PR #77](https://github.com/PlayerEden/Ricochet-Rumble/pull/77). Original audited game source is inherited from v0.9.48 integration candidate, with no production changes. Exact second, refined test SHA `327501703c0eb68a6029ee7452886511ebac895b`.
- [Automated GitHub Actions run 41022666945 — SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41022666945). Script `tests/map-fairness-v0950.mjs --seeds=1000`, actual engine `createMaze()` + `initialState()` + `spawnVehicles()` + actual LOS routine via a VM fixture hook. Generated **1,000 seeds for each 9×6, 13×9 and 18×12 map**, 3,000 in total, plus **all seed replays**, unique fingerprints per size, edge symmetry and full reachable graph per seed, all 4 actor starts and at least one reachable spare vehicle. Scored match/saves/smoke regressions and Android/Web JS/CSS source parity also PASS.
- Artifact `map-fairness-v0950-41022666945` contains complete **seed-records.json** (every seed), **summary.json** (distributions and example problem seeds) and **potential-outliers.json** (358 flagged size-relative / initial exposure observations). GitHub Actions artifact has limited retention; **this permanent report preserves substantive findings and repeatable seed examples**.
- **Important:** structural correctness is not a verified player-fairness or balanced PvP verdict; no human phone sessions were run. Distances are **open-corridor cell steps**, not straight-line pixels, seconds, or measured player route times.

## What we measured

| Real source metric (1,000 seeds/size) | Small 9×6 | Standard 13×9 | Large 18×12 |
|---|---:|---:|---:|
| Connected, uniquely replayable topologies | 1,000/1,000 | 1,000/1,000 | 1,000/1,000 |
| Median dead-end cell percentage | 9.26% | 7.69% | 6.94% |
| Median additional graph cycles | 6 | 15 | 30 |
| Initial actor-to-actor direct LOS exposure (% maps with ≥1 exposed actor) | **11.1%** | 1.7% | 0% |
| Median player-to-nearest-spare path | 4 cells | 4 cells | 4 cells |
| 95th percentile player-to-nearest-spare path | 10 | 14 | 15 |
| Longest player-to-nearest-spare path | **22** | **32** | **35** |
| Median gap between shortest/longest actor recovery path | 4 | 8 | **13** |
| 95th percentile recovery-path gap | 10 | 16 | **24** |
| Minimum spare vehicles per map / any free mech | 3 / 100% | 3 / 100% | 3 / 100% |

**Seed-based replay examples for future visual/physical checks:**
- Player-to-spare long corridors: **large seed 375 = 35 steps**, **large 671 = 34**, **large 865 = 34**, **standard 947 = 32**, **standard 529 = 29**.
- Recovery asymmetry across player seats: **large 395 = 44 step difference**, **large 159 = 40**, **large 512 = 36**, **standard 894 = 29**.
- Dense dead ends: **small 991 = 18.52%**.
- These are **case studies / possible outliers**, not automatic bug verdicts. Flags are relative to each size's p95 rather than a single misleading global threshold. 358 flagged rows across 3,000 seeds include initial exposure and elevated travel differences, potentially overlapping.

## Analysis — probable root cause to test

The existing `spawnVehicles()` populates a small set of unoccupied vehicles by shuffling cells and placing an early spare at **Euclidean distance less than 440 pixels** from local player 0, followed by others distributed farther away. This yields apparent proximity on the minimap but can place a garage down a winding disconnected-looking *route* in a connected maze. That explains the plausible long-path cases and seat-dependent access; the audit does not separately prove cause for every extreme seed.

**Important distinction:** User-approved procedural map diversity is functioning. This is not a reason to replace the random maze generator, automatically discard many seeds, add wall destruction, or force maps to be symmetrical. Also, the gameplay intentionally centers solo player 0's recovery access; balancing 1v1/PvP seats requires a separate mode-specific choice. There is no externally validated fairness threshold yet.

## Suggested next **test-only** design experiment before runtime changes
1. Compare *current* Euclidean “near vehicle” selection to a **graph-distance-aware selection** using the **same seeds**. Keep same number of spare vehicles, maps, game physics and vehicle art. Record median, p95, max and seat imbalance across all sizes.
2. Compare at least two bounded alternatives: (A) guarantee one spare within ≤N **actual corridor steps** of starting player in Solo only, vs (B) distribute spare opportunities near each competitive side where capacity permits. Use count/vehicle spacing constraints, not free vehicle teleportation through occupied actors.
3. Inspect the worst seeded replays physically/visually; verify no garages inside walls/actors, no exploitably instant reboard, and no unwarranted first-seat advantage.
4. Only if improvement is meaningful, propose a minimal **separate** `spawnVehicles()` change and rerun exact 3,000 seeds, 24+ scored simulation cases, prior tests, Chromium/Android and owner feel checks; preserve the old generator and tested APK as rollback.

## Remaining gaps and release decision

- Pure graph metrics cannot prove ricochet shooting angles, wall bank-shot quality, late-round respawn fairness, opponent dynamics, pickup placement under combat, or actual two-device PvP. Those need their own tests.
- **Automated source integrity: PASS.** **Map quality / competitive fairness: P1 investigation OPEN.** **Game release: still NO-GO** for independent P0 signing/save/device and LAN gates.
- [v0.9.49 measured controls](CONTROL_FEEL_BASELINE_v0949.md): Survival tank nominal 222 vs scored 166, physical player A/B pending. Don't silently alter speeds, turns, pilot, visual design, maps or LAN as part of the audit.

# Sector Rebound v0.9.50.1 — Vehicle recovery placement feasibility A/B

**Date:** 2026-10-30. **Status: test-only comparison PASS; no runtime change authorized, no physical gameplay fairness proof.** This expands the [original 3,000-seed map fairness audit](MAP_FAIRNESS_BASELINE_v0950.md) and is a Phase C development checkpoint under [tracker #76](https://github.com/PlayerEden/Ricochet-Rumble/issues/76).

## Exact original source / evidence
- [Draft source-only comparison PR #79](https://github.com/PlayerEden/Ricochet-Rumble/pull/79) child of [map audit PR #78](https://github.com/PlayerEden/Ricochet-Rumble/pull/78). Exact tested SHA `9cb83bcf199c50df4ec8f6874c0d0b42c9b9a004`.
- [Independent GitHub CI run 41023080678 — SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41023080678). Test: `tests/recovery-placement-ab-v09501.mjs --seeds=1000`; real original `initialState()/createMaze()/spawnVehicles()` in a VM, **same 1,000 seeds per map size as the baseline**, then compare two simulated reassignments of the same three unoccupied tank/mech vehicles. Artifact `spare-recovery-ab-v09501-41023080678` holds all 3,000 rows, per-size summaries and extreme replay seeds, retained for 30 days by GitHub.
- Both hypothetical policy variants honor the tested **static wall clearance**, keep initial occupied tank positions untouched, preserve 150px separation from occupied actors / other spares and preserve all three spare types/total count. They are **not** live gameplay implementations and do **not** validate actual ejected pilot entry, AI movement, PvP control, FPS cost or full contact fairness.

## Experiment definitions
- **CURRENT:** unmodified original game, the same baseline from v0.9.50. Its early spare placement favors a Euclidean neighborhood around local player 0, which may hide a much longer actual corridor route.
- **SOLO-NEAR:** allow relocating **at most one** existing spare to reduce player 0's path length, subject to static deployment spacing. Does not guarantee equal recovery chances across other seats.
- **SEAT-BALANCED:** local search relocates up to three existing spares (no extras), minimizing the longest nearest-spare corridor distance among all four actor starts. Uses a weighted maximum-and-sum proxy; it is **not** a fairness guarantee and may move the closest vehicle farther from player 0.

Distances are **shortest-path grid cell steps**, not seconds or actual walked routes during combat. Vehicle recovery in real play includes hostile fire, collision footprint, deployment entry feasibility and perception.

## Measured side-by-side results — 1,000 seeded layouts per size

| Map size | Current player 0 spare path (median/p95/max) | SOLO-NEAR (median/p95/max) | SEAT-BALANCED (median/p95/max) |
|---|---|---|---|
| Small 9×6 | 4 / 10 / 22 | **2 / 2 / 2** | **2 / 4 / 6** |
| Standard 13×9 | 4 / 14 / 32 | **2 / 2 / 2** | **2 / 6 / 9** |
| Large 18×12 | 4 / 15 / 35 | **2 / 2 / 2** | **2 / 9 / 16** |

| Map size | Current **worst seat** spare access (median/p95/max) | SOLO-NEAR | SEAT-BALANCED |
|---|---|---|---|
| Small | 7 / 13 / 22 | 4 / 6 / 8 | **3 / 4 / 6** |
| Standard | 12 / 20 / 32 | 7 / 10 / 16 | **6 / 8 / 12** |
| Large | 16 / 28 / 46 | 9 / 14 / 19 | **8 / 11 / 16** |

| Map size | Original gap between best/worst seat (median/p95/max) | SOLO-NEAR | SEAT-BALANCED |
|---|---|---|---|
| Small | 4 / 10 / 20 | 2 / 4 / 6 | **1 / 2 / 4** |
| Standard | 8 / 16 / 29 | 5 / 8 / 14 | **4 / 6 / 10** |
| Large | 13 / 24 / 44 | 7 / 12 / 17 | **6 / 9 / 14** |

**Caveats / tradeoffs:** SOLO-NEAR improved player 0 in **79%, 85.7%, 86%** of maps respectively, but makes the nearest vehicle exactly two cells away across this model. That may remove the meaningful vulnerability of being forced on foot, so it is not automatically the best *game*. SEAT-BALANCED improved worst-seat access in **97.1%, 98.6%, 99.7%** of maps, but worsened **player 0's** current recovery path in **8.7%, 12.8%, 14.7%** respectively—an expected tradeoff when treating all seats equally. The original game has different Solo vs LAN goals; equal fairness is more important for future competitive modes than solo Bot Survival.

## Recommended decision, not an unauthorized game change
**A controlled balanced-vehicle deployment prototype is worth testing,** particularly for later competitive host/guest parity. Do NOT blindly replace the accepted `spawnVehicles()` with the test planner: 3-swap optimization can add spawn processing work; 2-step instant solo recovery can trivialize pilot ejection; and generic spatial checks do not model full gameplay.

**Next isolated implementation proposal (requires review as a gameplay change):**
1. Build a **bounded, deterministic, testable graph-aware candidate picker** that preserves existing spawn seed, vehicle count/types and physics. Initially set a modest path target (e.g., aim for ≤6–10 cells instead of always exactly 2), with explicit separate Solo vs competitive recovery rules.
2. Test seed 375/395/947 and 1,000 additional unseen seeds per size; compare old vs proposed **real game spawned** spare locations, actual entry clearance, bot navigation and match dynamics. Benchmark generator time/frame budget in Chrome/Android.
3. Gate with 24+ additional match simulations, full smoke, browser/Android QA and owner verdict on whether pilot vulnerability still feels meaningful. Rollback uses original `spawnVehicles()` source from the preserved PR #74 / #71 lineage.
4. Do not merge through the existing draft dependency chain or call this a Google Play-ready change. Android signed upgrade, two-phone LAN and physical control A/B remain independent P0/manual gates.

**Bottom line:** Procedural generation is structurally reliable in the tested conditions, but recovery access can be strongly improved in a mathematical placement experiment. The better choice is a **moderate balanced policy**, not immediate universal closest-vehicle placement, and it still requires real gameplay validation.

# Sector Rebound — CTF Multi-Seed Reliability + Defender Corridor Recovery (2026-11-01)

**Result:** automated QA and full existing regression PASS. **Experimental, not approved for merge / Android release.**
Tested source: `23dc5cbc6b9d4136fb69238c35d8f0325cefd02e` (gameplay change `ee5fe78a4fa2e2f910bbb4c80a5a47141f0f2929`).
Latest [passing full 18-seed + regression CI 41291383897](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41291383897) and
[full JSON telemetry / screenshots artifact 13077183851](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41291383897/artifacts/13077183851).

## Why this checkpoint exists

The earlier CTF Objective AI browser test used accelerated flag distances, and the subsequent three-seed natural audit revealed the initial runner/defender corridor collision. The [18-match baseline workflow 41290365945](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41290365945) then confirmed that on seed 103, the runner could be alive yet creep only a few world units for **252 seconds**, blocked by the physically colliding Coral defender. Seed 106 similarly stalled for **181 seconds**. Each sample used genuine 60Hz `step(1/60)` physics and no actor relocations.

We compared three **same-seed** versions without changing shooting accuracy/damage, flag rules, actor collisions, bot speed or LAN:

1. **Baseline:** previous natural traversal and right-hand passing, branch `experiment/ctf-multiseed-reliability-v1`, [CI 41290365945](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41290365945), [telemetry artifact 13077525858](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41290365945/artifacts/13077525858).
2. **Defender off-lane holding point:** pure CTF AI selects a point 72% of the way from its Forward Bay toward the second open entrance; defender closes to 34 units of that target instead of holding within 95 of the central flag position. This preserves an ordinary reachable defense station away from the typical capture path; `experiment/ctf-defender-lane-clearance-v1`, [CI 41290880269](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41290880269), [telemetry artifact 13077237609](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41290880269/artifacts/13077237609).
3. **Off-lane + defender physical stall recovery:** only if a live Coral runner within 90 units has been stalled for more than two seconds does its defender attempt a bounded, wall-checked, line-of-sight side step staying within 165 units of the home bay. This uses existing pathfinding/movement and never phases through an actor. Branch `experiment/ctf-defender-stall-recovery-v1`, [CI 41291383897](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41291383897).

## Matched 18-seed results (6 per map class, complete 360s clock or legitimate target)

| Metric | Previous navigation | Off-lane position | Off-lane + stall recovery |
| --- | ---: | ---: | ---: |
| All matches where Coral picks up flag | 18/18 | 18/18 | **18/18** |
| Matches with >=1 real capture | 14/18 | 17/18 | **17/18** |
| Matches with 3 real captures and Coral victory | 10/18 | 12/18 | **13/18** |
| Small map: 3-capture victories | 4/6 | 4/6 | **5/6** |
| Standard map: 3-capture victories | 5/6 | 5/6 | **6/6** |
| Large map: 3-capture victories | 1/6 | 3/6 | **2/6** |
| Small map: longest observed runner stall | 252s | 7s | **7s** |
| Standard map: longest observed runner stall | 84s | 165s | **84s** |
| Large map: longest observed runner stall | 85s | 82s | **85s** |

The latest recovery prevented the off-lane candidate's **seed 205** regression (165s -> 3s stall, 2 -> 3 captures). It preserved all six large-map seeds reaching at least one capture, but one seed that had three captures in the off-lane-only candidate achieved one capture with recovery, so the change does **not** dominate on every map. Small seed 106 still fails to capture, and standard 202 and large 306 retain ~84-85s observed stalls. These are genuine known limits, not hidden or treated as passing tactical outcomes.

## QA gates satisfied

- Actual 18 full-clock or legitimate-first-to-three matches in Chromium with four actor seats, real Forward Bays, physical bot movement, shooting, actor-wall collisions, flags, pilots and scoring; safety invariants and no non-respawn frame teleports.
- 18/18 valid game state, all results populated; no invalid bot position or flag-state error.
- Pure flag/AI contracts and Android/Web **byte-identical** `game.js` and `ctf-ai.js`; no native Android APK was built.
- Full prior CTF, Forward Bay (300 maze seeds), Quick Play, first-match, save/restore, stale export, smoke and visual regression suite passed on the same source.
- Measured defender stayed within 180 world units of its bay for all sampled frames in the latest 18-seed cohort. Escort proximity is measured but **not** a tactical acceptance grade.
- Baseline/main, draft integration PR #85, existing user APK Preview 100061, and other gameplay modes have not been merged, released or intentionally changed.

## Boundaries and next proposed milestone

1. **Human-initiated enemy flag theft**: an ordinary automated human-control path (actual vehicle movement, exit and flag grab) is needed to verify Coral defender pursuing, intercepting and returning a real stolen flag; existing pure role contracts test the decision but no current 18-seed idle-human run adequately exercises genuine defense under attack.
2. Target the remaining stalls on standard seed 202 and large seed 306; confirm whether wall clearance or combat/respawn effects explain them before tuning more.
3. Reassess 1v3 role balance when the human actively plays, and eventually 2-player/team CTF; no claims about competitive fairness from a stationary human.
4. Physical Android controls, frame pacing, and 2-phone networking/CTF state replication remain unverified/unimplemented. **No production promotion or signing action.**

**Rollback:** previous accepted CTF natural navigation commit `242458e392cf36a59bfa4484d93bf64c5a06ba01`, or previous full 18-seed comparison branch `experiment/ctf-multiseed-reliability-v1`; off-lane-only isolated branch remains available for strict A/B. The specific improved gameplay code is in `ee5fe78a4fa2e2f910bbb4c80a5a47141f0f2929`.

Protocol: isolated implementation -> targeted seeded diagnosis -> matched A/B -> full legacy regression -> explicit evidence and rollback -> owner acceptance before release.

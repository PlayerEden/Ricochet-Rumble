# Sector Rebound — Input-Driven Armed CTF Attacker Audit
**Date:** 2026-11-02
**Scope:** test-only QA of the existing gameplay; no tuning, Android binary, merge, or public release.
**Parent:** `test/phase2-combined-owner-2026-11-02` at `465086aab092381bfe13bc13b237525a7a588f68`.
**Branch:** `audit/ctf-armed-attacker-v1`.
**Rollback:** parent commit above. Stable `main` and owner Preview v0.9.65 remain unchanged.

## Gap identified
The earlier [input-driven human CTF audit](CTF_CONTESTED_HUMAN_ATTACK_2026-11-01.md) successfully stole four enemy flags and confirmed defender/escort objective decisions, but its scripted human set `fire:false` on every frame. Four observed attacks produced **zero human captures** and were unsuitable evidence about combat balance or successful armed escapes. A passing bot objective simulator does not establish that CTF feels winnable for a person.

## Implemented test-only changes
In `tests/ctf-contested-human-attack.mjs`:
- Keep the same four seeded real maze contests: small seeds 101/102/104 and standard seed 201, at most 180 simulated seconds each.
- Navigate using ordinary directional inputs and EXIT/ENTER interactions. Do not warp actors, shorten routes, extend lives, bypass collisions, or modify flag state.
- Use a cautious, narrow approximate phone-screen rectangle plus actual wall line-of-sight to select **only opposing live bots** (Coral seats 1 and 3, never Cyan escort seat 2). This deliberately isn't a perfect camera model or human perception.
- Supply ordinary independent aim vectors and intermittent one-frame FIRE pulses only when physically aligned and the real game cooldown permits. Actual engine `tankMove`/`shoot` handles bullets, damage, bounces, hitboxes, armor and score.
- Record actual `shot` events owned by the human, aim opportunities, human KOs/deaths, first pickup, defender interception decisions, physical travel while carrying, nearest defender range, scores and objective events.
- Preserve the old rules-based assertions, and additionally require at least one visible-line-of-sight aiming opportunity and one successful legal human shot across the four fixtures.
- Run existing CTF, Forward Bay, match loop, backup and responsive visual regression checks. Test source and Android embedded assets must match exactly.

## Acceptance interpretation
**Automated workflow:** [Contested CTF combat audit](https://github.com/PlayerEden/Ricochet-Rumble/actions/workflows/ctf-contested-human.yml). Check exact branch SHA and terminal run result before claiming a pass. The new run was observed in progress after code commit `8e4698f5c89e74f80ed5b7b23158c002c7dc3e58`.

A pass proves that a scripted attacker can move, legitimately fire, steal a flag, and provoke objective decisions without test-injected health/position/flag changes. **It does not prove a human can score a capture, that optional visual targeting matches real mobile perception, that bot strategy is balanced, or that two physical phones work.** Record actual attack/escort effectiveness; do not secretly improve player stats merely to make the test green.

## Next decision gate
1. Inspect the complete match JSON and compare old unarmed observations with the armed trial, identifying how often the attacker gets valid firing opportunities and whether these shots materially change survival or return routes.
2. If the attacker can't fire, distinguish a too-strict test planner from a genuine physical shooting defect before any gameplay change.
3. If the human can fight but cannot ever bring a flag home, investigate defensive lane positions, escort distance and time to escape; use matched-seed A/B evidence and targeted regression before tuning.
4. After a justified change, retain the old seeded fixtures as a control and seek a physical Android owner test. No merging to stable `main` or Play publication without approval.

## First armed-only experiment — actual result (verified)
[Real browser/CTF/Forward Bay/Quick Play/visual regression run 41503619118: SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41503619118), tested source `8e4698f5c89e74f80ed5b7b23158c002c7dc3e58`, artifact `13169597652`.

| Seed | Human shots | Human KOs | Human deaths | Human captures |
|---|---:|---:|---:|---:|
| 101 small | 2 | 1 | 0 | 0 |
| 102 small | 4 | 2 | 0 | 0 |
| 104 small | 57 | 44 | 1 | 2 |
| 201 standard | 15 | 9 | 0 | 3 |
| **Total** | **78** | **56** | **1** | **5** |

The attack script uses instant perfect enemy coordinates for every currently visible candidate, zero reaction delay, and parallel movement/aim; it is **not a representative novice or expert human**. The 44-KO case is a warning not to infer normal difficulty from this test. Previous unarmed tests were on an older checkpoint; comparing historical values without controlling the source is confounded.

## Second-phase controlled A/B (test-only)
A follow-on source commit `474ef3e649124a643eb198e2c1aaf5cf4d24521e` now reruns the same four seeded maps in three controller profiles: (1) no firing, (2) precise existing controller, and (3) conservative controller requiring 0.34s continuous visibility, 0.30s target-position sampling, up to 0.065rad deterministic aim imprecision and at least 0.78s between input FIRE pulses. Every profile uses the same movement route planner and unchanged game engine. Results are observational, not a claim of causal isolation if other game-wide pseudorandom inputs diverge. The exact-head GitHub run must finish before reporting these results as successful.

No gameplay/Android asset changes; retain the parent stable/test build. If comparative results show unreasonable KOs, do not artificially nerf bots or grant player stats without physical owner feedback and further matched-seed evidence.

## Matched three-profile first run — verified (pre-cooldown-reset)
[All source and visual regression checks PASSED, GitHub Actions #41505975410](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41505975410), source `474ef3e649124a643eb198e2c1aaf5cf4d24521e`.

| Input controller | Successful scenarios with pickup / 4 | Shots | KOs | Human captures | Deaths |
|---|---:|---:|---:|---:|---:|
| Unarmed | 3 | 0 | 0 | 5 | 8 |
| Precise aiming | 2 | 76 | 53 | 4 | 2 |
| Reaction-limited | 3 | 53 | 28 | 9 | 4 |

Same four fixed seeds and movement goal logic, but this first paired script did not reset the preceding match's residual fire cooldown. Latest branch commit `521eb1541771481257529c80c3c4754bd1ae4d8b` explicitly resets it, matching `newMatch()`; **use that exact follow-up CI for any final A/B verdict**.

### Immediate diagnostic flags
- **Seed 102:** zero pickups and zero deaths for all three controllers; just 382–428 units of total human travel with 721–773 units remaining to the enemy flag. This is consistent with a noncombat movement/route obstruction in the scripted test, not evidence that bot weapons are too powerful. Instrument physical wall/actor proximity, selected grid waypoint, blocked movement attempts and stick/stall state next.
- **Seed 101:** unarmed and conservative controllers each secured three captures; the precise controller stalled after ~190 units of movement. This suggests constant exact aim coupled to movement/turning can degrade navigation, rather than perfect aim necessarily improving match success.
- **Seed 104:** precise controller achieved 44 KOs; conservative did 9 and unarmed zero. Do not set any official difficulty expectation or buffs from these scripted outcomes.
- **Four seeds are far too few** for win-rate or balance inference. Results also reflect the input planner and controlled physics state; no owner Android validation.

**Decision:** No AI damage, player hitbox, fire accuracy, ejection, respawn, map or vehicle spawn gameplay changes authorized by these observations. Run the corrected exact-head comparison; then create a single-purpose seed-102 bottleneck diagnostic with genuine collision and navigation traces before deciding to adjust production CTF.

## Definitive corrected exact-head comparison — PASS

[GitHub Actions #41506332651 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41506332651), exact test source `521eb1541771481257529c80c3c4754bd1ae4d8b`. The CI passed the paired 12 live engine matches, prior CTF/Forward Bay/Quick Play, backup, visual/browser and Web/Android mirror checks. Unlike the previous paired run, all controller profiles begin with fresh weapon cooldowns and empty queued release shots, matching real `newMatch()`.

| Controller | Enemy flag pickups (out of 4 seed cases) | Actual shots | Total player KOs | Total human captures | Deaths |
|---|---:|---:|---:|---:|---:|
| Unarmed | 3 | 0 | 0 | 7 | 5 |
| Precise | 2 | 42 | 19 | 5 | 2 |
| Reaction-limited | 3 | 49 | 24 | 8 | 3 |

**Not human win rates** and not a representative difficulty estimate. Same seeded fields, but bot engagement and exact simulation outcomes are sensitive to the scripted input path and timing.

- **Seed 102:** all profiles failed to reach the enemy flag, while registering **zero player deaths**. They traveled only ~382–428 world units and remained at least ~721–773 units from the enemy flag. A route planner/physical obstruction diagnostic is now the priority.
- **Seed 101:** unarmed and reaction-limited each captured three flags, but precise fire became navigation-stalled after ~163 units. Constant precise aiming can interfere with the scripted steering/path goals.
- **Seed 104:** all three profiles achieved three captures, while the precise firing profile generated nine KOs rather than the previous non-reset case's 44; reset semantics materially affected the result.
- **Seed 201:** unarmed captured once, precise twice, conservative twice.

**Engineering decision:** do **not** nerf bot weapons or buff pilot sidearms based on this. Isolate seed 102 with movement/waypoint/wall/actor diagnostics first. Real Android player acceptance is still outstanding. This branch and PR are not a gameplay release.

## Seed 102 obstruction instrumentation (test-only, pending exact run)

Source commit `10b67e9f9cd622d3b250b43528268081cd1a5b5b` adds capped snapshots on persistent script-navigation stalls: actual operator position, head angle versus desired direction, maze cell/goal/next waypoint, distance to flag, blocked 35-unit probes in four directions, blocked forward path, and nearest live actor distances/teams. It never changes AI selection, bot shooting, engine state, physics, pathfinding, lives, scores or Android runtime. Stalled movements are recorded per test profile inside the existing same-seed JSON and structured CI logs.

[Exact-source validation workflow](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41507307186) started after commit; **wait for terminal QA status and inspect matched seed 102 traces before design changes**. If multiple adjacent walls block the selected waypoint, diagnose test path planner vs generator topology; if the nearest live teammate/defender occupies the lane, compare real CTF yielding and operator push-away control without collision bypass. Owner device acceptance remains pending.

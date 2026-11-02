# Sector Rebound — A3 bounded AI trajectory acquisition (experimental)
**Date:** 2026-11-02. **Branch:** `experiment/bot-trace-aim-a3-v1`, directly based on accepted **A2** physics source. **Release state:** test-only; not merged and no Android APK yet.

## Goal and implementation
Owner reports that bots instantly find angles while humans struggle to line up a shot. AI must use the same real physical bullet trajectory as the player, respect the same pilot movement/aim turning limits established in A1, and commit before the player can dodge.

1. New `botTraceAim()`: starts with the truly observed direct target bearing (deterministic, skill-dependent wobble), then for tank/mech optionally examines a small fixed set of plausible one-wall reflection bearings derived from local maze wall geometry, maximum **seven** paths. On-foot pilot sidearms have **no bank-shot candidates** because sidearms do not currently ricochet.
2. Calls the side-effect-free A2 `traceProjectile()` to check whether a candidate path intersects an eligible enemy at the currently observed location or the **last truly observed position** when target LOS is lost. The latter never reads the unseen actor's present coordinates to choose a shot. A dead-end/no-shot result causes a bounded retry interval (Casual .75s / Normal .52s / Spicy .38s), never brute-force computation every frame.
3. `botFireCommit()`: stores a chosen heading **once per firing cycle**, and only fires after skill-dependent acquisition plus actual body rotation within the existing angular alignment threshold. Target motion after commitment does NOT lead to continuously updated aim or retroactive projectile cancellation. Existing aim/recover cooldown and ammo caps remain.
4. During genuine LOS, the bot records current target position and target kind. A short (up to .85s) last-sighting buffer can enable a *speculative* bank shot after cover breaks; it must also obey the existing Solo off-camera no-fire fairness rule. Exact current locations behind walls are not fed into candidate generation.
5. Keeps current enemy amber acquisition ticks and live muzzle flashes; allied visible traces and friendly-fire rules are **not yet implemented** (next B phase). Host remains authoritative; no LAN packet/schema changes. Source mirror required.
6. Skill affects the **planning cadence** and the prior small deterministic angle wobble, not projectile speed, teleportation, armor, bot-only turn rate or hitbox radius.

## Known limitations / risks to measure
- The current candidate generator samples direct fire and at most six nearby wall reflections. It may miss trick shots and should not be mistaken for a complete bounce-angle solver. One-bounce only in A3; no full-map solution.
- The A2 physics tracer creates path samples, so CPU/time budget and no-frame-loop over-evaluation are critical on Android. Verify retry timer and total traces per bot; no candidate may be reevaluated on every game tick merely because no shot is possible.
- Static-target trace is not a guaranteed hit against a moving opponent. A bot may fire an accurate intended shot which misses because the opponent moves after commitment—this is **desirable**.
- Existing bot movement and CTF pathfinding are unchanged. New shot selection may alter combat outcomes; scripted CTF win totals are not evidence of a human-balanced game. Check that AI doesn't become strangely passive in near-wall fights.
- Actual friendly-fire policy, team-facing colors, LAN squads and randomized FFA/solo sides remain scheduled stages B–D; no silent scope creep.

## Acceptance tests
- Real Chromium bot-shot fixtures for pilot/tank/mech × Casual/Normal/Spicy × two Android-like screen dimensions; verify first-shot reaction delay, actual shots, recovery spacing, target-kind changes, off-camera suppression and no invalid headings.
- New per-shot checks: up to seven candidates, direct near-target alignment, same committed heading after target moves, no immediate first-frame fire.
- A2 muzzle, substep, bounce and friendly/enemy hit parity tests; inspect whether actual shot trajectories match intended trace.
- Real seeded CTF and FFA/CQC/TDM encounters; full 300 Forward Bay seeds, Quick Play and 44 visual snapshots, saved progress and backup. Browser/Android `game.js` byte parity.
- CPU acceptance: bounded candidate count and plan refresh rate, no pathological frame-time spikes. Physical Android performance remains an owner test.
- Create new update-compatible test APK only after whole-game CI green and a separate Android signer/artifact verification. Do not alter stable main or previous signed v0.9.67.

## Rollback
Parent branch `experiment/trajectory-physics-core-a2` keeps the already audited shared bullets/dotted trace with old AI direct-aim commitment. v0.9.67 installed APK remains the owner fallback; a version-code downgrade cannot be assumed safe.

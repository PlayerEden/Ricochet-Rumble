# A2 design audit — trajectory truth before bot behavior changes
Date: 2026-11-02. Scope: inspection of the real browser/Android mirrored game engine at A1.

## Current implementation findings
1. **Actual fire**: `shoot(owner)` starts at the local rotated physical pilot muzzle (up to `PILOT_MUZZLE_X=28`, `PILOT_MUZZLE_Y=2`) or a projected tank muzzle (14–34 units). It sets sidearm speed 475, lifetime .82 s; tank 415 / 2.55 s; mech 355 / 2.05 s (rapid power changes shell life), active cap/cooldown per actor.
2. **Real flight**: projectile `step()` splits each frame to max ~5 coordinate units, applies wall collisions to x then y independently, terminates sidearm upon wall, reflects shell x/y, and handles bumper redirects, finite bounce count, shields, actual target radius and body-hit/life rules. A ricochet can self-hit under existing self-bounce conditions.
3. **Player dotted preview**: `previewTrajectory` uses 4-world-unit increments, sample range 245 for pilots / 520 for vehicles, **at most one reflected segment** plus a short after-bounce continuation (235 units). It samples muzzle and walls and bumpers but not actor hitboxes, target shields or all real projectile lifetime/bounce sequences. It was intentionally designed as a limited aid, not a perfect prediction; divergence must be quantified before sharing it with AI.
4. **Bot firing**: `botInput` builds a pursuit target from visible opponents and local/LOS rules; it hard-gates shots with `hasLineOfSight()` to the target and max 385 range on maze maps. `botFireCommit` stores a *single* slightly noisy direct-target bearing per shot, uses skill-dependent acquisition delays and real aim turn, and commits only within .095 rad angle tolerance. **It currently cannot select a deliberately banked shot** when direct LOS is blocked. It also has privileged exact-coordinate direct-target access while visible: future A2/A3 must intentionally bound this.
5. **Fairness**: A1 fixed one independent physical turn asymmetry (AI non-aim walking up to 12 vs human 6.5 rad/s). Existing shot cooldown/hit radius are shared, and bots already pause between shots. Other concerns (decision precision, same-shot projectile paths, unfair LOS use, overheated bot pathfinding) remain separately unverified.

## A2 proposed architecture and test ladder
- Create one **pure or explicitly state-parameterized** deterministic projectile simulation, independent of the player's canvas. Inputs: shooter position, current vehicle/foot, direction, projectile type, walls, bumpers, collision targets, shooter team, map bounds and maximum range/lifetime; outputs: ordered segments, bounce points, first impact (wall, target, self), predicted damage candidate and failure reason. No actor mutation or sound/FX from preview evaluation.
- Reuse **exact muzzle projection** and wall/bounce helper logic where safe, without altering real bullets until independent old-vs-new projectile comparison passes. Avoid copying and diverging collision code between browser and Android.
- Keep separate **renderer policy** (player dots intentionally short; optional local allied traces visually restrained) from **simulation truth**. Even if the evaluator knows farther geometry, bot AI cannot query hidden target positions or a full-map guaranteed angle solver; acquisition and visibility gates must still be real.
- Candidate generation: current forward line, direct observed bearing, then a limited angular neighborhood / one-wall reflection candidates; check 1–2 bounces only after measured performance. Compute periodically rather than every simulation frame, and retain one candidate until shot is fired or a true reacquisition event occurs.
- Friendly fire OFF/ON will later determine whether a teammate counts as a damageable projectile intercept in the **actual projectile hit** routine. A2 traces can classify teammates but must not yet change collision or damage. Friendly actor movement AFTER firing is never a cancellation condition.
- LAN: authoritative host evaluates bots; guests only render explicit, bounded intent packets if allied preview is enabled. Never let guest recompute secret bot targeting from duplicated world authority or expose through-wall position.

## Acceptance metrics
- Exact known walls: centerline vs corner/grazing projectiles; shallow-angle bank, x/y diagonal, and bumper normals; sidearms terminate at cover, not bounce.
- Shot range: one sustained projectile of each unit type with no collision vs sample trace; ensure trajectory and finite lifetime agree.
- One-bounce and multi-bounce: distinguish *rendered hint truncation* from true endpoint; never falsely promise a rebound past the actual projectile bounce limit.
- Actor interactions: pilot vs tank radius, shield, self-ricochet, friendly pass-through bodies (regardless FF; projectile policy separate), enemy body stops, parked tanks non-cover and future friendly-fire behavior.
- Precision: trace intersection of a `target` means a real projectile hits the expected body on a static target within numeric tolerance; moving target can escape after commitment.
- Latency: measure bounded evaluations per bot per second, Chrome frame-rate on several maze sizes, no GC/per-frame allocations in critical loop, compare game FPS to A1 baseline.
- Visual: local target dot clutter, allied dot fade, first-hit truthful stopping; enemy amber ticks and nearby/offscreen rule unchanged.
- Security/network: no new unvalidated state payload fields, no client-authoritative damage, no hidden target reveal; save data schema unchanged.

## Decision
Do **not** activate AI bank-shot logic or an allied-trace UI during the A1 pilot-rotation regression. Build A2 behind its own isolation boundary after A1 full QA; measure actual vs preview path first. The user explicitly wants **skillful but not magically perfect AI**.

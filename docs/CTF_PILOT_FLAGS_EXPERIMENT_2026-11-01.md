# Sector Rebound — CTF Pilot Flag Prototype (2026-11-01)

**Experimental source branch — not owner-accepted, not installed, NOT MERGED.**

## Player-facing design
- From **Choose Mode → Field Exercises → Capture the Flag**, play offline Cyan vs Coral teams on the same audited two-Forward-Bay procedural battlefield.
- One human on Cyan; three normal combat bots (one ally, two opponents). Objective-aware flag bots are explicitly **not yet implemented**. For this first playable mechanics prototype, **only human actors can pick up/carry/capture** flags. Nearby allies, including bots if on foot, can return their team's dropped flag. This is an intentionally incomplete and asymmetric PvE test, **not balanced two-human CTF**.
- **Pilot on foot only**: approach Coral's flag to take it. Boarding a tank/mech or suffering a pilot KO drops a carried flag. Vehicles remain escorts, cannot carry. A friendly pilot near their own dropped flag returns it immediately; otherwise auto-return after **20 simulated seconds**. The flag is not cover and has no hitbox.
- Return with enemy flag to Cyan Forward Bay **while Cyan's own flag is home**. First to **3 flag captures**, or lead after **6 simulated minutes**, wins. Equal captures at timeout is a **draw**. KOs are still tracked for pilot respawns but **cannot independently win** CTF.
- Live HUD shows flag score and instructions; actual world-space diamonds indicate flags, status and return countdown. Actual after-action shows FLAG TARGET=3 and true capture-based victory/draw. Rematch generates a new procedural maze/base layout.
- CTF is **not** included in regular Quick Play, Custom, LAN, daily progress or Dossier cosmetics. No save migration, new entitlement, network authority, or Play billing change.

## Implementation boundary
- `web/ctf-rules.js` / `android/app/src/main/assets/ctf-rules.js`: deterministic separate capture rules, strict ownership and idempotent death/boarding drops, first-to-three / timed finalization. `tests/ctf-rules.mjs` exercises pickup, return, death/drop, home flag gating, capture, timeout, draw, immutable terminal.
- `web/game.js` and byte-identical Android mirror: opt-in launch, generated Forward Bays, existing tank-to-pilot/KO/respawn path, flag advances after actual physics, collision-free world markers, captured score HUD, frozen end result, normal Dossier isolation. Browser actual gameplay acceptance in `tests/ctf-live-qa.mjs`.
- `web/index.html` and CSS / mirrors: collapsed extra exercise choice, small non-blocking CTF objective hint.

## Independent QA gates
1. CTF pure contract, original Forward Bay **300 seeded** procedural maps and 30 true vehicle/team layouts; actor boarding and death regressions.
2. Actual browser: opt-in launch, pilot exit, flag carry and capture 3x using recorded actual game step (test manipulates actor positions to shorten travel), 360-second tied draw, rematch new map, intact Dossier, normal Quick Play, screenshots at 740×360, 915×412 and 1280×720.
3. Full Daily, Custom bot role, Quick Play, first match, manual backups, responsive tests, Web/Android mirror parity.
4. Real physical Android touch and two-phone LAN later; **never claim physical CTF or competitive balance accepted** until tested.

## Before promoting CTF to release
- Objective-aware bot pathfinding, team balanced flag roles/defense, opponent capture threat, anti-spawn-camp rules, real 2- and 4-player LAN state replication, secure online authority and reconnect.
- Vehicle enter/exit UX, dual human scoring, score/flag minimap, understandable real match pacing, base layout fairness beyond heuristic graph-distance.
- Owner approval and release APK with independently validated signing/upgrade path. Stable main and PR #85 / Preview 100061 untouched.

**Rollback:** The accepted Forward Bay base is commit `71db3e9a0f7469abb661096cb7be2da82fbd369f` on `experiment/forward-bays-foundation-v1`. Keep this experiment on its own branch until targeted AND overall CI are passing.

# Sector Rebound — Phase 2A: Combat Feedback Consistency Audit

**Date:** 2026-11-02.  
**Branch:** `experiment/combat-feedback-parity-v1`.  
**Starting point:** `experiment/combat-hud-shot-state-v1` at `ef6dbb4d37c4682458ea002649bdaa722be6ccd7`.  
**Rollback:** that starting commit; no stable `main` modifications.  
**Owner Android:** v0.9.64 versionCode 260001 remains the last verified install-over APK; this source change is **not** in that APK.

## Focused open-source review

| System | Existing behavior | Finding |
| --- | --- | --- |
| Player trajectory | Dotted world-space path shows one vehicle reflection; pilot sidearm doesn't ricochet | Intentionally preserve established skill/physics. No new auto-aim or bounce changes |
| Physical projectile | Separate readable pilot/tank/mech sizes, colors and movement; shots use actual muzzle and world collision | Keep accepted shot presentation |
| Bot readiness | Three amber ticks are gated on actual bot acquisition, target, line of sight and viewport | Browser-proven in previous v0.9.64 branch, physical phone acceptance still outstanding |
| Ricochet | Local host/solo bounces produce a bounce effect and spatial ricochet SFX | **Defect:** guest spawned the remote bounce particles but did not play any bounce SFX |
| Armor hit | Host's real player receives a short, red damage border and optional 2.3 intensity shake when armor decreases | **Defect:** remote guest heard the armor hit but missed their own red damage border/optional shake |
| Pilot hit | Local and guest have strong 0.58 pulse; local and guest shake at 3.2 when enabled | Existing behavior preserved |
| Ammunition | `READY`, `CYCLING`, `IN FLIGHT` use real cooldown/live-projectile state | Already corrected in previous phase and kept |
| LAN authority | Host sends existing `fxEvents` with event IDs and target; guest rejects stale/duplicate IDs | Preserve wire messages and authoritative score/hit logic |

## Changes

1. Guest snapshot `bounce` event plays the existing short, spatially attenuated `ricochet` cue, respecting `SOUND FX` and the existing per-cue minimum spacing. No changes to bounce timing or geometry.
2. Guest snapshot `armor` event for **target seat 1** now applies the same **0.28 damage border** and **optional 2.3 camera shake** as the host for seat 0. Enemy armor impacts never produce the local player's red damage border.
3. Source and embedded Android `game.js` remain byte-identical. No new UI widgets, permissions, persistent state, sound assets, transport messages, damage, shell caps, projectiles or bot strategy.

## Test gates

- `tests/combat-feedback-parity-qa.mjs` uses the real game script, Chromium, a deterministic host-style valid snapshot, Web Audio API stub and calls `window.RR.nativeMessage` on the guest. Exercises pilot, tank and mech at 568x320, 740x360 and 960x540 with own vs other damage, muted SFX, shake OFF and duplicate packet replay.
- Existing 45 combat-HUD truth fixtures, 27 visibility cues, 18 bot timing cases, 48 touch gesture cases, team vehicle routes, Forward Bays, CTF and full visual regression required.
- **Complete regression PASS:** [GitHub Actions 41469568539](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41469568539), actual gameplay commit `a4923a2ea47f50e82c631b559dd4f9d640279023`. New **42 real guest feedback fixtures** passed across pilots/tanks/mechs and three landscapes; **45 HUD**, **27 cue**, **18 bot cadence**, **48 touch** fixtures, route-fair deployment, Forward Bays, CTF, Quick Play and **44 visual screenshots** all passed. Evidence artifact: `sector-rebound-combat-cues-evidence` (GitHub Actions run). No Android APK was built.

## Known limitations and next quality work

- A bumper strike and a maze wall strike currently share a generic `bounce` remote event. The guest now gets the ricochet cue for each, but the host locally plays a distinct `bumper` tone; distinguishing the two over the wire is a potential separate refinement after this baseline passes.
- Pilot sidearm ends on wall contact without vehicle-style ricochet, by current rules. Do not add pilot ricochets as a cosmetic change; a mechanics decision and sidearm balance test would be needed.
- These checks do not certify real two-phone Bluetooth/Wi-Fi speakers, Android latency, haptics, subjective volume or actual perceived fairness. Owner should test the previous v0.9.64 aiming warnings on a phone before subsequent combined preview acceptance.

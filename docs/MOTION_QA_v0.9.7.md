# Sector Rebound — FIELDGRID v0.9.7 Motion & Combat Readability

**Parent:** v0.9.6 `dev/sector-rebound-visual-qa`  
**Branch:** `dev/sector-rebound-motion`  
**Scope:** actual in-engine motion / UI fixes, no new game modes or balance changes.

## Design goal

Preserve the approved industrial maze and readable top-down geometry, but make motion and combat consequences easier to perceive on a small phone. Keep the game playable immediately, with no extra settings required.

## Changes

1. **Top-down mech gait:** mirrored leg assemblies counter-step based on actual vehicle velocity. Idle vehicles and parked mechs remain rigid and symmetrical. Movement animations do not change collision, speed, turning or networking authority.
2. **Pilot footfalls:** mirrored boots take short opposing strides while moving, returning to neutral at rest. The weapon and body maintain their +X forward axis.
3. **Ejection cue:** destruction produces a brief, expanding world-space ring at the wreck and a fading circle around the pilot. The visual timer is a serialized pilot field; the ring is a host-authored FX event that travels with existing state replication. Pilot immunity and lives rules are unchanged.
4. **Impact readability:** short hit/bounce rings supplement existing sparse particles. No full-screen flashes are added and the camera shake preference remains respected.
5. **After-action screen:** replaced floating win/lose wording with a compact FIELDGRID panel containing clear outcome, winner identity, lives, and hit count. The joystick / Fire controls dim and cannot be pressed after match completion; Play Again stays emphasized and regenerates a field. The host remains the only one who can redeploy in LAN play.
6. **Information priority:** first-time control hint clears when important ejection/kill notices or match results occur, avoiding overlapping messages.

## Not changed

- The game arena rendering and maze generation.
- Tank / mech armor, weapon physics, fire cooldowns and shell limits.
- Pilot speed, hitboxes, enter/exit geometry, difficulty and scoring.
- Android application ID, LAN protocol packet types, build signing process and launcher icon.

## Verification

- Node game/regression suite passed, including 180 seeded maze configurations and 1,500-frame bot simulation.
- Added motion symmetry tests for mech legs and pilot boots, ejection event serialization and immunity, after-action control state, and replay restoration.
- Chromium phone-landscape render checks at 740×360, 915×412, 1280×720: no JavaScript page errors or page overflow.
- Gameplay screenshot and after-action/ejection screenshots captured from the game engine. These are not generated concept images. Controlled QA states are used to capture rare events consistently.
- Android GitHub Actions build: see associated workflow run. The actual APK must still be tested on device.

## Outstanding

- Physical Android touch comfort and frame-rate profiling, especially four-bot Maze XL.
- Real two-phone networking, especially simultaneous ejection and rematch.
- Additional authored visual identity for individual mech/tank damage states and pilot customization after the current foundation is validated.
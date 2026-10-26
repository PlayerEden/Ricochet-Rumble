# Ricochet Rumble — Pilot Survival QA v0.7.1

**Branch:** `dev/pilot-survival`  
**Scope:** Alpha v0.7.0 game, Pilot Survival, Classic regressions, menus/touch layout, Android project and LAN implementation.  
**Status:** Focused repairs validated by automated tests. **Not a production-quality or device-certified release.**

## Summary

- **Core loop:** PASS (simulated). Classic tank combat, bullet limits, lives, respawn, teams, mazes and power-ups remain covered by the previous smoke suite.
- **Pilot Survival:** PASS after repair (simulated). Pilot entry/exit, two lives, tank armor, ejection, sidearm, pilot mode rematch.
- **Garage placement:** FIXED. Empty vehicles now choose collision-free locations instead of possibly materializing inside a wall, existing vehicle or player. 240 seeded scenarios across Labyrinth and Maze XL pass; each has a parked vehicle near the spawn.
- **World collisions:** FIXED. Live parked vehicles now block pilots and moving tanks; destroyed wrecks remain passable to prevent trapping ejected pilots. Exiting and ejecting search more safe positions away from walls, occupied tanks and other actors; exit paths also require unobstructed line of sight to prevent jumping through a wall.
- **Vehicle projectile interactions:** FIXED. Empty tanks now intercept incoming bullets, lose armor and recover after their wreck timer rather than acting like intangible scenery.
- **Bot recovery:** IMPROVED. Ejected bots path toward available tanks and enter them when near; previously they stayed on foot indefinitely.
- **Mobile usability:** PASS in desktop Chromium layout checks at 740x360, 915x412 and 1280x720 landscape. Fixed game UI, thumb controls, Enter/Exit and menus fit without document scrolling or page errors. This is **not** an on-device comfort certification.
- **Endurance:** PASS 3,000 simulated fixed-time frames with 4 bots on Maze XL. Actor coordinates and vehicle armor stay finite/bounded, shells obey the active limit, and no JS exceptions occur in the smoke harness. This does not establish physical FPS or battery performance.
- **Android packaging:** Android project, bundled WebView resources and launcher icon checked; GitHub build should be verified separately on the exact branch commit.
- **Multiplayer:** Classic LAN code and host-authoritative snapshots exist and are covered by simulated protocol checks only. Actual discovery, Wi-Fi routing, latency, reconnection and two-device behavior have **not** been tested. **Pilot Survival is not synchronized over the network** and is explicitly solo-only.

## Remaining risks, prioritized

1. **High — Two-phone acceptance:** Real physical test of Classic host/join, same-Wi-Fi discovery, rematch synchronization, disconnects, and slow/high-latency links. No remote internet P2P/friends service yet.
2. **High — Pilot mode multiplayer:** Vehicles, ejection and actor occupancy are not yet remotely playable; leave experimental mode solo until its state authority and transport protocol are explicitly implemented and tested.
3. **Medium — Gameplay balance:** Sidearm can chip vehicle armor as quickly as a tank shell per successful hit, and different pilot speeds/armor values haven't been playtested. Tune based on feel rather than inventing numerical claims.
4. **Medium — Exit edge cases:** If absolutely no clear exit position exists, emergency ejection falls back to the tank's last location with temporary invulnerability. This deliberately prevents losing a pilot life because of a blocked exit but may occasionally look awkward.
5. **Medium — Android installation:** Debug-signed APKs on fresh GitHub runners may conflict with previously installed versions; uninstalling can erase local options. No stable signing in the simple build workflow.
6. **Low — Visual treatment:** Tank/pilot art, damage feedback and the minimap are readable at simulated landscape sizes, but sizes/colors and thumb ergonomics still need hands-on testing, especially for smaller devices.
7. **Low — Endurance/performance:** No measured on-device frame time, memory pressure, heat or battery usage; long playtest and profiling recommended.

## Evidence and commands

- `node --check web/game.js`
- `node tests/smoke.mjs` — passes: Classic regressions, 700 indexed-wall parity cases, Pilot Survival interactions, 240 procedural placements, projectile/parked tank collisions, bot vehicle recovery, and 3,000-frame stress simulation.
- `python check_ui_inline.py` — Chromium layout checks at 740x360, 915x412, 1280x720, with zero overflow or page errors.
- Verify production APK via workflow at `.github/workflows/build-apk.yml` after committing; do not treat JavaScript simulation as an Android install/playtest.

**Release gate:** Keep v0.7.1 on `dev/pilot-survival` until solo mode is physically playtested and rechecked. Keep Classic Rumble on `main` unchanged.
# FIELDGRID v0.9.0 — design + validation record

## Scope

- One Ricochet Rumble gameplay system. No separate pilot, mech, survival or tank mode.
- Every match procedurally generates a different *connected* braided maze. Choose Small (9×6), Standard (13×9) or Large (18×12) cells. Cell width is 132 world units for vehicle access. No handpicked maps or map picker remain.
- Maze generation is seeded and the host sends `mazeSeed` plus `config.mapSize` to the other phone. Guests reconstruct the same world. The host remains authoritative for vehicle ownership, damage, drops, and state.
- Humans and bots start in normal tanks for immediate combat. Extra empty vehicles are seeded by match, spread through the battlefield; a spare is accessible near the starting player when space allows.
- Mechs are the first additional vehicle type: 4 armor, 76% tank movement speed, slower/heavier visual shells, 0.7-second normal fire interval, 2 shells active. Tanks: 3 armor, normal speed, 0.41-second interval, configurable shell cap. Both use the existing one-tap Enter/Exit.
- Every ~30–42 game seconds the host attempts a new tank or mech drop. The spawn is avoided if vehicles are at the cap (10 absolute), the map is crowded, or there is no safe cell. A brief announcement and seven-second minimap beacon signal successful drops. There is no disruptive intermission.
- Menu: Quick Play, Match Settings and Play Together. Essential settings are Map Size, Bots, Teams. Optional lives/shells/difficulty are in an inline More Match Options disclosure. Comfort controls remain on the same settings screen.

## PHOSPHOR continuity (non-canon pitch, not an in-game claim)

The separate `PlayerEden/Operation-Phosphor` game bible (as checked 2026-10-26) describes Project CATHODE as a classified terminal training system with unauthorized sessions and NEXUS-related anomalies whose origin is unresolved. FIELDGRID could represent a later, more physical and contemporary combat training interface for actual pilots. Retain visual echoes (cyan/coral, grid geometry, brief field messages) but **not** CRT phosphor, classified mission menus, or heavy lore exposition. This is thematic design direction only. No shared timeline, government affiliation, Project CATHODE succession or NEXUS explanation is made canonical by this build.

## QA performed

- Node smoke suite: previous classic + pilot mechanics and host/guest protocol, plus 180 procedurally generated maps across all sizes with connected-cell checks, vehicle clearance checks and mech inclusion.
- Mech entered on foot, fired only two simultaneous shots, absorbed four hits, then ejected the pilot without consuming a life.
- Timed deployment safe-position + maximum vehicle count checks.
- 1,500-frame five-player stress simulation (with 4 bots) with ammo/armor invariants.
- Chromium screenshots at 740×360, 915×412, 1280×720 for menu, settings and game. No JS page errors or document-level overflow observed. Expanded advanced settings also checked at 740×360 without panel overflow.
- Android `assembleDebug` and APK packaging must pass before this build is distributed. Physical phone playtest and real Wi-Fi co-op are not yet verified.

## Next decisions

1. Playtest map sizes. The standard maze should usually yield a fight within a few moments, not minutes of searching.
2. Adjust vehicle spawn cadence according to match duration. At capacity, the game deliberately skips announcements rather than teleporting existing vehicles.
3. Evaluate mechs visually and mechanically. Do not add another type before this one feels distinct and usable.
4. Verify two-phone LAN actions (enter/eject, mech fire, maze seed + host drop sync) before implementing remote internet P2P or friends.
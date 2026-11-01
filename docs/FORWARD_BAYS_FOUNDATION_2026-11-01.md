# Sector Rebound — Forward Bay / FOB Foundation (2026-11-01)

**STATUS: IMPLEMENTATION CANDIDATE, NOT OWNER-ACCEPTED OR MERGED.**

This is the deliberate first step toward CTF and objective modes; scope is a compact, functional **Forward Bay** rather than a large new fortress or a cosmetic-menu Hangar.

## Exact candidate behavior
- A collapsed **FIELD EXERCISES** group in Choose Mode reveals **FORWARD BAYS · 2 TEAMS / VEHICLE DEPOTS**. Normal Quick Play, normal Team Deathmatch, CQC, Custom and Daily are unchanged.
- Its match uses the existing real **scored Team Deathmatch** engine (2 teams / four actors, 1 human + 3 bots, 15 KOs or 5 minutes), **standard** procedural maze. No CTF, no zone scoring, no unreal protections.
- A deterministic graph planner chooses opposite west/east team depots from the actual fully connected maze. Each chosen tile has **at least two navigable corridor entrances**. Candidate scoring rewards high maze-graph separation and similar corridor distances toward the central zone. This is **heuristic fairness**, not an absolute guarantee of equally strong competitive positions.
- Team actors spawn in the base tile and a connected adjoining entrance tile, with no overlap; per-team garages reserve TWO of the game's **existing** spare tank vehicles (same armor, same cap) near their bay. The other spare remains free. No bonus HP, no collision-breaking objects, no new blocked walls and no asymmetric new vehicle type.
- Visible industrial team-colored pads, bay labels, entry markers and parking symbol are purely non-solid overlay graphics. They are NEVER implied to be usable cover, indestructible shields, real CTF flags, or safe zones.
- The existing scored respawn service deliberately **retains its global anti-camping safe-spawn selection**, rather than blindly forcing every respawn into a possibly camped base. Base-origin **initial** spawns and vehicle recovery are the only functional FOB mechanics in this first pass.
- Experimental match results and rematches are genuine scored TDM but do **not** affect the offline Dossier or cosmetic unlocks. Replays generate a fresh maze and new base pair.

## Specific tests
1. Pure graph validity / deterministic two-bay planner; 300 generated maze seeds, rotating three map sizes, both bases connected, 2+ exits, no cell aliasing.
2. 30 actual engine initialState vehicle/spawn sets: no overlaps or solid wall starts, 2 garage tanks from preexisting spares and at most 10 vehicles.
3. Real Chromium opt-in mode launch, short-landscape no-scroll Back, result score/end, accurate experimental note, unchanged Dossier, rematch generates fresh base set, Quick Play unaffected.
4. Full existing gameplay regression: Daily, bot personalities (3 roles, 300 seeds), Quick Play, fresh first-match, backup and responsive layouts; Android/web parity of all touched assets.
5. **Physical Android touch and 2-device LAN still pending**. This experimental mode is offline and not enabled in LAN. Later CTF will require objective-aware AI, flag physics, scoring, team base respawn policy, replicated online state and special QA.

## Design decisions held for later
- Whether pilots or vehicles should carry flags (old design favored on-foot-only pilot carrying and tank escort).
- FOB-controlled wave respawns vs global safe respawns: verify anti-camping before any change.
- Truly balanced competitive map generation needs a more explicit generator/validator than score heuristics.
- Large fortified FOB artwork, doors, destructible walls, ammunition depots, base capture, CTF flags and online 2v2 are **not** implemented.
- No source/approval/ownership risk to stable main, draft PR #85 or Preview 100061. Reversible experiment branch; rollback to audited bot branch `149c0ba`.

Development protocol: one gameplay milestone -> targeted audit -> full existing regression -> checkpoint / owner test before next major feature.

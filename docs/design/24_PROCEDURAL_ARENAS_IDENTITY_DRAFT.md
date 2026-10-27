# 24 — Procedural Arenas & Tactical Adaptation Bible

**Status:** Core identity direction captured from owner feedback; mechanical details are proposals, **not implemented by this document**.
**Date:** 2026-10-27
**Dependencies:** [20 — Match Modes](20_MATCH_MODES_BIBLE_DRAFT.md), [23 — Quick Play & After Action](23_QUICK_PLAY_AFTER_ACTION_BIBLE_DRAFT.md).

## Core promise

> **No memorized battlefield. Adapt, fight, survive.**

The experience is not "play the same authored map until you know every angle." Every new Quick Play match generates its own maze from an appropriate mode-specific ruleset and seed, including repeated plays of the same mode. Players learn **transferable skills** — route assessment, ricochet geometry, positioning, pilot/armor decisions, team coordination and adaptation — rather than memorizing static chokepoints.

**This is a design identity, not a claim that no other game uses procedural maps.** The distinct combination we want to emphasize is fresh maze layouts + ricochet combat + dismountable tanks/mechs + evolving mode objectives + ongoing shuffled Quick Play sessions.

## Product principles

1. **Fresh each round.** Generate a new valid seed and maze for each NEXT MATCH, including replaying a single selected mode. Reusing a seed deliberately should be a separate testing/private-match feature.
2. **Same unknown battlefield for everyone.** All players/bots in one match share the exact authoritative generated geometry, objects and objective placements. Never individually reroll the maze for clients.
3. **Skill outweighs favorable random rolls.** Chance changes routes and tactical opportunities; procedural validation rejects unreachable spawns, severely unbalanced objective access and unwinnable map variants.
4. **Tactical readability over maximal randomness.** Even a novel arena must be easy to parse, with legible walls, entrances, vehicle silhouettes, objectives, safe spawn transitions and minimap alignment.
5. **Mode-aware generation.** Each mode owns its generation constraints; do not apply one unrestricted maze sampler to all combat types.
6. **Variety within quality limits.** Players should perceive different loops, junctions and sightlines, but no maze should become a disconnected checkerboard or a single boring corridor.
7. **Fast iteration.** Validate map generation without needing handcrafted 3D art or content pipelines; retain deterministic seed-based replay for debugging.

## Mode-specific procedural constraints (design targets)

| Mode | Procedural personality | Must reject |
|---|---|---|
| **Close Quarters** | Compact, walkable, tight bends and multiple escape/approach paths, **pilot-only**, frequent but readable contacts | Vehicle spawns; inaccessible corridors; unfair immediate spawn-to-spawn firing lane |
| **Free-for-All** | Standard/large/future XL with a mix of open intersections, loops, covered turns and contestable vehicle opportunities | Dominant uncounterable camping position; one spawn consistently nearest all good supplies |
| **Team Deathmatch** | Multiple attack routes between teams, safely separated spawn groups, optional connected Forward Bays with meaningful exits | One team trapped behind a wall, single unavoidable spawn choke, asymmetric attack travel |
| **Capture the Flag** | Reachable flag/bay positions, multiple viable lanes, defensible but escapable bases, balanced routes for piloting | One flag substantially easier to reach, flag locked behind wall, camping-proof gate with only one approach |
| **Elimination** | Tactical but not excessively huge, several retreat loops; limited lives increase positioning importance | Long unproductive stalemates and locations requiring impossible movement to reach surviving opponents |

## Skill expression: what the player learns

- **Read geometry:** determine where a ricochet may bounce, where lines of fire intersect and when to flank.
- **Choose risk:** push a new corridor, guard a crossing, switch from mech to pilot, or retreat to a vehicle opportunity.
- **Navigate under pressure:** path toward objectives without knowing an exact route from a previous match.
- **Adapt to the generated sector:** a short-range maze favors one decision style, open junctions another.
- **Coordinate in team modes:** communicate emerging flank routes instead of copying memorized strategies.

Randomness can create memorable lucky shots and unusual encounters, but should not decide results because a starting cell is intrinsically bad.

## Generation architecture (future implementation)

- Create `seed`, `generatorVersion`, `matchModeId`, `mapSize` and validated `generatedMap` as explicit, replayable match metadata.
- Generate geometry with a deterministic random stream. Keep gameplay decision randomness independent where practical so animation or pickup ordering cannot change map shape unexpectedly.
- Validate connectivity for intended actor collision radii **and** movement through every expected door/corridor size.
- Place spawns, team bases, free vehicles, supplies and objectives *after* the topology is validated, with ruleset-specific constraints.
- Score prospective layouts: reachable space, graph connectivity, loop/dead-end mix, minimum safe spawn distance, number of alternate routes, objective path-length fairness, accessible vehicle positions.
- Regenerate only failed samples, under a bounded retry budget; implement a **known-good fallback seed/layout** to avoid hanging or generating broken matches.
- Preserve host authority: host chooses and verifies map seed or distributes authoritative geometry, clients never silently construct a different map.
- Save failed seed, generator version and test scenario in QA logs so any procedural failure is reproducible, even if it first appeared once in hundreds of runs.
- Avoid arbitrary XL size until AI pathing, camera framing, match duration and mobile performance are measured.

## Procedural fairness examples

- If team A can reach its own flag defense in 6 seconds while B requires 20 seconds, reject or adjust.
- If a CQC spawn exposes an on-foot pilot immediately to an enemy bullet line before they can move, reject or protect/reposition.
- If vehicles are usable pickups, ensure neither side monopolizes almost all of them by spawn placement.
- If one maze contains a single corridor that must be used by all combatants, treat it as a special curated exception, not typical generation.

Some asymmetry can be fun. We don't need perfect mirrors, but each team should have **comparable opportunities** despite different geometry.

## Quick Play / After-Action tie-in

**NEXT MATCH** chooses the next mode from the selected shuffle bag, generates a fresh validated sector, and briefly identifies the new mode and its objective. Players should not need to revisit the main menu. Session results may note the sector ID/seed for bug reports, but never expose confusing engineering codes in the normal results view.

Consider a lightweight optional post-match **"Sector Fingerprint"**: a tiny minimap silhouette in the match record. It can help players remember what happened even though the next layout is completely different. Defer until the Pilot Dossier and match result format are stable.

## Test gates before shipping

- Automated diverse-seed testing: propose **at least 300 seeds per mode/size configuration**, including collision-size-specific connectivity and spawn/objective fairness.
- Full-match bot simulations on a sampled range of seeds, checking encounter frequency, average completion time and true navigation stalls.
- Competitive spawn validity, team-distance comparisons, path alternatives, stuck edge cases and reachable flag/base items.
- Real two-phone LAN: both clients see exactly the same maze, pickups and objectives after joining, reconnecting and rematching.
- Mobile frame time/memory: generation must be fast enough not to create a blank screen or several seconds of unresponsive UI.
- Every new generator/version change must be regression-tested against stored failure seeds.

## Marketing/identity guardrail

Possible short copy: **"Every sector is different."** or **"Fresh maze. New fight."**
Avoid claiming **"first-ever procedural multiplayer shooter"** or pretending procedural layouts are unique by themselves.

## Open questions

- Should the entire maze be visible on the minimap immediately, or gradually explored in a special mode? Default to the existing clear minimap until tested.
- Should players ever be able to intentionally replay/share a seed in private matches, separate from randomized Quick Play?
- How much asymmetric geometry can team modes tolerate before it feels unfair?
- Do very large arenas need local objective highlights or faster vehicle deployment to avoid downtime?

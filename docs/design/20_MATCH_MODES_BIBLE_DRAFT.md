# 20 — Match Modes, Playlists & Respawn Bible

**Status: PROPOSAL / DISCUSSION, NOT IMPLEMENTED.** 2026-10-27.
**Gameplay baseline:** v0.9.20, with no changes in this branch.

## Camera and mode-identity decision — 2026-10-27 owner phone feedback

- **Pilot-only Close Quarters** will intentionally retain a **closer on-foot camera**. In the latest tested v0.9.22-dev5 *camera candidate*, the pilot stays at zoom **1.07**; this is a tested technical target, not proof that CQC is implemented.
- **Vehicle battles** should use wider tactical views. Latest dev5 camera targets: tank **0.82**, mech **0.77** (compared with dev4's 0.87 and 0.82); lower zoom values mean more of the procedural field is visible. No pilot zoom or combat rules changed.
- Camera scale is a **readability/pacing policy**, not a replacement for mode logic. CQC must explicitly disable vehicle spawns and boarding, create close-quarters pilot-only objectives/respawn rules, and receive its own QA gate before appearing in Quick Play.
- Review pilot-only sightlines, target readability, spawn fairness, arrows, walls and joystick area on physical Android before making any CQC-specific camera changes. Do not port vehicle view settings to foot mode by accident.

## Research-based score target refinement (2026-10-27)

Read [**Deathmatch Benchmarks and Balance v1**](../research/DEATHMATCH_BENCHMARKS_AND_BALANCE_V1_2026-10-27.md) before implementing scored modes. The earlier **CQC 12/3, FFA 15/5 and TDM 25/5** values below remain *original design discussion hypotheses*, NOT mandatory or already balanced. The first measured mobile QA should start with CQC **10 KOs / 3 min**, FFA **10 KOs / 4 min** with 1+3 bots, and **honest 2v2 TDM 15 combined team KOs / 5 min** (1 human + 1 Blue ally vs 2 Red bots, no unfair 3v2 label); stage 3v3 20–25 / 6 min only after extending four-bot cap and verifying Android load. 30 KOs could be an optional longer setting if measured KO/min supports it. Model score targets and clocks as mode presets so retuning is not a rewrite; separate from saved playlists until QA-approved. This research updates *design priority* only, not the live build.

## Vision

Build a compact, polished mobile combat experience where different modes reuse the same ricochet weapons, pilot ejection, tanks, mechs, bot opponents and procedural connected mazes. Let players choose which modes enter their offline Quick Play rotation; never force a login or claim network matchmaking exists.

## What current code actually supports

- Settings currently mix mapSize, teamMode (FFA/coop/teams), startLives, botCount and projectile cap; there is no durable ruleset ID.
- Current map definitions: small 9×6, standard 13×9, large 18×12 (all 132-unit cells). XL DOES NOT YET EXIST.
- Defaults: small map, 2 bots, 2 lives. Operators respawn while lives remain, then are eliminated. A match ends when one living side remains.
- Pilot-only mode must be implemented deliberately: actors must start on foot, vehicle spawns/repairs/redeployments and entry prompts must be disabled. It is not sufficient to select a small arena.
- Existing application mode names (solo, host, guest) are network/UI state; new gameplay modes should use an independent matchModeId, hosted and validated.
- No full-match score/time goal, spectator camera, flag logic or team base generator exists yet.

For the **fresh-per-match procedural sector contract**, mode-specific layout constraints, fairness validation and seed-based regression, see [24 — Procedural Arenas & Tactical Adaptation](24_PROCEDURAL_ARENAS_IDENTITY_DRAFT.md). Every match generates a new layout, including repeats of the same selected mode; mode rules govern what generation is allowed to produce.

## Proposed mode playlist

| Mode ID | Vehicles | Allowed sizes | Respawn | Proposed first test win condition |
|---|---|---|---|---|
| close_quarters | None: pilot only | Small, maybe a curated compact layout | Yes; 2–3 s | 12 operator KOs / 3 min |
| free_for_all | Tanks, mechs, pilot recovery | Standard, Large, later XL | Yes; 2–3 s | 15 operator KOs / 5 min |
| team_deathmatch | Tanks, mechs, pilot recovery | Standard, Large, later XL | Yes; safe team respawn | First to 25 team KOs / 5 min |
| capture_flag | Tanks/mechs, on-foot objective | Standard, Large | Yes | First to 3 caps / 6 min |
| elimination | Tanks/mechs optional | Standard, Large | No after lives consumed | Last side standing + timeout |

These numbers are playtest hypotheses, NOT balance facts or committed live settings. Multiple people/bots and difficulty levels may require scaling the target.

## Operator and vehicle lifecycle

Vehicle destroyed = eject the living pilot, NOT an operator KO. A pilot's elimination credits a KO and a score in score-based modes. When a life is lost in a respawning mode: freeze inputs, show brief unobtrusive respawn countdown/score, choose a safe navigable spawn far from visible enemies and live bullets, protect for a short initial moment that ends immediately on aggressive action. Returning on foot near a recoverable ride preserves Sector Rebound's identity; do not hand out free full-health tanks on every death without testing it.

Elimination mode: once out of lives, spectate active pilots, optionally switch teammates; do not reveal hidden positions in future competitive online versions. Use a clear timed fallback to avoid never-ending matches.

## In-world hangar vs customization hangar

Keep two separate places:
- **Menu Hangar:** cosmetics, pilot and vehicle paint ownership, no stat bonuses.
- **Forward Bay / Field Depot:** user-suggested generated in-map building used for team objectives/spawning/vehicle recovery; the name is undecided. No gameplay base in Close Quarters or base FFA.

TDM and CTF Forward Bays should be connected through the procedural maze, with equally accessible paths, no permanently protected offensive positions, clear exits, anti-spawn-camping measures and cooldown-controlled replacement vehicles.

## CTF design question: who carries the flag?

Option A (favored for identity): only on-foot pilots can pick up/return/capture a flag, with tanks as escorts. Entering a vehicle drops it. This makes the pilot meaningful but risks frustration if it forces an awkward exit.
Option B: vehicles also carry, but flag position is highly visible and mobility is limited. Easier to learn but may favor fast armor too much.

Prototype and test one rule first. Two actual, reachable team flags; drop/return timer; score and UI; objective-aware bots; validated host/guest replication. No gimmicky extra systems until this works.

## Quick Play as an ongoing session

Winning or losing a battle must **not** automatically return the player to the main menu. Show a mode-appropriate AFTER ACTION summary, followed by **NEXT MATCH** (chosen from enabled mode selections, using a fair shuffled rotation with no immediate repeat when possible) and **MAIN MENU**. The choice is always voluntary; another match never begins automatically. Player session totals continue across completed rounds; each match keeps its separate verified stats. For LAN, the host selects the next mode/maze and the guest waits or marks ready.

**Full specifications:** [23 — Quick Play & After-Action Bible](23_QUICK_PLAY_AFTER_ACTION_BIBLE_DRAFT.md). This is a proposed future design, not functioning v0.9.20 behavior.

## Player mode selection

Quick Play displays selected modes via a small MODES choice beside the main PLAY action. All released modes selected by default. Saving preferences locally is fine; mode rotation randomly draws from enabled supported modes only and avoids immediate duplicates where possible. When exactly one is enabled it always runs. Zero selected must disable Play with an intelligible message.

Host chooses mode, map size, seed, team membership and victory settings and replicates them. Two-player Wi-Fi should allow same-team/co-op or opponents; team-filling bots must be balanced. This is LOCAL PLAYLIST SELECTION, not public matchmaking.

## Implementation order

1. Introduce validated data-driven mode presets without changing combat; add matchModeId independent from solo/host/guest.
2. Close Quarters pilot-only setup, correct power-up list, scoring/respawn/end-screen.
3. FFA score/time objective and safe respawn preserving vehicle ejection.
4. TDM teams and score, then Forward Bay map nodes.
5. CTF plus objective-seeking bot AI.
6. Elimination spectator system and optional one-life variants.

## Tests before claiming success

Score attribution versus vehicle armor impacts; map validity/connectedness; 300+ procedural seeds per mode for spawns and Forward Bay symmetry; death/respawn protection; winner/draw/time; 10-minute full bot sessions; mode selection persistence and anti-repeat; LAN host/guest agreement; all landscape phone sizes; no game-over lock or spawn traps.

Reference design inspiration, not copied creative assets:
- Activision CoD Mobile modes: https://activision.helpshift.com/hc/en/3-cod-mobile/faq/3-what-game-modes-can-i-play-in-multiplayer/
- World of Tanks Blitz victory conditions: https://wargaming.net/support/en/products/wotb/article/15401/

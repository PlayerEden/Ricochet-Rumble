# Sector Rebound — Vehicle Route-Fairness A/B and Safe Team Supply Drops
**Date:** 2026-11-01  
**Status:** experimental source checkpoint; **full GitHub Actions QA PASS**, owner Android install-over and physical playtesting PENDING.

- Full tested source commit: `134b222dfa57fa02a6fe838fd0b9f9aec8a46afa`; gameplay change commit `c8c51b904a3c869e6c50bd550977b530dc23e69d`.
- [Candidate CI 41349526805](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41349526805) — success.
- [Candidate raw telemetry and screenshots, artifact 13100831961](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41349526805/artifacts/13100831961).
- Matched prior baseline `experiment/team-vehicle-route-balance-v1`, tested commit `44453ba83c1d69522526a269c7646640f671cd09` [CI 41349396242](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41349396242) and [baseline telemetry artifact 13100568226](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41349396242/artifacts/13100568226).
- Previously accepted parent: `experiment/team-forward-bays-spawn-v1` [QA 41344581392](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41344581392).

## Problem demonstrated

Ordinary random vehicles can look centrally placed on a minimap yet sit deep in one team's reachable maze corridors, making the other team travel many more actual corridor steps. Baseline tests showed no vehicle-to-vehicle overlaps (the old safety checks worked), but neutral access was widely biased.

## Exact A/B test design

`tests/team-vehicle-route-qa.mjs` uses real `game.js`, `initialState`, `deployVehicle`, actual generated `mazeGrid.open` topology, and production Forward Bay plans in headless Chromium. **450** seeded cases = **30 seeds × 3 map sizes × 5 modes** (`teams`, `coop`, `scored_tdm`, `ctf`, `ffa`). Of those, **360** are team-base cases and **90** are FFA behavior controls. Same test source and seeds on both branches; the candidate sets `VEHICLE_BALANCE_ENFORCE=1` to require the acceptance bounds. No fake actor relocation, geometry bypass or player-stat changes.

Each team match starts with one occupied tank per actor and two base garages stocked with parked tanks, plus one neutral spare mech. The test also attempts **two** standard supply deployments in the actual game engine, recording availability, distance-to-each-bay via BFS corridors, actors, and overlap.

| Metric | Old team spawning | New route-balanced team spawning |
|---|---: | ---: |
| Neutral spare mech placements where access differs by at most two corridors | 52/360 | **360/360** |
| Worst neutral access imbalance | 34 corridor steps | **1 corridor step** |
| First drops that meet the same fairness bound | 54/360 attempts | **341/341 successful drops** |
| Largest difference for first successful drop | 33 corridor steps | **2 corridor steps** |
| Second drops meeting the fairness bound | Poor distribution; see baseline histogram | **308/308 successful drops** |
| Largest difference for second successful drop | 50 corridor steps | **2 corridor steps** |
| Neutral mech inside three corridors of either base | 3 baseline cases | **0** |
| Replacement drops inside three corridors of either base | 45 baseline occurrences across the first and second drop | **0** |
| Vehicle-to-vehicle spacing failures | 0 | **0** |
| FFA controls | 90 baseline cases | **90 cases unchanged in distribution policy** |

**Important nuance:** In the candidate, 19/360 team games could not safely place the *first* periodic supply under these strict team-fairness constraints. Another 33 scenarios placed a first drop but not a second. The engine **defers** these drops rather than selecting a biased/unsafe fallback; it does not promise two new vehicles on every map. The 720 base garages (two per team scenario) remain present in all 360 scenarios. This is a measurable pacing tradeoff to evaluate in hands-on play.

## Actual implementation

Only `web/game.js` and its byte-identical Android asset mirror change:

1. Add `teamNeutralVehicleSite`, a deterministic seeded graph search over reachable cells. It rejects walls, too-close actors, occupied vehicle spacing, and any site within two corridor steps of either bay (minimum permitted is **three** from both). Score **actual shortest path length** from both bays, prioritizing at most a two-step gap; then minimize unnecessary route detours.
2. Initial team vehicle allocation keeps both team tank garages. Relocate the single reserved neutral mech to the best safe, fair connected cell. If no qualifying site exists, the existing spare remains as a fallback; the audited sample found a fair site in every one of the 360 seeded team configurations.
3. Team-mode periodic drops choose similarly fair vacant cells while avoiding actors and existing vehicles and obeying standard capacity/type/weapon rules. If a safe gap≤2 location is unavailable, return false (defer the drop); do not spawn it beside a flag or in an active base entrance.
4. **No changes** to FFA supply distribution, vehicle speed, armor, shell damage, pilot controls, CTF flag rules, team scoring, Dossier progression, or network protocols.

## QA acceptance

- Candidate full workflow [41349526805](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41349526805) succeeded: candidate route checks, 216-case team Forward Bay spawn matrix, 300-maze Forward Bay planner/browser suite, actual CTF objective-bot and contested-human browser tests, natural CTF observation, Quick Play, first-match onboarding, backup corruption safeguards, CTF rules and visual QA.
- Browser and Android game assets verified byte-identical by CI. No live phone visual comfort or two-phone gameplay tested at this checkpoint.
- Neither stable `main` nor draft integration PR #85 changed; installed v0.9.59 owner preview version code `200003` untouched. **No new APK built here.**

## Next focused milestone

Pilot-versus-pilot fairness: record actual bot firing engagement distances compared with player camera boundaries; compare existing normal bot accuracy and 14/17.5-unit hit radii; only after evidence prototype a restrained optional on-screen, LOS-only pilot aim correction. Also perform physical-size UI overlap checks and continue using paired regression audits.

If promoting to Android testing later, **must retain** current preview application ID `com.playereden.ricochetrumble.preview` and current test-signing certificate SHA-256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`, with versionCode **greater than 200003**, so it installs directly over owner's existing preview. Stable release signature/Play deployment are separate.

**Rollback:** compare/revert to prior full-team-spawn branch `experiment/team-forward-bays-spawn-v1`; for a no-vehicle-change A/B use `experiment/team-vehicle-route-balance-v1`. All tests and raw telemetry are linked above.

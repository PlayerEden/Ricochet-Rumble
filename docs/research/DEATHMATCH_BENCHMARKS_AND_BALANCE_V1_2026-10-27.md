# Sector Rebound — Deathmatch Design Research and First Balance Trials

**Research date:** 2026-10-27 (public official rules cross-checked).  
**Status:** SOURCE-BACKED RESEARCH + PROPOSED PLAYTEST PRESETS — **NOT IMPLEMENTED, NOT A LIVE GAME FEATURE**.  
**Owner goal:** Classic Halo / Call of Duty-like TDM and FFA with KO score targets, respawns, visible teams, timeouts and NEXT MATCH — scaled to a compact Android ricochet tank/mech/pilot shooter in a new generated maze every match.  
**Live code baseline:** [Team Survival Blue/Red ally correction v0.9.25 test APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.25-team-survival-allies-test), source `96be4c0540419d909a5ca20b444a1841d7354834`, still a draft, **last-team-standing** mode, not scored TDM. [Known stable main](https://github.com/PlayerEden/Ricochet-Rumble/blob/main/docs/PROJECT_STATUS.md) remains v0.9.21.

## 1. Primary-source comparison: what systems solve which problem?

| Game / official source | Real mode and rules | Transferable lesson | Do NOT directly copy |
|---|---|---|---|
| [CoD: Black Ops 7 — official launch guide (2025)](https://www.callofduty.com/blog/2025/11/call-of-duty-black-ops-7-multiplayer-maps-modes-launch) | Team Deathmatch: 100 score / 10 min, 6v6 style; Free-for-All: 30 score / 10 min | Everyone understands an explicit score race, per-kill point, countdown, end screen and fast restart | 100 / 30 are designed for more combatants, high infantry engagement rates, no per-kill 3-armor vehicle barrier |
| [Call of Duty: Black Ops 6 official TDM guide](https://www.callofduty.com/guides/blackops6/modes/call-of-duty-guides-black-ops-6-multiplayer-mode-team-deathmatch) | 6v6 core; spawn locations rotate with team map control, often near allies and away from hostile side | Respawn placement is a major mode mechanic, not just random coordinates; scores belong to teams | Don't spawn directly on teammate if enemy has a ricochet angle through the wall |
| [Halo Infinite official mode rules](https://support.halowaypoint.com/hc/en-us/articles/4407649063316-Guide-to-Halo-Infinite-Multiplayer-Game-Mode-Rules) | Team Slayer: 50 points for kills or most on time expiry; separate Attrition mode uses a shared limited respawn pool | Make Slayer/TDM and stock-life Attrition/Survival distinctly named modes | Never silently substitute a stock-lives match when user selected a KO-target match |
| [Halo Infinite official playlist sizes](https://support.halowaypoint.com/hc/en-us/articles/17920041655188-Halo-Infinite-Multiplayer-Playlists) | Arena 4v4, Doubles 2v2, Squad Battle 8v8, differing map/mode sets | Team size must match map capacity; 2v2 is a legitimate tested starting shape, not a failure to support 3v3 | Don't import 8v8 map dimensions into 2v2 phone experience |
| [Brawl Stars official mode support](https://support.supercell.com/brawl-stars/en/articles/game-modes-13.html) | Wipeout: 3v3 first to 10 takedowns; 5v5 first to 20; Showdown is a **different** last-standing mode; Knockout uses best-of-three rounds | Compact mobile fights often need much lower target scores; explicitly separate score-race, rounds, and elimination playlists | Wipeout's 10 may be too short when shots/armor/maze travel reduce actual encounter frequency |
| [World of Tanks official mode descriptions](https://worldoftanks.com/en/news/general-news/breakdown-game-modes/) | Vehicle battles won through tank elimination or base objectives, sometimes a match timer | Vehicle-heavy engagements are slower and positional; destroying a vehicle is a meaningful event distinct from infantry KO | No pilot ejection in WoT; our layered vehicle→pilot life cycle requires custom score rules |

**Community feedback (anecdotal, not representative research):** [Call of Duty spawn-trapping complaint](https://www.reddit.com/r/ModernWarfareIII/comments/1aeb7t1) highlights long repeated exposed respawns; [Halo bot teammate discussion](https://www.reddit.com/r/halo/comments/1f3oi5k) shows how ineffective AI can make scored teams feel unfair; [Halo large-team score-limit debate](https://www.reddit.com/r/halo/comments/qw7j29) suggests match length is sensitive to both combatant count and score cap. Treat these as **failure cases to test**, not quantitative evidence that all players agree.

## 2. Consequences for THIS engine (verified source)

In the current game, `bot-count` is limited to **0–4 bots**, so solo 2v2 is possible today, but 3v3 with one human requires **5 bots** and separate AI/pathfinding/memory testing. Solo survival currently allocates **finite** lives, with team victory from last surviving side. `registerHit` consumes tank armor before ejecting; armor hits/ejection are **not** `state.kos`. An on-foot life loss credits `state.kos[attacker]`, even if the victim respawns with remaining lives. Therefore a scored mode should count each **actual pilot death/respawn** once, and not require wiping the victim's entire life stock first.

The world's size varies with 9×6 / 13×9 / 18×12 procedural cells. New score modes must create dynamic safe respawn nodes in validated connected corridors, not simply re-use old opening deployment points. On foot a single unshielded hit can cost a life while armored vehicles take several hits; this creates an unusual time-to-KO curve. [Owner's deferred pilot-vs-vehicle fairness issue #33](https://github.com/PlayerEden/Ricochet-Rumble/issues/33) and [mode #36](https://github.com/PlayerEden/Ricochet-Rumble/issues/36) must stay linked.

## 3. Proposed starting presets (NOT locked; choose through measured bot matches)

| Purpose | Participants / equipment | KO target | Max match time | Why this trial |
|---|---|---|---|---|
| **Scored TDM — QUICK (first integration)** | **2v2**, one human + one Blue AI vs two Red AI; normal tank/mech/ejection, Standard sector | **15 shared team operator KOs** | **5 min** | Within currently validated actor cap; approachable mobile-session length. A vehicle life cycle may be 3 armor hits + 1 pilot hit, so start below 30. |
| **Scored FFA — QUICK** | 1 human + **3** AI initially (4 total), individual paint, Standard sector | **10 individual operator KOs** | **4 min** | Small bot roster; avoids 30-KO grind, tests how often a player meets an opponent through new maze routes. |
| **Pilot-only CQC — first scored-mechanics spike** | 1 human + 3 AI, no vehicles/boarding, Small sector | **10 KOs** | **3 min** | Removes vehicle-ejection scoring ambiguity while we build reliable score/respawn/end-state framework. |
| **Scored TDM — STANDARD future** | **3v3** after 5-bot capacity and fairness validated | **20–25 team KOs** | **6 min** | More actors can generate faster team scores. Re-evaluate with measured fight frequency. |
| **Scored FFA — STANDARD future** | Up to 5 actors if phone performance allows | **12 KOs** | **5 min** | Retains owner's suggested 12, paired with actual measured spawn/time pacing. |
| **TDM MARATHON optional custom** | 3v3 after performance verified | **30 team KOs** | **8 min** | Gives owner's earlier 30-KO concept a home without forcing the default to routinely hit the clock. |
| **Existing TEAM / SOLO SURVIVAL** | Existing finite-life modes and vehicle rules | **No KO score target** | Separate survival end conditions | Keep high-stakes last-standing experience; no silent behavior changes or rename to Deathmatch. |

**Rate sanity check (not actual telemetry):** 15 shared KOs / 5 minutes = **3 team KOs/min**, while 30 / 6 minutes = **5 team KOs/min**. Because each KO requires escaping/disabling occupied vehicles and then hitting the pilot, the larger target is more demanding per second than infantry shooter rules; cannot determine winner frequency without game telemetry.

## 4. Engineering rules borrowed from proven patterns, adapted to ricochet maze gameplay

### Score attribution / win states

- **Only pilot life loss** (a fully registered hit that actually decrements `lives` in survival-equivalent logic) awards exactly **+1 credited KO**. Vehicle armor damage, ammo shield/guard, empty parked vehicle, pilot ejection and merely hitting a robot do NOT award a kill. If a pilot respawns in a score match, that was a valid KO, regardless of personal remaining stock.
- Each elimination has a unique incident/sequence ID, scorer+victim and authoritative matchId; guard against duplicate hits, replayed LAN packets, match-ended shots, disconnected bot and double reward. Honor friendly fire disabled for casual TDM. Suicide/environment deaths: log death, award no enemy KO unless explicit last-damager rule later.
- **Team score** = sum of own members' valid opponent pilot KOs (including bots). FFA score = each individual player's valid pilot KOs. Personal operator KOs and team aggregate shown separately.
- Win immediately on the exact score threshold; at clock expiry compare score; equal score becomes **DRAW** initially (fair/transparent). Sudden Death or short overtime may be tested later, never secretly award a tie to player or host. Freeze a truthful result snapshot only once, even if same frame multiple deaths occur.

### Respawn / vehicle identity

- Unlimited **pilot lives** in scored modes; do not reuse finite-life elimination win test. Target 1.5–2.5-second downtime to start (tune for phone feel); reserve brief configurable spawn invulnerability with **clear visual cue that ends on firing**. Keep original ejection shield semantics separate from fresh respawn safety.
- Rank potential spawn locations by enemy distance, **enemy line of sight and ricochet paths**, nearby recent deaths / active bullets, teammate distribution and escape-route connectivity. Prefer safe, covered locations near the action rather than same static corner or right behind an active enemy. Reject unwalkable/blocked nodes; bound retry work and use safe fallback.
- Respawn on foot at a viable **recovery route to a fair available vehicle** (or staged mode-specific vehicle bay after QA), not an automatically gifted full-armored tank after every KO. If that pace is too punishing, test a separate *vehicle-ready respawn* preset, clearly advertised, against the on-foot recovery variant. Score balance with tanks is more complex than standard infantry TDM.
- **Do not respawn inside open enemy muzzle line**, immediately in ricochet danger path or isolated in a walled unreachable quadrant. Verify team side access to vehicle spawns and supply nodes is approximately equitable after each generated seed.

### Bots, teams, and readability

- **First TDM uses balanced 2v2** (1 player + ally against two enemies) and same skill preset for bots on both sides. An ally needs purposeful engagement/cover/assist behavior; merely matching paint and disabling friendly fire is not proof of teamwork. Include a test that AI bot KOs score correctly and have similar opportunity on either side across many seeds.
- Fixed BLUE/RED team paint and text/shape labels in all occupied vehicles, pilot bodies, minimap and HUD; future cosmetic materials cannot override team ID. FFA uses per-player distinct colors, not BLUE-vs-RED.
- Phone-landscape HUD should show **BLUE 7 / 15 — RED 6 / 15, 03:20 LEFT** for TDM and **YOU 4 — LEADER 6 / 10, 02:45 LEFT** for FFA (examples only). Show obvious personal KO/death feedback after a kill, with separate armor break/ejection event cues.
- After Action should list outcome reason (target hit / time / draw), both scores (or FFA ranking), player's KOs and deaths, assists if added later, duration, sector identity, and NEXT MATCH with fresh mode-validated arena.

### Procedural map fairness

- No memorized layouts: each NEXT MATCH uses new validated maze geometry with stored seed/version; do not claim different seed alone guarantees a different topology. Deduplicate recent topology fingerprints when possible ([#28](https://github.com/PlayerEden/Ricochet-Rumble/issues/28)).
- TDM test 2v2 spawns on opposite but comparably reachable networks with at least two approach paths and covered escape. FFA spread actors away from immediate LOS and initial high-value vehicle inventory. No single bottleneck forced for all respawns.
- Treat AI update/render/frame-time and overdraw on small Android screens as hard performance budget. A bigger bot count is *earned* by tests, not a feature checkbox.

## 5. Playtest telemetry and acceptance gate

Implement an inspectable simulation report per mode, bot-count, difficulty and map size, with >=300 reproducible generated seeds for geometry validity and >=50 full bot-vs-bot matches per planned preset/skill tier for *first* tuning (grow sample if stochastic spread high). Record:

- KO scoring rate, team/player win rates, target-vs-timeout finish fraction, match duration median and 90th percentile, stalemates, nearest encounter after each spawn.
- Death → valid new spawn travel time; spawn-under-fire within 1/2 seconds; respawn-killed-within-3-seconds rate; repeated same-area respawns; shortest walkable route to a vehicle.
- Per-bot participation, ally/enemy KO share, target acquired, distance traveled, long idle stalls, friendly-fire prevention; AI KOs clearly separated from human performance.
- Maze team-side first-contact times, vehicle availability per side, shortest route asymmetries, disconnected spawn failures, repeated geometry fingerprints.
- Android 740×360 / 915×412 / 1280×720 screenshots and real phone CPU/frame pacing, memory, heat, input usability and result-screen clarity.
- QA of **late kills, simultaneous score caps, timeout ties, shield, ejection, unique KO event, death when scene unloads, next-mode and exact saved bot counts**.
- Owner phone test: can recognize who is on their side, get into fair fights, find a usable vehicle after respawn, understand score and timer, and voluntarily hit NEXT MATCH with a genuinely different sector.

**Provisional product-level tuning target (not a claim of measured success):** 60–85% of ordinary matches should reach score target before timer; median 3–5 min for mobile Quick mode; avoid obvious bot-to-bot team score blowouts and frequent spawn camping. If almost all matches timeout at 5 min, LOWER cap or improve encounter/recovery rates, do not just increase timer. If most finish under ~90 seconds, increase cap or improve spawn protection. Re-test across map sizes and difficulties before treating targets as balanced.

## 6. Order and explicit ownership gates

1. **Keep stable baseline** `main` v0.9.21 and unmerged [#24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24), [#32](https://github.com/PlayerEden/Ricochet-Rumble/pull/32), [#34](https://github.com/PlayerEden/Ricochet-Rumble/pull/34), [#35](https://github.com/PlayerEden/Ricochet-Rumble/pull/35) separate until genuine phone acceptance. [v0.9.25 team ally/paint release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.25-team-survival-allies-test) still needs owner confirmation.
2. **First core scoring kernel** using standalone pilot-only CQC rules in isolated branch: independent modeId, score, timer, match finalization, safe respawn and one immutable After Action. No vehicle/ejection dependencies. Android QA + owner test.
3. **Scored FFA** re-enable tank/mech/ejection with scoreboard and safe vehicle access; start at 10 KOs/4 min and measure.
4. **Scored TDM** begin honest balanced 2v2, ensure teams and bot targeting/rendering and team score accounting. Expand to 3v3 only after verifying performance and fairness; do not mistake the already tested *uneven* Team Survival 2v1 as competitive TDM.
5. **Tune** using recorded match outcome rates and owner mobile feedback; only then enable completed modes in saved Quick Play selection/rotation; never let a selected proposed mode launch a survival substitute.
6. **Later** experiment with Kill Confirmed-style pickup tags, team objectives, 3v3 marathon or capture flag if the basic score race is reliably fun. No new hero abilities or a cosmetic economy required to complete the above.

## Source and evidence notes

All competitor rules in section 1 are linked to their publishers' public descriptions; community comments explicitly marked anecdotal. Recommendations, targets, telemetry thresholds and deployment steps in sections 3–6 are **Sector Rebound design hypotheses**, not industry rules or already validated game numbers. No code changed or Android APK generated by publishing this research note. No copied screenshots, sprites, maps, names, art assets, or proprietary code from referenced games.

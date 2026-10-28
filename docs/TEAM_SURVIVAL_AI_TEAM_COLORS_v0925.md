# Team Survival — Real AI Allies and Team Paint

**Date:** 2026-10-27. **Branch:** `prototype/team-survival-allies-colors-v0925`. **Status:** experimental gameplay correction, QA and phone acceptance pending.

## Phone report

Owner naturally completed a Quick Play match and confirmed NEXT MATCH changes the selected mode. However, `TEAM SURVIVAL` did not feel like teams, much less Team Deathmatch: no AI joined the player's team and tank/mech/pilot colors remained arbitrary individual colors. Owner wants recognizable sides including the VEHICLES.

## Confirmed code root cause

- Previous `teamOf()` hard-coded **every bot Red** whenever only one human played. This made Team Survival a human-vs-all-bots fight, even though bot AI already excludes friendlies.
- Tank, mech and pilot art were painted from `colors[i]` (arbitrary per-index), with only thin colored selection rings indicating sides. Radar markers, shields and most shot FX also used those per-index hues.
- Right-side HUD enemy count included all bots, which would incorrectly count newly added allies as enemies.
- The frozen After Action outcome required the human to be alive; a teammate victory after human death would incorrectly display defeat.
- **Existing objective is LAST TEAM STANDING**; there is no scored/time-based true TDM or repeated team respawn. Do not relabel this as a fully built Team Deathmatch.

## Implemented candidate

1. `teamOf` deterministic alternating split: in Solo Team Survival, Player BLUE, AI1 RED, AI2 BLUE, AI3 RED, AI4 BLUE. With default two bots this is **2 BLUE vs 1 RED**. Four bots gives **3 BLUE vs 2 RED**. Manual duo treats P1/P2 as opposing teams. Core AI targets, friendly-fire protection, winner side accounting already consume this same function.
2. `combatColor(i)` selects consistent Blue `#46d2f5` / Red `#fc856e` team paint for team modes, preserving per-pilot colors in original free-for-all. Use the same paint in **occupied tanks, mechs, the on-foot pilot team accent, radar indicators, shields, projectile smoke/trails and AI label text**.
3. On foot, allies are labelled `ALLY N`; the right HUD `RED` counter tracks only *living enemies*, not friendly bots. Existing left `YOU N ♥` remains personal lives, not incorrectly labelled team lives.
4. **Team Survival with 1 configured bot uses a second bot** to provide both an AI ally and an enemy, while intentionally choosing 0 bots remains no-opponent practice. Free-for-all counts are unchanged. A visible settings note states the exception; no hidden live bot inflation in other modes.
5. A team win is now displayed as VICTORY when the player's **side** wins, even if the player has 0 lives. Personal deaths and 0 remaining lives remain unchanged. Results still report player-only operator KOs, not synthetic team score.
6. Preserve last-side-standing survival objective, two-life/armor battle rules, procedural generation, tactical camera 1.07 pilot/0.82 tank/0.77 mech, Web/Android JS and HTML parity, mutable team rules and all LAN network message shapes.

## Automated gates

- [ ] All prior smoke and real Quick Play Chromium flow (both survival modes).
- [ ] New deterministic assertions for 0/1/2/4 bot team setup and actual presence of friendly AI; `teamOf`, team paint, enemy HUD counter and ally-win-after-death.
- [ ] Full real Chromium 740×360, 915×412, 1280×720 capture; inspect **team colors of actual occupied tanks/mechs and pilot**, minimap, and readable labels.
- [ ] Android debug APK and unsigned AAB build; permanent exact QA-passed test release with screenshot evidence.
- [ ] Owner actual Android phone acceptance: Team Survival starts with identifiable ally and enemy, ally doesn't attack Blue, Red and Blue vehicles visibly painted, results remain accurate, NEXT MATCH still shuffles.
- [ ] Keep previous immutable [Lab E test APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.24-pilot-lab-e-arcade-test) as rollback, and stable `main` unmerged pending explicit approval.

## Separate future mode

**Actual scored Team Deathmatch** should be a third independent Quick Play mode later, with timed/KO scoring, respawns, side-based score HUD and proper matchmaking/fair spawns (not one renamed Team Survival preset). Save this idea in [roadmap](https://github.com/PlayerEden/Ricochet-Rumble/blob/main/docs/ROADMAP_TO_GOOGLE_PLAY_V1.md). Do not claim it is present now.

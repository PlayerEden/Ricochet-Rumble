# v0.9.38 — natural bot and procedural-map balance audit

**Experimental QA-only branch:** `qa/natural-bot-maze-audit-v0938` directly extends the v0.9.37 scored Quick Play experiment, without changing `web/game.js`, the Android application, or player tuning. Stable `main` remains unchanged.

## Real-game simulation method

The audited executable is the actual checked-in `web/game.js` and `web/scored-match.js`, evaluated in a headless Node VM with its real maze generation, AI pursuit/pathfinding, projectile movement/bounces, armor damage and ejection, pilot-KO scoring, safe respawns, vehicle deployment and clock. To make autonomous round-robin possible, the **test-only in-memory source** replaces only the normally human-controlled **seat 0 input source** with the game's same existing `botInput(0,dt)`. The on-disk game, Android mirror and combat logic are not altered. It therefore measures **four bots playing the actual simulation**, *not* a human's performance, real Android speed, touch controls or networking.

The audit uses a fixed 30 Hz simulation step, 50 deterministic 4-participant full bouts per mode (CQC, scored vehicle FFA, scored team TDM), and 300 deterministic generated map layouts **per size** (Small, Standard, Large). It runs two probe bouts per mode first. Each full bout continues naturally until KO target or match clock; **no scripted kills/forced timeout** are used. For procedural checks it tests connectedness, collects 300 distinct canonical adjacency signatures per size and records duplicate counts.

The raw JSON evidence saves every seed, winner/reason, pilot-KO vector, team score, participant respawns, first shot/impact/KO time, shot/ricochet counts, initial enemy distance, active clock, unsafe and close-exposed respawn counts. Summary dimensions include winner/timeout/score-target split, no-contact and no-KO matches, Blue/Red TDM asymmetry, match pace, and coverage gaps. Unsafe actual respawns and disconnected or duplicate seeded layouts are test failures; unexpectedly weak bot combat is an *observed balance risk*, not a manufactured pass.

## First measured baseline: 30 Hz, 50 games each (PASS)

[Full natural AI run 40839155850](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40839155850) and [seed-level diagnostic rerun 40839511581](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40839511581) both completed successfully. Both run the same 30 Hz game logic, as described above.

| Measure | CQC | Vehicle FFA | Team Deathmatch |
| --- | ---: | ---: | ---: |
| Full natural AI bouts | 50 | 50 | 50 |
| KO-target finishes | 35 | 44 | 48 |
| Time-limit finishes | 15 | 6 | 2 |
| Draws | 6 | 1 | 1 |
| No-hit rounds | 3 | 0 | 0 |
| Mean elapsed seconds | 110.2 | 165.8 | 170.4 |
| Mean pilot KOs across all seats | 22.3 | 24.3 | 23.7 |
| Unsafe respawns observed | 0 | 0 | 0 |

TDM outcomes were **27 Blue / 22 Red / 1 draw**. **All 300 generated maps per size were connected and unique within the tested seed set**; their average navigable graph edge counts were Small 59.4, Standard 131.3 and Large 245. This establishes *topological* diversity, not necessarily visual or tactical uniqueness.

**CQC critical non-contact seeds:** `1001167` (6 shots, 0 hits), `1002719` (1 shot, 0 hits), `1003301` (10 shots, 0 hits). All lasted the entire 180-second limit without a pilot KO. The diagnostic run also identified CQC seed `1000682` (326 shots but only one hit), which warrants pathfinding/cover inspection. None is fixed by this measurement-only PR. The upcoming 60 Hz run must determine whether these seeds remain problematic at the live simulation rate.

---

**Artifacts:** [GitHub full natural simulation workflow](https://github.com/PlayerEden/Ricochet-Rumble/actions/workflows/natural-bot-audit-v0938.yml) uploads named `scored-bot-and-map-audit-v0938` JSON receipts. The exact successful run ID, SHA, numeric findings and any failed seed must be appended **after the tool reports it**.

## Caveats and follow-up gates

- 30 Hz headless all-bot matches are a reproducible surrogate, not the 60 Hz interactive render loop. Effects of physics rate, thumb aiming, controller layouts, music/visual performance, app lifecycle, account state and LAN are not validated here.
- Blue seat 0 uses identical bot decision code but has a different index, map starting position and team composition; a team-win split does not establish causal fairness.
- A validated connected maze can still have repetitious tactics or exposed corner traps; review seed-specific no-contact/long-draw cases before changing procedural design.
- Results must not justify silent changes to owner-tested tank pacing or other experimental game physics. Any tuning is a separate draft and per-feature visual/Android QA.
- No new APK is expected for this QA-only milestone; the preceding immutable [v0.9.37 tested APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.37-scored-quick-play-test) remains the exact playable artifact.

## Gate checklist

- [ ] Short probe test exercises actual game code and emits valid reproducible JSON
- [ ] 150 complete natural scored matches and 900 connected, topology-unique layouts finish with raw artifact
- [ ] All actual respawn centers pass collision/occupancy safety assert
- [ ] Audit real observed no-contact, timeouts, TDM win skew, first-hit timing and risky respawns; link actual numbers and seeds
- [ ] Complete next action recommendations from data without unapproved gameplay changes
- [ ] Keep experimental PR draft, no merge or claims of physical approval

**User phone/real-game pacing and Google Play signing remain separate open gates.**

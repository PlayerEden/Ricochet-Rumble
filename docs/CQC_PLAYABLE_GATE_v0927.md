# Close Quarters — first playable scored combat prototype

**Status:** experimental Android/browser gameplay implementation under QA, not integrated or Play approved.
**Branch:** `feature/close-quarters-playable-v0927` based on portable scoring PR #42, which depends on clean v0.9.25 PR #41.
**Goal:** user-requested actual scored CQC as the first example of shared Deathmatch rules, not another survival-mode relabel.

## Implemented candidate

- Clearly labelled **CLOSE QUARTERS — PILOT-ONLY · SCORE TEST** button separate from existing saved Survival Quick Play playlist. Exact 1 human + 3 bots, small procedural map; **no tanks/mechs or vehicle drops/boarding**.
- The *same* pure tested `game-data/rules/scored-match.v1.mjs` compiled to a synchronous classic `web/scored-match.js` (exact Android asset mirror) via deterministic text transform, verified by `tests/scored-browser-parity.mjs`. Script is loaded before legacy `game.js`. No independently maintained scoring algorithm.
- **10 genuine operator KOs / 180 game seconds**; pilot hits call `SectorScored.recordPilotKO` with match-specific monotonic incident IDs, immutable credited score; no scoring on armor, ejection or Guard. Fresh kills/respawns remain independent of finite-life Survival.
- Short downtime (1.6 game seconds), safe candidate evaluation using maze wall collision, active bullets, enemy proximity and LOS, temporary 1.65s spawn guard canceled by firing. If no safe cell exists, respawn remains pending and retries rather than teleporting into a wall. Players can still move/shoot on foot, and AI runs original pathfinding.
- Live HUD uses **YOU KOs / LEADER / 03:00** and shows remaining time (decrements only during actual simulation while unpaused). Actual After Action reports winner/defeat/**DRAW**, time and KOs, target and end cause. NEXT MATCH retains CQC rules but selects a new maze seed, not random Survival.
- Normal survival gameplay, Quick Play playlist and signed release files are untouched by this draft. No Android package metadata/signing or LAN network behavior changes.

## QA and known limitations

- [ ] Node fast smoke: existing 300 seeded maps, Survival/Team Survival, and new actual CQC 10 KOs/respawn/time-limit and rematch.
- [ ] Canonical scored kernel unit tests + exact matching generated browser/Android adapters, syntax.
- [ ] Real Chromium at 740×360/915×412/1280×720: home button fitting, gameplay CQC score/timer and real After Action, no console errors.
- [ ] Android debug APK and unsigned AAB compile from same SHA.
- [ ] Owner physical Android play: human and bots all start on foot, pilot KOs advance score, score clock visible, respawns safe (no tank spawning), timeout end correct, mode isn't accidentally in Survival playlist; review responsiveness and difficulty.
- [ ] Profiling 50+ full bot matches/300 seed respawn safety; balance 10 KOs/3 minutes may be retuned only with evidence.

**Limitations:** Current safe respawn ranking prefers LOS cover and distance, does not fully model multiple ricochets or map-wide spawn camping; pending respawns are retried per simulation step. Prototype uses 1 human + 3 bots, not online/LAN scored mode. No Custom Match rules sliders yet. No automatic 3v3 nor Play signing. Existing v0.9.25 remains rollback; main still v0.9.21, and no merged branches without owner approval.

**Engineering caution:** The current scored kernel's incident log is cumulative per round; accepted 10-point target bounds it for this prototype. For future high-score/long LAN play add bounded dedupe and canonical authoritative packet IDs, not untrusted client claims.

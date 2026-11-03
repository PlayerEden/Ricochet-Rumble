# D3 owner one-phone acceptance card — planned tests, not yet playable
**2026-11-02 — test planning only.** This checklist is for the future D3-A1 APK, **not** v0.9.71. The current v0.9.71 preview still waits for a second Ready human in its LAN room. Do not interpret this checklist as shipping features.

## First one-phone acceptance: D3-A1 host room
Use the same Android owner preview lineage as v0.9.71. **Back up saved records and install over, never uninstall just to force an update.** Record version code and whether install-over retained local Settings, Dossier, cosmetics and backup access.

| Case | What to do on one Android phone | Pass if |
|---|---|---|
| A1 | PLAY TOGETHER → CREATE ROOM, with no second device, select open/discoverable | Room exists with address/status, no fake connected HUMAN, and no Ready gate |
| A2 | Select **TDM 1v1**, start vs bots | Real host human vs AI opponent; can move/fire/eject/reboard/score/finish |
| A3 | **TDM 2v2**, then **3v3** | Correct host + allies versus opposing bots; actual opponents shoot/respawn |
| A4 | Choose host **CORAL**, FF ON, and a nondefault KO target | HUD/team colors/spawns/AI targeting/kill credits reflect Coral and FF; team kill never earns KO |
| A5 | Set **Best of 3**, complete a 2-0 series and a 1-1 decider | Rounds and team win totals truthfully continue; fresh maze/KO ledger each round; NEW SERIES resets |
| A6 | Between rounds change rules, then run a single match | Old Ready/queue/series values don't leak; bot counts and sides update only for new match |
| A7 | Pause/resume, open device notification shade, return, and switch landscape/portrait | No ghost FIRE/aim, controls reachable, onStop disconnect behavior shown honestly |
| A8 | Complete multiple matches and inspect personal rewards | No falsely reported second human, no fabricated online wins or unauthorized Dossier unlock |
| A9 | Leave match to room, then close room and reopen | Hosting closes only when user chooses or Android lifecycle requires; no duplicate rooms/socket leaks |
| A10 | Let game run 15–20 minutes (owner convenience, not performance certification) | No obvious growing stutter/heat, repeated match crashes or UI freeze |

Record outcome per case: `PASS`, `FAIL (steps + screenshot)`, `NOT TESTED`. Note whether host is on Wi-Fi, phone orientation, v-code, game mode, round, seed (if visible), expected vs actual result. User feedback on match pacing, bots, spectator UX copy and whether `START VS BOTS` is discoverable is valuable.

## What one phone CANNOT honestly prove
- Another phone can actually discover the open room via Android NSD or join by local IP.
- Guest sees live gameplay while spectating and cannot issue combat inputs.
- Guest queue actually promotes at the next round/match while retaining color/team score.
- Native sockets survive repeated join/disconnect and busy-room behavior on real Wi-Fi.
- Real latency, jitter, packet drops, input symmetry and room status fidelity on another device.

Those are covered provisionally by **two independent browser clients, Java/network tests, emulator where possible**, then a physical **two-phone same-Wi-Fi** checklist at D3-C. The tester needs only one phone for D3-A1, not a pretend second player.

## One-phone usability acceptance questions
- Is it obvious whether you're in an offline Solo match or hosting a LAN room?
- Does an empty room still feel like a **real playable game**, not a dead waiting screen?
- Are `START VS BOTS`, `NEXT ROUND`, `CHANGE RULES` and `CLOSE ROOM` easy to reach?
- Does squad size reflect the **actual** human+AI roster at all times?
- Is leaving to the room different from closing the room? Are there accidental disconnects?
- Does the game feel consistent with approved control sensitivity and camera zoom?

## Rollback and evidence
v0.9.71 signed experimental checkpoint: [APK workflow run](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41566002036) (versionCode 330001) and [immutable source branch](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-v0971-lan-series-signed-ci-330001). Never claim D3 phone success merely from Node/Chromium. Do not re-sign with a new certificate or force uninstall existing preview.

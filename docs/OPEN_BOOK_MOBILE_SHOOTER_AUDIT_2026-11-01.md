# Sector Rebound — Mobile Arcade Benchmark & Fair Combat Roadmap (2026-11-01)

## Why this audit exists

Owner's hands-on review of installed **v0.9.60 / versionCode 220001**: game is playable, but still needs focused polishing and comparison with established games. Prior reviews singled out thumb-scale pilot aiming, AI offscreen targeting, crowded/uneven vehicle spawns, team spawns and mode coherence. Existing source has **three** independent layers: real game rules, Android fullscreen canvas controls, and bots that navigate using exact actor positions. Do not assume all problems are solved by increasing hitboxes or generating more content.

## Primary reference benchmarks and lessons, not borrowed implementation

| Game or guideline | Confirmed design behavior | Our takeaway |
| --- | --- | --- |
| **Tank Trouble** ([classic game overview](https://geometry.games/game/tank-trouble/index.html), [competitive modes](https://ttoc.ca/gamemodes/)) | Maze corridors, ricochets, steer-then-fire, skillful survival and short repeated rounds | **Preserve** deliberate vehicle pace, angle skill and limited ricochet shells; don't add automatic tank aiming or continuous barrage |
| **Brawl Stars** ([official Play Store](https://play.google.com/store/apps/details?id=com.supercell.brawlstars), [Supercell's spawn/feedback update](https://supercell.com/en/games/brawlstars/blog/game-updates/december-update/)) | Multiple short goal-directed PvP modes, spawned team objectives, respawn location indicators, aim-cancel haptics | Recognizable team's base/goal must be clear every match; show deployment/respawn and objective status, not just a different arena; feedback before and after major events |
| **Soul Knight** ([official app listing](https://apps.apple.com/us/app/soul-knight/id1184159988), [official PvP preview](https://soulknight.chillyroom.com/et/article/base/67)) | Auto-aim supports thumb controls in its PvE game; the PvP preview explicitly supports tapping a weapon and dragging to aim | Make pilot fire understandable and fair with explicit option/feedback; do **not** adopt full lock-on from PvE into a skill-based PvP shooter |
| **Android accessibility guidance** ([Google](https://support.google.com/accessibility/android/answer/7101858?hl=en)) | Touch targets should normally be at least 48 dp square, spaced adequately | Audit actual visible and clickable touch regions across low-height landscape viewports and user-left-handed controls |

These comparisons guide priorities; they are not claims that Sector Rebound has equivalent budgets, players, code architecture, or every listed feature.

## Source evidence from latest Android owner preview

- `web/game.js` bot combat previously checked target position, facing cone, max **385 world units**, wall line-of-sight, and a new camera-space restriction for firing at on-foot human in local Solo. It still navigates toward the exact player location **even when not visible** and previously had **instant first-shot permission** on reacquisition.
- Pilot independent FIRE-drag and option **PILOT AIM ASSIST (LOW)** already exist; assistance is OFF by default, local-Solo and sidearm only, <=200 units, <=5° input cone, <=2° correction, live on-screen unshielded target. This is **not auto-targeting**. Actual physical perceived ease still needs repeatable Android comparison.
- Universal Forward Bays and route-fair mech/supply tests passed previously: 360/360 tested neutral mechs within 1 maze step team-access difference, no detected vehicle overlaps, 341/360 fair first supply drops possible. This does not replace live base-camping or mobile performance tests.
- Existing CTF is promising but physical play revealed additional need for guidance and readable objectives. A fully remote two-phone LAN match remains not accepted.

## Current isolated implementation: human pilot bot-fire acquisition window

- Only bot-to-local-human-pilot fire in **Solo** receives a continuous valid target-acquisition delay: **Casual 0.32s, Normal 0.24s, Spicy 0.16s**. The bot still has to face the target in its existing aim cone, be within normal combat distance and have maze LOS **and** both target and bot inside the human player's camera.
- Any blocked or offscreen target clears the timer; bot must reacquire after re-entering view. Accumulation is capped at 0.05s per engine update to avoid large-frame spikes bypassing the intended reaction.
- AI movement/pathfinding, ricochet physics, bot vs bot, tank/mech vs human, CTF objectives, LAN protocol, human sidearm damage, and touch UI were not modified.
- Actual 9-fixture targeted test extends `tests/pilot-combat-fairness-qa.mjs` to check skill-tier first-fire frames and reacquisition, as well as former view/aim setting checks. `web/game.js` and Android game asset share a byte-identical blob.
- This is **step one of fair combat AI**; it's not a human perception simulator and does not claim to measure natural win rates. Future A/B should test bot pursuit of last-known positions versus exact offscreen target knowledge separately.

## Next-stage priority and acceptance

**Phase 1 — reaction fairness (current):** verify full existing browser, CTF, vehicle, and visual suites; archived logs and test metrics required before any APK.
**Phase 2 — tactical readability:** no UI clutter. Evaluate compact world-space opponent pre-fire telegraph, pilot shot direction indication and clear flag pickup/capture/return status. Ensure visible in 740x360 and smaller landscape without occluding controls. Avoid revealing occluded enemies.
**Phase 3 — actual thumb control audit:** compare opt-in low assist OFF/ON on Android, first projectile direction after FIRE-drag, thumb occlusion and dead zones, left-handed mode, min 48dp clickable touch targets. Consider a configurable preview/hold-to-aim interaction only **after** physical evidence; preserve steer-to-aim tank identity.
**Phase 4 — objective/flow polish:** make team Forward Bay respawn and neutral mech locations legible, review ~3-minute scored match readability, automatic next match/menu friction and objective ownership. Test CTF match completion and positive/negative feedback.
**Phase 5 — release safety:** 2-phone host/guest and QR/code setup, network recovery, signing continuity and Play-specific key separation. Avoid Play ship claims before actual device and network tests.

After each phase: targeted fixtures, 30+ procedural seeds/soak as appropriate, Android/browser byte parity, full regression, checkpoint and rollback plan.

## Preservation / device release rules

Everything stays on the experimental GitHub branch `experiment/pilot-ai-reaction-window-v1`. No merge to stable main, no alteration to archived pilot/CTF and route-balanced branches. Current owner installed preview **220001** stays unchanged. Future owner test APK must preserve package ID `com.playereden.ricochetrumble.preview`, the previously installed certificate SHA-256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`, and **versionCode greater than 220001**, so existing on-device progress is not lost.

Previous verified **pilot-combat/vehicle** checkpoint for rollback: `experiment/pilot-perception-soft-assist-v1` ([passing CI 41355730770](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41355730770)). Current candidate workflow: [pilot AI reaction CI 41364787523](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41364787523).

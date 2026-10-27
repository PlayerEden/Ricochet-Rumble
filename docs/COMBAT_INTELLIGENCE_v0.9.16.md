# Sector Rebound v0.9.16 — Combat Intelligence, Arena Fairness & Stalled-Actor QA

## Goals
Make solo bots less predictable and improve reliability of procedural skirmishes. This is an **AI/physics correctness** pass. No changes to live HUD, menus, camera, tank/mech health, projectile caps, armor, damage, sound design or host/guest network protocol.

## Changes in the playable build
### Tactical but fair bots
- On-foot bots prioritize an actual **clear, enterable vehicle bay** over chasing tanks while exposed.
- Equipped bots can pursue **nearby useful supplies** based on difficulty-limited attention radius (casual ~205, standard ~325, challenging ~425 world units); repair only when armor is damaged; do not casually overwrite an active buff.
- Low-armor tanks or exposed pilots can choose a short **bounded evasion point** if a nearby threat is visible and a valid retreat position exists.
- Existing difficulty-based pace/aim thresholds are retained, and bots do not receive hidden armor, accuracy, damage or weapon-cap bonuses.
- Bots use normal maze connectivity/pathfinding. When immobilized by a wall/actor for around one second, try small alternating local steering corrections; cannot teleport or clip through walls.

### Important collision correction
A reproducible small-arena simulation showed two live tanks **already overlapping** by a small amount near a wall. The previous collision rule refused *any* subsequent motion until completely separated, creating an indefinite mutual lock.

Movement now permits an already-overlapping actor to **increase separation** while never allowing that step to move deeper into the overlap. Ordinary non-overlapping actors remain solid. This fix protects players and bots, including after unusual respawns, ejections or replicated position adjustments.

## Automated fairness and pacing diagnostics
CI runs the existing smoke test suite (including seeded procedural-generation and long fixed-step simulations) PLUS 18 additional fixed-seed scenarios:
- 6 each across **small, standard and large** maps, rotating relaxed/standard/challenging AI.
- Every initial spawn must be non-wall and maze-grid-connected to the human starting cell.
- Each scenario simulates **15 seconds**, with two bots against one **stationary** human.
- Record bot travel, shot events, KOs, max active projectiles, bot tactical-intent samples and longest near-zero-movement interval.
- Assert finite movement, bounded projectile population, working AI decisions, and no unsafe spawns.
- Upload the complete inspectable JSON report as a separate artifact.

### Findings from the 18-scenario diagnostic
| Measure | Before overlap correction | v0.9.16 final |
|---|---:|---:|
| Longest almost-stationary bot period | 8.85 s | **1.05 s** |
| Mean combined bot travel / scenario | 4,485 world units | **4,652** |
| Total recorded shot FX | 194 | **196** |
| Sessions completed within 15s | 0 / 18 | **0 / 18** |

The 15-second horizon is a navigation/stability sample, **not** a final match-length test. The stationary human is intentionally unrealistic. Do **not** interpret these results as a fair human win-rate, tank-vs-mech balance or evidence of compelling engagement. Longer real-player sessions and two-phone gameplay remain necessary.

## Regression contract
- Vehicle exit, respawn, active pickup handling, network snapshots and UI are still covered by the existing smoke suite.
- New tests check supply/repair choices, declining an unnecessary pickup, on-foot vehicle recovery, bounded evasion and the physical ability to escape pre-existing actor overlap without new penetration.
- Chromium before/after QA: 39 images covering main menu, settings, help, arena, tank movement, pause and the after-action layout fixture across **740×360**, **915×412** and **1280×720** landscape.
- Browser and Android game code are maintained identically. The debug APK build and artifact uploads must pass.
- We have **not** physically tested two Android devices together. No claim of zero remaining bugs.

## Checkpoint
- Branch: `dev/sector-rebound-combat-intelligence-v0916`
- Rollback: `dev/sector-rebound-feedback-v0915`
- Android versionCode **33**, versionName `0.9.16-combat-intelligence`
- GitHub Actions: https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40438222025
- Artifact names: `sector-rebound-v0.9.16-debug-apk`, `sector-rebound-v0.9.16-visual-before-after`, `sector-rebound-v0.9.16-balance-qa`
- Android APK: **78,417 bytes**, SHA-256 `29de07c70734299f594ed356d846b001d965ebab6c7ddb230e359381bf9c12e8`.

## Next gate
Owner playtest for natural solo difficulty, subjective match pacing and the new recovery behavior. Two-phone same-Wi-Fi host/guest state agreement and Android audio listening remain separate manual acceptance checks when the owner has time.

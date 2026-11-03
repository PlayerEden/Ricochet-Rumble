# Sector Rebound — Input-Driven Contested CTF Audit (2026-11-01)

**Automated contested gameplay and full regression: PASS. Player balance/physical Android acceptance: PENDING.**
Source-tested commit: `47e4b4004dd004336c8a17c907900f7226611dc6`.
[Passing Actions workflow 41292124841](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41292124841) |
[Real-match telemetry and QA screenshots artifact 13077733235](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41292124841/artifacts/13077733235).

## Scope, isolation and evidence standards

The test-only `tests/ctf-contested-human-attack.mjs` instruments the real Chromium-loaded `game.js`, but injects **only directional player input and the existing `tryInteract(0)` EXIT interaction**. It never teleports the human, skips wall/actor collision, sets a flag carrier, modifies actor health/damage/accuracy, suppresses defenders, or shortens the field. The scripted human navigates the existing generated maze graph, drives a real tank until close to Coral's flag, exits through the real pilot interaction, and must grab the actual objective within the flag rules. The four seeded 180-second attack sessions preserve the real AI, bullets, pilot deaths/respawns, flag auto-return and scoring.

The test-controlled human **does not shoot**; this is deliberately a constrained baseline to prove rule integration and defensive reactions, **not a representative skilled player, a fair 1v3 competition sample, or a 2-human LAN test**.

## Actual CTF match outcomes

| Seed / map | First legitimate Cyan flag theft | Frames carrying Coral flag | Defender chose intercept | Escort chose support | Cyan flag captures |
|---|---:|---:|---:|---:|---:|
| 101 / small | 33.08s | 85 | 85 | 26 | 0 |
| 102 / small | 45.65s | 550 | 550 | 288 | 0 |
| 104 / small | 88.67s | 47 | 47 | 47 | 0 |
| 201 / standard | 37.10s | 137 | 137 | 99 | 0 |

- **4/4 human attackers stole the flag by actual movement and EXIT**. Attacker could lose the flag to normal pilot deaths and the defender could physically return the dropped flag. True flag-event logs include Coral runner pickups/captures and in some scenarios cyan escort recoveries.
- **100% of observed human-carrier frames had Coral defender's pure objective decision set to `intercept`, targeting the real human location**. The recorded defender displacement between first and last carrier frames was roughly 11–33 world units, which does **not** establish that the defender successfully chased a long-distance carrier. Most encounters occurred close to Coral's guarded flag.
- Cyan's escort selected carrier support for 26, 288, 47 and 99 observed frames, respectively. Its actual protective effectiveness / ability to win firefights was **not** proven.
- **No legitimate Cyan capture observed** across the four sessions. The simulated attacker did not fire and died 6–9 times per run; this alone does not justify buffing/nerfing either team.
- No invalid human coordinates; the underlying browser suite and all existing CTF, natural maze, Forward Bay 300-seed, Quick Play, save/backup, visual and Web/Android source-mirror checks passed. No existing production gameplay files were changed.

## Design implications / proposed next audit

1. Use a human-input script with **normal firing controls**, cover/pilot survival and an objective-focused escape strategy, on the exact same seeds. Do not grant the player auto-aim, infinite armor or privileged map information. If first capture remains rare, determine whether the issue is AI strength or player navigation/weapon use before changing gameplay.
2. Track defender **path length and distance-to-carrier** in sequences where an actual carrier escapes the immediate flag radius. The current `intercept` decision test is necessary but not sufficient evidence of useful pursuit.
3. Track escort proximity and shot-blocking/survival benefit while the human carries a flag. With only one Cyan escort against a Coral runner and defender, 1+3 team symmetry is not guaranteed.
4. When the real behavior is understood, evaluate CTF score cues/minimap objective prompts and eventually 2-player CTF host authority and state replication as separate opt-in milestones.
5. Physical Android touch/FPS/comfort and two-phone network testing remain owner gates. No APK built and no merge/release authorized.

## Durable provenance and rollback

- Current experimental test branch: `experiment/ctf-contested-human-attack-v1` at tested source `47e4b4004dd004336c8a17c907900f7226611dc6`. The subsequent documentation commit changes docs only.
- Earlier complete 18-seed gameplay candidate preserved on `experiment/ctf-defender-stall-recovery-v1` at `bad09682016720f5d6a5b228d4311cf478c62792`, with passing [Actions 41291383897](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41291383897).
- Stable `main`, draft integration PR #85 and Android Preview 100061 remain untouched; further new CTF implementation should branch from this documented experimental state or the recovery checkpoint, never fast-forward stable without independent owner approval.

Development process: isolate -> genuine movement/control QA -> inspect objective/combat events -> full regression -> archive exact-source evidence -> physical owner acceptance before promotion.

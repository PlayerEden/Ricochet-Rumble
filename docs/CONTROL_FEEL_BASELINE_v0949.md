# Sector Rebound v0.9.49 — Phase A Controls Baseline (Automated PASS)
**Measured:** 2026-10-30 · **Status:** Actual game-source 9-case controls baseline PASS; physical gameplay experience PENDING. No production runtime changes.

## Exact source and evidence
- [Plan](DEVELOPMENT_EXECUTION_PLAN_POST_AUDIT_2026-10-30.md) / [tracking issue #76](https://github.com/PlayerEden/Ricochet-Rumble/issues/76).
- [Draft measurement-only PR #77](https://github.com/PlayerEden/Ricochet-Rumble/pull/77), based on [v0.9.48 UI layout draft #74](https://github.com/PlayerEden/Ricochet-Rumble/pull/74). Original QA-tested source SHA `6196e0305ff668760fb30ac0a2b5289c7ad8c2e1`; parent `9ab1b4871d0dc2cc4bfe3f9df79ba7920b9aa09f`.
- [Actual Node + real production `tankMove()` / `shoot()` CI **SUCCESS**, run 41021741127](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41021741127). GitHub Actions artifact `control-feel-baseline-v0949-41021741127` contains `baseline.json` with **all 9 mode/vehicle rows**, held 30 days by workflow. Baseline console line: `CONTROL_FEEL_SOURCE_BASELINE {"survivalTankSpeed":222,"scoredTankSpeed":166,"speedRatio":1.337349,"survivalTurnRadPerPhysicsFrame":0.2,"scoredTurnRadPerPhysicsFrame":0.043333,"scoredPrecisionAimRadPerPhysicsFrame":0.03,"conclusion":"Measurable handling discrepancy; NO gameplay changes made"}`.
- Workflow PASS confirms `web/game.js` and bundled Android `game.js` match byte-for-byte; same for CSS, scored-match kernel and full earlier `tests/smoke.mjs` suite.
- Tests invoke the **real loaded game source** with a fixture hook, the actual `tankMove` and `shoot` functions. One simulated 1/60-second input, no player hands, no Android device, no match-outcome or performance claims.

## Behavior recorded — common local human input

| Unit | Survival nominal movement units/s | Scored FFA/TDM nominal movement units/s | Survival first-frame hull turn | Scored first-frame hull turn | Scored fine-AIM only |
|---|---:|---:|---:|---:|---:|
| Tank | 222 | 166 | 0.200000 rad | 0.043333 rad | 0.030000 rad |
| Mech (0.76×) | 168.72 | 126.16 | 0.200000 rad | 0.043333 rad | 0.030000 rad |
| On-foot pilot | 268 | 268 | 0.108333 rad | 0.108333 rad | 0.108333 rad |

**Movement:** measured first-frame velocity is nominal speed multiplied by the engine's `dt*9 = 0.15` acceleration blend, with otherwise identical input and step duration. Tank projectile speed is 415, mech shell 355, pilot sidearm 475, verified through the actual `shoot()` projectile. Scored FFA and scored TDM produced the same movement/aim formulas in the tested setup. The pilot is intentionally different from vehicles.

**Important caveat:** 222 vs 166 refers to nominal movement targets, **not full-match observed average velocity** across corners/obstacles/AI. First-frame 0.20 vs 0.043333 rad reflects steering toward the same 90° joystick direction and does not prove a human can steer at that rate comfortably. Survival vehicle standalone precision-AIM only is absent in the tested behavior while scored vehicle fine AIM turn is 0.03 rad/step. Don't label that alone a bug: the modes currently have different control policies.

## Decisions and next evidence gate
- **Do not immediately unify movement.** This is a real code-level difference, but we need a specific human observation that the modes feel inconsistent or ricochet precision suffers. The owner previously requested slower, more deliberate scored tanks, which have been preserved.
- Next Phase B, when approved by evidence: small A/B, one control variable at a time, with 5°/15° bank-shot aiming, 180° turn, mech comparison, move+FIRE, and pilot eject/reboard on the actual phone. Record player comfort and precision without changing the locked P-03 pilot.
- Source check **PASS**, manual phone test **PENDING**, Android update signing **BLOCKED**, two-phone LAN **PENDING**.
- Parent integration PR #71 and UI PR #74 remain draft/unmerged; `main` runtime is older v0.9.21. This test-only PR #77 does not authorize a broad merge.

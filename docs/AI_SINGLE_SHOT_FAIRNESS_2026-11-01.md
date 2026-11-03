# Sector Rebound — Bot Aim/Commit/Recover Fairness Checkpoint

**Scope:** isolated experimental branch `experiment/ai-commit-shot-parity-v1`; stable main and installed Android v0.9.62 (versionCode **240001**) unchanged. This checkpoint follows universal release-to-fire, dotted trajectory and one-bounce preview.

## Owner goal

Bot shooting should share the same practical **angle, visibility, time and ammunition limitations** that a human experiences using the new release-to-fire controls. Replace continuous frame-held autofire with deliberate single-shot acquisition, not an arbitrary blanket nerf or instant aiming lock.

## Code changes

- All bot pilots, tanks and mechs now enter a **visible-LOS acquire → hold fixed aim → turn physically → commit one shot → recover** cycle. New targeting persists only while a valid live target remains visible and in line-of-sight.
- Casual takes 0.44 seconds, Normal 0.32 seconds, Spicy 0.24 seconds to acquire a vehicle or other nonlocal-pilot target. For the local on-foot Solo pilot, preserve the prior shorter acquisition windows of 0.32 / 0.24 / 0.16 seconds with the old pilot-view protection.
- After a real successful shot, bot recovery is 0.58 seconds Casual / 0.43 Normal / 0.35 Spicy, then **reacquisition is required before the next shot**. Normal tank cadence is therefore limited to roughly 0.75s between shots in favorable conditions, rather than firing every 0.36s physical cooldown. A mech still obeys its own 0.62s fire cooldown; the shared engine enforces actual projectile caps.
- A bot captures a firing direction **once per acquisition** with small deterministic per-shot aim error (maximum +/-0.085 Casual, +/-0.05 Normal, +/-0.025 Spicy radians); it cannot retarget perfectly each frame while committing. It rotates through `tankMove` using the same human pilot 6.5rad/s and vehicle rates (2.6rad/s in scored matches, 4.2rad/s outside), with no heading teleport or homing shells.
- Off-screen AI cannot shoot at the local Solo human whether on foot **or in a tank/mech**. Bot-to-bot combat and LAN remain LOS-limited but do not use the Solo player's own camera.
- Target identity changes from vehicle to pilot (ejection) restart acquisition. Losing LOS/offscreen view also clears acquisition.
- CTF runner/defender/escort objective selection, pathfinding, speed, obstacle collision, ammo bounce/collision, powerups, score and host authority are unchanged by design.

## Evidence and outstanding limits

The first integration commit passed the complete existing regression [GitHub Actions 41384190164](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41384190164), covering Quick Play, CTF, Forward Bays, vehicle balancing, pilot AI, backup and visual smoke.

A further targeted browser matrix at `tests/bot-shot-parity-qa.mjs` evaluates **18 engine fixtures** (two landscape viewports × three difficulty tiers × three weapons) with real physics tick and actual shot intervals; tests acquisition delay, recovery, camera occlusion, and ejection reacquisition. These are **controlled fixtures with stationary bot movement objective** to isolate firing; natural CTF and other full-match diagnostics run separately in the complete workflow. Record the CI result before considering this branch release-worthy.

### Limitations and future audit

- AI still uses exact enemy positions for strategic pathfinding, even when out of sight. This is firing parity, **not** a simulated human perception model.
- A frozen bot shot direction is deliberately imperfect against moving targets; human physical testing must decide whether this creates fair difficulty or frustrating incompetence.
- No real two-phone network play or device aiming feel is verified. Don't claim multiplayer parity on source tests alone.
- A useful next UI polish after human play is a subtle, unobtrusive visible aiming tell from an enemy when it is preparing a shot; avoid revealing bots behind walls. This is not part of this checkpoint.

## Rollback and Android continuity

Rollback source: `experiment/universal-release-ricochet-v2`, [full verified CI 41373810780](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41373810780). Its owner-preview Android APK versionCode **240001**, app ID `com.playereden.ricochetrumble.preview`, and signer SHA256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc` must remain install-over-compatible. If an AI fairness APK is built, it requires the same signer and a versionCode strictly greater than **240001**. Do not merge main or overwrite accepted Android tester assets without a green QA gate.

## Verified end-to-end audit — PASS

[GitHub Actions #41384505125](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41384505125) **passed**, tested source SHA `e3700ea405c75acbb2cd9b18afec26e1e242e297`. [Auditable QA artifact #13115320255](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41384505125/artifacts/13115320255) includes `qa-results/bot-shot-parity.json`, pilot/control results, team route balance and visual screenshots.

Actual **controlled still-target** physics results: each column below is observed in both 740×360 and 960×540 Chrome viewports, using 1/60-second frames. Values are first-shot delay / minimum inter-shot interval in seconds (rounded):

| Weapon | Casual | Normal | Spicy |
| --- | --- | --- | --- |
| Pilot | 0.33 / 0.90 | 0.25 / 0.67 | 0.17 / 0.52 |
| Tank | 0.42–0.45 / 1.02 | 0.33 / 0.75 | 0.25 / 0.60 |
| Mech | 0.45 / 1.02 | 0.33 / 0.75 | 0.25 / 0.63 |

18 test fixtures and all full-game browser/CTF/Forward Bay/vehicle/backup/visual regression tests passed. These are synthetic controlled-target timings, **not** measured actual difficulty or competitive human-vs-bot accuracy. The test also verified no off-screen first shot on a human vehicle, reset after camera occlusion, and re-acquisition on ejection. Main remains untouched.

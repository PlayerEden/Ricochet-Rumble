# Sector Rebound M13-E — Natural battle pacing study (November 6, 2026)

**Status: experimental, synthetic QA only. No gameplay or production changes.** Parent: [M13-D draft PR #145](https://github.com/PlayerEden/Ricochet-Rumble/pull/145); current physical-test candidate remains the independent [SR M13 Unified APK](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/42097017237/artifacts/13447637959) from [PR #144](https://github.com/PlayerEden/Ricochet-Rumble/pull/144). Visual PR #141 and gameplay PR #143 stay unmerged.

## Why this milestone

The 20-seed M13-D simulated active-player median was **90.8 sec** for standard 3-bot/3-life Survival, against an *aspirational* 150–240 sec; TDM 30 KOs/300 sec produced **181.5 sec**, versus a 240–360 sec aspirational range. More time is not automatically more fun. We want genuine combat events, movement, survival and camera opportunities without minimum-round timers, fake KOs, altered AI fairness, or involuntary changes to existing saved setups.

## Method: apples-to-apples seeded A/B

New test-only scripts replicate the existing M13-B engine-loader harness, changing **only deployment parameters for Survival**, or **only immutable scored-match target/clock fields inside a test VM for TDM**. They run the same actual combat engine, bot input, maze generation, projectile physics and scoring. A computer-controlled operator is not a human. Idle operator does not move or fire. No code is embedded in the APK and **no new package** is produced for this step.

### Survival, 20 deterministic seeds per row

| Profile | Map | Opponent bots | Lives | Operator |
|---|---|---:|---:|---|
| Base | Standard | 3 | 3 | AI proxy |
| More lives | Standard | 3 | 5 | AI proxy |
| More opponents | Standard | 4 | 3 | AI proxy |
| Both | Standard | 4 | 5 | AI proxy |
| Larger sector | Large | 4 | 5 | AI proxy |
| Base idle | Standard | 3 | 3 | Idle |
| Both idle | Standard | 4 | 5 | Idle |
| Larger sector idle | Large | 4 | 5 | Idle |

**Safety and feel gates:** a useful candidate should have more genuine engagements and fewer accidental sub-minute finishes, *not* simply force the player to wait while bots wander. The original custom choices, saves, zero-bot practice, death/winner logic, spectator controls and default 3/3/standard M13-C package remain unchanged. All idle trials are capped at 420 seconds and must be identified as capped rather than pretended to finish.

### TDM, 20 deterministic seeds per row

| KO target | Clock cap |
|---:|---:|
| 30 | 300 seconds (current M13-C preview) |
| 35 | 300 seconds |
| 40 | 300 seconds |
| 35 | 360 seconds |
| 40 | 360 seconds |
| 45 | 360 seconds |

**Safety and feel gates:** inspect median and P10/P90 time, *score-target finishes vs clock finishes*, draws, and mean KOs. Raising a target to 40 but causing nearly every game to time out is **not automatically an improvement**. Neither Preview TDM target nor LAN score authority is altered; testing a six-minute solo cap is not permission to modify host/guest rules.

## Run and inspect

- `.github/workflows/m13-e-pacing-lab.yml` automatically runs two independent jobs (Survival 160 observations and TDM 120 observations, **280 total**), guarding identical web/Android source parity and unchanged scored kernel.
- Raw files: `qa-results/m13-e/survival-profile-trials.json` and `qa-results/m13-e/tdm-target-clock-trials.json`; readable Markdown tables uploaded as Actions artifacts and posted to the job summary.
- **CI passing only means evidence is structurally complete and source parity passes.** We must read results, then decide whether a new **separate** Android test package is worth creating. Keep M13 Unified untouched until owner feedback.

## Release constraints

- [ ] Read both 20-seed distributions and identify a clearly better candidate, or reject them if gain is fake/timeout-heavy.
- [ ] Owner's CQC/FFA/TDM/Survival + spectator phone evaluation on original M13 Unified.
- [ ] Candidate-specific real Chromium/Android preview if any actual rule change is proposed, with **distinct package name and debug signer**, no installed app overwrite.
- [ ] Real two-phone LAN, correct host-authored score targets, phone FPS/thermals, update-safe signing/data continuity.
- [ ] **Explicit owner approval** before merging any underlying M13 draft to main.

**Rollback:** discard this stacked M13-E study branch; no game files or Android package have been changed. Keep [M13-C rollback checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/m13-c-unified-art-battle-ci-green-2026-11-05).

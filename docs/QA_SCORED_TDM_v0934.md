# v0.9.34 — True scored 2v2 TDM: first milestone quality audit

**Date:** 2026-10-29  
**Review:** [Draft PR #53](https://github.com/PlayerEden/Ricochet-Rumble/pull/53), originally branched from v0.9.33 pilot parity. Do **not merge**. Stable `main` remains the accepted v0.9.21 development baseline.

## Implemented (verify against tested source, not merely the mode design)
- An explicit test-only **TEAM DEATHMATCH** lobby entry, not a relabeling of finite-life TEAM SURVIVAL and not yet part of the curated Quick Play playlist.
- A 2v2 Standard procedural maze: human pilot 0 (Blue), ally bot 2 (Blue), bots 1/3 (Red); deterministic Blue/Red colors across characters and vehicles.
- Reuses original `SectorScored` immutable `mode:'teams'` kernel, exact team IDs `[0,1,0,1]`, aggregate **15 operator KOs / 300 simulation seconds**. Friendly fire is blocked. Player and AI pilot deaths score for their actual team only. Tank armor damage, vehicle destruction and pilot ejection do not score.
- Shared safe delayed scored pilot respawns, vehicle recovery, independent FFA-era vehicle precision AIM/FIRE, no hidden automatic firing. Scores are shown Blue/Red; After Action separates personal operator KOs from genuine team outcome and team scoreboard. NEXT MATCH preserves TDM with a fresh seed.
- Corrected a real in-game self-ricochet messaging defect across scored modes: self-inflicted pilot death counts as a death, but no team or individual KO is claimed. Follow-up test initially failed because the test loop incorrectly compared to **decreasing** vehicle armor; fixed to use initial armor before asserting ejection.

## Verification ledger
| Check | Status | Evidence |
| --- | --- | --- |
| Web/Android mirrored HTML/CSS/JS and Node syntax | Automated PASS on latest corrected source | [Fast CI 40825503347](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40825503347) |
| 300 seeded mazes, existing Survival/CQC/FFA/LAN regressions | Automated PASS | Same fast run |
| TDM real team assignments, no friendly hits, armored ejection, true KO, bot ally scoring, 15-KO win, timeout draw, rematch new seed | Automated PASS | Same fast run |
| Ricochet self-death produces no fake team KO | Automated PASS | Same fast run |
| Real Chromium menu and game scenes at multiple landscape sizes | **Automated PASS** (base TDM browser/layout scenes); extended TDM-specific scenario **PENDING** | [Full QA 40825503334 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40825503334), [extended 40825789109](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40825789109) |
| Debug APK and unsigned AAB from same game SHA | **Automated PASS on core gameplay SHA; re-check extended TDM QA** | [Full QA 40825503334 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40825503334) |
| 50+ *naturally simulated* bot TDM matches, measured team fairness/timeout/KO rates | **NOT RUN** | Separate balancing gate; scripted forced-KO tests do not substitute |
| Actual owner handset acceptance, touch/turn feel, long sessions and two-phone LAN | **MANUAL PENDING** | Owner unavailable for phone playtest; LAN not part of scored TDM yet |

## Known limits and quality follow-up
- v0.9.32 precision vehicle feel and v0.9.33 pilot controls remain unapproved physical-phone experiments. Scored TDM inherits them as an explicit experimental branch; don't call them accepted by passing CI.
- The scoreboard now aggregates teams, but human perceived target clarity and detailed post-match presentation require a physical-phone pass.
- Real bot performance and spawn fairness are not guaranteed by direct injection/forced operator-KO tests. Run natural encounters with results distribution and end-time statistics before playlist promotion.
- Existing procedural tests verify connectivity and topology diversity; repeated-layout deduplication and dynamic respawn exposure need later work.
- No scored LAN networking, remote ranked play, production signing, save migration or Google Play store readiness is claimed.

## Acceptance decision
**Conditional experimental code milestone:** fast checks and base full Android/Chromium QA passed; the new TDM-specific real Chromium match-flow test is still pending in run 40825789109; actual owner hardware verdict remains pending. Keep draft PR #53 isolated and preserve v0.9.28 CQC, v0.9.31 thumb comfort, v0.9.32 precision and v0.9.33 pilot parity prereleases as rollback references.

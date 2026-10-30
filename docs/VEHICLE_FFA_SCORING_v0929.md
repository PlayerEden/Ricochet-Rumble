# Sector Rebound — Scored Vehicle Free-for-All v0.9.29 Test Gate

**State:** New **experimental playable** candidate, not yet QA certified or merged.  
**Source base:** owner-positive [v0.9.28 CQC Aim Feel](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.28-cqc-aim-feel-test), [draft PR #45](https://github.com/PlayerEden/Ricochet-Rumble/pull/45), extending the SAME canonical scored-match kernel from [pure rules PR #42](https://github.com/PlayerEden/Ricochet-Rumble/pull/42).  
**Owner decision:** Keep v0.9.28 CQC control feel provisional "WAY better," don't retune without specific evidence. Implement scored vehicle FFA next, then balanced 2v2 TDM, then Custom Match.

## Actual playable rules

- New separately labelled **SCORED FREE-FOR-ALL — VEHICLES · KO TARGET · TEST** main-menu button. **Not silently part of existing curated Survival Quick Play.**
- 1 human + 3 AI, standard freshly generated maze, initial tank for each participant and spare tanks/mech accessible to pilots; 10 **genuine pilot** KOs or 240 **active gameplay** seconds. No finite stock elimination; timed draws possible.
- **Armor damage and destroying a vehicle DO NOT score a kill.** Existing vehicle armor decrement and pilot ejection with short safety shield run first. Only then can a vulnerable actual on-foot pilot death call `SectorScored.recordPilotKO`, with per-match deduped incident ID.
- On scored pilot death: short delay, safe on-foot spawn via existing canonical collision/actor/bullet/LOS ranker; KOs/deaths attributed exactly once; pilot can locate and **enter another empty tank/mech**. New healthy vehicles appear from original deployment system and wrecks recycle, preserving ongoing vehicle access.
- CQC pilot-only **still has zero vehicles or boarding**; independent approved FIRE thumb drag and slowed on-foot aiming remain in both scored presets where on foot. Original Solo/Team Survival existing limited-life and vehicle controls unchanged.
- Separate pause-aware clock, shared accurate score HUD and After Action; NEXT MATCH same scored FFA preset and fresh maze seed. One shared kernel rather than a new score implementation.
- Defaults are exploratory balance hypotheses, not proven ideal: vehicle matches may require more than 4 minutes to reach 10 genuine pilot KOs. Sample real combat telemetry before retuning.

## CI and acceptance

- [x] [Fast CI **40638575991 SUCCESS**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40638575991): 300 seeds and all old Survival/CQC, exact tank armor→eject→pilot KO and safe respawn, re-entry, 10-KO win/4m DRAW/new sector tests.
- [x] [Full real Chromium **40638575751 SUCCESS**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40638575751): scored FFA menu→armor/eject without KO→10 pilot KOs→truthful After Action→NEXT MATCH→4-min DRAW, existing CQC, mobile landscape snapshots and mirrored Web/Android source.
- [x] Android debug APK and unsigned AAB built successfully in [full QA 40638575751](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40638575751), exact game/test SHA `d9933a8edb585b05d71408cd1cff9a867f6710ea`. **Experimental debug only**, not Play signed or merged.
- [ ] Owner physical phone comparison: tank/mech fight, ejection and pilot movement, re-entry, KO accounting, respawn fairness, match time, score UI, NEW SECTOR; check CQC unchanged.
- [ ] Record performance, 50+ complete AI match telemetry and 300+ dynamic respawn scenarios for balance before release.

## Risks / strict boundaries

Keep a pilot's `vehicleId` cleared after ejection and KO; never let a wreck or armor hit increment `operatorKOs`. Score and win conditions must never depend on finite-life Survivor elimination state. Do not introduce scored team logic until #36 separately implements fair 2v2 assignments. No support for custom script rules, 3v3 or online matchmaking. No change to stable `main`, existing debug APKs and signing. [Scored FFA issue #37](https://github.com/PlayerEden/Ricochet-Rumble/issues/37) and [Custom Match #38](https://github.com/PlayerEden/Ricochet-Rumble/issues/38).

## Exact APK release and test result — 2026-10-28

- **[v0.9.29 scored vehicle FFA prerelease](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.29-scored-vehicle-ffa-test)**, original QA-built **[APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/download/v0.9.29-scored-vehicle-ffa-test/sector-rebound-v0.9.29-scored-vehicle-ffa-debug.apk)** (96,337 bytes), attached ~6.2MB Chromium visual QA ZIP + SHA256 hashes. Recovered **byte-for-byte with no recompilation or resigning** from [successful QA workflow 40638575751](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40638575751), exact source SHA `d9933a8edb585b05d71408cd1cff9a867f6710ea`, via one-off [publisher 40639160628 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40639160628), then removed the one-use publisher workflow.
- Branch [**DRAFT PR #46**](https://github.com/PlayerEden/Ricochet-Rumble/pull/46) retargeted to owner-positive v0.9.28 [aim PR #45](https://github.com/PlayerEden/Ricochet-Rumble/pull/45) for accurate 9-file review diff (paired runtime assets, two regression tests and this handoff). All upstream CQC score/aim/Survival code and immutable earlier APKs preserved. No merge to stable main.
- **Manual acceptance open:** owner to install v0.9.29, verify armor/ejection not credited as KO, genuine pilot death scores, vehicle recovery, reasonable 10-KO/4-min match pacing, respawn safety, and CQC controls unchanged. 50+ natural full AI matches and 300-seed *dynamic* spawn fairness telemetry remain future. Android production signing/update continuity and LAN scored PvP not tested.

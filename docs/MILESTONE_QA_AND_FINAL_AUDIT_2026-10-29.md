# Sector Rebound — Milestone QA and final cross-system audit

**Checkpoint: 2026-10-29.** This is the execution ledger for the user's requested development workflow. A major feature is implemented on a reviewable branch, audited with recorded evidence, then the next feature may proceed. Real phone approval remains separate from automated validation and does **not** become an automatic pass simply because development continues. No unapproved experimental branches may be merged into stable `main`.

## Repeatable gate after EVERY major implementation
1. **Scope and protection:** state player-visible functionality, explicit non-changes, branch dependency, known-good APK/source and rollback.
2. **Code & source truth:** review exact diff, scoring/vehicle/pilot rules, UI and Web/Android mirrored game files, audit for fake/unimplemented labels.
3. **Fast test:** syntax, scored KOs vs armor/ejection, match clock/paused time, collision and no-friendly-fire, safe respawn, 300 deterministic maze seeds, survival/CQC/FFA regression and connection protocol isolation.
4. **Interactive visual QA:** real Chromium game menu/match/After Action, working touch (not only a scripted state), no clipped/scrolling UI at 740x360, 915x412 and 1280x720; compare to last accepted baseline.
5. **Android QA:** debug APK + **unsigned** AAB from the exact QA source SHA; no claim of release signing or Google Play readiness.
6. **Evidence:** link successful/failed run, exact SHA, screenshot/QA ZIP, SHA256, immutable prerelease APK where appropriate, manual phone test procedure and open issues.
7. **Balance and acceptance:** for scored modes conduct >=50 natural AI matches with score/contact/timeout/spawn fairness sampling when telemetry exists; owner physical phone acceptance when available; don't silently change approved controls.

Use states **Automated PASS / Automated FAIL / Manual PASS / Manual PENDING / Blocked / Not applicable**. A failed check triggers scoped repair and rerun before treating the milestone as complete. A successful automated build may proceed to the next **draft**, but remains explicitly experimental until the owner checks it.

## Initial roadmap milestone ledger
| Milestone | Recorded status |
| --- | --- |
| Gate 0 — stable source and rollback | v0.9.21 consolidated into `main`, automated checks passed; general phone/LAN gates outstanding |
| Gate 1 — interface, pilot art, camera and sound | Lab E pilot and camera accepted provisionally; more game-feel polish deferred |
| Gate 2 — Quick Play, honest match results and NEXT MATCH | Implemented on experimental branch chain, manual acceptance incomplete |
| Gate 3 — Close Quarters | Scored pilot-only 10 KOs/3 min built; v0.9.28 aim was owner-positive |
| Gate 3 — vehicle FFA | Scored 10 KOs/4 min built, v0.9.32 precision controls automated PASS; phone verdict pending |
| Gate 3 — pilot parity | v0.9.33 Survival on-foot controls automated PASS; owner phone verdict pending |
| **Gate 3 — true Team Deathmatch** | v0.9.34 implemented on draft PR #53; fast CI 40825788956 + full real Chromium/Android QA 40825789109 **Automated PASS**, exact APK prerelease available; 50+ natural bot matches and real phone acceptance **PENDING** |
| Gate 4A — Custom Match | v0.9.35 core automated PASS; v0.9.36 local named presets and Reset to Default implemented on dependent draft; dedicated CI and phone acceptance PENDING |
| Gate 4B — scored Quick Play integration | Only genuinely validated and selected modes rotate; preserve old Survival |
| Gate 4C — procedural uniqueness and bot fairness | 300-seed connectivity QA exists; natural-match balance and topology dedup incomplete |
| Gate 5 — Dossier, saves and optional cosmetics | Planned; never invent progress/currency or purchase entitlement |
| Gate 6 — sound, release identity, privacy and Play readiness | Android debug/unsigned baseline exists; production release not ready |

## End-of-first-development-plan comprehensive audit
**Functional:** Every playable mode (Survival, CQC, FFA, TDM, Custom), genuine pilot-KO counters vs armor, teammate AI, safe spawns/respawns, termination and real draw cases, unchanged maze traversal, pause/restart, Next Match and coherent After Action.

**Balance & procedural:** >=300 deterministic unique topology tests per size/mode as applicable; store failed seeds; >=50 naturally simulated scored rounds with score target hit rate, no-contact/timeout rates, spawn exposure, vehicle recovery availability, 2v2 team advantage and no invisible wall/collision bugs.

**UI/UX:** real game screenshots and landscape safe-area checks, on-foot/vehicle controls, aim/fire thumb reach, pilot silhouette top-down consistency, team readability and color-independent identifiers, sound toggle/resume/audio focus and interaction accessibility.

**Reliability:** Android multi-device frame pacing/heat/long-session stress, app background/restore, offline save migration/update continuity, local LAN host/guest correctness and disconnect only if intended for v1 scope.

**Release & security:** stable source/branch reconciliation, no accidental secret/key exposure, signed bundle and immutable app ID/version plan, actual installed Android test, Play compliance/privacy, asset provenance, cosmetic-only economy/no pay-to-win, no fake remote matchmaking.

**Decision artifact:** release-readiness matrix with severity-ranked P0/P1/P2 findings, exact reproducible evidence and corrective PRs, test and handset status, fallback tags, owners' acceptance and only then a v1 candidate. Do **not** call the overall audit completed until the above checks have actually been performed.

## v0.9.34 TDM — required milestone gate
- [ ] Shared team rules, 1 Blue player + 1 Blue ally vs 2 Red bots and distinct mode entry
- [ ] Genuine pilot KOs only, Blue/Red aggregate score, no team damage, win at 15 / draw after 5 active minutes
- [ ] Safe respawn, vehicle recovery, After Action personal/team attribution, fresh-sector NEXT MATCH
- [x] Fast 300-seed + scoring + legacy Survival/CQC/FFA regressions — run 40825788956
- [x] Real Chromium menu/touch/results at three landscape sizes — run 40825789109
- [x] Android debug APK + unsigned AAB and original APK/QA/checksum prerelease — run 40825789109 and v0.9.34-scored-tdm-test
- [ ] At least 50 natural bot-match telemetry samples when harness is available
- [ ] User device confirmation deferred; stable main unmodified

**2026-10-29 milestone checkpoint:** [Detailed v0.9.34 audit](QA_SCORED_TDM_v0934.md) — automated implementation gate passed; phone/50+ organic bot fairness gates remain open. Do not merge into stable main or label Google Play-ready.

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
| Gate 4A — Custom Match | v0.9.35 Custom editor + v0.9.36 named local presets/default reset **automated QA PASS** (40830083479, 40832553495); owner phone acceptance, natural bot balance and upgrade persistence PENDING |
| Gate 4B — scored Quick Play integration | v0.9.37 explicitly opt-in CQC/FFA/TDM, legacy Survival-only default; fast and full Chromium/Android automated PASS (40837545823/40837545844). Owner phone acceptance remains PENDING |
| Gate 4C — procedural uniqueness and bot fairness | v0.9.38 full audit **PASS**: 500 naturally simulated all-bot scored games (30/60Hz plus 200 independent TDM), 300 unique connected maps each size, 0 observed unsafe respawns. Physics-rate sensitivity in CQC; native 60Hz TDM 200 rounds Blue 102/Red 96/draw 2. Physical user testing still OPEN. [Evidence run 40840318936](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40840318936) |
| Gate 5 — Dossier, saves and optional cosmetics | v0.9.39 real local dossier/versioned safe save foundation, **fast + full Chromium/Android automated QA PASS** (40987749714/40987749740), immutable test APK archived. Cosmetics remain concept-only/not selectable; physical Android storage-upgrade acceptance OPEN |
| Gate 6 — sound, release identity, privacy and Play readiness | v0.9.40 package identity/versioning/manual export-import recovery + env-only optional upload signing **fast/full Chromium+Android QA PASS** (40991176243/40991176203), original test APK archived. Real signing certificate continuity, physical data migration, Play registration/privacy and human device acceptance **OPEN** |

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

## v0.9.41 first-plan cross-system review

**Automated contract and regression QA PASS:** [GitHub Actions 40992468366](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40992468366), verifying 6 mirrored player assets, real wired modes, legacy Survival defaults, standalone local Dossier/custom/backup integrity tests, score physics, safe Android identity and optional env signing. [Severity-ranked evidence matrix](FIRST_PLAN_CROSS_SYSTEM_AUDIT_v0941.md).

**Overall status remains RELEASE NO-GO:** manual Android controls/performance and save upgrade, actual signed/certificate-compatible bundle, Play policy/privacy, tested two-device LAN if shipping, and explicit approval/integration of experimental draft chain. No new APK because this is QA/documentation only. Do not mark this first-plan audit physically complete.

## v0.9.42/43 P0 signing continuity evidence and future private test signer

- **[Confirmed FAIL for older in-place updates]** Actual public original v0.9.32, 37, 39, 40 APKs had four distinct verified signing certificates despite stable app ID. [Evidence 40994470523](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40994470523); [matrix](QA_APK_SIGNER_CONTINUITY_v0942.md). Do not uninstall older apps with important data before safe migration.
- **[Automated PASS for signing source preparation]** v0.9.43 Gradle dedicated private TEST signer vs separate Play signer, manual owner-only cert-pin workflow and safe code regression: [fast 40995367492](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40995367492), [full Chromium/Android 40995367559](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40995367559). No gameplay change, no public v0.9.43 APK released.
- **[BLOCKED]** Owner private test keystore provision, public pinned fingerprint, real owner-signed artifact, true two successive same-cert Android in-place updates with data preservation, and separate production Play upload signing. The ordinary CI debug APK is NOT a continuity baseline.

## v0.9.44 pilot-only P-02 visual checkpoint

**AUTOMATED PASS:** strict top-down helmet/visor, mirrored feet and shoulders, central two-hand pistol with real unchanged muzzle, original tank/mech visuals and zoom/controls unchanged. Fast 40999661362 and full real Chromium/Android 40999661261 succeeded at exact source SHA 8fd0f48dfcd43f13dc6e487cd61bd4b7a77b6c85. Original test APK and viewport before/after screenshot QA ZIP: https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.44-pilot-visual-test . Test APK is clean-install-only with disposable app data; archive signing incompatible with prior test APKs. **Owner mobile art acceptance OPEN, stable main unmerged.**

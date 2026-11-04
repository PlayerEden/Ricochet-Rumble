# Sector Rebound — M6 Source Audit / Release Gate

**Audited 2026-11-04.** Draft M11 Premium Hybrid PR #140, baseline `740f08873296acbf079bebd1f3221925b5974c43`, with M5.1-D badge consolidation in the next commit.

**Owner instruction:** Continue development and audit without another physical APK playtest. This is a code/documentation audit, **not** a claim of current-head CI, Android acceptance, or real two-phone LAN verification.

## Findings and actions

| Area | Source-backed finding | Gate |
| --- | --- | --- |
| Host Match AI counts | `initialState` reserves two LAN seats. `lanHostSolo` makes guest seat 1 an AI; `opposingCount(0)` counts it with any configured extras. A host alone with 0 extras should see **1 opponent**, with 1 extra should see **2**. Existing Solo S-FFA screenshot came from another mode and cannot establish a mismatch. | New same-match Chromium 0/1 extra-bot suite must execute |
| Room layout | Host/guest cards separate their role/status, original `lan-host-presence` and `lan-guest-presence` preserved, nine rule selector IDs preserved, sticky Start/Leave preserved. | Browser layout/scroll/hit tests on 568×320, 640×360, 740×360, 915×412, 1280×720 |
| In-match identity | `hudModeDetails()` reads actual mode/config in `refreshHUD()`, including LAN and scored modes; Pause uses same code. FFA personal accent tracks real player color; TDM scores remain fixed-team colors. | Screenshot geometry and true hosted/guest mode checks |
| Insignias | Existing `mark.field/vector/ace/command` thresholds unchanged. M5.1-D removes duplicated success stripe, keeps real save-failure feedback and truthful independent progress. | Browser and accessibility state checks |
| Dossier and save | `rr-dossier-v1`, `rr-hangar-paint-v1` schemas and finalize/restore code not changed by M5.1 C/D; existing Quick Play suite contains match-once and stored milestone assertions. | Fresh save/restore and canonical suite |
| Input and combat | No changes here to camera, tank/mech/pilot graphics, joystick, FIRE, EXIT, AI timing, multiplayer authority or Android socket packets. | Full gameplay and native LAN CI; later two-device Android acceptance |
| APK and signing | Hybrid is separately built for testing; existing Android Gradle signing and bundle fail-closed gate inspected. `main` remains durable baseline; previous owner build is documented in `docs/PROJECT_STATUS.md`. | Exact-head package hash + separate release signing/upgrade verification |

## GitHub CI visibility and PR-head caveat

Prior commit `9cccbbc` produced **8 passing workflows and one failed real-browser suite** (a test selector matched both Standard preview canvas and Standard paint button). The selector was corrected in `6a6f9e9`. In the latest inspection, the **Git branch ref** advanced to `740f088`, but GitHub's PR `head.sha` continued reporting `9cccbbc`; no new workflow runs had appeared for the later direct-Git-data commits. Cause is not confirmed. Never infer green builds from missing runs, and do not manipulate/close/reopen the PR merely to provoke CI.

Required before promoting a build: Actions run `head_sha` equals the **exact branch head**, all nine applicable workflows successful, matching tested Android artifact hashes, screenshots available, retained rollback path, no unexpected web/native asset parity drift.

## Next orderly work

1. Resolve current-head CI trigger/visibility through a supported, reviewable method; then review actual failures, not just green badges.
2. Keep M5.1 source fixes isolated in draft PR #140 until audited and approved.
3. Before Play launch, complete two-phone same-Wi-Fi host/guest join, spectator queue/recovery, physical safe areas, FPS/heat, install-over/storage continuity, and signing verification. These are deferred, not claimed passed.
4. Avoid redesigning already accepted menus or retuning the approved camera/AI without evidence.

**Decision:** Draft development may continue. **PR merge: NO-GO** until current-head CI and owner approval. **Public Play release: NO-GO** until full QA, physical LAN acceptance, and signing/compatibility gates. Do not touch `main` or the documented owner-compatible APK; revert regressions with reviewable commits, never force-push.


## CI diagnostic follow-up on exact head `3f6b92b`
- GitHub eventually synchronized PR head with the branch, and all **nine current-head workflows started**, resolving the prior run-discovery blocker for that commit.
- Canonical gameplay/LAN workflow failed in `tests/one-phone-local-relaunch-qa.mjs` because two older assertions still read the deliberately hidden duplicate `#emblem-status` stripe after VECTOR equip. The live selected `#insignia-detail-name` is the correct UI and saved marker; both assertions now use that element and explicitly confirm the redundant status is hidden. No save record, data migration or gameplay engine change was needed.
- Remaining current-head QA is still required after this test-only correction. Do not promote on an old successful run.


## M6 exact-green evidence — checked 2026-11-04

Baseline commit `3886e358f11c1fadd02a78de3a07f0ea5f5dd3bf` has **9/9 completed successful** PR workflows (no observed failures), including:

| Gate | GitHub Actions run | Result |
| --- | --- | --- |
| Premium Hybrid real-browser and Canvas fallback, five responsive captures | [41815624885](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41815624885) | PASS |
| Full Android/visual, gameplay lifecycle, packaged assets, signer and APK/AAB QA | [41815624794](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41815624794) | PASS |
| Canonical gameplay, persistence/relaunch, and same-match host bot counts | [41815624791](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41815624791) | PASS |
| Fast PR regression | [41815624813](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41815624813) | PASS |
| Isolated Hybrid Android test APK / separate package and disposable signer | [41815624798](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41815624798) | PASS |
| Native repeat LAN peer acceptance | [41815624774](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41815624774) | PASS |
| LAN recovery UX | [41815624749](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41815624749) | PASS |
| Real live LAN spectator | [41815624799](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41815624799) | PASS |
| LAN queued spectator promotion | [41815624845](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41815624845) | PASS |

PR #140, **41 changed files, 230 commits** at this green checkpoint, was reported **mergeable with clean merge state** against main `c198780293cae57f0387134f8ca074bea5b9e476`. This establishes source/CI integration readiness, not physical Android or Play readiness. Do not squash/rewrite history without separate authorization.

### Additional audit improvement

The M11 Hybrid browser workflow's `pull_request.paths` previously omitted the **premium browser QA test file actually executed by the job**. A future test-only correction could skip that suite. The workflow now also triggers when `tests/m11-premium-menu-qa.mjs`, `tests/uiv3-ui-contract.mjs`, `tests/smoke.mjs`, or `tools/verify-hybrid-menu-bundle.mjs` change. This is CI coverage only, not game/runtime logic. This new workflow revision must pass on its own exact-head commit before any promotion; older green evidence remains attached to `3886e35`.

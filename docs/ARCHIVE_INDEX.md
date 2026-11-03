# Sector Rebound — Archive and Rollback Index

**Purpose:** Keep important earlier code, owner decisions, technical research and **complete GitHub history** while making the modern v0.9.75 source readable as a single development baseline. Archived does **not** mean discarded, published or approved for the first public release.

## Most recent merged development milestones

- [D3-B1 live read-only spectator PR #105](https://github.com/PlayerEden/Ricochet-Rumble/pull/105) — source and CI accepted; no same-signer owner APK, physical two-phone LAN unverified.
- [D3-B2 host-authoritative JOIN NEXT PR #108](https://github.com/PlayerEden/Ricochet-Rumble/pull/108) — merge commit `bd7162619daf16496e17fbb332d7a8aebdd7e75d`, source and full Android/dual-browser CI accepted; real phone acceptance still pending. Historical independent pure host contract [draft #107](https://github.com/PlayerEden/Ricochet-Rumble/pull/107) remains **unmerged**, not falsely marked as integrated.
- Preserve older signed v0.9.74/v0.9.75 APK checkpoints and archive branches. D3-C reconnection and new owner APK are separate future work.

## Protected code and owner preview checkpoints

| What / when | Immutable source / evidence | Meaning |
| --- | --- | --- |
| **Pre-consolidation `main` (v0.9.21)** | [archive branch](https://github.com/PlayerEden/Ricochet-Rumble/tree/archive/main-v0921-before-2026-11-02-integration), `9f67b2bea83d552cdbae8af1964c30eecf49022c` | Original accepted baseline, retained before modern code reaches main. Older v0.9.21 [historical preview release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.21-polish-preview). |
| **v0.9.71 — LAN D2 series** | `checkpoint/sector-rebound-v0971-lan-series-signed-ci-330001` · `333fc9d9ffc5f5ff5e136121217240112def531e` | Two-browser LAN checks; not two physical phones. |
| **v0.9.72 — host-alone TDM** | `checkpoint/sector-rebound-v0972-host-bots-signed-ci-340001` · `848a14832d03486239b30d510f2fe5ae28fac7e6` | 1v1/2v2/3v3 real AI in empty guest seat, real scoring/series. |
| **v0.9.73 — host-alone FFA/Survival/Co-op** | `checkpoint/sector-rebound-v0973-lan-modes-signed-ci-350001` · `08580417bb43877b472f5b378d449f77e74bd4de` | Real device owner feedback on AI aiming motivated next adjustment. |
| **v0.9.74 — deliberately settled AI aiming** | [checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-v0974-ai-shot-posture-signed-ci-360001), `0797cc8f18b6da35a1bdcaf62e4d49c2dd52c1aa` | **Owner describes aiming as “pretty good for now.”** Protect for A/B fallback. |
| **v0.9.75 — rare quick opportunities** | [checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-v0975-rare-ai-openings-signed-ci-370001), `45e06297cf440a4d5f5606c8f282957dba602d4f` | Latest signed CI-verified gameplay candidate; rare-shot physical owner acceptance still pending. |
| **D3-B1 live spectator — source-only checkpoint** | [protected source branch](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-d3-b1-spectator-source-ci-2026-11-02) · `89bfe4bb7d57af90f9ec8267fef14ce5a48e96bf` | [PR #105](https://github.com/PlayerEden/Ricochet-Rumble/pull/105), merged into development main SHA `20e8e9f0ab8f1b5ee57f7536df298b715a9198cb` after **45 spectator tests + Android CI**; **no new compatible signed owner APK**, real two-phone pending. |
| **2026-11-02 historical master planning branch** | `plan/d3-persistent-lan-rooms`, [planning PR #98](https://github.com/PlayerEden/Ricochet-Rumble/pull/98) | Comprehensive D3 spec/QA and all original master plan notes retained, even though the canonical live plan is shorter. |

**Do not delete or force-update** checkpoint branches, historical published assets, source SHA commit objects, technical design Bibles or owner-approved art. Old GitHub Actions ZIP files expire and are *not* permanent APK archives; GitHub Release assets, if added separately and owner-approved, need provenance/signing validation.

## Written history preserved

- [Complete pre-consolidation PROJECT_STATUS chronology](PROJECT_STATUS_HISTORY_THROUGH_2026-11-02.md): original ~225 KB of progress logs, test runs, PR references and owner acceptance commentary; kept in the **same `docs/` folder** so most relative document links stay usable.
- [Original 2026-11-02 complete master development plan](MASTER_DEVELOPMENT_PLAN_2026-11-02.md) (historical snapshot with explicit banner).
- [Earlier detailed branch register](BRANCH_REGISTER.md), [v0.9.21 history](history/README_DEVELOPMENT_THROUGH_V0921.md), [prior post-audit plan](DEVELOPMENT_EXECUTION_PLAN_POST_AUDIT_2026-10-30.md), [future roadmap discussion](FUTURE_ROADMAP_2026-11-01_PROPOSAL.md), [original Google Play roadmap](ROADMAP_TO_GOOGLE_PLAY_V1.md) and [release-readiness NO-GO audit](RELEASE_CANDIDATE_AUDIT_2026-11-01.md).
- **Accepted visuals:** [P-03 operator](APPROVED_PILOT_P03.md), [Sector Rebound identity](SECTOR_REBOUND_IDENTITY.md), and design files in `docs/design/`; preserve all original art/physics decisions without forcing unwanted redesign.
- **Technical decisions:** [D3 LAN room architecture](design/LAN_PERSISTENT_ROOMS_D3_SPEC_2026-11-02.md), [single-phone D3 QA card](LAN_D3_ONE_PHONE_OWNER_QA_2026-11-02.md), [M2-AI1 owner report](AI_SHOT_POSTURE_M2_A1_ANDROID_OWNER_v0974.md), [M2-AI2 owner report](AI_RARE_QUICK_OPENINGS_M2_A2_ANDROID_OWNER_v0975.md), [Android persistence audit](ANDROID_WEBVIEW_PERSISTENCE_2026-11-01.md), [signing protocol](SIGNING.md).

## Pull request and prototype hygiene

- **Mainline integration:** preserve all 415+ verified history commits rather than squash to one unexplained commit. Some old PRs are merely ancestor milestones; other **side experiments have diverged** (e.g., old PR #85 integration rehearsal, PR #98 planning branch) and must **not** be called merged without verification.
- **Historical PR #1–17:** previously closed after owner-approved v0.9.21 work. Their GitHub discussion and original commits remain available.
- **Former experimental chains:** pilots/CQC/scoring/custom/UI/AI/CTF through D2 LAN #24–97, D3 room #99–101, AI fairness #102–103. Once `main` is verified, close *only* clearly superseded PRs after a recorded ancestry or contents review. Divergent prototype branches and docs-only planning PRs remain archived for later comparison; **do not bulk merge** them into runtime.
- Each closed superseded PR should include a link to the integrated main commit, the exact originally preserved head SHA and this index. If ancestry is not proven or a side-only change may be absent, leave open/label for manual review.
- The integrated default branch is a **new development baseline**, not owner approval for public LAN, remote multiplayer, paid cosmetics or Google Play.

## Safest rollback and continuation

Previous `main` is under `archive/main-v0921-before-2026-11-02-integration`; v0.9.74 is the accepted-feeling AI baseline; v0.9.75 is the current optional challenge build. Never reset `main` blindly to an old SHA or downgrade an installed Android preview while its local Dossier might be lost. Correct issues in small PRs; if urgent, branch from the exact checkpoint and run independent tests. For Android previews, compare package ID + signer + versionCode first. For future development, start from **canonical `main`** and the [master plan](MASTER_DEVELOPMENT_PLAN.md).
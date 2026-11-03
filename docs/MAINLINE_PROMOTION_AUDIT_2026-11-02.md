# Mainline Consolidation Audit — Sector Rebound v0.9.75

**Date initiated:** 2026-11-02 Kentucky local. **Scope:** move CI-verified experimental game lineage to a maintainable **development `main`**, preserve complete source history, reconcile docs, avoid destructive PR cleanup and prevent accidental production release.

## Proven integration topology and preserved states

- Old pre-consolidation `main`: `9f67b2bea83d552cdbae8af1964c30eecf49022c` (v0.9.21) preserved at `archive/main-v0921-before-2026-11-02-integration`.
- Selected **signed game source** `45e06297cf440a4d5f5606c8f282957dba602d4f` from `checkpoint/sector-rebound-v0975-rare-ai-openings-signed-ci-370001`, via the adjacent AI2 source-only docs head `5753fcfd318baa0634f7aa6b50302b9ee5ff401d`. The latter has the *same gameplay tree* and one additional documentation commit after signing.
- GitHub compare old `main` → **exact signed v0.9.75 source**: `ahead 415 / behind 0`; **`main` is an ancestor, not a conflicting branch**. Integration PR must be a normal (non-squash) merge preserving these commits and their historical review provenance. No `main` force-push/rebase.
- New integration candidate: `integration/v0975-main-consolidation-2026-11-02`, starting from above source/history. Its **only post-signed changes** are documentation, archival manifests and a dedicated regression workflow; do not alter `web/`, Android Java, or embedded Android assets as part of this consolidation.
- History retained: `docs/PROJECT_STATUS_HISTORY_THROUGH_2026-11-02.md` entire previous 225 KB log; full latest historical master `docs/MASTER_DEVELOPMENT_PLAN_2026-11-02.md`; all `docs/design` files, owner-approved art, signed source checkpoints v0.9.71–75, previous v0.9.21 archive. Existing archive branch for old v0.6.3 remains.

## Independent test evidence inherited unchanged

| Gate | Result |
| --- | --- |
| v0.9.75 full game/visual [41577565867](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41577565867) | **PASS**: 6 live browser quick-shot scenarios × 42 shot counters, M2 physical aim/cues/pilot tests, A1/A2 LAN, 101 legacy two-client browser LAN and 44 UI visuals |
| v0.9.75 signed Android [41578089841](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41578089841) | **PASS**: source/embedded APK parity, AOSP dev signer, versionCode 370001, `com.playereden.ricochetrumble.preview`, experimental only |
| Integration PR `ci-smoke` | **PENDING** until the PR is created and its exact commit passes |
| Integration PR `build-apk` (full Android/visual) | **PENDING**; no production key or public Play release |
| Integration PR `current-main-regression` | **PENDING**; new modern suite covering AI/host and 101 LAN browser checks |
| Default `main` post-merge regression | **PENDING**; verify actual promoted SHA, source parity and no branch-rule bypass |

## What *must not* be inferred

- The user has not physically verified **two phones** connected by Wi-Fi, spectator controls, queued takeover or native repeat accept; these remain D3 B1/B2/C work.
- The user felt v0.9.74 AI fair enough, but v0.9.75 rare fast shots have **not** been physically approved.
- This integration does **not** make the app production-signed, Google Play approved, multiplayer server-hosted, or ready to sell cosmetics.
- Old v0.9.21 historical PR, 61 open chained/side PRs and discussion documents are not automatically 61 separate missing game features; closure requires individual ancestry or content proof and archive links. Keep divergent side experiments inspectable.

## Change list and validation plan

- Root README and `docs/PROJECT_STATUS.md` now describe **modern source and accurate blockers** instead of an old v0.9.21 candidate.
- New concise `docs/MASTER_DEVELOPMENT_PLAN.md` is the single order-of-work reference. Original longer master remains an *archived snapshot*; outdated research and status logs are preserved.
- New `docs/ARCHIVE_INDEX.md` and historic snapshots make source decisions/rollbacks navigable. `docs/DEVELOPMENT_PROTOCOL.md`, `docs/BRANCH_REGISTER.md` and the older Google Play roadmap are marked with current-priority overrides rather than silently erased.
- New `.github/workflows/current-main-regression.yml` tests AI fairness+rare frequency, host-only LAN modes, 101 two-Chromium LAN, responsive UI, smoke/scoring/saves and byte parity; **no signing or artifact release**.
- Before promotion: run integration PR CI (fast, full Android, new QA), confirm only documentation/workflow changes since signed source and that no unexpected automation publishes a Play or GitHub release.
- After promotion: recheck `main` head and explicit GitHub diff (no game asset drift); post provenance/QA results here; archive superseded PRs conservatively, recording remaining side branches and leaving unverified claims OPEN.

## Release gate

**Source integration ≠ release approval.** Public Google Play remains **NO-GO** pending owner's Android update/save checks, actual two-phone LAN or deliberate Solo-first scope, store art/privacy/contact, Play account testing, private production signing and signed AAB. Never publish or change the repository name during this integration.

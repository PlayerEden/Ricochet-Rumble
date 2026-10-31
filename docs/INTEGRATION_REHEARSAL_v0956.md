# Sector Rebound — v0.9.56 main-rooted integration rehearsal

**Date:** 2026-10-30  
**Status:** DRAFT REHEARSAL / NOT MERGED / NOT AN INSTALL OR GOOGLE PLAY RELEASE  
**Working branch:** `integration/v0956-main-rooted-rehearsal`  
**Stable main source used as parent:** `58da2f3e1bd1dcfbb8f9a753f7c1f3432e0e2589`  
**Reviewed v0.9.54 gameplay source (original complete Android/Chromium QA):** `e4cb3e2e9351f1c2a354b35100f23bf0bd9e45a0`, [original green full QA](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41156274497) and [unaltered archived experimental APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.54-lan-ghost-input-test)  
**Tests-only correction provenance:** `e66117c329eb7bfd5a3ab31a31814b08b1f47d62` in [draft PR #84](https://github.com/PlayerEden/Ricochet-Rumble/pull/84), [fast source regression passed](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41163347216).

## Why this branch exists

An older stacked chain is ahead of and behind stable `main`. The foundational v0.9.47 PR #71 is in conflict with a changing project-status document. This branch starts from the **actual current main commit** and imports the desired current files by **exact existing Git blobs**, with no merge from the stacked branches and no edits to approved gameplay assets. It is an integration test, not a decision to promote or change the game.

## Scope and preservation

- Import **43 existing audited blobs** onto the main tree: the six offline Web game assets and six identical Android WebView assets; existing Gradle metadata (API 36; experimental `versionCode 50` / `versionName 0.9.54-lan-timeout-test`); scoring source; LAN/seeded/game/saved-data/Android signing tests and tools; reusable mainline `ci-smoke.yml` / `build-apk.yml` and three existing private-key-continuity test workflows; two older integration evidence documents. The historical v0.9.47 release-readiness test comes from PR #84's **fixed** blob, rather than its stale v0.9.54-incompatible prior version.
- Preserve **every file in the current main tree** unless it is among these explicitly imported paths. Most importantly, keep **all current main `docs/` content, including `docs/PROJECT_STATUS.md`, `docs/APPROVED_PILOT_P03.md`, roadmaps, signing guidance, and post-v0.9.54 audit**. Keep current main README unchanged at rehearsal time: it describes the stable released baseline and should be updated only for a future authorized main promotion.
- Omit 12 branch-specific, one-time experimental workflows from the integration tree; original branch source, archived evidence and PR history retain them. Long-lived fast/full QA workflows cover the main integrated candidate.
- **Zero deliberate gameplay, art, menu, sound, control, ricochet, LAN packet, save schema, or signature-policy changes** beyond importing the original v0.9.54 experimental game and PR #84's test-only correction. P-03 top-down pilot and owner-accepted quiet UI/audio are locked.

## Rehearsal validation gates — not assumed successful

1. Open a **draft PR to main** with `[full-qa]` to trigger exact integration-commit `ci-smoke.yml` and `build-apk.yml` checks.
2. Ensure the corrected historical release readiness and live scoring/save/cosmetic/asset mirror tests pass on this **new** commit. Additional targeted LAN/seeded tests have original-source success, but should be repeated as necessary if the integrated source changes.
3. Verify full **real headless Chromium screenshots and debug APK + unsigned AAB build** on this branch's exact SHA, plus Web/Android six-asset byte parity and original v0.9.54 SHA provenance. Report failures rather than claiming all green.
4. Review changed paths and absence of incidental documentation overwrite; **do not merge main, change repository rules, close historical drafts or create/install/re-sign a preview release automatically**.

## Remaining P0 owner/manual gates

- Before anyone upgrades installed previews with precious local data: verify installed APK signer and use an owner-held durable private key; perform **two real in-place same-certificate upgrades** retaining existing saved progress and confirm backup/restore. Never casually uninstall an old preview.
- Actual handset pilot/vehicle precision, garage/recovery balance, menu usability, Android background/thermal sessions and audio must be accepted by the owner.
- Two real phones on one Wi-Fi connection for LAN input parity, ghost-action cutout, jitter/reconnect/score acceptance **if LAN is part of the initial launch promise**; otherwise owner must explicitly defer that launch claim.
- Before Play: final package identity, production signing/Play App Signing, age/content/store assets, accurate data safety/privacy policy, Play Console and testing requirements as applicable. An unsigned AAB or debug APK is not ready for production.

## Rollback / safe fallback

1. Stable `main` remains `58da2f3e1bd1dcfbb8f9a753f7c1f3432e0e2589` at branch creation and is never advanced by this rehearsal; continue using existing v0.9.21 stable preview source as the mainline fallback.
2. Original [v0.9.54 QA-tested debug APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.54-lan-ghost-input-test) and original source stay unchanged; other milestones and draft PRs remain intact.
3. Abandon this draft branch/PR if integrated QA fails; do **not** force push main or replace GitHub release assets. Reconcile issues in another reviewable commit if needed.
4. This **does not establish same-certificate upgrade compatibility** between original/prior debug APKs.

**Handoff:** Read [latest main status](PROJECT_STATUS.md), [three-track risk audit](POST_V0954_INTEGRATION_RELEASE_REGRESSION_AUDIT_2026-10-30.md), this document, and the rehearsal draft PR CI results before taking a next step.

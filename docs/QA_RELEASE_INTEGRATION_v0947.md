# Sector Rebound v0.9.47 — Cross-system integration and release-readiness audit

**Audit date:** 2026-10-30. **Engineering source/regression audit: AUTOMATED PASS.** **Release gate: NO-GO** until physical, signing, and integration requirements are satisfied. This is a source-backed integration plan—not a claim that the entire app has passed human mobile testing.

## Approved presentation and exact source checkpoint

- **P-03 pilot silhouette and speed-driven movement LOCKED by owner:** [main-branch design contract](https://github.com/PlayerEden/Ricochet-Rumble/blob/main/docs/APPROVED_PILOT_P03.md), [original v0.9.45.1 APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.45.1-pilot-motion-test). Absolutely no unnecessary redrawing or boot/crawling motion.
- **v0.9.46 tactical menu sound / pause SFX-MUSIC controls OWNER DESIGN PASS**, accepted in chat 2026-10-30. Latest [focused draft PR #67](https://github.com/PlayerEden/Ricochet-Rumble/pull/67), [original Chromium/Android tested APK + QA screenshots](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.46-ui-audio-test), digest `e405e9714399495705e9dec1fbe2f12ea3f9222d91f10ab6aaf6f253b11417f2`.
- Full original v0.9.46 [fast PASS 41007675662](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41007675662) and [real Chromium three-landscape-size + debug APK and unsigned AAB PASS 41007675477](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41007675477) on the exact **source-equivalent QA snapshot** `01ac4360653f9764c56f335eb91c7bfb1616241a`; actual game/audio/Android/test blobs matched focused PR #67. No release Play signature or real-device upgrade is inferred.
- **Additional v0.9.47 independent run:** [source contracts, current-version audit repair, full lightweight gameplay/seeded regression PASS — 41013774058](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41013774058) on SHA `354758f5fe2d76110f9ddbf3d59eb79580ab4361`. Inspectable JSON artifact `v0947-release-readiness-source-audit`: **15 automated PASS checks, 7 explicit unresolved manual/production gates, zero gameplay code changes**.
- Historic [natural all-bot fairness and connected maze QA PASS 40840318936](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40840318936): 500 scored simulations over 30/60Hz plus 200 independent TDM, 300 unique connected maps per size and zero unsafe respawns in the tested seeds. This is **historical automated evidence**, not a fresh 50-game tournament or a physical player-balance signoff on v0.9.46.

## Actual current GitHub branch topology — verified via live open PRs

At this checkpoint **31 open draft pull requests**, of which **24 are a connected, unmerged dependency chain** from [#41](https://github.com/PlayerEden/Ricochet-Rumble/pull/41) (clean v0.9.25 foundation) through [#67](https://github.com/PlayerEden/Ricochet-Rumble/pull/67) (approved UI/audio). The 24 ordered PR numbers are:

`41 → 42 → 44 → 45 → 46 → 47 → 48 → 49 → 50 → 52 → 53 → 54 → 55 → 56 → 57 → 58 → 59 → 60 → 61 → 62 → 63 → 65 → 66 → 67`

The remaining **seven** open draft PRs (24, 31, 32, 34, 35, 39, 40) are older parallel proposals/prototypes, not part of that latest direct lineage. Keep those as history; do not assume they are additive to the accepted candidate. Other archived branches and old release tags likewise remain untouched.

- **Current stable main gameplay:** v0.9.21, with later documentation-only updates. A direct GitHub `main...polish/ui-audio-feedback-v0946` compare shows **325 ahead, 32 behind** and roughly **61 changed paths** (including doc/test/API files): the heads have diverged, and blindly merging the newest PR into main is not a simple no-conflict promotion.
- Newest experimental code contains working source for scored CQC, vehicle FFA, 2v2 TDM, Custom Match/presets, Quick Play, P-03 artwork, Dossier/backup, and UI/audio; its **actual source is newer than main**. Do not describe draft features as shipped on stable main.
- [QA-only PR #68](https://github.com/PlayerEden/Ricochet-Rumble/pull/68) used to validate the v0.9.46 snapshot was **closed unmerged** and must not be reopened as an integration candidate.
- v0.9.47 branch only adds independent source-audit tests/documentation and fixes stale report metadata. It does not touch Web/Android gameplay assets, manifests, physics, cameras, signing keys or APK signing.

## Executed verification matrix

| Area | Decision | Concrete evidence and limitation |
| --- | --- | --- |
| Web vs bundled Android (6 JS/CSS/HTML assets) | **AUTOMATED PASS** | Original v0.9.46 Chromium/Android + 15 v0.9.47 checks; exact SHA-256s in machine-readable JSON |
| Mode wiring, pilot KO vs armor/ejection, scored clock and rematch | **AUTOMATED PASS** | Existing smoke, scored-match kernel and browser parity rerun in 41013774058; no new gameplay |
| Procedural maze/AI and 30Hz/60Hz pacing | **AUTOMATED PASS on prior sample**, human balance **PENDING** | v0.9.38 seeded tournament + v0.9.47 source regression; re-sample on eventual integrated release SHA if gameplay differs |
| Owner-locked P-03 appearance and animation | **OWNER DESIGN PASS** | v0.9.45.1 physical feedback and locked implementation; v0.9.47 confirms no rejected detached boot geometry |
| v0.9.46 SFX/music UI presentation | **OWNER DESIGN PASS + AUTOMATED PASS** | Real sound preference toggle/state tests, Chromium screenshots; sound pressure/performance not measured |
| Dossier, Custom presets and manual save backup | **AUTOMATED PASS, migration PENDING** | Dossier/save tests in 41013774058; an older differently signed installed APK cannot be upgraded safely by assumption |
| Android debug APK + unsigned AAB packaging | **AUTOMATED PASS at v0.9.46 SHA** | Passing original test release and checksums; unsigned bundle is NOT production Play-signed |
| Signer continuity from old debug builds | **CONFIRMED FAIL for four archived APKs** | [Real signer comparisons 40994470523](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40994470523) found different certificates for v0.9.32 / 37 / 39 / 40. Owner-installed APK unknown |
| Two-phone same-Wi-Fi networking | **MANUAL PENDING** | Android NSD/TCP bridge exists, but real two-physical-phone host/join/sync/disconnect remains unverified |
| Production / Play readiness | **BLOCKED** | No verified signed upload-ready AAB, store/privacy approvals, device acceptance or controlled integrated release |

## Severity-ranked findings and exact next action

**P0 — existing save safety and signer continuity.** Older preview APKs used distinct debug certificates. **Do not recommend uninstalling** if local progress matters; new test APKs are clean-install only until the owner controls a durable TEST signing key and validates two same-cert upgrade installs preserving data. The separate Play upload key and signed App Bundle remain unverified. This work is not necessary to *continue coding/auditing*, but is required before labeling an APK update-safe or shipping on Play.

**P0 — physical release gate.** Real handset checks for thumb precision AIM (5–15° bank shots, 180° pivot), long-session memory/heat, pause/resume/audio, pilot transitions, actual menu reach and crash/rotation are not completely signed off. The owner approved **art and UI/audio appearance**, not all these release claims. Preserve the accepted numbers until measured.

**P0 / owner launch-scope decision — LAN.** If same-Wi-Fi multiplayer is advertised as included in v1, prove it on **two physical phones**; otherwise mark clearly experimental or defer/hide it for a separately scoped release. No remote servers, friends or ranked online play are implemented; don't imply otherwise.

**P0 — Store identity / policy / signing.** Confirm owner-operated Play Console and correct package identity, privacy and data safety disclosures, complete credentials custody and real signed upload AAB. Cosmetic gallery is still an **18-item concept catalog with zero authorized selectable items**; no in-app purchases have been demonstrated.

**P1 — source integration.** Do **not** click Merge on 24 chained experimental PRs. Instead prepare **one controlled, code-reviewed integration candidate** from current main:
1. Freeze newest QA-tested runtime assets/source from #67 and preserve original v0.9.46 release/checksum and owner-locked pilot design.
2. On an isolated integration branch from stable main, carry forward the **minimum coherent runtime/code/Android tests and required docs**, with current main `APPROVED_PILOT_P03.md`, project status, README and rollback data preserved. Resolve conflicts explicitly, not by overwriting the entire documentation tree.
3. Compare net code diff and confirm the approved pilot and v0.9.46 UI/audio asset digests **byte-for-byte** where expected. No new combat, button-layout or cosmetic experiments in the integration pass.
4. Run inexpensive source/300-seed regression first, then actual full Chromium touch/screenshots and Android debug + unsigned AAB against **the integration candidate SHA**, not only against #67.
5. Archive original exact tested binary/checksum and record new integration PR. Keep stable main unchanged until owner approves the candidate, manual device checks and release-scope decision; **never mark Google Play ready from CI alone**.
6. After the integrated candidate is explicitly accepted, close superseded historic draft PRs **with source lineage links and rollback notes** instead of bulk deleting branches or history.

**P2 — documentation/audit contract drift.** The historical first-plan audit script still printed `0.9.40 / code 40` while checking v0.9.46 (code 47), and described only nine dependent PRs. v0.9.47 fixes these misleading literals with dynamic Gradle metadata and non-stale dependency language. The targeted workflow passed the repaired report. Main README's v0.9.21 description is intentional until runtime integration.

## Disposition / immediate next gate

**v0.9.47 audit phase 1: source and regression PASS, report complete.** Full **physical + integrated release audit remains OPEN**. No APK is needed for this docs/test-only milestone; the user-approved v0.9.46 debug APK stays the current test binary. The efficient next engineering action is **isolated integration-candidate assembly and source-diff review**, not pilot redesign, new game modes, or repeated builds without code changes.

**Never confuse approval of a visual, successful browser tests, debug packaging and permission to merge or publish.**

# Sector Rebound — v0.9.47 targeted audits and overall readiness verdict

**Execution date:** 2026-10-30. **Owner request:** run several focused audits, then an overall audit, *before choosing new development work*. **Executed: 3 targeted suites in sequence, followed by consolidated overall audit.** No production gameplay, approved P-03 pilot/animation, approved v0.9.46 audio/UI, physics, network behavior, Android app identity, save data, or signer code was edited.

## Exact QA evidence and reproducibility

- **Targeted + overall fast CI — PASS:** [GitHub Actions run 41015877096](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41015877096), test snapshot `a9e2be9a8a1fc86c55cef0d2929ccfbd1a91ee4d`. GitHub artifact: `targeted-and-overall-audits-v0947-41015877096` (individual JSON, natural simulation seed-level data, every test's execution log and final Markdown/JSON findings; standard artifacts are temporary).
- [QA-only PR #73](https://github.com/PlayerEden/Ricochet-Rumble/pull/73) reconstructed exact changed non-documentation source files on latest `main` to avoid conflict with the newer main handoff; retained newer main documentation; **NEVER MERGE**. [Original audit-only PR #72](https://github.com/PlayerEden/Ricochet-Rumble/pull/72) retains test source/CI recipe. These are separate from [unmerged integrated runtime candidate #71](https://github.com/PlayerEden/Ricochet-Rumble/pull/71).
- Independent original integrated code [fast 41014535531 — PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41014535531), [full real Chromium + Android 41014535504 — PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41014535504), source SHA `feea956856df767cbb20a02c8a954d22cf73b02f`. The audit-only source edits do not replace original artifact provenance.
- **Additional repeat full Chromium/Android on the QA-only snapshot — PASS:** [run 41015877131](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41015877131), exact QA snapshot `a9e2be9a8a1fc86c55cef0d2929ccfbd1a91ee4d`, yielded screenshot evidence `sector-rebound-qa-41015877131-1`, debug APK `debug-apk-41015877131`, and an explicitly **unsigned/non-Play** AAB. This verifies the same source against a second full build pipeline; physical handset and compatible signer still unverified. **No new APK release was published** for these read-only audits.
- Automated statuses here refer to tested simulated/source/CI conditions, **never physical phone, real concurrent two-phone networking, installed package upgrade, Google Play sign-off or human-match balance.**

## Targeted audit 1 — Scored combat, controls and procedural arena

**AUTOMATED PASS.** Independently reran `tests/scored-match-kernel.mjs`, `tests/smoke.mjs`, and a **fresh** all-bot `tests/natural-bot-audit.mjs --seeds=8 --maze-seeds=100 --hz=30`.

- **24 completed scored matches** (8 each CQC, vehicle FFA and team TDM) all ended by score target or valid clock timeout. No match lacked fire, impact, or pilot KO; **0 unsafe respawns / 0 close-exposed respawns** in this sample.
- **300 fresh unique, connected maze topologies**: 100 each small, standard, large, all unique within their size group.
- **CQC:** 5/8 score-target finishes and 3/8 clock finishes; mean 21.9 total KOs across all participants; 115.6 seconds average elapsed.
- **Vehicle FFA:** 8/8 score-target finishes, 0 timeout; mean 25.3 total KOs, 148.8 seconds average; ricochet activity observed.
- **Team Deathmatch:** 7/8 score-target finishes, 1 valid clock-limit draw; Blue 5 wins, Red 2, draw 1. Too small to establish systematic team bias.
- Exact scored vehicle `166` human, `136` bot movement, `2.6` steering and `1.8` precision AIM remain; pilot P-03 overhead silhouette/muzzle retained; no rejected dangling boot geometry.

**LIMIT:** the supposed human seat was controlled by existing bot AI for deterministic simulation. Real phone steering/aim precision, player vs AI fairness, warmth/feel and 180° rotations remain MANUAL PENDING. This fresh sample supplements prior 500+ all-bot simulations; do not overinterpret 8 trials/mode.

## Targeted audit 2 — UI, audio, local profile and recovery

**AUTOMATED PASS.** Reran `tests/dossier.mjs`, `tests/save-backup.mjs`, `tests/first-plan-contract-audit.mjs`; compared all 6 real Web/Android asset pairs; verified pause SFX/music state, mute/background gates and saved settings wiring.

- Verified dossier deduplication by genuine match ID, safe handling of malformed/future record versions and storage failures; stats not credited on failed writes.
- Verified local preferences, Quick Play playlists, Custom presets and Dossier backup/restore, mandatory pre-restore recovery snapshot, failed-restore rollback, version/input constraints. These are synthetic storage tests, not proof of physical upgrade.
- Preserved **owner-approved P-03 and v0.9.46 UI/audio**. No menu, sprite, controller or sound synthesis revisions.

**P1 risk:** older APKs without the newer manual backup feature cannot be assumed migratable. Subjective phone audio comfort, lifecycle pause/resume and continuity across Android install still need human/device evidence.

## Targeted audit 3 — Native Android, local Wi-Fi protocol and signing

**AUTOMATED SOURCE/CONTRACT PASS.** Reran `tests/android-upgrade-readiness.mjs`, `tests/test-signer-contract.mjs`, `tests/scored-browser-parity.mjs`; inspected actual Java bridge/NSD/TCP method presence, per-message size/type checks, defensive WebView flags and Android package/signing declarations.

- Local host, NSD discovery, join-by-IP fallback, host/guest JSON message filters, TCP transport and 32KiB packet size guard exist in source. These checks **do not exercise two actual phone radios or disconnect/rejoin stability**.
- Package ID `com.playereden.ricochetrumble` preserved; separated env-controlled private TEST and Play UPLOAD signer contracts remain in place. No secret or signing key was created or exposed.
- **P0 blocked:** historically archived debug APKs have mismatched certificates; exact owner's installed certificate is unknown, and no two same-key, data-preserving upgrades are proven.
- **P0 if v1 advertises LAN:** physical two-phone discovery, joining, synchronized pilot/vehicle/scored state, disconnect/rejoin and Wi-Fi compatibility still unverified.
- **Other open:** battery/heat, rotation/background handling, store privacy/Data safety, owner-held production upload credentials, truly signed upload AAB.

## Overall audit / go-no-go

| Gate | Status | Meaning |
|---|---|---|
| Targeted gameplay, maps, score rules | **AUTOMATED PASS** | Tested 24 fresh natural bot matches plus existing regression |
| UI/audio and local save code | **AUTOMATED PASS** | Real settings paths and synthetic data recovery tests |
| Android native/LAN/signing contract | **AUTOMATED PASS** | Static/contract check, **not** physical multiplayer |
| Prior integrated real Chromium + Android packaging | **AUTOMATED PASS** | Exact source/artifact evidence linked above |
| Owner-approved pilot and UI/audio design | **OWNER DESIGN PASS** | Do not redesign without new feedback or reproducible defect |
| Existing APK data-safe updates / durable signing | **P0 BLOCKED** | Actual old signer and two same-key upgrades required |
| Two-phone LAN (if v1 scope) | **P0 MANUAL PENDING** | Two actual devices required |
| Control precision, lifecycle/performance, Play compliance | **MANUAL PENDING / BLOCKED** | Not assessed by CI or this review |
| Release readiness | **NO-GO** | Do not publish or merge draft chain from audit pass alone |

**Overall result: focused automated engineering quality checks PASS. No newly detected automated regression in inspected areas. This is not a claim of zero defects or Google Play release readiness.** The integration candidate [draft PR #71](https://github.com/PlayerEden/Ricochet-Rumble/pull/71) remains unmerged; main game runtime stays v0.9.21. Preserve existing installed user data; **do not uninstall an old differently signed APK with valuable progress**.

**Next is a user decision, not another automatic implementation:** choose whether to focus on signing/save continuity, two-device LAN, more on-device aim/performance testing, or a scoped source integration review. No further development was authorized by these audit results alone.

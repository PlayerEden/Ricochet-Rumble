# Sector Rebound — CI APK/AAB package integrity attestation (v0.9.56 integration rehearsal)

**Date (US Eastern):** 2026-10-30 · **Status:** AUTOMATED PACKAGE CHECK PASS / HUMAN INSTALL & PLAY RELEASE NO-GO

## Source and exact tested checks

- **Stable baseline:** `main` v0.9.21 gameplay at `58da2f3e1bd1dcfbb8f9a753f7c1f3432e0e2589`; this report documents a draft only and does not merge playable code.
- **First clean integration source:** `f7b738efc8ac1d6dd4d2d37a45d78b573a7dfd98`, [fast pass 41164303501](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41164303501), [full Android/Chromium pass 41164303536](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41164303536).
- **Test/workflow-only package-attestation source:** `8216e1f3d9d9b11cf3f4c743bb6a7bd1e1257816` in [DRAFT PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85), [fast regression + guard logic PASS 41165333896](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41165333896), [full Chromium + Android build + actual package attestation PASS 41165333823](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41165333823).
- Workflow log prints `source=2bc200f1d3a323ebfcd1317a870c669fa4f6b030` which is the **pull-request test-merge checkout SHA** from `GITHUB_SHA`, not the original draft branch HEAD. GitHub run metadata identifies the tested PR head SHA `8216e1f3...`; do not confuse these two identifiers.
- [Original exact v0.9.54 production game assets successful Chromium/Android QA](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41156274497) at `e4cb3e2e9351f1c2a354b35100f23bf0bd9e45a0` remained unchanged by either rehearsal commit. The new hardening edits only `tools/attest-android-ci-package.mjs`, `tests/android-ci-package-attestation.mjs`, `.github/workflows/build-apk.yml`, and `.github/workflows/ci-smoke.yml`.

## Attested actual APK (public/non-secret information)

| Verified item | Recorded value |
|---|---|
| Original generated debug APK internal SHA-256 | `201d1241420a924dcb92d4ad2aaa87bc8b65406cd3a4e8ef721a7dfeb989244b` |
| Real public signer certificate SHA-256 | `350aa465be6f369787799bf266fdf1bb3e6727aa9b6d137ff5f9c3782b0c5c64` |
| Package ID | `com.playereden.ricochetrumble` |
| Android versionCode | `50` |
| Android versionName | `0.9.54-lan-timeout-test` |
| Embedded browser/WebView game assets | **6; all byte-identical** across Web source, Android project assets, real debug APK and actual unsigned AAB |
| Actual APK cryptographic signature | **PASS** SDK `apksigner verify` with public certificate digest recorded |
| Actual APK manifest/metadata | **PASS** SDK `aapt dump badging`, package and version match Gradle source |
| Package QA decision | `PACKAGE_PROVENANCE_PASS_ONLY` (**not** approval to update/install/publish) |

**GitHub Actions artifact record:** [exact run 41165333823](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41165333823), original artifact `debug-apk-41165333823`, ID `13029237421`, ZIP SHA256 digest `710f73f1cc97502a37f8c5d21e8ca76ceb21659c7cf890b95ed64f493cddb3da`. **Important:** ZIP digest != embedded APK SHA. The ZIP also includes `qa-results/android-ci-package-attestation.json`; artifact retention was 14 days, so preserve the provenance here. Unsigned AAB artifact `unsigned-aab-NOT-FOR-PLAY-41165333823` ID `13029097666`; artifact ZIP digest `7d209321f6e769a198ade53a721f996fdea83aaf0f018a9e81e6b73f9f66d10e`, **not** the AAB file digest.

## What this safeguard protects, and what it cannot prove

1. Before uploading an APK from the full-build workflow, assert that the package signature is valid, capture the *public* cert digest, match package ID/version against source, verify all six intended WebView assets are present exactly once, and verify the actual APK and AAB embed precisely the game source being tested. Fails closed on wrong/duplicate/missing assets or mismatched package/version. The script never signs anything or accesses keystore passwords.
2. The generated test APK still has `versionCode 50`, **equal** to original v0.9.54 preview code 50. It **must not** be treated as an upgrade to that build even if a future signing certificate happened to match. Do not bump version numbers merely for this internal audit; do it before an actual new update release with matching signer and verified migration.
3. This run's public debug signer fingerprint is evidence **only for this generated APK**. It does not identify the current certificate on the owner's phone, prove compatibility with any previous experimental APK, or guarantee saved-data preservation. Prior source-backed [v0.9.52 certificate mismatch finding](ANDROID_UPDATE_PREFLIGHT_v0952.md) remains valid.
4. The AAB here is unsigned and cannot be published to Play. Real phone control comfort, two sequential same-certificate in-place upgrades with preserved Dossier data, real two-phone LAN if in launch scope, owner-held private test signer, production upload/key custody, Data safety and privacy policy are **still P0/manual gates**.
5. **No APK or AAB was promoted to a permanent GitHub release.** No phone installation, app data reset, private key access, PR merge or branch protection setting change was performed. Original v0.9.54 prerelease and stable main code are preserved.

**Next step:** Maintain draft PR #85 as an integration candidate. Before a new installable preview, choose owner-held stable private test signing and an incremented versionCode, verify installed package signer with the read-only preflight, and perform real device saved-data upgrade acceptance without uninstalling existing valuable progress. Google Play launch scope and two-phone tests are independent pending owner gates.

[Integration handoff](https://github.com/PlayerEden/Ricochet-Rumble/blob/integration/v0956-main-rooted-rehearsal/docs/INTEGRATION_REHEARSAL_v0956.md) · [Development tracker #76](https://github.com/PlayerEden/Ricochet-Rumble/issues/76) · [Signer custody issue #20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20) · [Save migration issue #29](https://github.com/PlayerEden/Ricochet-Rumble/issues/29).

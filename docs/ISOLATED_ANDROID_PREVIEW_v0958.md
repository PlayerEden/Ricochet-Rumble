# Sector Rebound — isolated preview APK architecture (draft, code-reviewed)

**2026-10-31. Not merged, not installed, no owner key present, no release created.**

## Why this design

The owner's other game's historical successful APKs used the same preview certificate with increasing version codes, a separate preview package name and a repeatable build workflow. This copies that **architecture**, not any prior game's private signer or hardcoded credential.

**Stable / prospective Play identity:** `com.playereden.ricochetrumble` (source unchanged).  
**Internal Android preview identity:** `com.playereden.ricochetrumble.preview` when and only when `srPreviewPackage=true` with complete private TEST signing settings. This is a separate Android installation with separate on-device app data. Existing preview APKs with the old package identity will **not** be in-place upgrades to this new preview package. Owner reports the old app is already uninstalled.

## Ordinary QA vs approved owner preview

- Ordinary PR full QA builds keep original package `com.playereden.ricochetrumble`, versionCode 50, versionName `0.9.54-lan-timeout-test`, and runner-generated debug signature. They are throwaway **QA builds**, not supported upgrades or public release candidates.
- Owner preview ONLY: a manually dispatched workflow on **the default main branch**, with owner consent and verified exact HEAD SHA. No PR or push event can trigger secrets. Missing secrets fail rather than falling back to transient debug signing.
- New preview versions are **automatic**: versionCode `100000 + GITHUB_RUN_NUMBER`, versionName `0.9.57-preview.<run number>`. Always start a **new run** for a new preview; reruns of the same run are blocked because `GITHUB_RUN_NUMBER` does not change. Remember the workflow run counter grows across new dispatches, not code commits, and is not a public release version.
- Owner-generated, securely backed up **new Sector Rebound TEST keystore**, provided through GitHub Actions **secrets** `SR_TEST_KEYSTORE_B64`, `SR_TEST_STORE_PASSWORD`, `SR_TEST_KEY_ALIAS`, `SR_TEST_KEY_PASSWORD`. Public **certificate fingerprint** pinned in `SR_TEST_CERT_SHA256` variable. Do not copy old private repo key material or encode keys in source.
- A separate, *ephemeral CI-only signing key* demonstrates the two-version Android Gradle output and real APK signature continuity **without ever touching the owner's private key**. It is destroyed on the runner, and these ephemeral previews are not uploaded as owner APKs.
- Actual private preview output is inspected using Android SDK `apksigner`, `aapt`, byte checks on six embedded WebView files, plus exact SHA-256 and signer evidence.
- The default result is a 14-day Actions artifact containing APK/evidence. **An independent optional checkbox** requests a **GitHub *DRAFT* prerelease** (never published automatically), from only the signed/verified same-run artifact and checksum. Owner can review and publish that draft later; public visibility happens only upon deliberate publication. No release will be made until owner runs it and explicitly approves. GitHub Releases provide a more durable link than ChatGPT file attachments or expiring Actions artifacts.

## How we reach the first real preview

1. Review and explicitly approve integration of this workflow/game source; it remains unmerged in [draft PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85). Workflow dispatch is not available until its file exists on default main.
2. On a trusted Windows PC, generate a unique long-lived TEST keystore, secure two private backups and passwords. Never paste them into chat, public repo, branch, issue, or PR.
3. Add secrets and pin in GitHub Actions settings directly. Consider a protected GitHub environment for additional control. The default main branch should be reviewed and ideally protected before enabling signing for broad contributors.
4. Once code is on main and key configured, use Actions → owner-approved stable preview APK → Run workflow. Use reviewed main HEAD SHA, tick `owner_approved`; leave `create_draft_release` false for the first run. It automatically assigns a code.
5. Since the owner's phone is currently empty of the old package, verify it remains empty and fresh-install the first **owner-signed preview APK**. Record Dossier/settings, then create a new owner run to make a higher code signed with the same key; install over the existing **preview** package without uninstalling. Verify data survives.
6. If owner desires a reliable public/downloadable link for testing, manually enable the workflow's separate draft-release checkbox and then **publish the draft only after reviewing the exact release asset and SHA**. Otherwise use the internal Actions artifact, mindful of expiration.
7. Later, Google Play uses the regular application ID with separately managed production upload/app-signing credentials; one cannot assume the sideloaded `.preview` package's local saves migrate to the public app. The second phone remains needed for LAN validation only.

## Explicit restrictions

No existing game logic, pilot art, physics, LAN packets, menu/audio, save format, or source asset content is modified by this packaging experiment. No owner private keystore is available to CI today. Automated two-version checks **do not prove** that the on-device save state survives an actual upgrade, nor validate a production Play release. Do not merge or distribute an APK until approved and checks pass.

See: [main status](https://github.com/PlayerEden/Ricochet-Rumble/blob/main/docs/PROJECT_STATUS.md), [signer issue #20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20), [draft integration PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85).

# Sector Rebound — automatically signed test APKs (Operation Phosphor workflow)

**Implemented on draft integration branch:** `integration/v0956-main-rooted-rehearsal`. This is a **testing-only** APK workflow, not a Google Play release.

## How it works
Every reviewed update to the Android/web game, test suite or this workflow triggers `.github/workflows/automatic-preview-apk.yml`. GitHub installs the build tools on its own runner, downloads the **fixed public Android Open Source Project generic development test key**, verifies its exact Git object hashes, constructs an in-run PKCS12 keystore, builds an Android app with `com.playereden.ricochetrumble.preview`, assigns increasing versionCodes `100000 + GITHUB_RUN_NUMBER`, and validates the real signed APK: certificate, version, package, six embedded WebView assets, and SHA256. It uploads a downloadable ZIP containing the actual APK and verification.txt.

**No local Java, PowerShell, GitHub secret, personal signer, credentials or user installation setup is required.** All key material is openly available in AOSP source by design. It is deliberately **not** the separate production/Google Play signing identity. The repository remains public.

## Where to download
[GitHub Actions: automatic disposable preview APK](https://github.com/PlayerEden/Ricochet-Rumble/actions/workflows/automatic-preview-apk.yml). Open the most recent green run on the integration branch and download the `sector-rebound-preview-<run_number>` artifact. Extract `sector-rebound-preview-<versionCode>.apk` and install on Android.

The artifact is retained for 14 days. The repository's full QA builds have separate temporary debug signers, so **do not install those APKs expecting an in-place upgrade** of the consistently signed `.preview` application.

## Security trade-off explicitly accepted for testing
The AOSP generic test key is **public** and is shared with unrelated Android test projects. Anyone could sign an APK using that certificate. Treat `.preview` as a disposable, untrusted development application, install APKs only from confirmed GitHub workflow runs and **do not store real credentials, sensitive personal data, or production assets in it**. Do not use this test signing identity for production, Google Play, user-facing security assertions, or any release identified as official.

The future Play app remains `com.playereden.ricochetrumble`, completely separate from `com.playereden.ricochetrumble.preview`. Those app installations do not automatically share local saves. A change from any previous base-package test build to the `.preview` package is necessarily a separate fresh install.

## Validation boundaries
- Automated source/build checks can prove that the signed APK has the expected identity and packaged assets. A repeat build using the unchanged AOSP key should preserve the signing certificate and advance the version code.
- Only the owner's actual **install version N -> save game progress -> install version N+1 without uninstalling** test can prove Android device-level update and local save retention.
- The two-phone Wi-Fi/LAN acceptance and future Google Play signing remain separate milestones.

**Stable `main` still contains the v0.9.21 known-good game.** This workflow was intentionally added to the draft integration branch only; no game assets, pilot art, controls, music, scoring or LAN logic changed in this pass.

Sources: [AOSP development key directory](https://android.googlesource.com/platform/build/+/refs/heads/main/target/product/security), [Android APK signer documentation](https://developer.android.com/tools/apksigner).

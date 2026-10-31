# Sector Rebound — v0.9.57 reliable test APK preparation

**Status (2026-10-30): CODE PREPARED, NOT YET AN OWNER-KEYED OR ON-DEVICE PASS.**
**Branch:** `integration/v0956-main-rooted-rehearsal` / [draft PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85).

**Owner has uninstalled the previous test APK** (reported in chat). An empty installation now permits a *fresh-install* test with a new durable signing identity; it does not prove prior local saves survive, and old data remains gone unless separately backed up. Never assume a different phone still has no Sector Rebound package.

## What was prepared without touching any private key

- A manual-only private test APK workflow requires explicit owner approval, an exact reviewed branch HEAD SHA, a new **versionCode greater than 50**, and explicit prerelease versionName.
- The Android Gradle project keeps exact original code 50 and name `0.9.54-lan-timeout-test` for ordinary QA. Overrides via `srPreviewVersionCode` / `srPreviewVersionName` are rejected unless a complete private TEST signing configuration exists.
- The existing workflow retains strict missing-secret checks, public certificate SHA-256 pinning, manifest/package verification, no automatic publishing, and runner keystore deletion. New tests only verify the guard's static contract.
- The future owner-private preview's numeric code must be higher than **every prior installed test build**. The guard enforces above-50 but cannot know an unseen device or every prior distributed build; record assigned codes and run the read-only installed-APK preflight before updating.

## What happens next

1. Owner, on a trusted computer: generate **one private internal TEST signing key** and store two secure offline copies and passwords. Do **not** paste keys/passwords/base64 to chat or commit them to GitHub.
2. Add private GitHub Actions secrets `SR_TEST_KEYSTORE_B64`, `SR_TEST_STORE_PASSWORD`, `SR_TEST_KEY_ALIAS`, `SR_TEST_KEY_PASSWORD`; add **public** `SR_TEST_CERT_SHA256` variable. This has **NOT happened**.
3. Review the workflow and bring it onto default `main` through a **separate explicitly approved integration**, since GitHub requires the `workflow_dispatch` file on the default branch before its Run Workflow button is exposed. Do not merge the newer game automatically for this setup.
4. First owner-pinned clean test APK should use **code 51 or higher** with a distinct explicit prerelease version name. Select the reviewed source branch and enter its **exact HEAD SHA** when using the manual workflow; verify real APK, private test signing public cert and the generated artifact report.
5. Confirm the app is **not currently installed** on the phone before intentionally clean-installing. Exercise Solo game, Dossier and settings, then create a new code 52 (or higher) APK **with the same signer** and test an actual in-place update, *without uninstalling*, verifying the saved settings/stats remain.
6. No two-phone requirement for single-device install/upgrade safety; LAN still needs actual second-phone acceptance before claimed working at launch. Google Play has separate signing/store gates.

**No new APK has been published or installed.** Stable main gameplay remains v0.9.21; candidate's owner-approved P-03/UI/audio assets have not changed. A workflow that has not run with real owner secrets must not be called release-ready.

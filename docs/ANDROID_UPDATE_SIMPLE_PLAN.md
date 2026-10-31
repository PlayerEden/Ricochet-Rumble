# Sector Rebound — Simple Android APK Update Plan

**Status (2026-10-30): preparation only. No install, no user data changes, no permanent signing key configured or tested yet.**  
**Goal:** make updating a test APK a normal repeatable process rather than an uninstall/reinstall gamble.  
**Short version:** back up saves → one permanent *private test* signing key → higher Android version for each new preview → verify an in-place phone update. The second phone is needed for Wi-Fi multiplayer QA, **not** for this Android update test.

## What is already handled

- The [main-rooted integrated game PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85) has passing browser, game, Android, and real APK/AAB-package integrity QA. It is an **unmerged draft**; main playable code stays v0.9.21.
- Six browser game assets match the Android WebView files and the packaged APK/AAB. This verifies the package content, **not** whether it will update an existing phone installation.
- The source includes a *read-only* cert/version preflight checker `tools/android-update-preflight.mjs`, a local backup/restore implementation, and a private-test-key-only manual signing workflow on the candidate branch.
- Old experiments **did use differing debug signing certificates**. The newest candidate has `versionCode 50`, the same code as the earlier v0.9.54 preview, so it is **not** a valid new preview version to deploy over that build. The existing owner-keyed workflow still hardcodes code 50 and is present in the candidate tree, **not yet set up as a ready-to-run release pipeline on stable main**.
- No verified permanent test key, installed-phone signing fingerprint, or phone save-preserving upgrade proof has been recorded.

## First: protect what is already installed (no PC or second phone needed)

1. **Do not uninstall Sector Rebound** to fix an installation conflict; first determine if it has progress worth preserving.
2. If your *installed* preview includes it, open **Dossier → Backup → Generate Backup Text → Copy Selected Text**. Paste into a **private note or text file outside the game**; save another safe copy and make sure the text is intact. This text may contain local profile/statistics and preferences; do not put it in a public repository or chat.
3. A backup that cannot be recovered is not enough: before any destructive change, inspect that the copy is complete and use the app's **Preview Import** action to validate the text where available (without confirming restore/overwriting the old installation). Older preview APKs may **not** have the Backup menu; if absent, stop and preserve the existing app until a safe recovery route is chosen.
4. The backed-up keys cover existing settings, Custom Match settings/presets, and Dossier where available. It is **not** cloud synchronization, multiplayer data, account entitlements or proof of automatic Android data retention.

**Today's safe stopping point:** keep playing the existing installed game and leave the phone unchanged. No new APK is needed to make the current GitHub QA progress useful.

## One-time task when you have a trusted Windows computer

1. Generate **one new private INTERNAL TEST keystore** (a `.jks` file) locally using Android Studio's *Build → Generate Signed Bundle/APK → Create new key store* or the JDK `keytool`. Give it a long validity and strong passwords. This is the test key for **sideloaded development APKs**, not the eventual Play upload key.
2. Keep **two offline copies** of the keystore in safe locations and store credentials in a password manager. Never paste the keystore, its base64 contents, its password or the private key into ChatGPT, GitHub issues, PRs, commits or a public repository. Do **not** reuse the historical encrypted backup from the public repo without separate custody review.
3. Record the **public certificate SHA-256 fingerprint** (safe to put in repository variables). After the key is backed up, configure the existing workflow's GitHub Actions private **secrets**: `SR_TEST_KEYSTORE_B64`, `SR_TEST_STORE_PASSWORD`, `SR_TEST_KEY_ALIAS`, `SR_TEST_KEY_PASSWORD`. Pin the public certificate fingerprint as repository **variable** `SR_TEST_CERT_SHA256`. In GitHub: repository **Settings → Secrets and variables → Actions**. Do this in the GitHub settings/CLI, not through chat.
4. **Before the first signed test release, engineering must finish the simple release-button guard**: expose the verified manual workflow from the default branch without publishing secrets, make it accept/verify a new strictly increasing `versionCode` rather than the current hardcoded 50, verify the requested source/commit and exact APK signer, and fail closed if anything is missing. This step is **not complete yet**; do not run the older pinned workflow as though it solves upgrades.

**Good default:** keep the existing technical package ID `com.playereden.ricochetrumble` for now; the launcher already says *Sector Rebound*. Avoid changing package identity unintentionally. Verify final uniqueness/ownership before Play publishing.

## First transition from old experimental APKs

The new permanent key **cannot normally update a phone install signed by a different old debug key**. This one-time transition may require a **user-approved** migration after safely verifying the backup. Do not delete the installed app to make an APK install, and don't promise in-place preservation when certificates do not match. The existing preflight tool compares signed APKs, or reads a connected phone's installed APK, and refuses wrong package/certificate/version.

- **If existing and new certificates match:** use a higher Android version code, run read-only preflight, then attempt an in-place APK update with your saved data intact; confirm Dossier/settings afterward.
- **If certificates differ:** preserve old app and backup, and only after explicit owner approval plan a controlled transition to the new key with restore testing; this is **not** a normal in-place update and may require removing the old installation. If data cannot be exported and validated, **stop** rather than risk irreversible loss.

After that first transition, install two **successive new versions signed by the *same* permanent key**, with increasing version codes, without uninstalling either time. Verify the existing Dossier and settings after *each* update. **One Android phone is enough to test this**; a second phone is only needed for real LAN multiplayer.

## What we deliberately postpone

- **Google Play:** requires a separately managed upload key and Play App Signing, final package identity, privacy/Data safety, store assets, and applicable Console testing. Google's Play app signing identity can differ from a sideloaded test key, so **do not assume a test APK will update seamlessly to the Play version**. No public Play launch or keys are being configured now.
- **Two-phone Wi-Fi QA:** needed before we advertise LAN as fully tested at launch, but it does **not** prevent us from developing, verifying, or installing offline/single-phone builds. Whether to defer LAN from the first public release is an owner launch-scope decision.
- **Gameplay changes:** none of this requires reworking art, controls, scoring, tanks, pilot, maze generation or the engine.

## Who does what?

| Work | Who | Status |
|---|---|---|
| Preserve original releases, game assets, docs and integration tests | Assistant/GitHub | **Done; draft remains unmerged** |
| Prepare release-button/checks and version guard | Assistant/GitHub, separate reviewed code-only work | **Next engineering task; not yet done** |
| Copy existing in-game backup if available | Owner, on current phone | **Not yet verified** |
| Create/custody permanent private test key + GitHub secrets | Owner, on trusted computer | **Not yet verified** |
| Compare installed signer; test two same-key in-place updates and real saves | Owner + assistant's documented read-only checks | **Blocked until key/device available** |
| Test LAN with two physical phones and complete Play Console launch | Owner with assistant support | **Later; not required for initial setup** |

## Explicit release rule

A **passing CI build is not permission to uninstall an app or claim data-safe upgrade compatibility**. No one should publish, merge, or force an Android update based on this checklist alone. Keep prior APK releases, rollbacks, approved pilot art, and stored progress intact.

**References:** [permanent package-integrity audit](ANDROID_CI_PACKAGE_ATTESTATION_v0956.md) · [existing signer mismatch and read-only preflight](ANDROID_UPDATE_PREFLIGHT_v0952.md) · [signing custody issue #20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20) · [offline save issue #29](https://github.com/PlayerEden/Ricochet-Rumble/issues/29) · [Google: how updates work](https://developer.android.com/google/play/app-updates) · [Android app signing](https://developer.android.com/studio/publish/app-signing) · [GitHub Actions secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).

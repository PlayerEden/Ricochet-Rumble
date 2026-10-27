# Android signing & test build safety

**Status (2026-10-27):** The Actions workflow builds a debug-signed installable APK and an unsigned release AAB for packaging checks. **There is no configured, tested production release-signing workflow.** The Android Gradle project currently has no release signing configuration.

## Debug APKs

GitHub-hosted runners can create different debug keys across builds. Android will not update an installed app with an APK signed by another key; **uninstalling removes local app data**. Back up settings/saves before replacing a conflicting debug install. Debug APKs are for internal testing, **not** Google Play releases.

The technical Android application ID remains `com.playereden.ricochetrumble`, despite the public Sector Rebound title. Final package ownership/name must be decided before first Play publication. Increment `versionCode` and update `versionName` for every genuinely new release candidate.

## Encrypted historical signing backup

This public repository contains a **password-encrypted historical signing-key backup** under `signing/`. The presence of ciphertext in a public repo is a custody concern, but **does not by itself prove that the private key or password was exposed**. The repository does **not** configure that backup for automatic release signing.

**Do not delete, decrypt, publish plaintext, or rotate key material impulsively.** First confirm the legitimate key owner has a verified independent offline backup and access to the necessary credentials; inspect git history and any exposure; then decide on secure key custody or replacement. Use GitHub Actions secrets or equivalent private signing facilities only after review. Never paste keys or passphrases into issues, PRs or chat.

## Production release (not implemented)

Before Google Play: choose a durable upload key, configure least-privilege secret-managed AAB signing and secure backup/recovery; test an install/update path; confirm Play App Signing requirements; then check policy, package ID, store ownership, privacy and Data safety. See [issue #20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20).

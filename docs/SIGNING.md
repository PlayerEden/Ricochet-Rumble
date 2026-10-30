# v0.9.40 signing configuration update — audited 2026-10-29

The older note below predates the **experimental v0.9.40** Gradle update. This branch now supports **optional externally configured upload signing** using the complete set `SR_UPLOAD_STORE_FILE`, `SR_UPLOAD_STORE_PASSWORD`, `SR_UPLOAD_KEY_ALIAS` and `SR_UPLOAD_KEY_PASSWORD`. **No credentials were supplied during CI; the v0.9.40 release AAB remains unsigned and no signed production artifact has been accepted.** Partial environment configuration throws an error instead of silently selecting an unintended signer. [Exact successful Android QA](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40991176203).

**P0 open:** Historical password-encrypted release key backup exists under public `signing/` and owner custody/exposure review remains open ([issue #20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20)). Do not decrypt/open/print, delete, rotate or assume a key is safe/unsafe without owner-backed security review and independent recoverable backups. The exact Android update certificate must match the installed APK (or supported signing rotation) for in-place data continuity. Signed Play upload, app-signing enrollment and owner hardware validation remain unperformed. No secrets or credentials belong in the public repo, CI logs, issue comments or chat.

---

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

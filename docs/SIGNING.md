# Ricochet Rumble: stable Android updates

Older v0.3–v0.6 APKs were created with GitHub Actions' default **debug signing key**, which changes when a fresh runner creates a new keystore. Even if the package name matches, Android rejects updates signed by a different key.

## Permanent solution (one-time setup)

- Use the private backup archive provided separately: `Ricochet_Rumble_PRIVATE_Signing_Backup.zip`.
- **Keep the archive private.** It contains the permanent signing keystore and its password; never commit it, upload it to a public issue, or share it with players.
- In the repository, go to **Settings → Secrets and variables → Actions → New repository secret** (not Variables).
- Name: `RR_SIGNING_PASSWORD`.
- Value: the single line in the backup's `SIGNING_PASSWORD.txt` file.
- Save, then open **Actions → Signed Android APK → Run workflow** on `main`.
- The completed workflow provides `ricochet-rumble-0.6.1-SIGNED-release-apk` containing `app-release.apk`.

The source repository contains **only a strong-password-encrypted copy** of the signing keystore (`signing/ricochet-release.p12.gpg.b64`). The secret is required to decrypt it during a build. The decrypted key stays on the temporary GitHub runner and is excluded from Git.

## One last uninstall

The current phone install was signed using the old disposable debug key. Its private key isn't available for this build, so **Android cannot update it in place**. Uninstall that copy once and install the new `app-release.apk`. After that, keep the signing password/keystore, the same `applicationId` (`com.playereden.ricochetrumble`), and increment `versionCode` each release. You can install new signed APKs over the existing app, preserving its on-device data.

If the APK ever still says `App not installed as package conflicts with an existing package`, check the signing certificate and version code. An APK with a lower or equal version code won't normally be accepted as an upgrade. Don't uninstall without first considering whether the old app contains saves you need.

## Build safety

The workflow uses **manual dispatch** rather than automatic builds until the one-time secret is configured, so a missing secret doesn't waste a build on every commit. It fails rather than generating another disposable APK. Future APKs must use `assembleRelease` with the configured signing key (not `assembleDebug`). The public GitHub repo, encrypted key, and actions themselves don't require paid services.

For local builds or migration to another CI service, the private `.p12` keystore in the backup and the password can be used with Android Gradle Plugin's signing configuration. Losing both the backup and secret means losing the ability to publish updates under this signer.
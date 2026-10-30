# v0.9.40 Android upgrade safety, local recovery and upload-signing boundary

**Experimental branch:** `feature/android-upgrade-readiness-v0940` stacked directly on v0.9.39 dossier PR #58. This is **not** a production-signed Android release or confirmation that past debug APKs can update in-place.

## Existing deployment fault discovered

Previous v0.9.39 test artifact was archived from a binary whose Gradle build config still reported **versionName `0.9.21-game-feel` and versionCode 38**. The new candidate uses `versionName '0.9.40-upgrade-test'`, `versionCode 40`, retaining `applicationId 'com.playereden.ricochetrumble'` and same Java package/NSD service. Internal version increase alone is NOT sufficient to update an APK signed with a different debug certificate. GitHub-hosted Android builds may use ephemeral default debug keystores. Before uninstalling an old debug version, use the new manual backup text *if the currently installed APK already includes the backup screen*, or preserve data through a supported Android backup process; old v0.9.39 and earlier **do not yet have this export UI**, so do not promise a migration that cannot be performed. Avoid uninstall until the data-preservation path is verified.

Android's manifest still explicitly has `android:allowBackup="false"`; do not assume OS cloud migration. Android update verification requires compatible package ID, signing certificate, and versionCode. See official [Android app update requirements](https://developer.android.com/google/play/app-updates) and [Play App Signing setup](https://support.google.com/googleplay/android-developer/answer/9842756).

## Implemented in this experimental candidate

- A user-accessible **BACK UP DATA** entry from Player Dossier. It exports only present, validated local records: `rr-options-v06`, `rr-custom-v1`, `rr-custom-presets-v1`, and `rr-dossier-v1`. No accounts, network upload, Android permissions, clipboard reading or remote servers.
- The exported JSON text must be copied **outside the game before uninstall**. Restore lets the user paste code, preview valid included records and how many existing entries would be overwritten, then explicitly confirm. Invalid/oversize/unknown-key/future-schema backups are refused.
- Before changing records, restore writes `rr-restore-recovery-v1` snapshot of all target keys. Partial storage-write failures attempt restoration of original values; if this fails, recovery snapshot is retained and error is shown. A successful import reloads the UI.
- The previous versioned dossier stores and Quick Play/Custom Match settings are preserved verbatim, not converted to fake stats or invented entitlements. Future/unknown local schema data is write-protected.
- No cosmetics selections or purchase systems added. Web/Android JS, HTML and CSS mirror exactly.
- Gradle config provides **optional external upload-key signing only** from four environment variables (`SR_UPLOAD_STORE_FILE`, `SR_UPLOAD_STORE_PASSWORD`, `SR_UPLOAD_KEY_ALIAS`, `SR_UPLOAD_KEY_PASSWORD`). None are stored in repository. Missing all leaves the AAB intentionally **unsigned**; partially configured variables cause a build failure, not silent fallback. No signing keys are generated, committed, transmitted or assumed to exist. **Do not put private keys into chat, logs, or GitHub source.** Play App Signing is a distinct future enrollment/acceptance gate.

## Explicit tests and completion requirements

- [ ] Fast standalone recovery tests: valid roundtrip, all four keys, duplicate-safe saved dossier, damaged/future schema rejection, unknown key rejection, failed-snapshot abort, partial failed import rollback.
- [ ] Android identity/version audit: application ID stable; version code now 40; no hardcoded keystore/password; existing safe WebView settings, LAN/manifest and backup policy preserved.
- [ ] Real Chromium dossier → export → preview error → corrected preview → confirm restore → reload, with actual per-mode dossier and Custom Match presets roundtrip, 740x360, 915x412, 1280x720.
- [ ] Full Android Gradle debug APK and **unsigned** AAB, same gameplay/source SHA; screenshot/test evidence from exact QA.
- [ ] Record actual successful CI IDs, checksum and original immutable prerelease APK without rebuilding.
- [ ] **Manual phone test** with same certificate for in-place update, and export-to-external/import after a debug uninstall; old builds without backup tool cannot export this way.
- [ ] Provision a durable owner-controlled keystore/certificate and private repository secret storage *only with owner consent*, then validate production Play upload and non-Play Android update certificates before launch. Never commit or print private signing keys.
- [ ] App lifecycle/permissions, Play Console account, privacy policy, final naming/trademark check, multiple Android devices, two-phone LAN and formal plan-wide audit **remain uncompleted**.

**This is release infrastructure, not Play-ready evidence.**

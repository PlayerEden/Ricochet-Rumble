# M4 — One-phone offline backup sharing (2026-11-03)

## Decision and purpose

Sector Rebound's owner has temporarily accepted **v0.9.78 camera/AI feel** (pilot 0.94, tank 0.73, mech 0.69), and **cannot yet test on two phones**. Neither core combat nor LAN protocols change in this pass. A practical one-phone release blocker is transferring user progress before debug APK updates: the existing validated Dossier backup code only offered text selection/copy, which can be cumbersome on Android.

## Implemented scope

- Dossier → Back Up Data → **GENERATE BACKUP TEXT** retains the existing strict offline six-key export/preview/restore/rollback behavior. New **SHARE / SAVE BACKUP** button opens the standard Android share chooser *only on an explicit button tap*.
- The Android JavaScript bridge receives only previously validated backup text; native code rejects content outside the known `sector-rebound-local-v1` v1 envelope or above 60,000 characters, then uses `Intent.ACTION_SEND` / `Intent.createChooser` with `text/plain`. No new Android permissions, no automatic upload, no developer server, no background sharing.
- Existing **COPY SELECTED TEXT** stays available. Web/browser builds attempt `navigator.share` if supported; otherwise display a truthful instruction to use Copy. Invalid or missing backup text never enters the native chooser.
- The Android share target is a separate app selected by the user. Depending on the chosen app, the user's full backup (settings, saved match stats and cosmetics) may be copied to a notes app, file service or contact. This is an explicit user action, not a background service. Backups must be preserved outside the installed app before uninstalling; reinstalling can erase local data.
- The existing restore flow remains **preview → confirmation → recovery snapshot → actual write verification**. No cosmetic entitlement, scoring or gameplay rule changes.

## Tests

- Existing `tests/save-backup.mjs`, `tests/dossier.mjs`, `tests/android-upgrade-readiness.mjs` continue to guard raw progress, versioning and fail-closed recovery.
- New `tests/backup-share-ui.mjs` exercises real rendered browser navigation, Generate/Share click boundaries, exact validated text passing to a native stub, lack of automatic sharing, missing and maliciously edited export handling, web fallback and Java bridge/chooser contract.
- The canonical `current-main-regression.yml` includes the new test. All Web and Android WebView asset files must be byte-for-byte identical, and accepted AI/camera/solo practice/LAN behavior must continue to pass.

## User test on one Android phone

1. **Back up the existing Dossier** before installing another preview APK. Upgrade in place; do **not** uninstall for a signing failure.
2. Open Dossier → BACK UP DATA → GENERATE BACKUP TEXT. Tap **SHARE / SAVE BACKUP**. Confirm the Android chooser appears, pick a notes/file app of your choice, and **verify the complete saved text exists there outside Sector Rebound**.
3. Return to the game; test regular Copy still works. Check that opening the backup screen or closing the chooser has not altered your Dossier/Hangar/custom presets.
4. Inspect preview import and cancel; do not restore anything unless you actually need it. No real two-device Wi-Fi tests are part of this milestone.

## Open gates

The Android share chooser's actual appearance and save-target persistence, install-over/retained progress, long session reliability and second Android Wi-Fi test are not asserted by CI. Google Play production signing, privacy disclosures, Android Data Safety and store listing are independent later steps. Source checkpoint and APK hash must be recorded before owner install.

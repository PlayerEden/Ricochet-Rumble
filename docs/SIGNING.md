# Android APK builds — simple test mode

The default workflow **Android Test APK** builds `assembleDebug` on GitHub-hosted runners.
It requires **no GitHub secrets, passwords, or extra setup**. Use Actions → Android Test APK → Run workflow, or edit the workflow to trigger a test build.

Each GitHub-hosted build may use a different debug signing certificate. Android rejects updating an app signed with a different certificate. For these test builds, uninstall the previous Ricochet Rumble APK before installing the new one. **Uninstalling deletes local app data and settings.**

The game uses application ID `com.playereden.ricochetrumble`. Increment `versionCode` for subsequent APK versions.

## Optional permanent updates, not enabled

The repository retains a strong-password encrypted release signing key for a future optional switch to stable, in-place updates. The key and backup must remain private. A future release build could use the signing configuration already in `android/app/build.gradle` together with the private password as a GitHub Actions secret `RR_SIGNING_PASSWORD`. **The default test workflow does not use this secret or the release key.**

The permanent signing setup is entirely optional; the project does not depend on it to make APKs for playtesting.

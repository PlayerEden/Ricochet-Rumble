# Sector Rebound — Google Play Launch Foundation v0.9.18

## Goal
Begin developing toward a legitimate, maintainable Google Play commercial release while preserving the v0.9.17 playable game as a rollback baseline. **This is not a Play Console submission** and no accounts, keys or publishing actions are performed here.

## Confirmed current requirements (2026-10)
- Google Play Console developer account is **Personal** or **Organization**. Either type can sell games. Newly created Personal accounts (after 2023-11-13) must meet the closed-test eligibility rule: **12 continuously opted-in testers for at least 14 days**, then apply for production access. That specific rule is not applied to Organization accounts, but testing, app reviews, and policy compliance still matter. Organizations must genuinely represent a business and complete legal/website identity verification, typically including D-U-N-S.
  https://support.google.com/googleplay/android-developer/answer/14151465
  https://support.google.com/googleplay/android-developer/answer/13634885
- Beginning **2026-08-31**, new mobile apps and updates must target Android **API 36 or higher**.
  https://developer.android.com/google/play/requirements/target-sdk
- New Play apps must be published as **Android App Bundles (.aab)**. APK remains for direct QA installation.
  https://developer.android.com/guide/app-bundle
- Apps must complete a Data safety declaration and have a published, accurate privacy policy **even if they collect no personal data**. Any future account, analytics, ads, crash reporting or cloud save features require updating those statements.
  https://support.google.com/googleplay/android-developer/answer/10787469
- The app may be Free or Paid. Play currently permits Paid → Free, but **not Free → Paid** for the same app once it has been offered for free. Decide before launching. Any purchased digital cosmetics later require compliant Google Play Billing.
  https://support.google.com/googleplay/android-developer/answer/6334373
- Google Play Games Services (PGS) is **not** a substitute for the game's own player identity/save system. Its platform identity is suited to achievements and leaderboards; profile and progression should be local-first with optional authenticated sync later.
  https://developer.android.com/games/pgs/migration_overview

## v0.9.18 build foundation
- Android compile/target SDK **36**, still minSdk **26**.
- Android Gradle Plugin **8.13.2**, Gradle **8.13**, JDK **17**.
- Existing app ID **com.playereden.ricochetrumble** is intentionally unchanged in this branch. **Before creating a Play app**, decide whether to keep it for continuity or adopt a final Sector Rebound package ID. A published package ID is effectively permanent, and changing it also changes app identity/upgrade behavior.
- CI builds a normal **debug APK** for sideloaded tests and generates an **unsigned release AAB for packaging validation**. The unsigned artifact is **NOT UPLOADABLE TO GOOGLE PLAY** until a proper, secret-managed release upload signing configuration is implemented. Never commit signing certificates/passwords/keystores into Git.
- The workflow continues smoke tests, 30-second pacing samples, Chromium viewport QA and artifact parity.

## Roadmap for the next development slices
### v0.9.19 — Offline Pilot Profile MVP
Build a concise, in-world `PILOT DOSSIER` accessible from the main menu. Offline-first, no login, no uploads. Schema-versioned local save with error handling and safe migration. Display:
- Operator callsign (editable, length-limited, sanitized)
- Service record: completed solo matches, solo wins, total verified KOs, pilot recoveries, and best streak
- Cosmetic service grade from **participation milestones** only, never weapon damage, armor or aim upgrades
- A small menu profile card and after-action update confirming progress

Keep **private local progression only**. Do not claim cloud sync, external leaderboards or cross-device identity yet. Stable event snapshots should credit a match only once; completing a replay shouldn't double-count. Anonymous device profiles should not require an internet connection. If the user deletes local storage, progress will be lost until an explicit backup/sync feature exists.

### v0.9.20 — Identity, cosmetics and achievement foundations
Pilot badge/rank icon and cosmetic tank/mech accents, several unlock milestones, profile UI clarity on mobile. No pay-to-win. Maintain clear separation between local game profile and a future Play Games platform Player ID.

### v0.9.21 — Release candidate infrastructure
- Finalize package ID, signing/upload key flow via secure CI secrets, Play App Signing, **signed** release .aab.
- Privacy policy page (in app and public HTTPS), data safety statements, deletion procedures if future cloud accounts exist.
- Store assets: feature graphic, high-res launcher icon, real in-game screenshots, game description and age/content rating.
- Accessibility: reduced screen shake, sound toggle, legible controls, input size, safe area, low-end performance.
- Real two-device LAN, reconnects, backgrounding, signing, and release-mode regression tests.
- Review permissions (network/service-discovery only), app security, third-party licenses and actual Google Play review requirements.
- Any monetization choice to be decided with the publisher before Play listing creation.

## Acceptance and non-goals
- No fabricated store registration or release signing claims.
- No forced online login, ads, subscriptions or microtransactions in the foundation build.
- No fabricated cloud profile, multiplayer match results or ownership records.
- Preserve v0.9.17 as rollback and only merge after the owner tests an Android APK.

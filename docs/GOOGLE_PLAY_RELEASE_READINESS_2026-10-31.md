# Sector Rebound — Google Play v1 readiness audit (2026-10-31)

**Status: RELEASE NO-GO; dev preview is healthy.** This is an executable, evidence-backed readiness *inventory*, not a store approval, a signed distribution build, or legal advice. The game and user-approved icon A are unchanged by this pass. Source HEAD at audit start: `d68b483b12ddf41d707f162f8efc9beb834aa98c` on draft PR #85, stable `main` untouched.

## Verified technical foundations
- Android compile/target **API 36** (required for new phone apps and updates since August 31, 2026), min SDK 26, production package `com.playereden.ricochetrumble` distinct from test `.preview` package.
- Bundled HTML/JS/CSS parity, restrictive webview loading, permissions limited to INTERNET, ACCESS_NETWORK_STATE and ACCESS_WIFI_STATE.
- Debug preview can build and update with same public test signing certificate; private **Play upload signing** is a separate, externally provided key; unsigned AAB workflow only proves bundle compilation capability, **not** a signed production artifact.
- Cross-preview browser storage rehearsal passed, but owner phone upgrade/restore still needs explicit physical evidence; actual two-phone LAN not yet tested.

## Confirmed release requirements
1. **Public privacy policy URL + in-game accessible privacy text or link**, covering locally saved Dossier/preferences, manual user-exported backups, local Wi-Fi device/IP and game packets, and any later cloud/analytics/ads. Google Play requires policy information even when app has no user account. No speculative Data safety claim: final declarations require inspection of the actual signed build and software dependencies.
2. **Approved Play listing icon** (512x512 32-bit RGBA PNG, <=1MB) and **feature graphic** (1024x500 24-bit PNG/JPEG). These are *different deliverables* from the Android adaptive launcher; Preview 100041's 224px image foreground must also be upgraded before publishing. Include actual in-game screenshots, not generated depictions of gameplay.
3. **Production signing & publishing:** privately signed AAB, verified manifest/package/target, Play App Signing and account listing; do not reuse public AOSP test certificate.
4. **Owner acceptance:** Android in-place saved progress, resume/rotation/interruption, real two-device local Wi-Fi host/join/ready/rematch/disconnect OR explicit launch scope removing LAN. Full game UI/engine browser automation does not substitute.
5. **Play Console eligibility:** account-type dependent closed testing. Personal developer accounts created after Nov 13, 2023 generally require 12 opted-in testers continuously for 14 days before production access; *cannot infer the user's account type*.
6. **Android 17 forward-compatibility (future only):** Apps targeting API 37+ may need ACCESS_LOCAL_NETWORK or system picker strategy for local TCP/NSD; **do not request it for this current API 36 build**.

## New repeatable release gate
- `node tools/play-release-preflight.mjs --output=qa-results/play-release-preflight.json` emits a reproducible read-only source-backed report. Current result should be `RELEASE_NO_GO` while external evidence is missing; this is the *correct* success condition for the audit.
- `node tools/play-release-preflight.mjs --require-ready` exits nonzero for any missing store asset/policy or manual acceptance (fail-closed). Manually evidenced gates are intentionally not auto-passed by simply placing an arbitrary file in the repo.
- `node tests/play-release-preflight.mjs` protects the distinctions: preview APK ≠ signed Play AAB, Chromium storage ≠ physical Android install, two-browser LAN ≠ two-phone Wi-Fi, Android launcher ≠ 512 Play listing icon.
- The fast CI will run the audit and upload the report as inspectable artifact. The developer branch stays DRAFT; **no auto-merge or publication**.

## Primary official policy sources (checked 2026-10-31)
- Target 36: https://support.google.com/googleplay/android-developer/answer/11926878
- App info / public policy: https://support.google.com/googleplay/android-developer/answer/9859455
- User Data & Data safety: https://support.google.com/googleplay/android-developer/answer/10144311
- Icon/graphic: https://support.google.com/googleplay/android-developer/answer/9866151
- Closed testing depending on account: https://support.google.com/googleplay/android-developer/answer/14151465
- Android 17 LAN migration: https://developer.android.com/privacy-and-security/local-network-permission

## Next implementation slice
Prepare a clear in-app privacy entry and app-specific policy **without inventing public URLs**, then approved full-resolution Version A store and launcher art, screenshot capture, private production signing, device/LAN release tests and owner go/no-go decision.

# Android emulator install-over QA — 2026-10-31

This is a **real Android package-manager test** addressing the gap left by source-only browser upgrade rehearsals. It is not a substitute for the owner's actual phone or real two-phone Wi-Fi multiplayer.

**Workflow:** [`.github/workflows/android-emulator-upgrade-rehearsal.yml`](../.github/workflows/android-emulator-upgrade-rehearsal.yml), [test shell](../tools/android-emulator-upgrade-rehearsal.sh).

- Checkout immutable Preview 100041 code at `55c91024eb2d76f120bc9203dfc228fe7e333757`; compile Android `.preview` package with versionCode 100041.
- Compile current integration source with versionCode 100050. Both use *the exact same known PUBLIC AOSP test signing certificate*, fetched from official AOSP and checked by git blob SHA. No Play release secrets accessed.
- Emulator API 35: install 100041, launch actual WebView MainActivity, write an app-private file canary, capture screenshot; **`adb install -r`** 100050 over the installed app **without clearing/uninstalling**.
- Verify identical certificate, app ID, installed version 100050, persistent canary, both app launches, record WebView profile directory and screenshots.
- Gate fails on signing mismatch, package/version errors, install failure, missing canary or app crash. Evidence uploaded from GitHub CI.

**Crucial limitation:** A canary file is app-private Android data, **not proof that Dossier, Hangar or saved Custom settings remain in WebView localStorage**. Existing same-origin Chromium save tests covered those stores, but real Android device storage must still be checked. Emulator test additionally cannot prove two physical Wi-Fi devices or private production AAB signing.

This workflow triggers only when its workflow/script/source contract changes on draft integration PR; it does not publish APKs. Stable main and game runtime unchanged. A real owner phone upgrade from Preview 100041 to later preview remains pending.

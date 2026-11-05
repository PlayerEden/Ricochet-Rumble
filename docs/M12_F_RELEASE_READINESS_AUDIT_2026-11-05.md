# Sector Rebound — M12-F integration and release gate
**Date:** 2026-11-05 · **PR:** #141 (draft, never auto-merge) · **Verdict:** **REVIEWABLE, NOT SHIP READY**

## Grounded checkpoint
- Canonical main base (unchanged at audit start): `b114dfa37af2f132e4d3c08d503afcb15c5dff19`.
- Preserved E4 rollback branch: `checkpoint/m12-e4-visual-lab-passed-2026-11-05` → `fd1c14f1cf186da5743c1994b3005d3540281ffa`.
- All ten active E4 PR CI workflows were green, one full Android/visual QA workflow skipped.
- M12-F audit evidence at `qa-results/m12/release-gate/source-scope-audit.json` is generated against current Git HEAD in the visual-test workflow.

## Release packaging blocker and fix
**Finding:** 12 opt-in SVG study files lived in `android/app/src/main/assets/assets/m12/`, meaning standard Android builds could package unused experiment art despite default CSS/JS not rendering it.
**Correction:** all 12 originals have been moved to `android/app/src/m12Visual/assets/assets/m12/`; Gradle adds them to the Android **debug** sourceSet only if `-PsrM12VisualLabPackage=true`. The M12 Visual APK remains `com.playereden.ricochetrumble.m12visual`. Standard debug / hybrid test / owner preview / release do not include these extra studies.
**Proof required by CI:** build the standard APK and confirm correct package ID and **zero** M12 study assets in its ZIP; then build isolated M12 Visual APK and confirm distinct ID, offline SHA parity, 12/12 assets, authentic test URL and debug signing. Both results in the same CI artifact, not unsupported claims.

## Scope / continuity gate
- Compare all changed paths against pinned main, reject anything outside approved M12 docs, tests, assets, opt-in game UI, and test package configuration.
- Verify canonical save-backup, Dossier, CTF, FFA/TDM, LAN modules and AndroidManifest were not modified from pinned main.
- Enforce `web/index.html`, `web/style.css`, `web/game.js` exact byte equality to their ordinary Android-mirror counterparts.
- Check normal Android app ID remains `com.playereden.ricochetrumble` and original launch URL, separate from isolated visual QA app.
- Existing first-party five-size Chrome QA verifies normal URL requests **zero M12 images**, controls/labels/scores unchanged, and art toggles don't write localStorage.
- M12-D floor-cache experiment is **NOT shipped** because measured frame-time improvements/regressions did not satisfy the release threshold.

## Remaining blockers
1. Owner hasn't selected final default visual variants; phone acceptance on prior builds is encouraging but not approval of shipping all variants.
2. Real Android GPU/FPS/heat and longer-session durability not verified by headless Chromium.
3. Two-device LAN test still deferred.
4. Durable signing/upgrades and Google Play release checks not yet complete; CI debug APK is never an upgrade-safe installer.
5. Separate full Android/visual CI workflow was skipped by policy; do not imply it passed.

**No merge into main, no Play production build, no implicit save migration.** The next production-art decision belongs in a separate review/PR after approvals.

## M12-F2 — baseline-to-candidate progress continuity on real Chromium

With zero release changes, `tests/m12-f2-progress-continuity.mjs` serves exact original `main` at the pinned baseline SHA, then swaps HTTP-served scripts/styles to the current M12 PR SHA **on the same browser origin** without resetting browser storage. It seeds **six synthetic game records** (options, Custom rules, Custom presets, Dossier, equipped paint/earned insignia and Daily Sector) and compares their exact raw JSON bytes before and after a second launch and opt-in badge art cycle. It also verifies the Dossier match and KO totals, equipped/unlocked Vector mark, paint, settings and Custom presets in real app menus, producing before/after screenshots and key-specific SHA256 fingerprints. Source files are read from Git and the candidate checkout, not mocked modules.

**Limit of inference:** A headless Chromium same-origin source swap is **not** an Android APK installation, does not establish Android signature continuity, and cannot guarantee real-device uninstall/reinstall data preservation. Unlike upgrading with the same package ID, **uninstalling an app erases its local storage**. The M12 visual APK has a different app ID, so its progress cannot transparently transfer into the normal app; manual export/restore is a separate, user-directed operation. The disposable CI debug signer still means the visual-test APK may need reinstallation on later downloads. Real same-signer, increasing-versionCode on-device installation remains a required separate gate.

The M12 visual-test workflow now runs this scenario automatically and retains machine-readable evidence in the test artifact. All logic is test-only; do not modify actual storage keys, backup behavior or canonical app paths in M12-F2.

## M12-F3 — real Android emulator install-over rehearsal

A new M12-scoped CI workflow, `.github/workflows/m12-f3-android-update-emulator.yml`, uses the existing real Android emulator harness and only public **AOSP emulator-test signing** (never the owner's signer). It compiles immutable previous preview `100041` and candidate preview `100050` with identical signing certificate and `com.playereden.ricochetrumble.preview` ID, instruments both WebViews only in temporary CI build worktrees, installs the old APK, seeds five synthetic local records, restarts it, then uses actual Android `adb install -r` to upgrade to the candidate without uninstalling or clearing app data.

A fail-closed evidence verifier checks certificate SHA256 identity, monotonically increasing version codes, preservation of the app-private file canary, exact bytes of all five localStorage records through baseline relaunch and upgrade, and that the Dossier UI displays the same wins and KOs. Both preview APKs are checked to exclude all M12 Visual-only art assets. Evidence is captured under `qa-results/emulator-upgrade/` and `qa-results/m12/release-gate/m12-f3-android-upgrade.json`.

**Critical limit:** This tests the isolated **.preview** package on a CI emulator using a publicly available throwaway signer. It **does not** make the owner's regular installation upgrade-safe, cannot verify the actual signing certificate on the user's device, and does not justify uninstalling an installed app. The M12 Visual `.m12visual` app remains separate and disposable. Full physical phone testing, true durable signer continuity, and release approval remain blocked.

## M13-A approved-study-art production-style preview (2026-11-05)
User approved the illustrated mode cards, insignia designs and cyan/amber/steel styling in actual phone screenshots. Warm Hangar is the **provisional default in the isolated M13 preview**, not an approved canonical app release. The standalone `.m12visual` package launches `?hybridMenu=1&m13Preview=1`, and is now labeled **SR M13 Preview**. The study art is immediately visible in Mode Select, Hangar and equipped Dossier mark, with all designer A/B buttons hidden and ignored. The Dossier uses the actual equipped emblem ID (FIELD/VECTOR/ACE/COMMAND), no made-up progression. Existing `?m12Art=warm` comparative route is still available in the browser, existing test QA and rollback remain.
Only the disposable test app packages the SVGs, not the ordinary main/debug/preview/release APK. No gameplay, controls, LAN, save schema, unlock requirements or signer changed; no production merge. Full five-landscape-size preview QA and saved storage checks required. This test APK may need a test-app-only reinstall if the CI debug signing key changes; never uninstall the regular app.

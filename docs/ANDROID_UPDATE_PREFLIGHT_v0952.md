# Sector Rebound — Android APK Update Preflight v0.9.52

**2026-10-30.** Independent release-safety development step after the [v0.9.51 corridor-recovery prototype](CORRIDOR_RECOVERY_PROTOTYPE_v0951.md), on [draft PR #81](https://github.com/PlayerEden/Ricochet-Rumble/pull/81). **No runtime gameplay, Android app code, app certificate, signing key, user data or stable main source was modified.** This is a **read-only safety checker** and an automated verification of archived APKs, not a finished in-place update or Play App Signing configuration.

## Critical verified discovery: the archived test builds are NOT mutually update-compatible

The original exact-source signed APK files from [v0.9.46](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.46-ui-audio-test) and [v0.9.51](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.51-corridor-recovery-prototype) were fetched using their original SHA256 from GitHub releases and verified with official Android SDK 35 `apksigner verify --print-certs` and `aapt dump badging`.

| APK | App package | versionCode | Public signing certificate SHA-256 |
|---|---|---:|---|
| v0.9.46 experimental | `com.playereden.ricochetrumble` | 47 | `bad00387cc8336af13f7aa5fb487bfaa8606d0562b806661f8e2b32bc5dc3b67` |
| v0.9.51 experimental | `com.playereden.ricochetrumble` | 48 | `4802b4f710102ce91d1230d523de7c9786c6671d8bcefd1e3b827df1984ffc3b` |

**Actual automated decision: `PREFLIGHT_NO_GO / SIGNING_CERTIFICATE_MISMATCH_DO_NOT_UNINSTALL`.** A larger versionCode alone does not allow these debug builds to update one another. Private signing keys were **not** read, exported or created; certificate fingerprints are public. This does not independently prove which APK is installed on the owner's device or that the other install errors had the same cause.

[Real archived APK certificate check and fail-closed parser QA](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41144046390) PASS. The first attempts detected an SDK output-version parsing mismatch; the final test pins official build-tools 35.0.0 (or an explicitly selected local tool) and exercises real archived APKs, not just mock metadata. [Latest branch CI runs](https://github.com/PlayerEden/Ricochet-Rumble/actions/workflows/android-update-preflight-v0952.yml) include follow-up hardening of explicit fresh-install behavior.

## What the new tool does

`tools/android-update-preflight.mjs` checks a **candidate APK** against either an existing device installation or another APK. It uses Android SDK's `aapt` to inspect package and version, `apksigner verify` to verify the actual cryptographic signature and extract a public signer digest, and `adb shell pm path` + **read-only** `adb pull` to inspect a connected Android device's currently installed base APK. It returns a machine-readable PASS/NO-GO verdict.

- **Fail closed:** wrong app/package, wrong signing certificate, equal/lower versionCode, inaccessible installed APK/device, invalid APK/signature, missing SDK tools, unsupported output, or unknown signer.
- **Explicit first-install mode** requires `--fresh-install` and only approves if no instance of this package is installed on the connected device. Refuses this flag if the app is already installed, even when signers match.
- **Strict identical certificate only.** Android can also support signed proof-of-rotation lineage, but this tool deliberately does not automatically approve such a path without a separate key-lineage review.
- **Safety boundary:** The tool never runs `adb install`, `adb uninstall`, app data clearing, APK signing, or private-keystore operations. A passing result is a preliminary compatibility check, **NOT** proof of data retention or actual in-place success.

## When the owner has a PC and Android device available

Install Node.js and Android SDK Platform Tools / Build Tools, connect the phone with USB debugging enabled, and from this repository's checked-out working branch run:

```bash
node tools/android-update-preflight.mjs --candidate "/path/to/new-test.apk"
```

If more than one device is connected, add `--serial DEVICE_ID`. For an offline comparison between two archived APKs, without a phone:

```bash
node tools/android-update-preflight.mjs --previous "/path/to/old.apk" --candidate "/path/to/new.apk"
```

`--fresh-install` is for intentionally verifying a phone with **no installed Sector Rebound package**, not for bypassing a signing mismatch. **Do not use uninstall or clear-storage to resolve a failed preflight unless the user has already exported and safely verified all progress, deliberately accepts the loss risk, and explicitly chooses a clean install.**

## Why the release P0 is NOT closed

1. **Choose an owner-held permanent private TEST signing key** separate from Google Play upload/app-signing custody. Existing owner-only [pinned manual APK workflow](https://github.com/PlayerEden/Ricochet-Rumble/blob/main/.github/workflows/owner-pinned-test-apk.yml) already defines external secret variables and certificate pinning on the relevant development branch. Do not publish passwords, base64 keystores or keys in chat or GitHub history. [Release custody and package-ID issue #20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20) remains open.
2. **Create two successive APKs from the SAME private test certificate** with strictly ascending version codes. Validate each candidate against the installed preceding version; don't claim an existing ephemeral debug build can be silently updated.
3. On a real Android phone, **export and verify a manual Dossier/settings backup**, check app state, install version N, then **update in place** to N+1 with no uninstall. Verify that the same local stats, settings and profile survive. Repeat one additional update if desired. Record phone Android version, certificate fingerprint, exact APK SHA and screenshots. [Save/update continuity issue #29](https://github.com/PlayerEden/Ricochet-Rumble/issues/29) is not finished by unit tests alone.
4. Decide final package identity and production Play App Signing key ownership separately. Signing the Play upload bundle with a particular *upload key* does not establish that separately distributed debug APKs share the Play *app signing* certificate.
5. Prior experimental owners may need a **deliberate user-directed export/restore** on first move to permanent signing because old CI certificates are different; protect data before any clean install.

**Decision:** automated verifier implementation is useful and code-verified; owner data-safe physical upgrade and long-lived signer custody remain P0 BLOCKED. No gameplay changes, APK release or automatic merge authorized by this audit.

## Official Android references

- https://developer.android.com/google/play/app-updates
- https://developer.android.com/tools/apksigner
- https://developer.android.com/studio/publish/app-signing

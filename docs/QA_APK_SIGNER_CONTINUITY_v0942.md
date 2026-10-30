# v0.9.42 — Actual archived Android APK signing certificates and upgrade preflight

**Verified on original GitHub-release APK bytes**, not a locally rebuilt project, Gradle declarations or user device. [Exact successful GitHub Actions verification 40994470523](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40994470523) downloaded original immutable v0.9.32, v0.9.37, v0.9.39 and v0.9.40 test APKs. Android's official `apksigner verify --min-sdk-version 26 --verbose --print-certs` confirmed valid signed APKs; `aapt dump badging` obtained real embedded application ID and version, and each archived APK SHA-256 was matched to its release's original checksum manifest. Raw public certificate metadata and the JSON compatibility matrix are in the workflow artifact `original-apk-certificate-compatibility-v0942`.

## Definitive result: normal in-place update is BLOCKED

| Release | Embedded `versionCode` | Embedded `versionName` | Android app ID | Public signer SHA-256 (first 16 chars) | Matches v0.9.40 certificate? |
| --- | ---: | --- | --- | --- | --- |
| v0.9.32 vehicle controls | 38 | `0.9.21-game-feel` | `com.playereden.ricochetrumble` | `34dbf47847d99656` | **NO** |
| v0.9.37 scored Quick Play | 38 | `0.9.21-game-feel` | same | `ee967dc767265665` | **NO** |
| v0.9.39 player dossier | 38 | `0.9.21-game-feel` | same | `bae5e3486d6233cb` | **NO** |
| v0.9.40 upgrade readiness | 40 | `0.9.40-upgrade-test` | same | `21d5eb0a415b46c1` | Reference |

All four original releases verified as signed, have the same app ID, and passed their original asset checksum comparison. However, **all four have distinct signing certificates.** v0.9.40 has a higher `versionCode`, but **cannot replace the listed older released APKs through a normal non-destructive Android package update** because the signing certificate differs. There is no evidence of configured supported signing lineage/rotation for these archived debug APKs. This concerns these exact four releases, not a hypothetical APK currently on the user's phone; only the phone/user can confirm that installed file.

## P0: preserve old local data BEFORE any replacement

**Do not uninstall** an existing installation if it contains settings, Custom presets or Dossier history the user wants. `v0.9.40` introduces a manually copied backup UI, but **v0.9.39 and earlier do not possess this feature**; installing the new APK does not magically export an older app's data. Without old signing credentials or a successful verified debugging-data extraction and restore, the correct answer is **preservation unknown**, not "just uninstall/reinstall". The prior app is debuggable; advanced Android Debug Bridge `run-as` recovery might be possible under developer control, but is **not tested** and should not be recommended as a guaranteed migration or run without independent rollback and actual device evidence.

Do not replace, decrypt, publish or rotate the historical encrypted signing material under public `signing/` without an owner-approved credential-custody review. Encrypted file presence alone does not prove that the private key was exposed.

## P0: consistent future Android test signing strategy

1. Owner securely creates or verifies custody of a **durable TEST signing keystore** (distinct from production Play upload key). Store its encrypted/private bytes **only in owner-managed private secrets/offline backup**, never commit it, paste it in chat or expose it in logs. Preserve recovery information outside a public GitHub repository.
2. The test/release pipeline must **require complete configured test signing credentials** and **fail closed if absent**; never silently fall back to an ephemeral CI debug key for a user-facing upgrade candidate.
3. Pin the **public signing certificate digest** (not the private key), assert on each newly built test APK that signer, application ID and monotonic versionCode match the intended track, then run real phone **install-over-existing** with preserved local data. A consistent future signing certificate does NOT automatically convert older differently signed test builds.
4. The production **Play upload key/Play App Signing** is separately configured and approved by the app owner; it is not the debug test key. No signed production artifact exists yet, and no Google Play claim is warranted.

## What remains to verify

- [x] Run deterministic release-asset integrity, signature, app ID and version extractor against actual archived APKs, preserve machine-readable results — [40994470523 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40994470523).
- [x] Establish whether the archived v0.9.32/v0.9.37/v0.9.39/v0.9.40 test APKs are mutually in-place-upgrade-compatible — **they are not**.
- [ ] Confirm installed device's *actual* signing certificate and whether valuable old local data exists, **without uninstall**.
- [ ] Establish private test signing keystore custody and a signed/pinned future test release pipeline, with explicit owner consent.
- [ ] Confirm a real Android device can update between two new **same-certificate** signed test builds with preserved local stores; record observed history before/after.
- [ ] If older data must be preserved, test a strictly read-only debug extraction/restore procedure with independent backup verification, otherwise do not risk existing app data.
- [ ] Finish physical feel, two-phone LAN if shipping, production signing/Play Console and privacy acceptance.

**No game asset, Android package or gameplay source changed in this audit. No new APK required.** The earlier v0.9.40 release remains archived for clean-install testing, not a safe update over older releases.

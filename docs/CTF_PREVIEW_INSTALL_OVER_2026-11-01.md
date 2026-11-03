# Sector Rebound — CTF APK install-over signing continuity (2026-11-01)

**RESULT: verified, install-over compatible by Android package, signing certificate and version code. Actual owner's phone installation still to be confirmed.**

## Corrected provenance: installed and new previews use the SAME PUBLIC AOSP test signer

The prior reply erroneously claimed that the CTF APK used a different signature than the existing Preview 100061. That was not true.

| Checked field | Previously delivered Preview 100061 | New CTF Overall Test 200003 |
| --- | --- | --- |
| CI build run | [41279138843](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41279138843) | [41342410789](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41342410789) |
| Public signer SHA-256 | `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc` | **identical** |
| Application ID | `com.playereden.ricochetrumble.preview` | **identical** |
| Android versionCode | `100061` | `200003`, greater |
| Source | integration preview SHA `3ecc7d3cd0080c1ab94e8fbb890ae628e9ef8c60` | isolated CTF test branch SHA `7b1120879de1e3c839cb35f10f0ae8991c62a89f` |

Both CI runs printed exactly the same `VERIFIED_PREVIEW_APK ... cert=...`. The owner's existing preview series **100036–100061** uses this repeatable AOSP development signing key; the separate *owner-private test signing* workflow was proposed but **has not been substituted for the installed preview signer**. Switching to it for the same package would break the immediate installation-upgrade promise. The public AOSP test key is suitable **only for experimental previews**, not secure distribution or Google Play.

The fresh build's verification metadata states:

```text
SOURCE_SHA=7b1120879de1e3c839cb35f10f0ae8991c62a89f
APP_ID=com.playereden.ricochetrumble.preview
VERSION_CODE=200003
PUBLIC_TEST_SIGNER_SHA256=a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc
APK_SHA256=621456da482875296eaea579cde073826fc0eb31bae4522597737a9b4990cdc7
```

[Exact GitHub Actions artifact 13098131759](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41342410789/artifacts/13098131759) — ZIP contains `sector-rebound-ctf-overall-test-200003.apk` and `verification.txt`. We checked the extracted APK against this SHA-256.

## Permanent safety guard for this test branch

`.github/workflows/ctf-overall-android-apk.yml` now fails the build if:
- APK signer differs from installed Preview 100061's **exact certificate fingerprint**, even if it is otherwise a valid Android signing cert.
- APK package ID is not `com.playereden.ricochetrumble.preview`.
- Version code is not above the previously shipped CTF test 200002, or does not match the newly allocated code.
- The APK's packaged HTML/game/CTF assets differ from source files.
- The known-good fixed AOSP test key's public source hashes are not satisfied.

**Future build rule:** use the same preview signer and an Android versionCode HIGHER than whatever the user has already installed; do not mix in ordinary debug APKs signed with ephemeral CI keys, the owner-private key, or production signing credentials under this same preview app ID. This branch's workflow allocates increasing version codes as `200000 + its workflow run_number`. An unrelated older integration workflow may still produce lower version codes; do not distribute those as upgrades to a device already on 200003.

## Install guidance

Install APK 200003 directly over Preview 100061; **do not uninstall Preview**. Expected: original WebView app data and Dossier persist. This is proven package/certificate/version compatibility, not a claim that a hands-on device upgrade has already completed.

If Android says "app not installed" despite the checks, capture the exact Android message and your currently installed preview code; treat it as a separate device issue rather than asking the user to delete their data.

Stable `main` and draft integration PR #85 remained unchanged. The build is experimental and not approved for production Play publication.

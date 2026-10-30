# v0.9.43 final AUTOMATED QA — PASS; owner-signed APK and real update remain BLOCKED

- [Fast 40995367492 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40995367492) with test signer static/secret-scope contracts, versionCode/package checks, offline game/scored/custom/dossier/backup tests.
- [Full 40995367559 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40995367559) with 740×360, 915×412, 1280×720 Chromium UI/gameplay, Android debug APK + unsigned AAB compiled on exact source SHA `37efc45b2aabb8dbd4bfeefc5ff7783056409c28`. **Neither build was signed with an owner-private test key.** This verifies Gradle defaults and source integrity, NOT the unconfigured private signer branch. No permanent release was made.
- A new manual-only GitHub Actions workflow initially had a validation error due to `runner.temp` being used in a job-level environment expression; moved it to supported *step-level* environments. Final workflow parsed and fast/full source CI succeeded. Owner-only `workflow_dispatch` must be available on an approved default branch before actual test-key execution.
- **P0 BLOCKED:** no owner-provided test signing keystore, private secrets or public `SR_TEST_CERT_SHA256` pin. No runtime signed artifact or real same-cert update tested. Still no safe direct upgrade between older 0.9.32/37/39/40 releases: their certs differ [40994470523](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40994470523).
- Maintain current known original [v0.9.40 release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.40-upgrade-readiness-test) only for fresh installs or scenarios with explicitly preserved data; never claim non-destructive upgrade.

---

# v0.9.43 — Stable private test APK signing preparation

**Status: SOURCE/BUILD PREPARATION, NOT AN ALREADY-SIGNED RELEASE.** Child of [v0.9.42 actual APK certificate investigation](QA_APK_SIGNER_CONTINUITY_v0942.md), which established four archived debug APK releases each had a different signing certificate. **No private test keystore or password has been supplied or accessed.** No APK from this branch may be described as update-safe until its signature and a real phone upgrade are verified.

## Engineering changes

- `android/app/build.gradle` now supports a **separate owner-managed internal TEST signer** when **all four** `SR_TEST_STORE_FILE`, `SR_TEST_STORE_PASSWORD`, `SR_TEST_KEY_ALIAS`, `SR_TEST_KEY_PASSWORD` are set and the test keystore exists. Partial/missing-file configuration deliberately aborts the build, rather than accidentally falling back to another certificate.
- The production/Play upload signer still has **separate** `SR_UPLOAD_*` variables and config. Test and production signing keys should never be the same. The app ID remains `com.playereden.ricochetrumble`.
- Candidate internal metadata uses `versionCode 43` and `versionName 0.9.43-test-signer-preparation`. The code increase is **not** evidence of certificate continuity with v0.9.40 or previous builds.
- New GitHub Actions `.github/workflows/owner-pinned-test-apk.yml` is a **manual-only** workflow. It explicitly refuses missing secret material and missing public `SR_TEST_CERT_SHA256` pin, runs game/save tests, builds with private test signer, validates actual APK with official `apksigner verify --print-certs` and `aapt dump badging`, then uploads an artifact **only if public certificate SHA-256, application ID and versionCode match**. No automatic release, Play upload or signing-key disclosure. Temporary keystore is deleted after the job.
- Sensitive environment variables are limited to keystore preparation and Gradle signing steps. Repo source, CI logs and artifact provenance contain **no private keys or passwords**.
- Without owner-provisioned secrets, other ordinary development debug APKs **may still use GitHub's ephemeral default Android debug key** and should not be distributed as update-compatible. The intentionally owner-only workflow fails closed when private credentials or pin are absent.

## Safe owner setup (when approved)

1. **Choose and back up** a durable, **internal TEST-only** signing keystore. Do not reuse the Play upload or historical production signing key. The owner must control the passphrases and an offline recovery backup. Do **not** send signing files or passwords to ChatGPT, public GitHub, issues, PRs, or log output.
2. In GitHub **Settings → Secrets and variables → Actions**, configure repository/environment **secrets** (not ordinary variables) `SR_TEST_KEYSTORE_B64` (base64 encoding of the *binary test keystore*, which is still a SECRET), `SR_TEST_STORE_PASSWORD`, `SR_TEST_KEY_ALIAS`, and `SR_TEST_KEY_PASSWORD`. The owner must independently verify private key custody before granting build access. Restrict workflow run permissions to trusted maintainers; use protected environments if available.
3. Configure public repository **variable** `SR_TEST_CERT_SHA256` to the **SHA-256 digest of the public signing certificate** associated with that test keystore, exactly 64 hexadecimal characters, **not the keystore hash**. This digest is not secret. Verify it using `keytool -list -v -keystore <local-test-keystore> -alias <test-alias>` *on the owner's machine*, without sharing passwords.
4. The manual `Sector Rebound - OWNER-KEYED stable test APK build` workflow must be available on the **approved default branch** and triggered by an authorized maintainer; GitHub's `workflow_dispatch` event generally requires the workflow definition on the default branch. **Do not merge this draft solely to unlock the workflow** without explicit approval. Its output is an artifact for owner testing, not a published marketplace release.
5. Before making **two** successive owner-signed test releases, increment versionCode for the second, verify both APK public certificates match, and test an **actual in-place install** on a physical Android phone **with app data checked before and after**. Do not uninstall to perform this test. If the update fails, preserve the old installation and diagnose before changing signing identity.
6. Keep production upload signing and Play App Signing separate; a real signed release AAB, Play Console policy/privacy and app-store listing remain independent P0 release blockers.

**Crucial historical limit:** This creates continuity only **among future builds signed with this chosen same test key**. It does **not** make older v0.9.32/v0.9.37/v0.9.39/v0.9.40 APKs compatible. The phone's *installed* package certificate still needs a real, nondestructive check. Older builds without manual Backup UI cannot retroactively export via v0.9.40's new menu.

## QA / acceptance

- [ ] Fast CI source/static security tests, all offline regressions and Android mirrored assets on exact code SHA
- [ ] Full Chromium 740×360/915×412/1280×720, debug APK and **unsigned** AAB on same tested SHA
- [ ] Validate missing-all config defaults to ordinary unsigned Play bundle and no secrets; partial test config fail-closed
- [ ] **BLOCKED owner provision:** private test keystore connected to actions secrets, public fingerprint pinned
- [ ] **BLOCKED:** execute the manual signer workflow, capture certificate-verified APK SHA and public digest
- [ ] **BLOCKED physical:** two successive same-certificate test APKs verified to install in place preserving local user data
- [ ] **BLOCKED production:** owner-approved key custody, release Play bundle signing, privacy, store review and two-phone LAN if launch scope includes it

No new upgrade-safe APK should be published without those blocked steps.

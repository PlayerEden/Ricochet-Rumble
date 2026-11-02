# Sector Rebound v0.9.63 — AI Shot-Parity Android Owner Preview

- **Status:** verified experimental, not a Play release; physical human-device feel not yet confirmed.
- **Date:** 2026-11-01 local / 2026-11-02 UTC.
- **Build workflow:** [successful GitHub Actions 41384958978](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41384958978); source commit `df5c01d19872af5c9ee1e8d5aeeabe20f140f2a3`.
- **Artifact:** [sector-rebound-ai-shot-1](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41384958978/artifacts/13115031703), contains `sector-rebound-ai-shot-250001.apk` and `verification.txt`.
- **Android package:** `com.playereden.ricochetrumble.preview`
- **Version name/code:** `0.9.63-ai-shot.1` / `250001`.
- **Test signer SHA-256:** `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`, identical to the owner preview v0.9.62. This is a public/disposable AOSP test certificate, **not Play-production signing**.
- **APK SHA-256:** `6c90f6b7efa8947e31b95645030e5510850c3f388950f74c653f89d04484aa1c`.
- **Upgrade:** v0.9.62 code `240001` → v0.9.63 code `250001`; do not uninstall the old preview.
- **QA:** APK build passed strict signing/version/asset parity checks and 18-case bot shot parity plus 48-case pilot/mobile controls. [Complete experimental browser regression passed](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41384505125) including CTF objective AI, Forward Bays, vehicle-route fairness, Quick Play, and visual QA.
- **Owner acceptance:** compare Solo pilot CQC, tank FFA, mech and CTF on Casual/Normal/Spicy. Look for measurable differences in first-shot reaction and recovery; note bots still navigate using exact world positions (not human-like fog of war). Confirm no off-screen bot snipes against vehicle or pilot. Test no regressions in one-release-one-shot. LAN 2-phone not tested.
- **Rollback:** previous owner preview v0.9.62 code 240001 available on older GitHub build branch `test/universal-release-android-2026-11-01`; experimental source rollback `experiment/universal-release-ricochet-v2`. Android won't permit in-place version-code downgrades, so revert source and **build a new, higher versionCode** with the same signing key for safe rollback.
- **Protected:** stable `main` untouched. No automatic integration merge or Play publication.

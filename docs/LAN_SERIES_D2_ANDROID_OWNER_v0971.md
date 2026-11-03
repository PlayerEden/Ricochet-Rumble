# Sector Rebound v0.9.71 — Experimental LAN Series Owner Preview

Source branch: `experiment/lan-series-d2`, based on D2 game+HTML+series assets tested in [D2 full QA #41565384859](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41565384859).

This **development-only** Android preview contains D1 LAN scored squads and D2 optional best-of-three. It uses app ID `com.playereden.ricochetrumble.preview`, the public AOSP test signing certificate SHA256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc` (same as v0.9.70), and an incremented versionCode `330000 + GITHUB_RUN_NUMBER` (strictly above verified v0.9.70 code 320001). This workflow must verify real signed APK package metadata, signing certificate, all embedded files, SHA-256 and source hash before the ZIP is offered for manual tests.

Workflow: `.github/workflows/lan-series-owner-apk.yml`. Do not substitute a new signing identity; **never uninstall** the known-good preview just to make a downgrade install. Preserve local storage and backup it first. Test install-over, saved data retention, controls, release-fire, connection/host/join, real human input, bot 1v1/2v2/3v3, FF ON/OFF, faction swap, three-round score flow, timer/draw, disconnect, orientation and correct updates.

No Google Play upload, LAN physical acceptance, or production signing is claimed. Maintain stable `main` and C1/D1 rollback checkpoints.

# Sector Rebound v0.9.64 — Combat Readability Owner Test APK

**Status:** Verified experimental owner Android preview (NOT Play production). Physical owner test and two-phone LAN acceptance still pending.

## APK provenance
- [Android CI build **41386494069**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41386494069), **success**.
- [GitHub artifact **13115432842**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41386494069/artifacts/13115432842), `sector-rebound-combat-cues-1`; contains `sector-rebound-combat-cues-260001.apk` and `verification.txt`.
- Build source commit: `e92580ac0713465c2096054a93175d9bb01f7d54` (on `test/combat-cues-android-2026-11-01`).
- Application ID: `com.playereden.ricochetrumble.preview`.
- Version: `0.9.64-combat-cues.1`, Android versionCode `260001`.
- Signing certificate SHA256: `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`, **same verified installed owner preview test signer**, public/disposable AOSP key—not a private production key.
- APK SHA256: `3376d85153ebcf075731157341c9b2d4405b1d6c93116f5884ea82c081cd0aa8`.
- Previous owner preview versionCode `250001` (v0.9.63); upgrade installs **without uninstalling** and preserves local Android app data. The APK verification workflow rejects mismatched certificates and codes not above `250001`.

## Contents and boundaries

- Small amber acquisition ticks near the AI weapon muzzle on an actual visible LOS threat; truthful brief firing marker when the shot really targeted the local human.
- No cues behind walls, off-screen, for unrelated targets, or on LAN guests where bot state isn't authoritative.
- Gameplay mechanics are unchanged from v0.9.63: same AI acquisition/recover timings, tank ricochets, sidearm no-bounce, universal human release-to-fire, CTF, Forward Bays and route-fair vehicles.

## QA gates
- [Core/full regression PASS #41385812973](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41385812973), gameplay source unchanged after that check. Includes 27 true-LOS/camera/target-cue fixtures (3 weapons × 3 difficulty levels × 3 screen sizes), 18-case AI cadence, 48 real-pointer universal release cases, CTF natural match and contested human theft, team spawns/vehicles, Quick Play, backups and visual QA.
- A screenshot evidence-only test change subsequently made tank screenshot fixtures use a legitimate open corridor instead of overlapping intentionally-staged actor coordinates. The APK CI itself passed this revised 27-case test, and the full workflow [#41386393766](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41386393766) confirms the later run's full regression when complete.
- No physical device, accessibility touch comfort or actual two-phone LAN acceptance is claimed.

## Owner test checklist

1. Upgrade over installed v0.9.63 without clearing app data.
2. Play Casual, Normal, and Spicy tank battles. Watch for brief amber muzzle ticks and distinguish preparation from the actual shot.
3. Duck behind a corner or move enemy offscreen: no cue should follow or reveal its position through the wall.
4. In CQC, check pilot cue readability and whether fire/movement fingers obscure it.
5. In CTF, make sure defensive bots and escorts still visibly function and the cues don't crowd the objective icons.
6. Compare the original release-to-fire + dotted one-bounce trajectory to prior owner build: it should be untouched.
7. Test legibility in the actual phone landscape dimensions.

Rollback code to prior known passing `experiment/ai-commit-shot-parity-v1`, [CI 41384505125](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41384505125). Android cannot in-place downgrade 260001; for a safe rollback compile prior source with an even **higher** versionCode and the **same** signer. Stable `main` and release tracks remain untouched.

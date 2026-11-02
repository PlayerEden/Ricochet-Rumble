# Sector Rebound v0.9.66 — experimental CTF lane-clearance owner APK

**Prepared:** 2026-11-02. **Do not merge/release to Google Play.**
**Game change:** solo CTF Cyan AI escort yields to the human by standard side-stepping or, in a blocked one-cell corridor, standard forward steering. Collision, damage, ammo, score, procedural generator, other modes and LAN code remain unchanged.
**Feature PR:** [draft #88](https://github.com/PlayerEden/Ricochet-Rumble/pull/88). **Stable main:** untouched.

## Immutable test package verification

- [Successful exact-source owner-build workflow 41511097912](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41511097912) built test workflow/source commit `cc6223e9a70c081630ea27ecc557056c5aa3d4d1` (actual game feature in `4688e20750c30465b5740834bab1ee29b1825bb2`).
- [Download GitHub Actions artifact 13173780392](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41511097912/artifacts/13173780392), name `sector-rebound-ctf-escort-1`. ZIP contains `sector-rebound-ctf-escort-280001.apk` and a machine-generated `verification.txt` with the original APK SHA-256.
- Android package `com.playereden.ricochetrumble.preview`; versionName `0.9.66-ctf.1`; verified versionCode **280001**. Previous owner v0.9.65 Phase 2.2 preview is code **270002**.
- Verified **PUBLIC AOSP developer/test signing certificate** SHA-256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`, the same test identity as previous matching `.preview` APKs. Never use for official Play release or sensitive production signing.
- CI checked actual APK with `apksigner`/`aapt`, compared embedded Android assets to the browser files, ran source/saves and live Chromium pilot/AI/touch/combat HUD/CTF/first-match tests, and successfully compiled the Android package. This is **build acceptance**, not actual hardware or user-data migration acceptance.
- The independent CTF full browser+visual regression [41511097801](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41511097801) is a separate exact-source gate; record its terminal status before treating this candidate as fully QA-green.

## Independent whole-game CTF regression — VERIFIED PASS

[Full 12-profile CTF + existing mixed-mode/Forward Bay/visual workflow 41511097801](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41511097801) completed **SUCCESS** at exact source commit `cc6223e9a70c081630ea27ecc557056c5aa3d4d1`, the same source as the owner APK. It passed actual CTF capture/rematch and objective bots, natural-maze diagnostic, 300 Forward Bay seeded cases, Quick Play, saved progression/backup, first-match and **44 browser visual snapshots**.

All four seed maps and all three scripted controller profiles reached and picked up the enemy flag in this run. Aggregated 12-scenario totals: unarmed 6 captures, 13 deaths; precise 12 captures, 2 deaths; reaction-limited 12 captures, 2 deaths. These figures are scripted input-model outcomes and should **not** be presented as human win rate, AI fairness certification or stable gameplay balance. Real hardware, input comfort, menu/UI perception and actual save migration are still pending.

**Final automated decision:** targeted CTF, broader game/browser QA, Android compilation, signer/metadata verification and embedded-asset parity PASS. **Release decision:** experimental owner phone test only; stable `main` unmerged, Google Play public release NO-GO.

## Phone acceptance (not yet executed)

1. Note current installed preview package and version; back up your offline Dossier and preferences before updating. Do **not uninstall** to install this test APK. Update only when package name, signing certificate and version order match the existing app.
2. After update, check Dossier matches/wins/KOs, Hangar paint/insignia, settings, Custom presets and Quick Play playlist remain intact. No loss or reset should be assumed away.
3. In CTF, move toward the opposing flag while a Cyan escort is ahead. Observe the escort physically move to a side pocket or lead forward through a narrow lane, rather than stay glued in front of the tank/pilot. Test respawn, drop/return, actual captures, rematch and objective HUD.
4. Quick Play / scored FFA / TDM / CQC control feel, releasing FIRE, one-bounce aim guide, ammo state and bot warning should remain unchanged. Verify landscape and left-handed settings.
5. Record any frame stutter, stuck AI, jittery escort oscillation, impossible wall obstruction, unintended changes in teammate protection or too-easy CTF, with screenshot and short reproduction.
6. Two-phone Wi-Fi LAN remains an entirely separate hardware QA gate; this experiment does not establish remote or LAN CTF.

**Rollback:** source changes can be reverted to experimental parent. Android cannot normally install a lower version code over a higher one, and uninstalling may delete local data. Preserve backup and don't promise binary downgrade without a separately versioned compatible rollback build.

## Status

Automated APK build **PASS**. Actual phone install-over/save persistence, subjective CTF and cross-device play **PENDING**. No private production signing or release approval. GitHub Actions artifact retention is temporary; preserve commit/QA proof and do not imply a permanent release download.

# Sector Rebound — Phase 2 Combined Owner Android Preview

**Date:** 2026-11-02.  
**Source from fully passing game CI:** `f09ab9fcab46a819a69e6b0edf14be8827fe621c`, [run 41478683188](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41478683188).  
**Source branch with documented acceptance:** `experiment/match-flow-truth-v1` at `93081aa37becbf8a3c51322fc0c39dafc761d584`.  
**Owner APK preparation branch:** `test/phase2-combined-owner-2026-11-02`.  
**APK workflow:** `.github/workflows/phase2-combined-owner-apk.yml`. First run 41479770356 stopped at a misplaced Chromium-dependent test in the pre-install gate; fixed the workflow only, then **fully passed** [build run 41480036489](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41480036489), tested source+workflow commit `801e614df71a090fa3f81fb05fa1b4568cbd8cdc`. Artifact: [sector-rebound-phase2-2](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41480036489/artifacts/13160355059), artifact ID `13160355059` (APK plus verification manifest), 164440-byte GitHub archive, unexpired.  
**Stable main:** unchanged. No source merge or Play Store production signing.

## Combined changes since installed v0.9.64 preview

1. `experiment/combat-hud-shot-state-v1`: truthful live shell capacity, weapon cooldown and in-flight status.
2. `experiment/combat-feedback-parity-v1`: LAN guest ricochet audio and local armor-hit feedback agree with host.
3. `experiment/solo-bot-last-seen-pursuit-v1`: Solo bot navigation pursues the last observed human location, not hidden real-time movement through walls.
4. `experiment/landscape-combat-hud-safe-zones-v1`: six-phone-landscape 84-fixture HUD layout, compact CTF countdown/objectives, power/alert stacking, readable ammo status.
5. `experiment/match-flow-truth-v1`: accurate fire-scheme coach, safe-spawn waiting status and legacy first-Quick-Play milestone compatibility.
6. Existing v0.9.64 bot aim telegraph, universal release-to-fire, pilot/mech/tank physics, CTF/Forward Bays, cosmetics and saved profile remain intact.

## Android install-over safety contract

- **Package identity:** `com.playereden.ricochetrumble.preview`, same as the previous owner-tested Android preview.
- **Signer:** fixed *public AOSP development* key, verified certificate SHA-256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`; **not** a production Google Play certificate.
- **Version:** verified `0.9.65-phase2.2`, **versionCode 270002** (> previous installed **260001**); actual Android metadata and embedded assets checked in successful build. The artifact's `verification.txt` includes actual APK SHA-256 and exact checked source SHA.
- **Provenance:** check exact `SOURCE_SHA`, `APP_ID`, `VERSION_CODE`, `APK_SHA256`, `PUBLIC_TEST_SIGNER_SHA256`, embedded game assets and `apksigner` before treating the downloadable artifact as valid.
- **Data retention:** install over the existing preview app. **Do not uninstall**; uninstalling generally discards local saves/settings. The preview and eventual production app are separate signing/package identities.

## Owner physical acceptance plan

1. Update in place and confirm that existing controls, saved settings, Hangar/Dossier and mode selections are retained.
2. Solo Quick Play: the first-use hint must say drag / aim / **release**, then return to Home and verify the playlist is not repeatedly forced into Solo Survival.
3. CQC: pilot-to-pilot duels, sidearm collisions and aim/cancel; no remote pilot ricochet added.
4. Scored FFA/TDM: tank and mech dotted bounce preview, true `READY` / `CYCLING` / `IN FLIGHT`, normal precision and fair respawns. If a spawn is temporarily unsafe, HUD should say `WAITING FOR SAFE SPAWN` instead of remaining at `0.0s`.
5. Bots: acquire ticks on visible aiming enemy, clear after losing cover; enemies should search last-seen location rather than pivot toward the human's hidden current coordinates.
6. CTF: scoreboard and objective countdown share clear zones; try grabbing/returning flag, power-up, pause, death, rematch and results without overlapping controls.
7. Check both default and left-handed controls, menu/pause audio settings, landscape rotation and no unexpected duplicate bullets.
8. LAN guest/host combat feedback needs **two real phones**. One-phone QA cannot validate real Wi-Fi joining or guest audio/armor in a physical match.

## Known caveats

- Automated Chromium test evidence cannot guarantee subjective mobile combat feel or actual Android GPU/audio/network behavior. Mark release readiness pending owner testing.
- This is an **experimental owner APK**, not a Play Store or production-signed release.
- If a later build fails verification, do not advertise it. Preserve previous verified v0.9.64 artifact [run 41386494069](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41386494069) as the immediately available device rollback.

# Sector Rebound v0.9.68 — A3 trace-aim Android owner preview
Date: 2026-11-02. Status: experimental hardware handoff; not a Play release or stable main merge.

## Exact verified APK and rollback
- Android signed APK [GitHub Actions run #41521976445 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41521976445).
- [GitHub Actions owner download artifact #13177907598](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41521976445/artifacts/13177907598). ZIP contains `sector-rebound-bot-trace-300001.apk` and `verification.txt`.
- Source commit `f7a4f0859c9daec3d38548f8fef608eb38bc1a29`.
- Package `com.playereden.ricochetrumble.preview`, versionName `0.9.68-trace.1`, versionCode **300001**. Older compatible owner v0.9.67 preview was versionCode **290001**; v0.9.66 was 280001.
- Signed with the **same PUBLIC AOSP developer/test** certificate SHA256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`. It is NOT a private app store signing credential. CI validated apksigner, aapt, Android SDK API36 and literal embedded assets against source.
- APK SHA256: `b11d7caaa2ebf2add79a2ed08ffd8d17f5426022a074ac810e449118732d9bc8` (verified after extracting GitHub artifact).
- **Do not uninstall** the existing compatible `.preview` version: a normal install-over should retain local files, Dossier, Custom presets and Hangar. Android save retention must still be tested on the actual phone; don't claim it was demonstrated by CI. If app ID or signing cert differs from the installed package, stop instead of deleting user data.
- To rollback an experimental version, use a newer versionCode signed by the same certificate and containing the previous gameplay code. Installing a lower versionCode over a higher one is not normally safe; uninstalling may delete saves.

## What is new
- AI uses the common actual projectile trajectory physics for direct and plausible single-wall ricochet shot selection.
- A bot tests no more than **seven** paths per acquisition. It must physically turn and finish its normal reaction period before firing. The gun's heading is locked for the firing cycle; it does not continuously retarget as the opponent dodges.
- Last seen target locations can support speculative bank shots for up to .85 sec; current exact hidden positions don't enter the planner. Existing offscreen human no-fire protection remains.
- A1 shared pilot human/AI 6.5 rad/s turn limit, A2 exact bullet/preview physics and v0.9.67 teammate pass-through remain included.
- No friendly-fire ON/OFF toggle, visible allied tracers, random FFA palette, rotating solo sides or LAN squad TDM yet. These are planned next.

## Automated evidence
- [A3 focused real Chromium tests](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41521849113) PASS: 18 shot fixtures pilot/tank/mech × 3 difficulties × 2 viewports; target movement after commit, reaction spacing, shot recovery, offscreen suppression, ejection retarget and real seeded blocked-LOS bank-shot case (maze cell 0 to 10, six candidates).
- [A2 exact projectile physics contract](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41521849118) PASS.
- [Full CTF + 300 Forward Bay + 44 browser visual scenarios](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41521454260) PASS for identical game.js blob and same A3 shooting behavior. Additional [exact APK-source full regression](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41521976163) triggered after tests/workflows; verify its terminal outcome separately.
- Android build includes smoke, A2 physics, actual Chromium aiming/shot/cues, CTF input-driven matches, signing/package/asset checks. None certify phone UI feel, real LAN, or a good human win rate.

## Actual phone test
1. Note your saved Hangar/Dossier/Custom presets/settings, then **install directly over** compatible existing preview. If Android refuses, do not blindly uninstall.
2. Pilot duel (CQC): face bots from different angles, observe whether they rotate deliberately before firing; check their first-shot cadence and your own pilot movement remains responsive.
3. Tank/mech: watch direct shots and occasional bank shots around nearby walls. They should not appear to instantly solve impossible angles, track you perfectly mid-shot or fire when they never actually saw you.
4. Cross a bot's intended lane after its gun started lining up or after its shot. A legitimate miss is desirable; projectiles must travel normally, not home in.
5. Verify existing amber warning ticks and muzzle flash, actual dotted **player** guide, ammo/cycling, sidearm wall stop and vehicle bounces.
6. Team CTF/TDM: physically pass through allies with FF OFF (default), check teammate colors, scoring, pilot flag pickup/capture, respawns and FOB/vehicle spawns. No new FF toggle in this preview.
7. Quick Play: FFA, Team Survival, CQC, scored FFA/TDM; test menu/pause/result screens and saved data. Note any new battery drain, heat or frame stutter in a crowded large maze.
8. LAN remains a separate two-phone physical acceptance; browser CI does not certify Wi-Fi host/guest connectivity.

## Release safety
A3 branch remains a draft PR. Stable `main` has not been touched. Human judgement on fairness and device performance is required before any promotion or final choice of Casual/Normal/Spicy AI planning cadence.

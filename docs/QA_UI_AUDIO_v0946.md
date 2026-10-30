# v0.9.46 — Tactical UI & Audio Feedback (experimental)

**Scope:** Small interface/sound feedback pass after owner locked P-03 silhouette + movement ([permanent approved design contract](https://github.com/PlayerEden/Ricochet-Rumble/blob/main/docs/APPROVED_PILOT_P03.md)). **No new gameplay feature or weapon balancing.**

## Exact verified test checkpoint — AUTOMATED PASS (2026-10-30)

The original focused development PR #67 had a main-branch **documentation conflict** and GitHub did not start its standard PR workflows. A **QA-only, unmerged integration snapshot** was created on `integration/ui-audio-v0946-qa` using the **same exact game source/Android assets/tests** as PR #67 (verified matching Git blob SHA for Web game.js, Web style.css, tests/smoke.mjs, Android Gradle and this QA doc), with the already-approved main-branch pilot design document restored. This was **NOT** merged to main and is not a separate development implementation.

- Exact **tested QA snapshot SHA:** `01ac4360653f9764c56f335eb91c7bfb1616241a`.
- [Fast UI toggle persistence, audio guards, all regression/seeded smoke QA **SUCCESS**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41007675662).
- [Full Chromium actual landscape 740x360 / 915x412 / 1280x720, pause/control snapshots, Android debug APK + unsigned AAB **SUCCESS**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41007675477).
- Actual screenshots at 740x360 and 915x412 were manually viewed: SFX/MUSIC controls are legible, fully contained in the compact pause panel, and do not occlude the arena outside the pause overlay.
- [**Original passing APK, original QA screenshots and checksum manifest permanently archived**](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.46-ui-audio-test) via [single-use publisher 41008282199 **SUCCESS**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41008282199). The APK is copied byte-for-byte from the QA artifact, **not rebuilt or re-signed**; APK SHA256 `e405e9714399495705e9dec1fbe2f12ea3f9222d91f10ab6aaf6f253b11417f2`. Single-use publisher removed.
- **Owner physical Android UI/audio acceptance still PENDING.** Automated pass does NOT certify sound subjectively pleasant, speaker volume, thermal performance, two-device LAN, or safe APK upgrades.
- **Do not merge the QA-only PR #68 or the unapproved experimental PR #67 ancestor stack** into main from this automated pass.

## Player-visible
- Short quiet **menu-select**, **menu-back**, and **deployment** tones generated offline through the **existing** Web Audio SFX system. They honor SOUND FX OFF; no third-party music samples/assets, downloaded file, autoplay or copyrighted tune.
- Main deploy and post-match NEXT MATCH use the same short confirmation; menu and After Action back navigation get subtle feedback. No extra sounds from continuously holding movement or aiming.
- **Pause overlay now has immediate SFX ON/OFF and MUSIC ON/OFF** for Solo, LAN Host and LAN Guest. Controls are real action buttons with aria-pressed indicators, saved in **existing local preferences**, and available without visiting advanced settings. The gameplay HUD stays unobstructed.
- Music preference toggles reset the existing procedural soundtrack scene so switching it back ON can restart naturally. Player gesture unlocks AudioContext; muted music is not scheduled. No new background loops.
- Small responsive styles for 740×360 and other landscape devices; same Web/Android CSS/JS; versionCode 47 and versionName `0.9.46-ui-audio-test` for an independent clean-install debug candidate.

## Source and scope protections
- [x] Fast Node smoke and 300 seeded maze/combat/scoring regressions; test both interactive toggle paths, stored values, pressed state, and mute behavior.
- [x] Real Chromium visual QA: lobby, pause, rematch + on-foot/tank at 740×360, 915×412, 1280×720, no clipping/scroll and no console exceptions.
- [x] Build debug APK + unsigned AAB from exactly tested source; attach screenshot archive / provenance and checksum.
- [ ] **User real-phone UI/audio verdict PENDING** (is menu feedback pleasant, pause controls reachable, no clipping or excessive volume).
- [ ] No stable main merge or Play production signing. Keep original v0.9.45.1 P-03 pilot motion [APK/release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.45.1-pilot-motion-test) as a tested rollback.
- [ ] Retain explicit blocked gates: true durable test signer, same-cert app upgrade with data retained, two-phone LAN, store privacy/compliance, manual precise-aim acceptance.

**Do not change locked P-03 pilot art, muzzle origin (28,2), velocities, AI, tank/mech art, camera, ballistics, score modes, procedural mazes, dossiers or local backup.** Sound/music switch semantics persist independent of gameplay. Debug APK signer continuity is not established; **never uninstall a game copy holding important local progress.**

# v0.9.46 — Tactical UI & Audio Feedback (experimental)

**Scope:** Small interface/sound feedback pass after owner locked P-03 silhouette + movement ([permanent approved design contract](https://github.com/PlayerEden/Ricochet-Rumble/blob/main/docs/APPROVED_PILOT_P03.md)). **No new gameplay feature or weapon balancing.**

## Player-visible
- Short quiet **menu-select**, **menu-back**, and **deployment** tones generated offline through the **existing** Web Audio SFX system. They honor SOUND FX OFF; no third-party music samples/assets, downloaded file, autoplay or copyrighted tune.
- Main deploy and post-match NEXT MATCH use the same short confirmation; menu and After Action back navigation get subtle feedback. No extra sounds from continuously holding movement or aiming.
- **Pause overlay now has immediate SFX ON/OFF and MUSIC ON/OFF** for Solo, LAN Host and LAN Guest. Controls are real action buttons with aria-pressed indicators, saved in **existing local preferences**, and available without visiting advanced settings. The gameplay HUD stays unobstructed.
- Music preference toggles reset the existing procedural soundtrack scene so switching it back ON can restart naturally. Player gesture unlocks AudioContext; muted music is not scheduled. No new background loops.
- Small responsive styles for 740×360 and other landscape devices; same Web/Android CSS/JS; versionCode 47 and versionName `0.9.46-ui-audio-test` for an independent clean-install debug candidate.

## Source and scope protections
- [ ] Fast Node smoke and 300 seeded maze/combat/scoring regressions; test both interactive toggle paths, stored values, pressed state, and mute behavior.
- [ ] Real Chromium visual QA: lobby, pause, rematch + on-foot/tank at 740×360, 915×412, 1280×720, no clipping/scroll and no console exceptions.
- [ ] Build debug APK + unsigned AAB from exactly tested source; attach screenshot archive / provenance and checksum.
- [ ] **User real-phone UI/audio verdict PENDING** (is menu feedback pleasant, pause controls reachable, no clipping or excessive volume).
- [ ] No stable main merge or Play production signing. Keep original v0.9.45.1 P-03 pilot motion [APK/release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.45.1-pilot-motion-test) as a tested rollback.
- [ ] Retain explicit blocked gates: true durable test signer, same-cert app upgrade with data retained, two-phone LAN, store privacy/compliance, manual precise-aim acceptance.

**Do not change locked P-03 pilot art, muzzle origin (28,2), velocities, AI, tank/mech art, camera, ballistics, score modes, procedural mazes, dossiers or local backup.** Sound/music switch semantics persist independent of gameplay. Debug APK signer continuity is not established; **never uninstall a game copy holding important local progress.**

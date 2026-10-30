# Sector Rebound v0.9.45 — P-03 Pilot Silhouette QA

**Experimental — source committed; CI and owner physical Android acceptance PENDING.** Based on owner v0.9.44 physical gameplay screenshot: team colors and identification good, but two separated boots with counter-stepping motion look like the pilot is low-crawling.

## Actual pilot art-only change
- Remove **both** independently drawn boots and their mirrored gait animation, leaving one compact rear torso block rather than lower limbs.
- Slightly shorten the angular arms; retain two symmetric blue/red/neutral armor shoulders, one overhead helmet, forward visor, and two gloved hands on the same pistol.
- Preserve bullet muzzle (28,2), exact hitbox, aim, turn, pilot speed, tank/mech art, camera/zoom, AI, mazes, scoring, FFA/CQC/TDM/Survival, LAN, menu, save/backup and cosmetic rights.
- Web/game.js and Android/game.js must remain byte-for-byte identical.
- Android test metadata 0.9.45-pilot-silhouette-test / versionCode 45; private pinned test-signing prep remains owner-controlled and inactive. Debug APK is **NOT an update-safe signed release**.

## Validation matrix
- [ ] Fast CI Node smoke, geometry and mirror regression: zero detached boots in both idle and moving frames; no mirroring leg motion; two team-colored shoulder patches, one torso, correct visor direction and same bullet muzzle; regression of scored modes/maze/AI and dossier/backup.
- [ ] Full real Chromium visual/touch QA at 740x360, 915x412, 1280x720; compare actual P-02 vs P-03 when idle, moving, aiming and firing; tank and mech identical.
- [ ] Android debug APK + unsigned AAB from the exact tested commit SHA and QA screenshot artifact; checksum if archived.
- [ ] **OWNER ARTISTIC ACCEPTANCE:** on-phone pilot viewed at game scale no longer resembles crawling/low-crouching; team identifiers remain useful. Not substituted by source checks.
- [ ] No regression to input / control sensitivity, match pace, physics or data.
- [ ] Explicit owner decision before any merge to stable main.

**Rollback:** [v0.9.44 original pilot trial](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.44-pilot-visual-test), draft [PR #63](https://github.com/PlayerEden/Ricochet-Rumble/pull/63). Rejecting P-03 means selectively restoring only the renderer on the newest reviewed code, not rolling back game features. Keep all source commits and tests. Two-phone LAN, real-save upgrade continuity and Google Play signing remain separately open.

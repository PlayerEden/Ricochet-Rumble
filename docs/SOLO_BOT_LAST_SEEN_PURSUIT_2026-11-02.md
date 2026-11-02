# Sector Rebound — Phase 2B: Solo Bot Last-Seen Pursuit (isolated A/B)

**Date:** 2026-11-02.  
**Branch:** `experiment/solo-bot-last-seen-pursuit-v1`.  
**Exact rollback:** `experiment/combat-feedback-parity-v1` at `5a062c802f18bd9f32bd7f92167b8f720995c358`.  
**Stable `main`:** untouched.  
**Installed owner Android:** v0.9.64, `versionCode 260001`, unchanged; no APK issued for this experiment.

## Fairness issue found in actual source

Bots already obey line-of-sight, target acquisition, fixed single-shot direction, physical rotation, projectile cap/cooldown and recovery. They cannot fire at an offscreen Solo human. However, their **movement objective** was chosen from the exact current player coordinates every simulation tick even while a solid maze wall fully concealed the player. This was an explicit known limitation in the prior aim/firing checkpoint. After a player broke sight and moved, bots could immediately choose a new corridor based on unseen movement.

## Deliberately small experiment

- For a bot chasing the **Solo human**, only a target within **385 world units**, unobstructed maze LOS and the same Solo camera visibility gate refreshes its navigation target.
- After losing sight, bots pursue the **last observed x/y** for up to **1.8 seconds**, never silently receiving new movement behind cover. When that time expires, bots patrol deterministic, connected-maze cell destinations for **4.5 seconds** or until reached; existing BFS navigation and actor collision remain in place.
- If the human becomes visible again, bots immediately resume real-position pursuit. Bot firing is still subject to the **existing** separate aim/acquire/commit/recovery gate; this prototype never authorizes invisible shots.
- The search target is a local AI brain variable, not sent to peers or saved. No new persistent schema.
- CTF objectives, Solo other-bot targeting, LAN host/guest, bot speeds, physical angle limits, deterministic shot error, human controls, sidearm/vehicle physics, scoring, auto-respawn and render cues remain unchanged.

## QA

- New `tests/solo-bot-last-seen-qa.mjs` uses actual Chromium renderer, real procedural maze connected/open versus physically blocked corridors, and the unmodified production bot perception function.
- **27 planned fixtures:** three phone landscape sizes × pilot/tank/mech × three procedural seeds. Validate visibility, last-seen memory not updating through walls, search after expiration independent of hidden movement, no shot through cover, regained sight, and explicit CTF/LAN bypass.
- The existing full regression is mandatory: 42 guest feedback cases, 45 shell HUD cases, 27 visual bot cues, 18 bot shot-cadence, 48 touch-input cases, CTF/Forward Bays/team vehicles/Quick Play and 44 visual scenes. [GitHub Actions run 41472631318](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41472631318) is the verification target.
- Automated fixture success alone does **not** demonstrate enjoyable difficulty. A natural-session telemetry A/B and physical owner Android game feel must be reviewed before considering this for a stable or Play Store release.

## Owner acceptance

Play Solo Survival, Close Combat, and FFA after eventual higher-versionCode Android preview packaging. Try breaking LOS, moving behind a maze wall and returning at a different angle. Bots should search intelligently rather than instantly predicting your new location, without wandering aimlessly for long periods. Check Casual/Normal/Spicy separately. Keep CTF objective bots and LAN as they were until a separate design/audit.

# APPROVED PILOT P-03 — Sector Rebound (design lock)

**Owner acceptance:** 2026-10-30, after testing the v0.9.45.1 pilot: **"I think that's good. Lock it in."** This locks the P-03 **art and movement animation**, not the whole experimental game branch or the Android release. Prior v0.9.45 P-03 basic top-down silhouette was already accepted ("I like it"); this confirms the motion addendum as well.

## Source and release — exact baseline
- **Frozen implementation:** commit `ab12c6b2e4ce2bcb3b2ebe694494d8e7dd5b45ed` on child experimental branch `polish/p03-pilot-motion-v09451` ([review PR #66](https://github.com/PlayerEden/Ricochet-Rumble/pull/66), based on [P-03 silhouette PR #65](https://github.com/PlayerEden/Ricochet-Rumble/pull/65)).
- **Original byte-identical APK, QA screenshot ZIP and checksum manifest:** [v0.9.45.1-pilot-motion-test](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.45.1-pilot-motion-test). Original APK sha256 `c41ade4009551845b5668bfecb5ed67c80af1f077b471607a7f8b3228f15096f`.
- **Automated tests PASSED:** [fast geometry/gameplay/maze](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41005017654), [real Chromium multiple landscape sizes / Android debug APK + unsigned AAB](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41005017792); exact original source SHA as above.
- **Fallback:** [previous v0.9.45 P-03 no-motion APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.45-pilot-silhouette-test); prior [v0.9.44 P-02 APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.44-pilot-visual-test) is a historical comparison but owner rejected its crawling-looking boots.
- [Branch QA contract](https://github.com/PlayerEden/Ricochet-Rumble/blob/polish/p03-pilot-motion-v09451/docs/QA_PILOT_MOTION_v09451.md) and [latest branch handoff](https://github.com/PlayerEden/Ricochet-Rumble/blob/polish/p03-pilot-motion-v09451/docs/PROJECT_STATUS.md).

## Locked player-facing design
- Strict **90° top-down** compact operator icon, single continuous torso and helmet/forward visor, symmetric armored shoulders, short braced arms gripping **one centerline pistol**.
- Keep existing blue/red team readability and standard neutral paint in FFA. Never restore visibly separated rear boots, long crawling-like lower limbs, prone/crawling perspective, or 2.5D rendering.
- **Movement** uses existing velocity-driven oscillation to animate only mild unified torso sway and mirrored shoulder armor shifts; no artificial feet/knees. Stops moving when pilot stops. Keep helmet, forearms, pistol and drawn projectile muzzle aligned to exact (28,2) gameplay coordinates.
- All pilot/tank/mech hitboxes, combat physics, speed/rotation/aim logic, scoring, procedural arenas, AI, LAN protocol, camera, game modes, save/backup and user controls remain outside this art-only acceptance.

## Change-control and integration boundaries
- **Do not reopen pilot cosmetics/art** just for visual novelty; only a reproducible issue or a fresh owner request warrants a new pilot iteration.
- **Do not merge the broad experimental PR chain into main** as a consequence of this art approval. Default `main` gameplay remains the known-good v0.9.21 line until separately reviewed/integrated and approved. Future merges must preserve the locked art.
- **Android debug APK signing is ephemeral** and older APKs have mismatched signing certificates. APK is a **clean-install test build**, not a safe in-place update. Do not uninstall an older installation with valuable local data.
- **Still open:** physical multi-session performance/control comfort, 2-device LAN acceptance, durable test signer and in-place data upgrade proof, privacy/Play signing/compliance, natural-match balance telemetry, overall release-readiness.
- **Next independent milestone:** v0.9.46 UI/audio presentation polish, then severity-ranked comprehensive product/Android QA. Keep approved P-03 unchanged.

**Milestone verdict: Pilot visual and movement = OWNER MANUAL PASS; broader game release = NOT READY.**

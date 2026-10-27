# v0.9.22-dev3 -- Wider Tactical Camera / Phone Feedback

**Date:** 2026-10-27. **Status:** Draft PR #24 development, NOT a finished release.

## Player feedback
- Tested v0.9.22-dev2 APK on a real Android phone. Game starts, menu animation is decent, fights are fun but not yet as compelling as desired. Screenshot shows an on-foot pilot in a maze: character silhouette lacks convincing human readability and the tactical view feels too close.
- **Immediate:** Pull back camera for ALL active classes and maintain cinematic-but-playable follow, procedural arena visibility and Android touch overlay size.
- **Dedicated future art pass:** Rework top-down human/pilot silhouette, motion and visual hierarchy. Current pilot reads too much like a technical icon/turret and needs external game reference research, multiple candidate silhouettes and screenshot comparison at true phone zoom.
- **Later:** Menu animation polish and game-juice, sound/music including potential separately produced tracks; gameplay feel tuning. Do not start music or LAN mode work this slice.
- **LAN:** explicitly deferred by player until two phones available. Keep #22 open; no claim of tested LAN.

## Camera changes
- Previous unit zoom targets (mech/tank/foot) **1.08 / 1.13 / 1.22**. New proposed **0.94 / 0.98 / 1.07**. Lower values mean MORE world visible, preserving the existing visibility ordering.
- Spectator/fallback target: **1.15 → 1.00**.
- Exterior **CAMERA_APRON 112 → 260**, and dynamically render enough perimeter floor tile rows/columns to cover the entire apron. Important for ultrawide/high-resolution Android viewports where the old minimum zoom silently prevented zooming out.
- This is world-camera-only: combat collision radius, arena generation sizes, tank/pilot artwork geometry, joystick/fire overlay hit targets, HUD and minimap are unchanged.
- Camera easing across pilot/tank/mech unchanged; tests cover phone viewport widths and zoom floor, camera finiteness and class hierarchy.

## Validation / gates
- Update shared browser and Android `game.js` byte-identically. Inherited camera regressions must use the updated targets and apron geometry, not just be bypassed.
- QA: node smoke suite, visual screenshots 740×360 / 915×412 / 1280×720 and debug APK compilation. **Real physical Android feel/visibility must be reported by owner** before merging PR #24.
- Keep known-good v0.9.21 `main` / preserved v0.9.22-dev2 APK release; branch PR #24 remains draft.

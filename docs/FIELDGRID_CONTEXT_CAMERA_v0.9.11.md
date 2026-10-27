# Sector Rebound — v0.9.11 FIELDGRID Console & Context Camera

## Player direction
The fullscreen v0.9.10b build feels substantially more like a mobile game. Feedback highlighted two next refinements:
1. The main menu still resembled a clean app card, lacking the institutional, government-training / defense-simulator atmosphere of FIELDGRID.
2. Tactical zoom should respond to whether the human-controlled unit is on foot, in a tank, or piloting a mech.

## Menu identity
The game remains fictional; no real government affiliation, seals or department claims are used.
- Added compact control-system metadata header (`FG/01`, `OPERATIONS TRAINING DIVISION`, system version).
- Revised live-play command modules and field briefing; sharper corners, restrained cyan accent, separator lines, status indicators, and tighter text hierarchy.
- Installed-font-free Android design: native `sans-serif-condensed` for headings/commands and built-in system monospace for identifiers. No remote font calls, copyright/license dependency or loading delay.
- The **game title remains in the main menu but not live gameplay**. Help, match settings, and pause continue to use shared panel styling.
- Short-landscape breakpoints compress rails and controls to preserve touch usability.

## Camera targets
The rendering camera blends by the *local controlled actor*, including guest multiplayer snapshots:
- On-foot pilot: **1.28**
- Tank: **1.18**
- Mech: **1.12**
- Unknown/spectator fallback: **1.20**
- When the world/phone aspect requires it, a minimum zoom of max(screenWidth/(worldWidth+224), screenHeight/(worldHeight+224)) prevents unrendered gutters.
- Scenic apron increased to 112 world units around world boundaries. Outside the playable walls is visual only, with no movement/spawn geometry change.
- Exponential zoom interpolation (~5.2/s) changes camera framing over several frames after boarding, ejection and unit changes, without affecting movement, collision or network state.
- A new match/restart resets the camera zoom interpolation so a stale previous mode cannot carry into a fresh round.
- Only the local client decides zoom, not a replicated packet. Shared actors continue using the same position/vehicle state.

## QA
- Existing game mechanics, LAN protocol, bot AI and 0.9.10b motion regressions remain in the smoke suite.
- Added tests for panel semantics, offline typographic system, pilot/tank/mech target differentiation, smooth non-snapping transitions, convergence and wide-viewport minimum zoom.
- GitHub Actions builds an Android debug APK and compares Chromium screenshot sets at 740×360, 915×412, 1280×720 with baseline branch `dev/sector-rebound-motion-polish-v0910b`.
- Screenshots verify static layout, not final tactile experience. Real-phone and two-phone Wi-Fi playtests remain required before merging.

## Rollback and branch
Experimental branch: `dev/sector-rebound-fieldgrid-v0911`.
Prior verified rollback: `dev/sector-rebound-motion-polish-v0910b`.

## Build verification (October 26, 2026)
- GitHub Actions: https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40424926749 — **success** across gameplay smoke tests, 36 real Chromium screenshots, debug Android APK compilation and both uploads.
- Artifacts (14-day retention): `sector-rebound-v0.9.11-visual-before-after` and `sector-rebound-v0.9.11-debug-apk`.
- Browser screenshots: 740×360, 915×412 and 1280×720, each with home, settings, help, arena, moving tank and pause before/after. Screenshot report found no menu scrolling and the arena canvas remained fullscreen.
- Actual Android two-player Wi-Fi playtesting, device cutout behavior and touch feel are not yet validated.

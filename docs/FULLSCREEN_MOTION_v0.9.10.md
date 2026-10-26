# Sector Rebound v0.9.10 — Fullscreen Combat + Tank Motion

## Why this pass exists
A real-device screenshot revealed that v0.9.9 treated the combat field as a letterboxed web page: a large fixed header sat above the arena and separate touch-control gutters consumed both sides. The player requested a **mobile-native fullscreen field** with overlay controls and no game title during active combat, plus more physical tank/tread animation.

## Implementation
- **Full viewport field:** `.game-screen`, `.battlefield`, and `.arena-wrap` now occupy the entire available app viewport; no dedicated top row, border or side columns reserve world space.
- **Real canvas aspect:** the canvas rendering dimensions respond to window resize and orientation change; backing resolution caps device pixel ratio at 1.6 to avoid excessive Android GPU load. The camera's zoom automatically grows on unusually large/wide viewports so arena/world margins cannot become empty canvas strips.
- **HUD overlays:** tiny menu and three score/status chips are overlaid near the safe top edge, with the radar in the upper-right. The game name is absent from the active HUD but remains on the main, pause, and help menus. Menu/status elements remain readable in multiplayer modes.
- **Transparent input overlays:** movement stick sits at bottom-left, fire and enter/exit bottom-right, with inset-sensitive edges; swapping handedness still swaps the interactive controls. Input hit targets stay reachable while terrain extends behind them.
- **Tread physics:** movement integrates the *actual unblocked forward displacement*, and steering adds equal/opposite left/right belt phases. Both side treads retain mirrored geometry and run lengthwise along the tank's gun axis. Mech and pilot animations remain unchanged.
- **Tank weight:** a gentle speed-gated suspension motion is visual only. Shots cause a short, easing recoil; ballistics and collision remain exactly as before. Track states are included naturally in existing authoritative LAN state serialization.
- **Context events:** temporary event alerts moved below floating top chips rather than covering the new HUD.

## Regression and visual QA
- GitHub Actions run: https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40420470005
- Automated smoke tests **PASS**, including existing gameplay checks plus viewport canvas sizing, absence of branding in live HUD, track-belt differential phases, physical seam animation, and shooting recoil.
- Android APK build **PASS**, artifact upload **PASS**.
- 30 real-Chromium screenshots (15 before, 15 after) at **740×360**, **915×412**, and **1280×720**, with menu, settings, help, arena, and pause views. Visual inspection confirms world fills the view and side gutters/header were removed; no menu scrolling required in these test sizes.
- Artifacts: `sector-rebound-v0.9.10-debug-apk` and `sector-rebound-v0.9.10-visual-before-after`.

## Remaining manual checks
1. Verify on Android landscape with a gesture-navigation bar or display cutout: ensure menu, radar and both controls are tappable.
2. Drive and pivot a tank at varied speeds, checking seams visibly move in opposite directions while steering; inspect the recoil feel with repeated shots and the gentle bob for motion comfort.
3. Check camera, radar, and joystick visibility near arena boundaries, including on the smallest supported screen.
4. Play two phones on the same Wi-Fi. Scripted LAN state tests are not a substitute for genuine host/guest touch and latency tests.
5. Keep `dev/sector-rebound-ui-v099` unchanged for rollback; don't merge without on-device feedback.

## Deferred
Any additional tank sound, exhaust, track scars, camera shake, or physics retuning should be a separate, opt-in polish pass. This release deliberately changes presentation only and avoids gameplay balance changes.

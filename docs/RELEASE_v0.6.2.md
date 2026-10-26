# Ricochet Rumble v0.6.2 — comfort / correctness

Date: 2026-10-26. Small incremental release; existing 0.6 game balance and saved preference key are preserved.

## Changes

- Left/right swapped touch controls option persisted through the existing local preference key.
- Quick Help menu with a lightweight 2-column guide without screen scroll.
- Barrel-to-muzzle shell clipping against solid walls so a barrel next to cover cannot shoot *through* cover.
- Android/web visibility handling clears held input and attempts a host pause snapshot. Guest sends neutral input if backgrounded. Android lifecycle may still close nearby Wi-Fi connections onStop.

## Verification

- `node tests/smoke.mjs` succeeds, including new tests for left-handed mode, Help navigation, adjacent-wall shell spawn, and background host pausing.
- Chromium headless browser checks: 740×360, 915×412, 1280×720. Main menu, Help, match settings and in-game swapped controls display with no page overflow or JavaScript errors.
- `web/` and `android/app/src/main/assets/` HTML/CSS/JS content is kept byte-identical.
- GitHub Actions Android APK build result is recorded separately; a successful Gradle build is not a physical-phone or two-device LAN test.

## Still pending real-phone acceptance

- Hand comfort, scrolling/status bars, landscape notch cutouts, app suspend/resume and sound on both phones.
- Two real Android phones: discovery, host/join, packet loss, pause, reconnect, multiple bots, match end/restart.
- No guarantee of in-place updates with disposable debug signing. Uninstall old debug APK if Android rejects it due to certificate mismatch; uninstalling loses app-local settings/progress.
- Internet P2P and cross-network friends are not implemented.
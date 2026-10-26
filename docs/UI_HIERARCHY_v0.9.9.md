# Sector Rebound v0.9.9 — FIELDGRID Interface Quality Pass

## Why this branch exists
Continue the October 26 v0.9.8.1 UI work without altering the approved arena, LAN packet format, combat tuning, tank/mech geometry, or procedural maps. Previous verified branch: `dev/sector-rebound-ui`. This pass: `dev/sector-rebound-ui-v099`.

## Implemented
- **Main menu:** a distinct primary Quick Play action, concise metadata for Match Settings and local Wi-Fi, and a field-brief area instead of generic onboarding filler.
- **Match HUD:** compact semantic status: `TANK · 3/3`, `MECH · 4/4`, `PILOT · ON FOOT`, `HOST PAUSED` and `MATCH OVER`. Low armor, on-foot and paused have separate high-contrast surfaces, without shrinking primary movement/fire touch targets.
- **Recovery cues:** a bay blocked by a living actor remains visible as `BAY BUSY`, unlike the prior hidden ENTER button. The earlier v0.9.8.1 boarding-clearance rule remains authoritative. Gameplay/AI collision remains unchanged.
- **Radar framing:** concise corner ticks identify the minimap as an instrument, without affecting its pixels/visibility logic for enemy fire, player markers, or vehicle deployment.
- **Mobile typography:** retains fully offline Android-compatible condensed headings, and adds phone-landscape guardrails for main actions and the central status.
- **UI verification:** test suite checks UI text hierarchy, damaged/on-foot/end state transitions, occupied-bay cue, asset parity, and prior gameplay behaviors.

## Reproducible screenshots
The GitHub Android workflow attempts a real Chromium comparison against `dev/sector-rebound-ui`: `before` and `after` screenshots for home, settings, help, arena, and pause at 740×360, 915×412, and 1280×720 (30 total when Chrome is present). The `sector-rebound-v0.9.9-visual-before-after` Actions artifact contains screenshots and `layout-report.json`, including whether any panel needs scrolling.

The screenshot step is non-blocking; the gameplay tests and Android debug APK build are blocking. Screenshots are browser-emulated checks, not proof of physical Android notch/safe-area, device frame rate, or two-phone LAN functionality. Human screenshot review and on-device playtesting remain necessary.

## Acceptance checklist
1. Verify the latest Actions run: smoke, screenshot capture, and Android APK build.
2. Review the generated screenshots for overflow, tap readability, unwanted blank space, text wrapping, sidebar balance, and minimap coverage.
3. On a real phone at landscape sizes: check fingers do not obscure the ENTER/BAY BUSY cue, the primary HUD is not cut by a notch, and controls remain comfortable.
4. Test two real phones on same Wi-Fi; scripts alone cannot verify network pairing/latency.
5. Continue with short targeted UI iterations rather than introducing additional modes or vehicles yet.

## Verified workflow result — October 26, 2026
- [GitHub Actions run 40416502522](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40416502522): gameplay smoke tests **PASS**; screenshot capture **PASS**; both artifact uploads **PASS**; Android debug APK compilation **PASS**.
- **30 Chromium screenshots** were captured, including baseline and updated screens. Home and collapsed-settings panel overflow was **false** at 740×360, 915×412, and 1280×720 in both versions.
- The screenshots are artifacts for human visual review, not an independently completed artistic/pixel-by-pixel audit. Two-Android-device playtesting remains the next release gate.

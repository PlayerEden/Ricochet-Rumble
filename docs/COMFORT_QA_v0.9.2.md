# FIELDGRID v0.9.2 — Mobile Comfort & Recovery QA

**Branch:** `dev/procedural-deployments`  
**Scope:** v0.9.1 focused incremental refinement  
**Status:** local automated QA complete; Android CI and physical two-phone tests recorded separately.

## Pass 1 — Controls and LAN safety

**Issue:** A guest device could continue sending movement/fire requests after its own menu opened or when backgrounded. The host pauses globally, but the guest menu was not reliably neutral.

**Fix:** Control sampling is gated by menu visibility. When the guest opens the menu, it sends an immediate neutral input; periodic input is neutral when the menu is up or the page is hidden. Remote ENTER/EXIT won't trigger during host pause. This does not imply disconnect/reconnect is validated on two phones.

**Evidence:** `node tests/smoke.mjs` tests neutral input on menu opening and no auto-fire while paused.

## Pass 2 — Stranded-pilot feedback

**Issue:** After ejection, the top HUD says FIND VEHICLE, but players still had to interpret a small minimap to locate a garage.

**Fix:** A small directional marker appears only when on foot, alive, and a healthy unoccupied vehicle exists *outside* the current view. It identifies TANK or MECH and disappears naturally when the vehicle is visible, entered, destroyed, or none remain. The marker is not a route planner and deliberately does not reveal opponent positions.

**Evidence:** nearest-spare selection smoke test; automated browser screenshot with an artificially positioned distant vehicle for visual checking. Route-finding through walls is not offered.

## Pass 3 — Landscape comfort and accessibility

**Issue:** Advanced match selectors were 40 CSS pixels high at 740×360, below the usual 48dp Android accessibility goal. Short screens constrain the entire sheet.

**Fix:** At 740×360 selectors are 44px, the disclosure is 42px, and comfort toggles are 40px. At 915×412 and 1280×720 selectors are 48px, disclosure 48px, and comfort toggles 44px. The compact HUD brand subtitle is hidden on short-width screens to improve space for pilot state and remaining lives. None of this adds screens or settings.

**Evidence:** Playwright/Chromium snapshots at 740×360, 915×412 and 1280×720 show the expanded sheet fits, Play Now and Back are visible, no webpage overflow and no JavaScript errors. **Note:** some controls still fall short of a 48dp target; CSS pixels are not a reliable substitute for measurements on actual Android devices.

## Preserved gameplay

- One unified Quick Play game, procedurally generated field, optional match rules.
- Three-armor tank, four-armor mech, exit/eject, two pilot lives by default.
- Timed vehicle deployments, bot skill, ricochet shell limits, no-enemy practice setting.
- Existing optional auto-fire, sound, reduced shake and swapped controls.
- Same-Wi-Fi multiplayer foundation; not claimed to be remotely validated.

## Automated checks

- JavaScript parse check (`node --check web/game.js`).
- Existing 180 seeded mazes and 1,500-frame mixed bot stress regression.
- Pilot recovery and no-fire-while-menu-open tests.
- Playwright layout and console checks at three landscape resolutions.
- Mirrored browser/Android assets checked identical before build.

## Remaining acceptance blockers

- Two actual Android phones: connect, guest pause/menu, enter/exit, resumption and reconnect.
- Real phone frame pacing and thermal behavior during four-bot Large maze play.
- Human balance of mech vs tank, pilot vulnerability, and speed of rematches.
- Physical touch-target measurements with actual device dp scaling and accessibility settings.

No new game modes, currencies, accounts, or lore menus added.
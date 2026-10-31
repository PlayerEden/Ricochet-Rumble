# Sector Rebound — convenience and navigation audit, 2026-10-31

## Why we are changing this
Owner tested Preview 100022 on a real Android device, approved the new charcoal/amber/cyan style, and supplied actual phone screenshots identifying friction: **Hangar cosmetics form a tall page requiring a long scroll to reach insignia and Back**; **Dossier Back only appears at the bottom**. User asks for everything to be convenient, not a hassle. The UI foundation was already validated at 87 Chromium scenes/zero layout issues, but layout geometry alone does not establish low-friction navigation.

## Targeted implemented solutions
1. **Hangar: two tabs, not one long list.** PAINT (six current paints, including progress toward 5-match/12-win unlocks) appears by default; INSIGNIA (four original emblems) is one tap away. They are both genuine functional panels; switching never modifies storage or eligibility. The unselected section uses `hidden` plus a CSS override to ensure it does not occupy space or expose hidden controls. Tabs have `role=tab`, `aria-selected`, keyboard Arrow Left/Right/Home/End, and large touch targets. The active tab is the only tab in keyboard Tab order.
2. **Immediate back access:** the Hangar's only Back button is in its compact sticky header rather than after the scrollable list. The Dossier's Back control moves to the header, remains available at the top of short landscape layouts and does not require scrolling. Dossier still shows all six real stats, mode rows, played time and backup action.
3. **Contextual navigation:** opening Hangar from the Dossier returns to the Dossier, not to the main menu. Opening Hangar from home still returns home. The owner can inspect unlocked emblems and return to their progress without retracing a second navigation path.
4. **No manufactured new features:** original signed development app, all saved Dossier/Hangar IDs, cosmetic progress, modes, control scheme, match/lobby logic, physical HUD, art, LAN messages and performance unchanged.

## Test gates
- Existing smoke, Dossier and backup regression, Android/web assets byte parity, Android signed build.
- Real Chromium navigation: Home -> Hangar -> Insignia -> Paint -> Home, Dossier -> Hangar -> Insignia -> equip -> Dossier, direct Back without scrolling at 740x360/915x412/1280x720, keyboard tab navigation, persistence.
- Real UI geometry: additional Hangar Paint and Insignia scenes for each of 568x320/640x360/740x360/915x412/1280x720, no clipped controls or horizontal overflow. Existing whole-game 87-scene audit still runs.
- Real owner phone screenshots are **not** equivalent to this automated proof. Owner needs to confirm short landscape spacing and that pressing Back feels natural; two-phone LAN and production Google Play signing still pending.

## Provenance
Source baseline [signed Preview 100022](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41184207080), active [draft PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85), immutable [pre-convenience checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-100022-before-usability-pass) at `c47e3c994c03b7193bcad85f9591b847f7944a61`. No stable gameplay merge without owner approval.

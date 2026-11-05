# Sector Rebound M12-E — original tactical mode art and insignia studies
**Status:** developer preview on existing draft PR #141, not a default-art approval. `main` and ordinary saved data are unchanged.

## Six illustrated game modes
- **Close Quarters:** narrow angular corridors, short-range tactical sight geometry; pilot-only play is still from the authentic game.
- **Free-for-All:** schematic ricochet paths and isolated maze regions; no live score or fictional enemy depiction.
- **Team Deathmatch:** two neutral opposing territories separated by a dashed middle corridor; in-game actual team colors remain authoritative.
- **Capture the Flag:** two opposing flag symbols with a dashed route, not a fake in-game map or actual objective locations.
- **Forward Bays:** bilateral depot enclosures and connecting lanes, not new interactable props.
- **Custom Match:** its own adjustable maze-module schematic with measurement indicators, instead of misleading Forward Bays artwork. No invented game controls.

The six original code-authored 512×288 SVG illustrations live under `docs/m12-art-studies/` and mirrored exactly at `web/assets/m12/` and `android/app/src/main/assets/assets/m12/`. They have no external URLs, fonts, embedded UI text, player/tank/mech imagery, JavaScript or license dependencies. They are compact vector **study assets**, not the manifest's originally suggested WebP production finals. All six appear in the opt-in M12 visual lab only; `?m12Art=original` starts with Mode Select artwork off and shows the original cards. The visible Mode Select **ART: STUDY / ART: ORIGINAL** button switches the optional decorations without changing selection or saved settings. An unchanged default launch **does not render or request the studies**.

## Integration details
The existing `openModes()` now calls `refreshM12ModeStudy()` to apply `data-m12-mode-art="on"` or `"off"` only when the explicit M12 visual-test query flag is present; the button is hidden without this flag. Existing button markup, active click regions, labels, mode dispatch, the actual live vehicle canvas, touch target dimensions and saved settings are not modified. Five decorative pseudo-element backgrounds are sized for the preexisting compact cards; opacity and masks prioritize native readable text. The small landscape cut reduces illustration coverage. Field Exercises remain a focused subview, not additional rows or a forced scrolling grid. M12 Android test package is distinct from the ordinary app.

## Insignia concept family
Four additional 96×96 original SVG studies in `docs/m12-art-studies/insignia-*-study-v1.svg` retain the original **FIELD, VECTOR, ACE, COMMAND** vocabulary. These are **review-only**; the game's existing inline insignia icons and unlock conditions are untouched. No cosmetics become available prematurely.

## QA and release gate
- Test A/B toggle click, no-art state and all five phone landscape viewports for opt-in mode visuals, small-screen button visibility and Field Exercises behavior.
- Confirm normal URL has no mode-study data attribute and issues zero mode image requests.
- Verify offline app packaging includes exactly matching asset source and no CDN calls.
- Preserve existing Hangar and full regression workflows.
- No automatic merge, performance improvement claim or replacement of baseline UI. Owner reviews art styles and actual-phone legibility before any default integration.

## M12-E2 revision
The 2026-11-04 refinement adds a dedicated original Custom Match concept and a direct Mode Select A/B control. The control is sized for touch (44 px minimum), appears only in the distinct M12 visual app / URL opt-in, and uses the existing short-screen header rather than introducing an extra row. The original renderer and mode actions remain unchanged. The insignia proposals stay in docs because no user-selected emblem overhaul has been approved.

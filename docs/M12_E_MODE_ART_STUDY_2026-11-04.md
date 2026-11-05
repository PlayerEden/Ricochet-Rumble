# Sector Rebound M12-E — original tactical mode art and insignia studies
**Status:** developer preview on existing draft PR #141, not a default-art approval. `main` and ordinary saved data are unchanged.

## Five illustrated game modes
- **Close Quarters:** narrow angular corridors, short-range tactical sight geometry; pilot-only play is still from the authentic game.
- **Free-for-All:** schematic ricochet paths and isolated maze regions; no live score or fictional enemy depiction.
- **Team Deathmatch:** two neutral opposing territories separated by a dashed middle corridor; in-game actual team colors remain authoritative.
- **Capture the Flag:** two opposing flag symbols with a dashed route, not a fake in-game map or actual objective locations.
- **Forward Bays:** bilateral depot enclosures and connecting lanes, not new interactable props.
- **Custom Match** reuses a faint Forward Bays pattern in this compact first UI test; it is *not* a sixth unique game-mode illustration.

The five original code-authored 512×288 SVG illustrations live under `docs/m12-art-studies/` and mirrored exactly at `web/assets/m12/` and `android/app/src/main/assets/assets/m12/`. They have no external URLs, fonts, embedded UI text, player/tank/mech imagery, JavaScript or license dependencies. They are compact vector **study assets**, not the manifest's originally suggested WebP production finals. All five are opt-in under the existing `?m12Art=warm`, `blueprint` or `original` test URLs. An unchanged default launch **does not render or request the studies**.

## Integration details
The existing `openModes()` function adds the `data-m12-mode-art="on"` attribute only when the explicit M12 visual-test query flag is present. Existing button markup, active click regions, labels, mode dispatch, the actual live vehicle canvas, touch target dimensions and saved settings are not modified. Five decorative pseudo-element backgrounds are sized for the preexisting compact cards; opacity and masks prioritize native readable text. The small landscape cut reduces illustration coverage. Field Exercises remain a focused subview, not additional rows or a forced scrolling grid. M12 Android test package is distinct from the ordinary app.

## Insignia concept family
Four additional 96×96 original SVG studies in `docs/m12-art-studies/insignia-*-study-v1.svg` retain the original **FIELD, VECTOR, ACE, COMMAND** vocabulary. These are **review-only**; the game's existing inline insignia icons and unlock conditions are untouched. No cosmetics become available prematurely.

## QA and release gate
- Test all five phone landscape viewports for opt-in mode visuals, small-screen button visibility and Field Exercises behavior.
- Confirm normal URL has no mode-study data attribute and issues zero mode image requests.
- Verify offline app packaging includes exactly matching asset source and no CDN calls.
- Preserve existing Hangar and full regression workflows.
- No automatic merge, performance improvement claim or replacement of baseline UI. Owner reviews art styles and actual-phone legibility before any default integration.

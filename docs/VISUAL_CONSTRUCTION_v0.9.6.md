# Sector Rebound — v0.9.6 Visual Construction / UI Quality Pass

**Branch:** `dev/sector-rebound-visual-qa` (from `dev/sector-rebound` v0.9.5). **Scope:** redraw existing tank, tighten menus/control styling, introduce construction regression checks. This is an actual render/code change, not concept art. **No gameplay balance changes.**

## Found and fixed

1. **Tank tread axis (high impact).** In the prior renderer the cannon faced vehicle-local +X, while the two tread strips were drawn as vertical shafts parallel to local Y. The graphics implied incompatible vehicle orientations. v0.9.6 renders both tracks along local +X and uses `c.scale(1,side)` with `side in [-1,+1]` to construct perfectly mirrored geometry. Track transverse seams share the same offsets. Chassis, turret and barrel use +X as forward. Both tracks retain their symmetry during vehicle rotation because the entire sprite is rotated as one object.
2. **Soft mobile-app look (medium).** Flatter panel fills; fewer gradients and decorative shadows; consistent 5–7 px angular corners; simpler, clearer button hierarchy. Preserves high-contrast cyan primary action and coral fire control. The arena tiles/walls remain untouched, since their existing look was approved.
3. **Generic pause sheet (medium).** Solo pause now uses field-specific `SECTOR PAUSED` and a clearly prioritized Resume action. Host/guest pause titles match FIELDGRID vocabulary, while preserving all match and network actions.
4. **Regression coverage (high).** The Node smoke suite checks one centered +X barrel, exactly two mirrored tank tread assemblies, six matched transverse seams per tread, and paired mech limbs. The previous maze/pilot/bot/LAN logic tests continue to pass.

## Art contract — future additions

- **Projection:** strict top-down. Vehicle-local forward is +X. All vehicle bodies and accessories must align to that axis before rotation in world space.
- **Symmetry:** replicate mechanical paired components with `scale(1,side)` from a single definition. Asymmetry only where clearly intentional (e.g. visible damage).
- **Sizes:** silhouette must read on compact Android landscape (target 740×360, 915×412). One central barrel, clear side treads, cockpit centerline.
- **Palette:** cyan ally; coral enemy; violet mech type (when discoverable); mint usable vehicles. Color cannot be the sole identifier. No new decoration on the already-approved arena.
- **UI:** graphite panels, light borders, restrained corner radii and glows; one bright primary action per screen; action names short. Keep the arena view unblocked and the left joystick/right fire controls anchored.
- **Lore:** FIELDGRID as later-generation simulation descended from PHOSPHOR/CATHODE; short operation language, not intrusive lore overlays.

## Checks performed

- `node tests/smoke.mjs` — passed; includes existing gameplay, maze generation (180 seeded cases), 1,500-frame simulation, LAN packet rules, ejection, and newly added tank/mech visual construction assertions.
- Browser Chromium screenshots: 740×360, 915×412, 1280×720 — no JavaScript errors or page-level scrolling.
- Separate vehicle silhouettes captured from the *actual canvas drawing functions*; before/after screenshots captured from real game renderer with matching generated maze seed 20261026.
- Android build check: recorded separately in GitHub Actions. Compilation success does not prove phone performance.

## Remaining uncertainties

- Real-phone UI touch comfort, layout under system gestures and accessibility scaling.
- Two physical Android devices across same Wi-Fi for host/guest play, network interruption and reconnect.
- Combat balance and human perception of pilot versus mech/tank silhouettes at speed.
- A deeper audit of mech gait animations, ejection animation polish, and input feedback; visual mechanical consistency is improved but this is not final pixel-art completion.

This pass makes the artwork more **authored and mechanically consistent** rather than adding complexity, game modes or visual clutter.
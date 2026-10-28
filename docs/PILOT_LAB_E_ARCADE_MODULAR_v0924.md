# Pilot Lab E — Arcade Unit Cohesion and Modular Paint Foundation

**Date:** 2026-10-27  
**Status:** CODED EXPERIMENT on isolated branch; QA and owner acceptance PENDING.  
**Branch:** `prototype/pilot-lab-e-arcade-modular-v0924`  
**Parent:** `prototype/pilot-fieldgrid-lab-d-v0923` (Lab D tested APK and debug rollback immutable).

## User direction and visual problem

In their actual Lab D Android landscape screenshot, the owner identified a clear mismatch: tanks/mechs use blocky old-school arcade-like panels while the pilot still looks too intricate and rendered. Lab D is usable for now; the next experimental pilot should share the strong thick rectangular armor seams, small bright panels, flat fills and crisp dark outlines of the tank, while preserving the strictly overhead two-handed gun pose. Make future schemes/skins easy to implement via modular shapes/material roles rather than full new art each time.

See [mainline master gameplay art and skin architecture plan](https://github.com/PlayerEden/Ricochet-Rumble/blob/main/docs/design/25_GAMEPLAY_UNIT_ART_AND_MODULAR_SKINS_DRAFT.md).

## Actual Lab E implementation

1. **Chunky operator art:** replace Lab D fine faceted pilot plates with wide block-built vest, dark mechanical seams, paired rectangular shoulder armor, bent forearms, two square gloves meeting a pistol, one square-chamfered overhead helmet. Flat lit/shadow/base planes and 2px outline echo tank. No feet/low crawl/face/2.5D and no permanent circular selection rings.
2. **Material resolver:** `resolveUnitMaterials(unit,teamPaint,skinId)` and fixed `FIELDGRID_UNIT_SKINS` IDs: `fieldgrid.standard`, `fieldgrid.moss`, `fieldgrid.dune`, `fieldgrid.oxide`. Each unit gets paintable `armor`, `shadow`, `light`, `trim` roles plus always-independent `team` paint. Invalid ID returns standard, never arbitrary user hex input.
3. **Tank/mech default appearance stays intact**: the standard materials use the same live team paint and exactly the existing shadow/highlight constants; optional skin parameter only when explicitly invoked. Mechanically neutral treads/joints/barrels, vehicle geometry and aim unchanged.
4. **Pilot styling modular** with its original shape locations unchanged across four palettes. Team marks and tactical bracket markers not part of cosmetic paint. Modular *palette* foundation is implemented, but **no skin selector, ownership, save, network equip, purchase or Google Play Billing** is added.
5. **Exact WEB / embedded Android JS parity**; no changes to HTML, CSS, arena generation, input controls, physics, camera or actual cosmetic manifest for *dossier portrait icons*.

## Invariants and QA

- The firearm's visibly marked muzzle stays at local **(28,2)** and physics uses the SAME rotated offset with wall-safe tracing; four rotations and collision remain tested.
- Camera **pilot 1.07 / tank 0.82 / mech 0.77**, apron **420**, original procedural battlefield and UI unchanged.
- Screenshots must prove the *real gameplay* operator looks like the actual nearby tank at 915×412 landscape. At natural size, compare Lab D archived idle/aim/fire screenshots and Lab E, not enlarged character sketches alone.
- Monochrome/low-brightness legibility, mirrored shoulder/glove sanity, team marks independent of skin, no tiny detail overload, shield and ejection readability.
- Node syntax; smoke (including default vehicle appearance material roles, all 4 palette IDs, invalid fallback, true barrel shots), Android web byte parity, original Chromium scene capture, APK/debug compilation, unsigned AAB. Document actual CI run IDs, exact release SHA, and owner phone test separately.
- **Do not merge** this experimental branch, PR #31 (Lab D) or draft Quick Play PR #24 merely because QA passes. Keep exact Lab D prerelease as rollback.

## Future checkpoints (not yet implemented)

- Present 3 free sample palette swatches to the owner **only after this base sprite is judged coherent**; palette definitions alone are not gameplay-selectable.
- Later optional helmet/shoulder modular *shape* variants and profile persistence; include stability/migration and LAN synchronization tests before enabling equip.
- Existing dossier portraits in `game-data/cosmetics/pilot_icons.v1.json` remain separate. Their manifest is not a gameplay sprite skin.

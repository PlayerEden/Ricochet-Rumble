# Sector Rebound — UIV3 K1–K5 targeted refinement checkpoint

**Date:** 2026-11-04. **PR:** #140 (draft), `feature/m11-hybrid-menu-foundation-2026-11-03`. **Owner decision:** current joystick/FIRE controls comfortable; they are **locked unchanged** during this patch. This is a targeted composition/refinement pass, not a gameplay change or a replacement of the accepted art style.

## Work performed
| Scope | Code/UI change | Gameplay/data risk |
|---|---|---|
| K1 Hangar | Move the existing **VIEW TANK / VIEW MECH** preview-only switch from the bottom bar to the title rail. Label the actual display **UNIT PREVIEW · COSMETICS**, mark **DISPLAY ONLY · START IN TANK**, and separate paint readout. Fit the existing `drawTopTank`/`drawTopMech` shapes using conservative actual-geometry bounds (no min 1.45× zoom). | No changes to `rr-hangar-paint-v1`, equip/eligibility logic, starter tank, or rendering geometry; actual game drawings remain authoritative |
| K2 Local Play | Compact the 3-choice screen, move the original **Back** action into the header, make same-Wi-Fi scope plain English and put network scope in a subtle footnote. | Existing `host`, `find`, `manual`, `help-back` actions and bridge methods unchanged |
| K3 Dossier | Promote the existing real saved emblem styling and the actual **Sector Rebound** brand; show **FIRST MATCH AWAITS** only when `info.matches===0`, otherwise **SOLO HISTORY**. | No invented rank/reward/currency or save mutation; six actual stats and five real mode records unchanged |
| K4 Pause | While a real Pause surface is open, make the overlay translucent enough to show the frozen battlefield; lower blur cost on small devices and respect reduced motion. | No pause/resume rules, LAN host/spectator authority, game input or frame update change |
| K5 Branding | Dossier and Local Play now foreground **Sector Rebound** and user-friendly Wi-Fi language. FIELDGRID remains fictional lore elsewhere. | No package/repo, mode IDs or preferences renamed |

## Automated proof
- `tests/m11-premium-menu-qa.mjs` now tests the Hangar **preview-only** label plus bounded sprite scale, verifies honest Dossier empty-state copy, and expects the preserved Local Play action sequence with Back in its *new header position*.
- Original five-size browser QA (568×320, 640×360, 740×360, 915×412, 1280×720), real hit testing, Android QA, canonical gameplay/LAN, spectator and recovery workflows remain mandatory.
- Web and Android HTML, game.js, and CSS were verified byte-identical after this refinement.
- **No production merge, no production APK replacement, and no finished phone acceptance** is implied until exact latest-head workflows finish and owner approves the final screenshots.

## K6 creative assets — experimental only
A standalone visual exploration was produced separately from the repository. **It is NOT a production asset, validated screenshot, app feature, proof of unlocks, or app mockup to implement literally.** It must not overwrite the real 2D tank/mech sprites, menus or gameplay. Do not promise any fake player accounts, currency, achievements, vehicles, online matches or 3D rendering. Follow the existing K6 concept-only comparison/approval pipeline. Retain the current shipped procedural art if candidate concepts do not fit.

## Manual phone feedback still required
Check complete mech/tank silhouettes and 44px preview toggle; no overlap at 568×320; the Local Play header Back and Host/Find/Join hit areas; Dossier true zero and populated record labels; frozen arena visibility and audio controls on Pause; actual joystick/FIRE exactly unchanged. Two-phone physical LAN remains a separate acceptance item.

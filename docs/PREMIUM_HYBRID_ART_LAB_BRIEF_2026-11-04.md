# Sector Rebound — Premium Hybrid Creative Lab Brief (M5)

**Status:** concept exploration only. Nothing in this brief is a runtime asset, a new unlock, a gameplay feature, or a production approval. References the owner's favorite generated Sector Rebound multi-screen concept and the existing M-Series plan in `UIV3_GAME_FEEL_OVERHAUL_MASTER_PLAN_2026-11-04.md`.

## Visual grammar to preserve
- Product: **Sector Rebound**, mobile landscape, 2D arcade ricochet combat, actual in-game top-down pixel/vector tank, mech, pilot and maze geometry.
- Palette: navy/deep ink `#081923`, steel surfaces `#142A35` and `#1C3440`, warm action amber `#EAB96D`, signal cyan `#8AD6DE`, readable near-white `#EFF6F5`.
- Materials: minimal industrial dock, cyan edge lines, careful amber spot lighting, geometric silhouettes, restrained neutral texture, compact game typography. Readable at **568×320** and on low-end Android/WebView; no high-frequency noisy backgrounds.
- Art framing: the **existing real Canvas unit** must remain perfectly legible on top. Decorative background must leave ample low-contrast negative space behind unit and text.
- No embedded labels, fake achievements, fake stars/currencies, fake online/friends, 3D reimagining of real units, invented interface tabs, or copied art/logos from other games.

## Controlled asset experiments
**A. Hangar industrial dock — original concept study**
- One empty 16:9 hangar bay without units, UI, logos, text, icons or humans.
- Two visual variants of the *same geometry*: A1 slightly brighter warm ceiling lights + muted navy ground deck; A2 dark blueprint/docking dock with gentle cyan floor lines.
- Leave the central 50% clean enough for the actual game-authored top-down unit renderer.
- Treat output as reference only: review current procedural CSS M1 stage first. Use approved texture only after color correction, manual cleanup, crop/safe-area/contrast tests, and size/performance verification.

**B. Four-emblem style family — original concept study**
- Exactly four minimalist geometric insignia silhouettes for current authentic unlock identities: FIELD (diamond), VECTOR (triangle), ACE (four-point star), COMMAND (filled diamond).
- Single consistent family: identical stroke weight, optical size, flat vector geometry, no lettering, no medals/political or military organization marks. First draft black/white + one cyan/amber accent, transparent or dark neutral background.
- Test at 24, 32, 48, 96 px and against locked, available, equipped states. Convert accepted concepts to manually authored SVG/Canvas paths. Do **not** modify progression requirements (3 matches/10 KOs/12 wins etc.) or import generated pixels directly.

**C. Supporting pattern (optional, lower priority)**
- Repeatable low-contrast panel-grid or hazard-chevron motif behind a submenu, no text or gameplay tokens. Must not obscure tabs or buttons. CSS/SVG preferable.

## Plugin workflow
1. **Figma** — editable 568×320 / 915×412 / 1280×720 Hangar frame comparison and state system; use actual screen data with real button labels/controls; preserve content as editable frames rather than a screenshot.
2. **OpenArt / Adobe/Firefly** — generate and refine *background-only and insignia-only* candidates; work from the exact art brief rather than vague "modern gaming" prompts. Verify model/tool commercial usage and provenance before shipping.
3. **Code** — hand-code final static SVG or procedural Canvas/CSS. Optionally import a small optimized raster texture after approval; bundle it offline identically in Web and Android; never load from a CDN.
4. **QA** — live five-size screenshot A/B, sprite contrast checks in all four base paints, current unit/insignia geometry unchanged, FPS/memory and battery observations, accessible focus states, no fake interactions, legitimate rights.

## Decision sheet (do not mark approved without the owner)
| Candidate | Belongs in | Must beat existing baseline on | Status |
|---|---|---|---|
| A1 warm dock | Hangar only | recognizability, contrast, size | Concept |
| A2 blueprint dock | Hangar only | depth without clutter | Concept |
| B1 diamond/triangle/star family | earned insignia icons | coherent geometry at tiny size | Concept |
| C1 subtle motif | optional menu surfaces | readability, minimal bytes | Deferred |

## Implementation order
- M1 procedural hangar + equipped state: committed for test in PR #140.
- M2 navigation icons and panel language once M1's actual screenshots are accepted.
- M3 icon family selection and profile identity.
- M4 host/modes UX corrections.
- M5 approved art only; no generated art in game beforehand.
- M6 latest-commit Android regression and owner phone approval before merge.


## M5 CSS-only A/B implementation
Owner's five real screenshots motivated warm dock (default) and blueprint dock (review query only) as reversible **procedural** backgrounds. No generated images, dependency, texture, source-code replacement or external rights issues. M5 still permits future background-only art studies, but user approval and APK/contrast/byte-size tests are required before external/generated art can ship. The four existing original SVG insignias are already implemented and remain unchanged.

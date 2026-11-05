# Sector Rebound — M12 Generated Asset & Render Efficiency Program
**Authorized:** 2026-11-04 · Owner: “Yeah, plan it all out and let's begin.”
**Base:** M11/M5.1 merged to canonical `main` at `b114dfa37af2f132e4d3c08d503afcb15c5dff19` (post-merge fast and canonical workflows PASS).
**Active branch:** `feature/m12-asset-lab-and-render-efficiency-2026-11-04`; all new changes start here. **Do not merge automatically.**

## Goals / non-goals
1. **Art:** turn plain decorative environments into a memorable, consistent **Sector Rebound** tactical 2D identity while respecting the user's preferred existing layout, fonts, unit silhouettes, and colors.
2. **Efficiency:** reduce unnecessary Canvas draw operations only where an A/B profile proves it worthwhile; measure browser stage times, draw operations, texture decode/memory and APK size, then validate mobile.
3. **Safety:** retain the real game tank/mech/pilot geometry, exact painted-material logic, team identity, collisions, walls, bullets, aim traces, radar, HUD, camera, joystick/FIRE/EXIT positions, save schemas, LAN authority, offline operation, signing/package IDs and version code. **No AI-generated player silhouettes or fictional features masquerading as real game UI.**

Generated art is **not** intrinsically faster. HTML/CSS backgrounds may be browser-cached; a 1024×576 RGBA image may consume ~2.25 MiB of decoded RAM even if its WebP file is 100 KiB. Uploads also increase APK size and GPU texture transfers. No performance benefit claimed without matched measurements.

## Evidence-backed opportunities (current `main`)
- `web/game.js:drawHangarUnitPreview()`: authentic tank/mech Canvas drawn when Hangar opens or paint/unit changes; **not an every-frame redraw**. A baked decorative Hangar background is **primarily a polish opportunity**, not a guaranteed FPS win.
- `web/style.css:.hangar-bay`, `::before`, `::after`, `.hangar-architecture`: multiple CSS gradients and industrial lines, behind the unit. Test texture-based replacement in QA-only mode, not in default shipping UI.
- `web/game.js:drawLobbyPreview(dt)`: frame-limited to **24 FPS** while a menu preview exists; draws the real unit plus a radial gradient, grid, floor and shadows. Could cache a backdrop at size-change and blit it, with unchanged unit layer and screenshot comparison.
- `web/game.js:render(dt)`: in-match floor **132-unit cells** are culled but their plates, rivets, symbols and stripes are still constructed each render; wall details are redrawn for every visible wall. These are the most plausible CPU-side **static caching** candidates, but new tile textures may cost memory and interpolation. Never flatten collision, layout, markers, dynamic objects or camera.
- `tests/frame-pipeline-profile-browser-qa.mjs` and `tests/render-budget-browser-qa.mjs` already produce stage timings but not Canvas operation counts. M12-A adds a **test-only Canvas operation profiler** across representative maps and Hangar redraws, to make optimization prioritization evidence-based.

## Ordered milestones
| Stage | Deliverable | Exit criterion |
| --- | --- | --- |
| **M12-A — audit and baseline (now)** | Source-backed asset candidates, budgeted JSON manifest, test-only Canvas operation profiler + CI; isolated concept art; no runtime art swap | Measured browser baseline, source/asset parity preserved, no runtime or save change, targeted CI green |
| **M12-B — controlled creative batch 1** | **Two** empty industrial Hangar backgrounds (warm dock / cool blueprint) and **five** small mode-card illustration concepts (Survival FFA, Team Deathmatch, Close Quarters, CTF, Forward Bays); four coherent current-emblem studies | True game appearance, no tanks/players/text/controls/logos in Hangar background, every concept approved/rejected by actual game overlay comparison; licenses documented; nothing added to shipping default |
| **M12-C — safe optional integration** | Bundle 1–2 approved optimized images offline in `web/assets/m12/` and identical Android mirror; explicit QA-only `?m12Art=hangar` study with existing CSS fallback, accurate aspect/contrast, no missing URLs or build-time fetches | Five landscape snapshots including 568×320; real unit preview unobstructed; paint/insignia and tap geometry unchanged; measured package/decoded texture budgets |
| **M12-D — real render optimization pilot** | Choose **one** from lobby-backdrop caching / procedural floor tile prerendering / wall stamp atlas **only if baseline shows meaningful repeated work**. Feature-flag and A/B with same seeds and viewports | Candidate matches original gameplay geometry & readability; 10%+ median/P95 render improvement **where measurable** without >3% regression elsewhere; no texture memory blowup; reversible fallback |
| **M12-E — art polish and scalable pipeline** | Mode cards and cosmetic decals refined; optional source-edited insignia vectors (no unearned unlocks). Commercial-use provenance and deterministic WebP/PNG/SVG transformation notes | Offline bundle, ≤ defined budget, team colors and accessibility retain meaning, no fake scoreboards/achievements |
| **M12-F — release gate** | Full 9-workflow game QA; Play-safe asset provenance; current-head hash, rollback ref, screenshots, user approval | CI green; phone/GPU/FPS/heat and two-phone LAN remain **deferred** until owner wants real release approval |

## Asset categories, ranks and budgets
Detailed machine-readable inventory: [M12 asset manifest](M12_ASSET_MANIFEST_2026-11-04.json).

**Tier A, highest visual payoff:** Hangar environmental plate; compact mode cards.** Generate without UI text, badges, vehicles and logos.** Keep the natural center of the Hangar uncluttered: existing Canvas unit stays legible. The first Hangar composite must retain color/toggle/equip UI and the equivalent visual silhouette of the true tank and mech.
**Tier B, low-risk reusable pieces:** original FIELD/VECTOR/ACE/COMMAND mark *visual studies*, subtle dossier trim and background motifs. Source-author SVG if concept works better; do not replace official badges blindly.
**Tier C, depends on profiling:** static arena floor tiles, neutral non-colliding prop skins, wall details, marked spawn and objective pads. These require deterministic placement tied to real map objects and their collision rules.
**Protected / keep dynamic:** player units, pilot/mech animation, shells, shot traces, hit feedback, minimap, live HUD, control hit areas, team paint, flag ownership, pickup state and all network state.

### Starter budgets (targets, not measured source facts)
- One Hangar background: preferred **1024×576 WebP** (no alpha; quality tuned), **≤160 KiB compressed** and **≤2.25 MiB decoded RGBA**. Screens shorter than 16:9 must crop with central 50% safe negative space. One variant loaded at once; lazy-load when Hangar is open.
- Five mode-card illustrations: **512×288 WebP** each **≤75 KiB**, no embedded typography, added text remains native DOM, prefer image decode after main menu interaction.
- Four small emblem studies: source vector family; **≤5 KiB SVG each** or shared atlas **≤48 KiB**; test at 24, 32, 48 and 96 CSS px.
- Arena static texture experiment: baseline **256×256 or 512×512** tiled deterministic pixel-style sheet, **≤256 KiB compressed** and capped number of retained textures. Never invent world props that imply collision where there is none.
- Total new first-batch compressed assets **≤1 MiB**, and unloaded assets must not allocate decoded memory.

## Creative specification
**Sector Rebound look:** 2D top-down arcade geometry over quiet industrial settings; deep navy (#081923), steel (#142A35), cyan (#8AD6DE), muted warm gold (#EAB96D) and restrained amber warning marks; geometric disciplined contrasts, crisp on low-end Android.
**First production-target candidate:** empty Hangar industrial bay viewed as top-down/isometric-light environment plate, subdued walls/beams and docking floor around the perimeter, center open and dark for authentic dynamically colored unit render. **No player, tank, mech, text, control overlay, icon, trademark, watermark, legible serial code, fake button, or hidden UI.**
Second candidate: same stage geometry, cool-blueprint lighting, with no magenta/red combat alerts.
**No raw image generation is silently placed into the APK.** Generate → evaluate composition with real Canvas overlay → crop/color-grade → convert to WebP → record origin and rights → compare screenshots → integrate via opt-in flag → measure → only then propose release.

## Measurement contract
Use deterministic seeds, same viewport/DPR, map size, actor count, same code path and 30+ sample frames. Collect JS render median/P95, Canvas calls by type, aggregate operations/frame, number of visible walls, canvas pixels, texture bytes, exception counts. Browser evidence is labeled **HEADLESS CHROMIUM, NOT PHYSICAL FPS**.
An apparent speedup can be noise: repeat runs and compare paired distributions; measure warm and cold loads separately. If art hurts memory or frame pacing, keep the CSS/procedural version. No unmeasured “generated art makes gameplay faster” claims.

## Review / integration discipline
- GitHub is source of truth: new branch, draft PR, docs/asset metadata/test evidence, no direct commits to `main`.
- No user APK installation or extra physical playtest for M12-A/B. Test/visual automation only.
- Keep exact original Web/Android asset parity; never reference unbundled external images/CDNs.
- Incremental M12-B/C/D commits with reviewable rollback. Persist original images only as concept assets where provenance/licensing is understood; ship optimized derivatives if accepted.
- Manual phone/two-device LAN and store signing compliance are independent launch gates, not prerequisites for continuing visual experiments.

## Starting decision
**Begin M12-A immediately.** Gather actual Canvas draw operation baseline, record the user-approved aesthetic and budgets, and create an empty Hangar concept. Do not yet touch runtime art or claim an optimization. Branch remains draft until evidence supports M12-C.

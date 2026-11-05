# Sector Rebound — M12-A Canvas operation baseline & first art studies
**Measured:** 2026-11-04 · [GitHub Actions #41893859531](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41893859531) **PASS** · [inspectable JSON artifact #13353614251](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41893859531/artifacts/13353614251).
**Exact measured source:** `576155a5dee5e13c1603b7fd77f38dd41e684328` (only docs/tests/CI). Reproduced using real `web/game.js` instrumented in the *test HTTP response*, not in the shipped Web/Android assets.

## Results (method calls per repaint/frame, not GPU draw calls or FPS)
| Browser landscape | Lobby unit preview | Hangar unit change | Arena small | Arena standard | Arena large |
| --- | ---: | ---: | ---: | ---: | ---: |
| **740×360** | 99 | 47 | 751 | 850 | 1,040 |
| **915×412** | 99 | 47 | 925 | 1,095 | 1,268 |
| **1280×720** | 103 | 47 | 1,126 | 1,781 | 1,947 |

Method counts include `beginPath`, `fillRect`, `strokeRect`, `arc`, `fill`, `stroke`, `save/restore`, text/gradients and `drawImage`. **All sampled scenes used 0 `drawImage` calls**; this is a method-invocation count, not a discrete GPU-driver-call count. Arena cases use 32 synchronous frames after warmup, menu 16 draws, Hangar 12 unit changes; 15 total cases across three viewports with deterministic seeds.

Representative headless Chromium synchronous timing observations (milliseconds; **not Android CPU/GPU, battery, thermal or delivered 60 FPS**):

| Scene | 740×360 median / P95 | 915×412 median / P95 | 1280×720 median / P95 |
| --- | --- | --- | --- |
| Lobby repaint | 0.2 / 0.3 | 0.0 / 0.2 | 0.1 / 0.1 |
| Hangar on-change | 0.6 / 0.8 | 1.0 / 1.3 | 0.8 / 1.3 |
| Large arena | 0.6 / 0.9 | 0.8 / 1.2 | 0.6 / 0.8 |

Sub-millisecond timer quantization and scheduling noise mean these are rough diagnostics. An art asset should not be declared faster based on these single-run numbers alone.

## What this tells us
1. **Hangar generated art is a visual priority, not a meaningful steady-state FPS target.** The authentic preview renders on open/selection, not on every gameplay frame. HTML/CSS gradients may already be composited efficiently by the browser.
2. **Arena tile plates, rivets, wall lines and painted detail are a legitimate *test candidate***: they execute repeatedly while combat is active, especially as the camera sees more of the map. Culling already exists; don’t remove it.
3. **Lobby preview** is limited to about 24 redraws/sec, showing real tank/mech material variants; it is not an emergency optimization.
4. For genuine performance improvements, the next experiment should compare **original procedural drawing vs prerendered cached floor stamps** at the same seed, camera state, unit positions and viewport, checking visual differences, total decoded cache bytes and P95—not only operation counts.

## First original art studies — code generated and offline, not shipped
- [Warm industrial docking bay](m12-art-studies/hangar-warm-empty-v1.svg) — original text-free, unit-free, 1024×576 vector study.
- [Cool blueprint docking bay](m12-art-studies/hangar-blueprint-empty-v1.svg) — identical stage geometry with cooler lighting.

These are **hand-authored procedural SVG concept plates**, not claims that the generative-image tool produced optimized, approved production sprites. They deliberately contain no vehicles, menus, embedded text, remote images or fake functionality. Both remain **in docs only**, so opening the existing app will show its original Hangar gradients and real Canvas tank/mech. If a concept is accepted, create an optimized local WebP derivative and measure with an opt-in A/B flag before modifying the default.

The image-generation mood boards shared in chat are **planning references only**, not production source images.

## Next gates
- M12-B: create and shortlist actual empty-background art variants based on the proven composition constraints; user can review inline without a phone installation.
- M12-C: QA-only runtime optional art path (never network-referenced), keep CSS fallback and actual DOM/Canvas layering.
- M12-D: conditional floor-stamp cache experiment if render-stage A/B indicates a stable win without texture-memory or visual problems.
- All new image rights/provenance, file byte sizes, packager parity, source continuity and current-head CI must be preserved.

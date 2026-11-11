# Sector Rebound — M12-D cached floor stamp A/B experiment
**Date:** 2026-11-04 (US Eastern). **State:** test-only experiment validated in CI; **NOT approved for production.**
**Test:** [M12 asset/baseline workflow #41950769548](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41950769548) · [test source](../tests/m12-floor-cache-experiment.mjs).

## What changed
- A separate Node/Chromium browser test loads the **actual current game renderer** and patches only the HTTP-served test copy of `web/game.js`.
- It extracts the **real FIELDGRID tile-drawing commands** to build 11 interior stamps and one perimeter stamp, each 132×132 Canvas pixels; the production renderer stays procedural.
- It measures a paired 72-frame A/B per arena/viewport with the same initialized game state, camera, seed, map and actors.
- Browser screenshots of the arena Canvas (original and stamped) and pixel-difference statistics are written to the workflow artifact; browser reports and the original operation baseline are retained.
- **No Web or Android runtime bundle, build identity, signing key, saved data, combat, LAN, controls, or cameras changed.**

## Results: reduction in fillRect calls per frame (NOT frame-rate improvements)
| Chromium viewport | Arena | Original | Cached | Reduction | Render median ms original → cached | P95 ms original → cached |
| --- | --- | ---: | ---: | ---: | --- | --- |
| 740×360 | small | 573 | 377 | 34% | 0.2 → 0.2 | 0.3 → 0.3 |
| 740×360 | standard | 698 | 500 | 28% | 0.3 → 0.2 | 0.5 → 0.3 |
| 740×360 | large | 869 | 633 | 27% | 0.2 → 0.2 | 0.4 → 0.3 |
| 915×412 | small | 718 | 448 | 38% | 0.3 → 0.3 | 0.6 → 0.5 |
| 915×412 | standard | 915 | 641 | 30% | 0.3 → 0.3 | **0.5 → 0.6 (regression)** |
| 915×412 | large | 998 | 726 | 27% | 0.3 → 0.3 | 0.4 → 0.4 |
| 1280×720 | small | 871 | 472 | 46% | 0.3 → 0.3 | 0.5 → 0.5 |
| 1280×720 | standard | 1478 | 857 | 42% | 0.5 → 0.4 | 0.6 → 0.5 |
| 1280×720 | large | 1800 | 1179 | 35% | 0.5 → 0.4 | 0.5 → 0.5 |

**Caution:** The cached renderer also issues 50–135 `drawImage` operations per frame, depending on the viewport. The table counts `fillRect` alone, not total GPU cost. Sub-millisecond timings are unstable under Chromium and should not be called a measurable FPS improvement without repeated runs. The baseline workflow remains the unmodified game's operation-count measurement.

## Visual and memory findings
- The experiment used **12 × 132 × 132 × 4 = 836,352 bytes** (about 0.80 MiB) of nominal RGBA cache surface storage, excluding canvas/GPU driver overhead.
- Across nine scenarios, **5.67–6.82% of rendered pixels changed at all** in the paired images, likely due largely to rasterization/interpolation; only **0–0.005% of pixels** differed by more than 20 in any channel.
- Mean absolute channel delta was **0.107–0.147 / 255** across the full canvas. This is encouraging but does not replace human review of thin lines, warning symbols and HUD/gameplay legibility on a phone.
- No new downloadable art, runtime texture, renderer feature flag or APK was shipped.

## Release decision
**Keep original floor rendering in the actual game.** M12-D is a **prototype with useful operation reductions but insufficient stable P95 gains** to meet the M12 10% timing improvement threshold across cases without >3% regression. In particular, 915×412 standard P95 was worse in the initial run.

## Next controlled work
1. Retain 9-case paired benchmark as the permanent comparative fixture, and run repeated browser trials with interleaved A/B order and proper warm/cold distinction if optimization is pursued.
2. Review original/cached artifact screenshot pairs at 740×360 and 1280×720 and verify no softened tactical silhouettes, tile lines or adjacent tile seams; consider nearest-neighbor filtering only if it preserves original aesthetics.
3. Evaluate smaller or chunked stamps **only in a new isolated experiment**, with hard caps on texture bytes and drawImage calls. Do not ship merely because `fillRect` calls fall.
4. Continue M12-B/C Hangar visual style feedback independently, and create mode-card/emblem studies before any default art choice.
5. Preserve real physical Android FPS/thermal checks, two-phone LAN verification, signing and owner merge decision for later gates.

**Gate discipline:** Draft PR #141 stays unmerged. No user installation or additional manual QA required to keep experiments progressing.

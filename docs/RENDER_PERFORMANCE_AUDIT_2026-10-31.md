# Sector Rebound — headless Canvas2D performance audit (2026-10-31)

No change to accepted camera, zoom, tank/pilot rendering or visual design. The browser source shows existing GPU-density clamp (DPR 1–1.6), transient particles capped at 260, and per-render maze collision spatial bucketing. These are sensible boundaries but **not evidence of mobile FPS**.

The new `tests/render-budget-browser-qa.mjs` renders 30 actual Canvas2D frames in **nine** combinations: 740×360, 915×412, 1280×720, each with small, standard and large generated maze. It records wall count, actors/vehicles, canvas pixel count, median/P95/maximum headless Chromium draw time and DOM count. Assertions intentionally cover finite results, bounded resources and no missing bundled resources or JS exceptions, **not arbitrary FPS requirements**. It uploads JSON `qa-results/render-budget-observations.json` alongside current full QA evidence. Future optimization decisions should use repeated comparable runs and owner hardware, not a single CI timing.

The first 30-round mixed-mode soak at commit `88fb8a89` failed due to a too-tight clock assertion; [corrected run 41270333305](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41270333305) later reached the final check but reported two 404 requests from the *test HTTP fixture*, not a gameplay crash. The fixture now serves a blank response for the default browser favicon request; any other unknown asset still results in a reported error. Verify the next exact-head CI result and missing-path evidence rather than declaring the mixed-mode soak passed prematurely.

Physical Android 30-minute FPS, memory, heat and power draw remain unverified; do not infer hardware performance from this test. Stable main untouched, draft PR #85 only.

# M7 — Android Canvas Reallocation and Frame-GC Reduction

**Owner priorities, November 3, 2026:** 1) one-phone reliability/performance, 2) UI/HUD/results, 3) beta groundwork, 4) audio/music later. Keep the accepted camera pilot **0.94**, tank **0.73**, mech **0.69**, and existing AI/combat physics intact. Physical two-phone LAN testing remains deferred. One canonical game on `main`; do not create a new APK for this small source pass.

## Observed implementation inefficiencies

- `resizeArenaCanvas()` previously wrote **both** `canvas.width` and `canvas.height` every time Android/browser emitted a `resize` or `orientationchange` signal, even when the backing pixel dimensions had not changed. Every width or height write resets the context bitmap/state and can reallocate its backing store. Duplicate lifecycle/orientation notifications should not trigger that expensive work.
- Visible FIELDGRID floor tiles were creating two temporary JavaScript arrays for four fixed decorative rivets on **each tile, each rendered frame**. That introduces avoidable short-lived allocations during continuous animation.

## Changes

- Track the last effective pixel ratio and compare backing pixel dimensions; return without touching the canvas when dimensions and ratio are unchanged.
- When one axis changes, update **only that axis**. Restore the exact existing DPR scale after necessary resizing. Preserve the existing device-pixel-ratio cap of **1.6**, floor visuals and established camera math.
- Draw the same four tile rivets in the same order without ephemeral array allocations; no shader, textures, arena layout, collision, game speed or gameplay rules changed.
- Mirror `web/game.js` and `android/app/src/main/assets/game.js` exactly.

## QA and limits

`tests/android-canvas-resize-qa.mjs` runs the **real game** in Chromium at 740×360/DPR 1 and 915×412/DPR 3 (effective DPR 1.6). It instruments actual `HTMLCanvasElement.width`/`height` setter calls to verify **24 duplicate resize/orientation events cause zero backing-store writes**; a width-only viewport change writes width exactly once and not height; context transform and device-density cap remain correct. The canonical regression suite also checks existing visuals, AI behavior, LAN protocol and save data.

**What this does not prove:** faster measured average FPS, lower device heat, or battery savings on the owner's physical Android phone. It targets redundant resource churn and verifies the operation count, not an invented FPS benefit. On-device longer-session performance and thermal observation remain an owner testing gate before any Google Play release.

**Release policy:** merge after CI; leave the existing single owner preview v0.9.80/code 420001 untouched. Group M7 with later UI/performance changes for a single compatible higher-code owner APK, preserving signer/package and local Dossier data.

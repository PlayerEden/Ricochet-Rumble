# Sector Rebound — PixiJS renderer comparison (isolated experiment)

**Date:** 2026-11-03 · **Branch:** `experiment/pixi-renderer-probe-2026-11-03` · **Base:** verified `main` after M10. **Never auto-merge this experiment.**

## Purpose

Test whether migrating **the rendering layer only** from existing HTML5 Canvas2D to PixiJS v8/WebGL has a measurable benefit for Sector Rebound on Android. This is a controlled microarena, not a copy of the full production game. Do not treat its simplified AI, collision or physics as production behavior, and do not interpret synthetic Chromium numbers as Android performance.

## What is in the proof of concept

- One fixed maze with team-colored tanks, enemy movement, projectiles with wall bounces and touch move / aim / release-to-fire controls.
- A single simulation/state driving either the Canvas2D renderer or a PixiJS WebGL renderer; both share the exact same units, walls, projectiles and camera so the comparison isolates visual submission better than unrelated demos.
- An in-game **PIXI / WEBGL** and **CANVAS 2D** toggle, frame-rate indicator, CPU submission p95 timing, and RESET. GPU work may be asynchronous, so the CPU number is **not** the GPU time.
- No login, Dossier, save import, rewards, live LAN, backend, camera rebalancing, or changes to the production game engine. No CDN: PixiJS is bundled in the generated local `bundle.js` and works offline in the test APK.

## How to build and play from a phone

GitHub Actions workflow `.github/workflows/pixi-probe.yml` builds JavaScript using pinned PixiJS, checks a real Chromium WebGL renderer against Canvas2D at three landscape sizes, saves paired screenshots and measurements, then creates an **independent Android debug APK** artifact from bundled local files. Download the APK **from the experimental PR's passing workflow artifact** on your phone and install it beside the existing game. Its Android app ID is `com.playereden.ricochetrumble.pixiprobe`, label **SR Pixi Test**, and it uses an ephemeral CI debug key. Do not uninstall the current Sector Rebound preview. This test must **never** use the owner's private preview signer or package identity.

Playtest the same maze and bot/projectile load in each renderer using the toggles; compare observed FPS, lag while shooting, visual consistency, heat and touch feel. The browser numbers are software/desktop measurements only. Visual fidelity and full production AI/physics parity are deliberately outside this narrow probe.

## Decision gates

1. Real Chromium check passes with actual WebGL, Canvas2D, switching, a fired shot, resets and screenshots at 568×320, 740×360, 915×412. Verify the Android APK identity, asset parity and separate signing.
2. Phone playtest on the same Android device compares both renderers under similar motion and projectile load. Check cold startup, smoothness, visual correctness, WebGL context loss and heating.
3. A PixiJS upgrade is **only considered**, not approved, if it clearly wins on real phone hardware without new regressions or offline dependencies. A full game port would be a distinct, reviewed project with benchmark evidence and rollback.

**Mainline stopping point:** M10 merged and green; the next normal work is M11 compact Dossier/Hangar usability. **Current recommended game APK remains `v0.9.80-main.1`, code 420001**. Music remains priority #4; two-phone physical LAN deferred. This experiment must not block or replace normal development.

**Result:** pending Actions/browser and Android build verification, plus owner hardware measurements.

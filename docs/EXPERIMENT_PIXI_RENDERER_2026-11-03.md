# Sector Rebound — PixiJS renderer comparison (isolated experiment)

**Date:** 2026-11-03 · **Branch:** `experiment/pixi-renderer-probe-2026-11-03` · **Base:** verified `main` after M10. **Never auto-merge this experiment.**

## Purpose

Test whether migrating **the rendering layer only** from existing HTML5 Canvas2D to PixiJS v8/WebGL has a measurable benefit for Sector Rebound on Android. The initial simplified microarena received on-phone feedback: it did not look enough like Sector Rebound to assess a renderer migration. The revised experiment now reuses **the actual production tank, mech, and P-03 pilot Canvas drawing functions and material presets**, FIELDGRID floor tile palette/rivet patterns, wall bevels, hit particles and projectile trails, but remains a **visual benchmark, not a full game port**. Do not treat its simplified AI, collision or physics as production behavior, and do not interpret synthetic Chromium numbers as Android performance.

## What is in the proof of concept

- A larger FIELDGRID-style arena with production wall colors, riveted floor tiles, real tank/mech/P-03 pilot paths and team colors; moving bots, bouncing projectile trails, hit particles and touch movement / aim / release-to-fire.
- One simulation/state drives either Canvas2D or PixiJS WebGL. **Both use identical pre-rendered production unit art frames and the same static floor texture**, preventing the previous art-style mismatch. Match Load has 5 bots; deliberately exaggerated Stress Load has 18 bots and 80 initial projectiles. Rendering can be toggled while the match continues.
- The **PIXI / WEBGL** and **CANVAS 2D** toggle, **MATCH LOAD / STRESS LOAD** controls, frame-rate indicator, CPU submission p95, displayed bot/projectile counts and RESET. GPU work may be asynchronous, so the CPU number is **not GPU time**. Both renderers use cached sprites: a prospective optimization, **not** the exact current game's per-frame Canvas path drawing.
- No login, Dossier, save import, rewards, live LAN, backend, camera rebalancing, or changes to the production game engine. No CDN: PixiJS is bundled in the generated local `bundle.js` and works offline in the test APK.

## How to build and play from a phone

GitHub Actions workflow `.github/workflows/pixi-probe.yml` builds JavaScript using pinned PixiJS, checks a real Chromium WebGL renderer against Canvas2D at three landscape sizes, saves paired screenshots and measurements, then creates an **independent Android debug APK** artifact from bundled local files. Download the APK **from the experimental PR's passing workflow artifact** on your phone and install it beside the existing game. Its Android app ID is `com.playereden.ricochetrumble.pixiprobe`, label **SR Pixi Test**, and it uses an ephemeral CI debug key. Do not uninstall the current Sector Rebound preview. This test must **never** use the owner's private preview signer or package identity.

Playtest MATCH LOAD and then STRESS LOAD using both renderer toggles, watching for projectile-heavy stutters; compare observed FPS, lag while shooting, visual consistency, heat and touch feel. The browser numbers are software/desktop measurements only. Visual fidelity and full production AI/physics parity are deliberately outside this narrow probe.

## Decision gates

1. Real Chromium check passes with actual WebGL, Canvas2D, switching, a fired shot, resets and screenshots at 568×320, 740×360, 915×412. Verify the Android APK identity, asset parity and separate signing.
2. Phone playtest on the same Android device compares both renderers under similar motion and projectile load. Check cold startup, smoothness, visual correctness, WebGL context loss and heating.
3. A PixiJS upgrade is **only considered**, not approved, if it clearly wins on real phone hardware without new regressions or offline dependencies. A full game port would be a distinct, reviewed project with benchmark evidence and rollback.

**Mainline stopping point:** M10 merged and green; the next normal work is M11 compact Dossier/Hangar usability. **Current recommended game APK remains `v0.9.80-main.1`, code 420001**. Music remains priority #4; two-phone physical LAN deferred. This experiment must not block or replace normal development.

## Revised visual-fidelity experiment: verified after owner feedback

**Latest verified isolated prototype:** [GitHub Actions #41744671898](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41744671898), tested head `9bca5b684ae1bcf389008ab343b497d5be0c2534`: **PASS**. Real Chromium WebGL and Canvas at 568×320, 740×360 and 915×412, production-path art, five-bot match, 18-bot stress, frozen-state A/B screenshots, toggles, reset and firing. Android debug package and exact bundled offline assets verified. [**Revised separate APK artifact**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41744671898/artifacts/13281784676) · [**Revised screenshots and QA**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41744671898/artifacts/13282828983).

**Limits:** This is a visually representative renderer test, not the full Sector Rebound game. Production AI, physics, procedural map configuration, live camera logic, Dossier, LAN, saves and actual Android heat/FPS are not reproduced. Both backends use cached artwork, unlike the `main` Canvas renderer's many per-frame vector calls. A win in this test alone does not justify a full migration. CI runs headless software WebGL, not Android hardware. Phone comparisons still need practical testing.

**Result:** revised code and separately installable APK built; physical hardware verdict pending. Keep experiment in draft PR, never merge into the real `main` merely because CI passes.

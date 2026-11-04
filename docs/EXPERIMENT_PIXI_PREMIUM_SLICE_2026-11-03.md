# Sector Rebound — Premium Pixi UI + WebGL vertical slice

**Date:** November 3, 2026 · **Status:** Isolated visual experiment, draft/unmerged · **Base:** approved art/scale experiment PR #138, not `main`.

## Purpose and rationale

User feedback from the recent Pixi renderer, FX, and art-scale experiments: the effects worked, but the overall presentation still did not convincingly exceed the existing game, and the earlier art direction leaned toward a translucent blueprint rather than our solid arcade-tactical identity. This pass asks what a **modern, higher-budget Google Play visual presentation** might feel like if Sector Rebound had been designed around Pixi/WebGL from the start, especially its main menu, Hangar, HUD and GPU compositing. It is a limited concept, **not** a finished AAA game.

A critical technical distinction: **Canvas 2D is not a reason for an unpolished menu.** Well-designed DOM/CSS can produce high-quality interfaces with strong accessibility and touch support. This experiment deliberately combines **HTML/CSS for semantic interactive controls** with **Pixi GPU-rendered visual stages** behind them. GPU shader effects are the true new rendering technique here, not DOM menu styling itself.

## What was built

- **Menu:** a full-screen cinematic hangar with FIELDGRID structural details, animated hero vehicle, arc/lighting accents, emblem, Sector Rebound branding, primary DEPLOY, HANGAR and VISUAL SETTINGS actions. No online/account/Play integration is implied.
- **Hangar:** vehicle plate, read-only armor/mobility/firepower indicators, interactive deploy and back navigation. No cosmetic purchases, loadout saves or real game persistence.
- **Quality profile:** CINEMATIC vs REDUCED. CINEMATIC enables a real Pixi v8 **GLSL WebGL filter** that subtly warps and scans an in-world holographic vehicle panel and keeps atmospheric glow. REDUCED disables the filter and extra ambient light. GPU filter is applied to a deliberately small region rather than every sprite for performance.
- **Combat HUD:** stronger typography, compact score and status panels, pause/resume/return flow, and a collapsed TEST TOOLS drawer that keeps the arena from being squeezed by a permanent diagnostics bar.
- **Existing baseline comparisons:** Canvas 2D, original-inspired unit artwork vs layered Pixi rigs, match/stress load, 0.69/0.94/1.27 camera options, FX ON/OFF and demo effect still work via the diagnostics drawer.
- **Offline Android:** PixiJS bundled in local `bundle.js`, no CDN or remote resources; unique debug app `com.playereden.ricochetrumble.pixipremium`, label **SR Pixi Premium**, ephemeral CI debugging signature. Can coexist with the original game and earlier experiments.

## Real-browser QA acceptance gates

- Chromium with actual WebGL renderer at 568×320, 740×360, 915×412.
- Menu launch, visually populated Pixi stage and live GPU shader; navigation to Hangar and Settings, quality preset switching and shader active/inactive assertions, screenshot captures in both states from the Pixi canvas.
- DEPLOY shows the game HUD and hides the front-end; pause/resume/return-to-menu and collapsed diagnostics work using touch-size browser geometry.
- Existing game simulation tests: firing, renderer switching, reset, 5/18 bot load, frozen FX ON/OFF screenshots, classic vs layered art, 3 zoom presets and no JavaScript runtime errors.
- Android Gradle debug APK with exact offline asset contents, distinct application ID and visible launcher label.

## What this does not prove

- No full rebuild of Sector Rebound; no campaign, LAN, cosmetics, accounts, friend list, achievements, achievements APIs, Android native integration or production release.
- No evidence of GPU speed/thermal/battery advantage until tested on physical phone. Software WebGL in CI isn't comparable to real Android GPUs.
- No assertion that PixiJS is necessary for the menu and HUD. Any adoption decision should separate the **UI design ideas** (portable to production HTML/CSS) from the **WebGL-specific shader/visual techniques** (require GPU rendering infrastructure).
- No permission to merge the experiment, change live saved data, owner signing identity, camera approvals or current game app.

## Exit criteria

If the cinematic menu/Hangar, readable HUD and true WebGL filter still do not make the case for a full renderer port, document which ideas to implement in the existing Canvas/HTML/CSS game and return to M11 Dossier/Hangar polish. The owner's current recommended APK remains **v0.9.80-main.1**. No new owner build is implied by the experiment.

**CI/browser validation and artifact:** pending completion; record the exact source SHA and URL when verified.

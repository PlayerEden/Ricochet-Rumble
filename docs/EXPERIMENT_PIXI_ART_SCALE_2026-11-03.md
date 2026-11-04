# Sector Rebound — Pixi ART + CAMERA SCALE Showcase

**2026-11-03 — draft, experiment only.** Derived from the [Pixi FX lab PR #137](https://github.com/PlayerEden/Ricochet-Rumble/pull/137), deliberately isolated from the production `main`. This is not a renderer migration or a production build.

## Why

Owner feedback on the FX lab: muzzle/ricochet/destruction effects looked pretty good but the game still looked almost identical to the classic version. Both versions felt about equally smooth at ~60 FPS. The next question is **how much better Pixi could make the core game art, animation and spatial scale**, not more glow or another contrived FPS comparison.

Pixi does not invent new art or make 3D for free. Its scene graph helps independently rotate/transform layered sprites and graphics; zoom is camera/container transforms. We must build the design itself and test Android thermal/performance costs.

## What's added

- **LAYERED ART vs CLASSIC ART** in the *same Pixi/WebGL scene*. Classic uses production-derived FIELDGRID unit sprites; layered is an intentionally more detailed, **experimental** hand-coded artwork concept (not a replacement to merge), with separate tank chassis/treads/armor and independently rotating turret, articulated mech plates and legs, and upright pilot legs, animated parts and team-specific details. It includes recoil response, tread/walk cycles, engine pulse, hit/damage highlights and dynamic hull/aim articulation.
- **ZOOM − / +** cycles three bounded camera perspectives: **WIDE** 0.69×; **COMBAT** 0.94×; **DETAIL** 1.27×. Both rendering backends share the same camera math. Detail is for inspecting animation/armor, not a new approved gameplay zoom.
- **High-DPI internal rendering** caps resolution between 1.0 and 1.75 according to device pixel ratio, with a matched native-resolution Canvas2D path and Pixi WebGL renderer. Actual memory and speed on phone must be measured.
- **FX ON/OFF and DEMO FX**, MATCH/STRESS LOAD, basic Canvas baseline and same prior camera/arena all remain accessible. Footer is a swipeable mobile horizontal toolbar to preserve playfield height and avoid multiple cramped action rows.
- Everything is separate from `main` and in the prototype only. Original launch button, in-game art, controls, AI, saves, package IDs, campaign, LAN and user APK are unchanged.

## What this *does not* establish

This is a small animation and art-direction *vertical slice*. It does **not** yet model fully authored sprite sheets, skeletal animation, normal-mapped lights, custom animated shaders, expensive texture streaming, multimap rendering, infinite procedural terrain, platform graphics drivers, Android heating and device memory. The layered vehicle concepts are procedural and deliberately distinct from locked production style. Approval would require art critique, phone performance/heat and a carefully limited production implementation. Improved animation is not exclusive to Pixi; a better Canvas renderer could implement most of it with additional work.

## QA / Android isolation

The experimental workflow checks three real Chromium landscape sizes, production-art baseline and layered Pixi art, FX switch, frozen-state screenshots for classic vs layered visual differences, zoom preset limits, normal/stress modes, touch controls and reset, plus separate Android packaging with its own app ID `com.playereden.ricochetrumble.pixiart` and label **SR Pixi Art**. It uses ephemeral CI debug signing, local bundled PixiJS files and **does not overwrite** Sector Rebound (`v0.9.80-main.1`) or the other two experiments.

**CI result:** pending at creation, record verified run and artifact link after green. No performance win claimed without device measurement. M11 Dossier/Hangar remains the mainline next milestone; release safety unchanged.

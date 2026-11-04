# Sector Rebound — Pixi FX Visual Ceiling Lab

**Date:** November 3, 2026 · **Experimental branch:** `experiment/pixi-fx-lab-2026-11-03` · **Source:** snapshot of the isolated [Pixi renderer probe PR #136](https://github.com/PlayerEden/Ricochet-Rumble/pull/136), **not** `main`. Keep this PR **draft and unmerged**.

## Why this second experiment exists

The owner compared the real-art Canvas and Pixi arena at 5/18 opponents and found them **practically indistinguishable in feel**. A raw benchmark alone therefore does not establish the value of a renderer migration. This lab tests the **visual ceiling** of PixiJS: whether real-looking Sector Rebound combat receives materially better, *readable* feedback and atmosphere when Pixi adds GPU-composited VFX. Neither a performance gain nor a migration decision is assumed.

## What this prototype actually does

- Reuses production-path FIELDGRID floors, walls, tank/mech/P-03 pilot sprites and the same simplified arena/simulation as the original isolated renderer probe.
- Keeps **MATCH LOAD** (5 bots) and deliberately excessive **STRESS LOAD** (18 bots, initially up to 80 projectiles).
- **PIXI/WEBGL + FX ON:** adds bounded, pooled PixiJS additive light sprites, different tank/mech/pilot projectile glows, muzzle flashes, wall ricochet sparks, unit-hit/armor flashes, death bursts/short-lived smoke, mild engine exhaust, pulsing pickup light and subtle facility accents. No gameplay, hitbox, turn speed, camera or aiming behavior is changed by these effects.
- **PIXI/WEBGL + FX OFF:** same simulation, same renderer and unit textures, with the entire Pixi VFX layer hidden and no VFX draw work. This is the most useful direct visual A/B comparison.
- **CANVAS 2D:** same cached production art and existing basic particles. The advanced Pixi FX button is explicitly disabled to prevent implying that Canvas baseline has these effects; it is *not* a complete attempt to reproduce the added visual effects in Canvas.
- **DEMO FX** sends a staged display of muzzle, bounce, hit, damage and destruction effects near the player. This is a visual preview only; it does not alter scoring, health, damage or the simulation. Effects also respond to actual test combat.
- FPS and CPU rendering-submission p95, live projectile/bot and active Pixi FX sprite counts are exposed for comparison. CPU submission is not GPU wall time. A locked ~60 FPS alone cannot distinguish smoothness or thermal efficiency.

## Safety and one-phone workflow

The generated test package has distinct Android ID `com.playereden.ricochetrumble.pixifx`, launcher label **SR Pixi FX** and an ephemeral CI debug signer. It is not signed with the regular owner's preview key, has no login, does not import existing saves, and can be installed beside BOTH `Sector Rebound` and the original `SR Pixi Test` renderer probe.

This branch changes only `experiments/pixi-probe/**`, its scoped experimental CI workflow, and this documentation. It **does not** touch `web/**`, `android/**`, production `main`, existing package identifiers or any owner save data.

## Required CI checks

1. Bundle the same pinned PixiJS v8 into local, offline WebView assets (no CDN).
2. Run real Chromium WebGL and Canvas baseline on 568×320, 740×360 and 915×412 viewports.
3. Verify a 5-bot normal scene and an 18-bot 80-shot initial stress fixture, the ability to fire, reset, and switch renderers.
4. Freeze the *identical* simulated stress state, inject an effects-only deterministic showcase, capture Pixi FX ON and FX OFF screenshots from the **canvas surface only**; assert they differ, the FX toggle is enabled only for Pixi, and zero enhanced sprites are visible with FX OFF.
5. Assemble the separate Android APK and verify `com.playereden.ricochetrumble.pixifx`, `SR Pixi FX`, exact asset parity and independent signing. Artifact does **not** replace the regular owner preview.

## Physical phone acceptance — not established by CI

Install the verified experimental APK, play 5-bot and 18-bot loads with FX ON/OFF, use **DEMO FX** and shoot, and judge aim clarity, combat readability, 1% frame-time lows, thermal behavior, battery and long-session stutter. Hardware FPS and heating cannot be inferred from software SwiftShader CI, and the isolated simplified AI/ballistics still do not match the complete live game. If the FX pass is too noisy, expensive or not meaningfully better, do **not** migrate. The current production Canvas remains the baseline.

**Mainline remains at M10; M11 Dossier/Hangar polishing stays next. Current recommended owner APK is v0.9.80-main.1/code 420001. Two-physical-phone LAN remains deferred.**

## Verified results

Pending latest experimental GitHub Actions run and Android artifact; update only when all checks complete.

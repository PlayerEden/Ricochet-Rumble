# Sector Rebound — Godot Ricochet Trials feasibility spike

**Draft / parallel experiment, not a port or replacement of Sector Rebound.**

Engine: **Godot 4.7.2 stable**, standard GDScript, Compatibility renderer.

## Try it

Open this directory in Godot via project.godot, then run the main scene. The 960x540 test range has one top-down tank, seven real 2D colliders, a target, bounced shells, shot count and medals.

- Desktop: WASD/arrow keys to steer/move, Space/Enter to fire, R to restart. Mouse can click FIRE and RESTART.
- Android touch: drag MOVE/AIM bottom-left, tap FIRE bottom-right, RESTART top-right.
- Goal: bank a shell into the gold target. A one-shell cap makes your choice of angle important.
- Headless import: godot --headless --path . --editor --quit
- Headless test: godot --headless --path . --script res://tests/smoke.gd

## What this tests

The actual Godot 2D collision/raycast/render/input architecture, not a mocked JavaScript demo. No external textures, credentials, analytics, ads, server or third-party addons.

**Not included:** original Sector Rebound tank controls/physics parity, procedural world generation, pilot/mech, offline Dossier, Android APK/AAB, multiplayer, saved data or Google Play packaging. The main game remains untouched.

## Engine comparison gates

1. Physically compare aim, bounce feel, tank center rotation and touch responsiveness against Preview 100061.
2. Benchmark startup, APK size, sustained FPS and heat on the same Android handset.
3. Automate test-only Android APK export with a **different package ID** and repeatable signing; preserve the existing source/version.
4. Compare 300+ deterministic procedural seeds and actual gameplay events before any full port.
5. Prove safe migration of all five local saved records, reimplement pilot, bot, modes, LAN and Hangar.
6. Stay in JavaScript unless Godot offers clear maintainability and game-feel benefits worth the rewrite.

**Migration NOT approved.** Preserve the existing HTML/Canvas/Android source, PR #85, package IDs, Preview 100061 and stable main.

[Future roadmap](../../docs/FUTURE_ROADMAP_2026-11-01_PROPOSAL.md).

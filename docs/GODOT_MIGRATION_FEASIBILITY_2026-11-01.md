# Sector Rebound — Godot migration feasibility experiment (2026-11-01)

**Status:** DESIGN + SOURCE EXPERIMENT, not a full game port or engine migration approval.

The user suggested Godot while physical Android acceptance is deferred. Prototype only in branch experiment/godot-ricochet-trials-spike and directory experiments/godot-ricochet-spike. Existing JavaScript/Android integration remains on draft PR #85; current known working test preview 100061, all three automated QA workflows passed, physical acceptance pending. Stable main unchanged.

## Confirmed engine execution — 2026-11-01

**Godot 4.7.2 headless import and smoke: PASS.** [GitHub Actions 41280737168](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41280737168), exact source `df5520b7ab183865832db1d6728ac2bc45f11263`: official engine `4.7.2.stable.official.ed1daf0bf` downloaded and executed; project imported; GDScript scene loaded, seven static-wall bodies/target collider initialized, deterministic reflection/medal rules, one-active-shell and reset smoke passed. No Godot parser errors observed in smoke run. This is **not** real gameplay handling, Android APK, touch, visual render, or multiplayer acceptance. Existing JS game, its package and saves still completely unchanged.

**Recommended next experiment after owner phone is available:** compare ricochet responsiveness and actual visual output; prototype independently signed Godot Android test package, then decide whether any more porting work is justified. Do not label this spike a port or advertise it as the released game.

---

## Engine choice

Pin **Godot 4.7.2 stable**, GDScript and Compatibility 2D; Godot 4.8 is beta in November 2026. A standalone real top-down Ricochet Trials experiment demonstrates wall colliders, 2D physics raycast shell reflection, touch and keyboard input, one-shell cap, simple medals and reset.

This is an engine feasibility test, not proof of a playable Android port, complete saved-state compatibility or new features in the live game. The Godot Android editor is experimental for touch use; prefer GitHub/headless and later automated export for the existing phone-centric workflow.

## Trade-offs

- Godot can improve long-term scene composition, 2D animation, gameplay editor tooling and networking API ergonomics.
- Existing approximately 157k-character JavaScript engine plus CSS/HTML, native Android networking bridge, pilot/mech, bots, procedural generation, scores, QA tests and five separate local save records do NOT simply run in Godot. A real port is a substantial rewrite.
- Godot high-level multiplayer has ENet, WebSocket and WebRTC interfaces, but still needs synchronized authoritative simulation, real internet infrastructure, reconnect tests, hosting cost and security. Two physical phones remain mandatory before saying LAN works.
- A Godot test APK must have its own application ID and signing setup. Never uninstall or install this over the existing game; no automatic transfer of saved data.

## Concrete gate

1. Run real Godot headless import + GDScript smoke in isolated GitHub Actions workflow.
2. Play small trial on a physical Android test install later: input fidelity, deliberate ricochet aim, visuals, target collision, startup and heat.
3. Prove test-only repeatable Godot Android export and benchmark native app size/performance vs original.
4. Port ONE existing algorithm with seeded comparison fixtures, ideally maze topology or ricochet impact rules.
5. Investigate native vs existing 2-device LAN with 0 bots and predictable host start.
6. Determine whether improvement justifies the reimplementation and a safe Dossier/Hangar/Custom/preferences migration. Owner decides go/no-go. Retain proven JS implementation if not.

## Sources (current as of 2026-11-01)

- Engine release: https://godotengine.org/download/archive/4.7.2-stable/
- Godot Android export: https://docs.godotengine.org/en/4.7/tutorials/export/exporting_for_android.html
- Godot LAN/API: https://docs.godotengine.org/en/4.7/tutorials/networking/high_level_multiplayer.html
- Headless project workflow: https://docs.godotengine.org/en/4.7/tutorials/editor/command_line_tutorial.html
- Godot Android editor: https://godotengine.org/download/android/

No production gameplay, stored records, signing or public Google Play state changed by this experiment.

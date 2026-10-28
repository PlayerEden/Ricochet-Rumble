# v0.9.23 PILOT LAB C -- two-handed true-overhead pistol and muzzle alignment

**Date:** 2026-10-27. **Status:** independent art/weapon-origin prototype, **not accepted/merged**.
**Branch:** `prototype/pilot-two-hand-muzzle-v0923`, based on [Lab B](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.23-pilot-lab-b-overhead-test), with [draft Quick Play PR #24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24) still unmerged.

## Actual phone feedback
Owner judged Lab B head-and-shoulders camera as the right concept but requested more defined, outward arms gripping a pistol with TWO hands (or rifle) and noted **bullet appears to come from center of the head**.

## Research distilled into code rules
- See [Godot top-down muzzle node tutorial](https://www.peanuts-code.com/en/tutorials/gd0006_guns_of_topdown_shooter/) and [engine-agnostic sprite anchor overview](https://tigerabrodi.blog/2d-asset-primitives-a-reference). The pistol barrel needs a local-space muzzle point rotated with facing. Never infer origin from the actor's center and draw the gun elsewhere.
- [Overhead arm/weapon sprite examples](https://opengameart.org/content/topdown-shooter-pack-0) illustrate head/body plus two outward arms. Inspiration only; **do not copy artworks or import licensed assets**.
- Default to **two-handed pistol**, consistent with existing pilot sidearm rules and projectile kind. A larger rifle would demand its own weapon balance/appearance/mode integration and can be separately prototyped after user accepts the pose.

## Implemented changes
- Strict top-down helmet/shoulders preserved. Two **elbows out, forearms in** form a visible braced V pointing along facing +X, hands converge near compact pistol at (14,±3).
- Shared named `PILOT_MUZZLE_X=24`, `PILOT_MUZZLE_Y=2`: visual muzzle and physics world-transform use the *same anchor*. Shot starts at rotated world muzzle when clear.
- Muzzle trajectory sampled from pilot center to barrel tip against existing `blocked` collision. Near wall, bullet spawns at last safe point to avoid shooting through a wall; this is intentional small-cover behavior, not shoot-through.
- **Not changed**: camera, aim rotation, projectile velocity/damage/life/cap, underlying collision hitboxes, bot AI, tank/mech barrel logic, mode rules, UI or Android package identity.
- Web/Android JS byte-identical by construction. Add smoke assertions: two arms/hands, helmet prominence, actual muzzle location at 0°, 90°, 180°, 270°, unchanged speed and camera. Then real phone-sized Chromium screenshots and Android debug compile before showing APK.

## Acceptance
Actual phone screenshot and moving/firing clip must show *person from directly overhead gripping pistol with both hands*, rather than a vehicle turret or low-crawl. Confirm bullets visually emerge at barrel tip, no shooting through corners, no FPS/controls regression. Owner chooses whether to approve two-handed pistol direction or commission a separate rifle variant. Do not merge onto `main` or draft PR #24 until source branch acceptance.

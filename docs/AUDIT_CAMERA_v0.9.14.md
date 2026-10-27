# Sector Rebound v0.9.14 — Camera / Quality Audit

## Scope
This is a restrained correctness and visual-legibility pass on top of the v0.9.13 combat and power-up build, not a new game mode or balance overhaul.

### Camera: slight zoom-out for all units
| Context | v0.9.13 | v0.9.14 |
|---|---:|---:|
| Pilot on foot | 1.36 | **1.32** |
| Tank | 1.26 | **1.22** |
| Mech | 1.20 | **1.16** |
| Fallback/spectator | 1.28 | **1.24** |

A decrease of exactly 0.04 in every mode. The tank/mech/pilot distinction remains. World-boundary clamping, scenery overscan, safe-area HUD, smoothing, and camera transitions remain unchanged. This effectively returns the framing to the earlier v0.9.12 camera while retaining v0.9.13 combat improvements.

## Code-audit findings and corrective changes
1. **Ambiguous supply visual codes — fixed.** Barrier, Capacitor, and Field Repair all used a plus glyph. Their FIELDGRID supply markers now use **B**, **C**, and **H** (repair/health), alongside existing distinct colors and names. Rapid remains **R**, Turbo remains **»**.
2. **Recovery pointer could favor a blocked vehicle — fixed.** The on-foot directional recovery hint considered any unoccupied and healthy vehicle, even where a living actor blocked boarding. It now shares `vehicleEntryClear` with boarding and bot routing. A blocked vehicle becomes eligible again when the area clears.
3. **Expired player's active supply timer — fixed.** When a pilot lost the final life on foot, the existing terminal-life path did not clear power state. The game HUD could show a lingering timed power-up because dead actors no longer tick their timers. Eliminated actors now lose active timed buffs and the HUD explicitly hides active power when the local life count is zero.
4. **QA fixture collision — repaired.** The first new CI run failed at test-file parsing due to a duplicate fixture name in the extended smoke suite. The added tests are now in separate lexical scopes; the corrected run passes gameplay checks. This was not a runtime game crash.

## Retained design
- Tank 4 active shells at standard setting, mech 3, pilot 2; tunable tank cap.
- Rapid Fire, Turbo, Barrier, Capacitor, Field Repair; finite spawn rotation, effect timer, and capacity behavior.
- Tank tracks, mech gait, pilot locomotion, recoil, fullscreen tactical HUD, menu identity.
- LAN protocol unchanged. The fixes modify server-authoritative game behavior only where appropriate, and Android/web source stays byte-identical.

## Test gates
- Existing procedural maze checks (180 deterministic seeds), 1500-frame stress, armor/ejection/vehicle interactions, bot movement, projectiles, power-up timing/limits, and LAN serialization smoke checks.
- New tests check camera targets, unique supply identifiers, blocked and unblocked recovery targets, eliminated-player buff expiration and HUD cleanup.
- 36 deterministic Chromium before/after screenshots (740x360, 915x412, 1280x720), including menus, active arena, moving tank, help and pause. Full-bleed viewport and menu fit are CI gates.
- Android debug APK compile, artifact upload and web-vs-Android game asset parity.

## Outstanding: physical quality gate
- Real two-phone same-Wi-Fi hosting, discovery/manual join, match state, rematches and reconnect after backgrounding are not physically validated.
- Devices with rounded screen corners or display cutouts may show HUD/touch behavior different from Chromium's rectangular viewport.
- Long-session frame pacing/battery, responsiveness and the real fun/balance of v0.9.13 require human playtesting, not just the automated smoke suite.
- Avoid claiming all bugs are gone; this audit targets the issues found in the code review.

### Rollback
- Baseline: `dev/sector-rebound-combat-feel-v0913`
- Experiment: `dev/sector-rebound-camera-qa-v0914`
- Android: versionCode **31**.

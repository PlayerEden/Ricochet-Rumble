# Sector Rebound — Universal Release-to-Fire & First-Bounce Preview

**Development checkpoint:** experimental `experiment/universal-release-ricochet-v2`; no merge to `main`, no current APK replacement.

## Intent and owner decision

The player prefers deliberate aim/commit/release firing for the whole game, not merely pilots. Ship the first A/B without changing baseline sidearm bounce behavior, then revisit how **AI commits to shots** so bots face comparable limitations to players.

## Current control design

- RELEASE TO FIRE (ALL WEAPONS) is **ON by default** for mobile human play in Solo and LAN host/guest. Accessible from Settings; OFF restores classic hold-fire. A user who deliberately enables legacy AUTO FIRE keeps that separate opt-in (UI shows AUTO ON). Keyboard shooting remains usable and unchanged.
- FIRE touch press and drag previews a selected heading without shooting. The pilot, tank or mech physically turns toward that heading using its appropriate existing turn cap. Releasing queues **one** shot, which executes when facing within 0.095 radians and the existing projectile capacity/cooldown permit. A pending request expires after 1.6 seconds. The game never teleports the vehicle's rotation or bends projectiles.
- Pointer cancellation, pause, blur, match restart, death, and mode changes invalidate pending shots. Device-level LAN guest sends a one-shot `fire-request` with finite normalized aim, match ID and a monotonic sequence number; host checks connected, match, seat alive, valid sequence, and executes through the original physics/cooldown. **Actual two-phone testing is still required**.
- Firing preview is world-space, minimally dotted rather than a solid line; first segment is brighter, second softer, a small impact marker identifies the first bounce. Human aim line appears only during touch FIRE/queued shot. A pilot sidearm trace stops at walls and does **not** bounce.
- Vehicle preview length budget is up to 520 world units versus 245 for sidearms, rather than the prior short 135-unit pilot-only straight line. The second segment is bounded to 235 units after the first bounce. Preview uses actual weapon muzzle offset, wall collision radius and x-then-y reflection, plus circular bumpers; only one predicted bounce is shown to preserve skill expression. It is a preview, not guaranteed prediction after moving targets or map changes.

## Rollback and evidence

- Prior owner-device APK: v0.9.61, versionCode **230001**, with stable installed preview signer SHA-256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`.
- Prior passing experimental pilot controls: `experiment/pilot-release-aim-preview-v1`, [CI 41368280228](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41368280228).
- This branch's **initial full regression passed**: [CI 41373601911](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41373601911). Follow-up targeted test matrix adds actual tank/mech/sidearm shots and host shot-request validation, and must also pass before device certification.
- Main, prior experiments, and integration PR #85 are intentionally untouched. Any later APK must retain `com.playereden.ricochetrumble.preview`, the exact existing test signer and strictly increasing versionCode **above 230001**; update in place, no uninstall.

## Separate AI firing fairness phase — DO NOT CONFLATE WITH THIS CONTROL CHANGE

**Important confirmed gap:** In current `botInput`, bots issue `fire: true` continuously while target/LOS/aim cone allow it, consuming cooldown as rapidly as legal. Humans in the new default must now deliberately acquire an angle and **release** to commit one shot. Existing short acquisition windows (Casual 0.32s, Normal 0.24s, Spicy 0.16s) apply specifically to an on-foot Solo human target, rather than every bot-versus-human situation. Bots still use precise world positions for navigation.

Next audit should first measure real fired-shot intervals, angular error and reactions after acquiring/losing LOS **separately** for pilot/pilot, pilot/vehicle, tank/tank, CTF, and all difficulty levels. Capture camera-space visibility and bot vs human rates across real procedural seeds. Then A/B an AI `aim → acquire → commit → one shot → recover` firing state with skill-dependent finite aim commitment. Use the bot's real vehicle turn limits and the same projectile caps, ammo speed, bounce/walls and cooldown; no omniscient shots from beyond player-view pilot combat, no perfect first-frame release and no invisible full-maze ricochet solver. Keep AI objective navigation intact. Match exact human constraints wherever feasible without making bots inert or trivial. Audit the AI pass **after** the universal human-control checkpoint is accepted.

## Physical acceptance still required

Compare one match each of FFA, TDM, CTF, CQC, and a mech in landscape. Look for smooth angular alignment, quick taps, no ghost/duplicate shots, readable thin dots and correct first bounce off walls, one request equals one shot, pilot ammo still stops at cover. Then compare how often bots fire versus human shots, and whether bots get offscreen attacks or instant second shots. The browser CI cannot replace user device feedback or real LAN.

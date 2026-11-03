# Sector Rebound — Pilot Combat Fairness: On-Screen Bot Fire + Low Optional Assist
**Date:** 2026-11-01  
**Status:** experimental source-only, targeted Chromium + complete prior regression **PASS**. Physical Android controls and real-player balance still unverified.

**Exact tested source commit** `4c87e2e2e2dd28a78346fb77d12562e0ca9d8484`.
[Passing CI 41355730770](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41355730770).
[Archived test JSON + screenshots artifact 13103272156](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41355730770/artifacts/13103272156).

## Owner physical feedback and code finding

On Android, sidearm duels between pilots demand precise thumb aim; AI can apparently shoot at the pilot from outside the human's visible camera. The existing source had a world-space bot-fire limit of 385 units in maze matches and checked line of sight, but it did not check if the bot was on the player's screen. The pilot camera zoom target is 1.07 versus tank 0.82 and mech 0.77, making the asymmetry more noticeable when ejected.

This checkpoint addresses **offscreen bot firing in local Solo** and offers **light, optional on-screen pilot-only aim assistance**. It does not change AI navigation, exact-target knowledge, target prediction, hitboxes, projectile speed, bullet damage, ricochet rules, tank movement, CTF scoring, host/guest networking, or objective AI. It is **not** a claim that bots have human-like vision or that difficulty is balanced.

## Implementation — web/game.js and Android-mirrored asset

1. `pilotInLocalView` checks a world-space point against the current local rendered camera rectangle, conservatively inset by 24 pixels. It uses the actual current camera transform with a valid zoom fallback.
2. `pilotBotFireFair` blocks bot firing if its chosen target is the **on-foot local human** in **Solo** and either shooter or target is off screen. It keeps the existing world-distance and maze line-of-sight gates. Bot-vs-bot, combat versus player vehicles, and LAN remain as before. It does **not** stop AI from moving toward an enemy's known world position.
3. `softPilotAimOffset` is *opt-in*, defaults OFF, and only applies to the solo human's on-foot sidearm on a shot-ready frame while FIRE is held. It chooses a live visible enemy **pilot** within 200 world units, with line of sight, no spawn shield and an existing manual heading error of no more than **5 degrees**. It adjusts pilot facing by at most **2 degrees** toward that target. No locks, autofire, curves, tank/mech correction, or targeting off-screen contacts; correction is not continuously applied during firing cooldown.
4. New `pref-pilotAssist` checkbox in the existing Settings comfort controls, stored through existing `rr-options-v06` opt-in settings and automatically supported by the old load/save paths. Web and Android `index.html` are byte-identical; Web and Android `game.js` are byte-identical.

## QA completed

The actual Chromium game engine was instrumented only for deterministic **test fixtures**: seeded arena setup, two live pilots with clear LOS, controlled headings, camera boundaries and option state. These are not natural match simulations and must not be mistaken for measured PvP win rates.

`tests/pilot-combat-fairness-qa.mjs` **passed 9 fixture cases** across 740×360, 915×412, 360×300 viewports and maze seeds 101, 202, 303:
- Default OFF; check/uncheck settings and persisted opt-out through browser reload.
- 4-degree manual miss receives max 2-degree correction when enabled; >5 degrees gets zero correction.
- Other zero-assist guards: shielded pilot, enemy in vehicle, outside 200-unit reach, and off-screen target.
- Actual `tankMove` adjusts shooter heading on ready FIRE, actual `shoot` emits a normal sidearm bullet following that heading; no correction during existing cooldown.
- Camera-aware bot fire is rejected off-screen and can fire when visible; host-mode behavior preserved.
- No browser exceptions.

The **full passing CI** also ran prior smoke/save/CTF contracts, 450-case vehicle-route fairness audit, 216-case team-deployment audit, 300-seed Forward Bays browser checks, CTF objective bot and natural CTF matches, legitimate human-input CTF flag theft, Quick Play, first-match onboarding, backup safety, CTF UI and visual QA. Evidence accessible at the CI link above.

## Limits / next focused audit

- Since bot navigation still uses opponent world positions, this is **fire fairness**, not a complete AI perception system. For the next phase, instrument actual camera-space shots and pilot hit rates in longer matches, compare casual/normal/spicy AI skill before introducing finite reaction latency or last-seen pursuit behavior.
- User should compare low assist OFF and ON in the same physical pilot-v-pilot fights on Android, especially CQC and ejected pilots. Check if the 2-degree nudge is noticeable but not magnetized; can adjust or remove based on actual feedback.
- Validate Settings at 360×300/740×360 physically (automated browser acceptance covers menu presence and persistence but not screen-reader and real thumb use).
- CTF objective bot behavior is separate; human-pilot combat and dedicated objective behavior were not optimized together.
- Neither full LAN play nor actual 2-phone control sync was tested.

**Release and rollback:** no new APK, PR, main-branch merge, signing-key change or Play publication. Prior passing baseline `experiment/team-vehicle-fair-deploy-v1`, tested source `134b222dfa57fa02a6fe838fd0b9f9aec8a46afa`, remains the independent rollback. If the owner requests a new Android preview, retain `com.playereden.ricochetrumble.preview`, exact installed test signer SHA-256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`, and versionCode **above 200003** so no uninstall is needed. Stable `main` and draft integration PR #85 remain unchanged.

# Sector Rebound — Visible Enemy Shot Readability (v0.9.64 Candidate)

**Date:** 2026-11-01 local (2026-11-02 UTC).  
**Branch:** `experiment/visible-bot-aim-telegraph-v1` (stable `main` remains unchanged).  
**Purpose:** owner-approved follow-up after v0.9.63 AI aim/acquire/commit/recover mechanics.

## Before / after

Previously bots physically acquired targets before shooting, but there was limited visual information for the human to distinguish intentional aim from an instantaneous shot. The new world-space cues make that behavior visible without increasing player aim assistance or exposing hidden opponents.

**New UI:**
- **Three small amber ticks** appear around an enemy's own muzzle during real bot target acquisition, progressing as the timing approaches readiness. They do not extend toward the player, solve a bounce angle, or reveal enemy coordinates off-screen.
- **Brief warm shot diamond** immediately after a real projectile, based on the existing `t.flash`, only when `brain.lastShotTarget` was the local player. The drawing follows actual bot facing.
- A true **local Solo/host visible camera and unobstructed maze line-of-sight** gate is required. An occluded enemy, offscreen enemy, paused/finished match, dead bot, teammate, bot acquiring another actor, or bot in recovery cannot display a readiness cue. LAN guest does not attempt to infer unsynchronized enemy bot state.
- Readiness ticks only start at 23% acquisition progress to prevent single-frame flicker; first segment is very short. Existing teammate outlines, pilots, vehicle art, player dotted single-bounce shot guide, and CTF flag indicators are unchanged.

**No gameplay changes:** AI navigation, target selection, acquisition and recovery durations, projectile speed/damage, ammo caps, ricochet physics, spawn logic, LAN protocol and player touch controls are unchanged. The local cue is an observed visual state only. It introduces no new game preferences or persistent storage.

## QA acceptance

`tests/bot-combat-cues-qa.mjs` is a production code browser instrumented test, using controlled fixtures for **3 landscape viewports × 3 difficulty tiers × 3 weapon configurations = 27 cases**. It checks positive on-screen acquisition, progress ratio, suppression on initial flicker, suppression during recovery, wrong target shot, shield/out of view/dead actor/guest, real maze wall LOS, truthful muzzle flash for local opponent, and no renderer exceptions. Captures screenshots for the middle difficulty tank case. Raw results and screenshots are persisted as CI evidence.

Full browser regression also reruns 18-case bot cadence, 48-case actual touch release across pilots/tanks/mechs, route-fair team vehicles, universal Forward Bays, CTF objective bots, legitimate human theft, first-match onboarding, Quick Play, corrupt-backup handling, and visual QA. Source/browser `game.js` and embedded Android `assets/game.js` are byte-identical.

**Status:** audit running on [GitHub Actions 41385812973](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41385812973); do not label passed until workflow conclusion confirmed. Initial run 41385714405 revealed a legitimate unrelated-target muzzle fallthrough bug, fixed in commit `4327d77f4641a7eb46fc45c79e2ae5987b551f04`.

## Mobile owner acceptance and rollback

Actual phone test still needed: whether these ticks are noticeable but not distracting at the owner's landscape resolution, if warm shot confirmation feels truthful, and whether a bot changing focus midfight produces confusing cues. CTF, pilot-only CQC and regular tank play should all be inspected physically. Do not infer PvP fairness or accessibility acceptance solely from Chromium fixtures.

Rollback to `experiment/ai-commit-shot-parity-v1`, known passing [CI 41384505125](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41384505125), and owner v0.9.63 preview versionCode `250001`. Any new preview APK must use package ID `com.playereden.ricochetrumble.preview`, same test signer SHA-256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`, and higher versionCode than `250001` to preserve installation and data.

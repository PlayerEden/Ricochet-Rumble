# Sector Rebound — Combat HUD Shot State (experimental)

**Date:** 2026-11-01 local / 2026-11-02 UTC.
**Branch:** `experiment/combat-hud-shot-state-v1`.
**Last accepted Android preview:** v0.9.64 / versionCode 260001; unchanged.
**Rollback:** `experiment/visible-bot-aim-telegraph-v1` at `bcccb4e403ebe21127108ba104c6d6c8073fee65`.

## Focused source audit

The existing projectile meter displayed `READY` whenever there were open simultaneous projectile slots, including while the real `fireCooldown[seat]` prohibited firing. It also counted expired shells awaiting cleanup, although the actual `shoot()` capacity check ignores projectiles whose `life <= 0`. During a close fight this could make the status contradict firing behavior.

## Scope of change

- Display **IN FLIGHT** when the live projectile cap is occupied; **CYCLING** when a slot exists but the weapon is still on cooldown; otherwise **READY**.
- Count only local, live projectiles for the compact existing shell indicator, matching `shoot()` rather than including expired shells and enemy rounds.
- Keep existing shell-slot dots, one-bounce dotted aiming preview, three amber enemy warning ticks and real shot flash.
- Lightly tint **CYCLING** warm and update the accessible text; no additional panel or intrusive animation.
- No changes to bullet velocity, projectile caps, bounces, wall collision, target acquisition, bot difficulty, touch input, LAN protocol, match rules or saved settings. JS/CSS mirror edits are identical in web and Android asset copies.

## Independent validation

- New `tests/combat-hud-truth-qa.mjs`: 3 phone landscape sizes × 3 weapon types × 5 cases (ready, cycling, partial, fully occupied, expired owned + active enemy shells) = **45 browser assertions**.
- The existing `bot-combat-cues-audit.yml` now runs this additional test alongside the 27 visibility fixtures, bot cadence, pilot release controls, CTF, forward bays, team vehicle placement, Quick Play and visual regression.
- **Full browser regression PASS:** [GitHub Actions run 41390494669](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41390494669), gameplay commit `a938a8e48280aa4747b8452c9555401d000bb784`. New **45/45 HUD cases**, **27/27 enemy visibility fixtures**, **18/18 bot-cadence cases**, **48/48 release/aim cases**, route-fair vehicles, forward bays, CTF bot/human matches, Quick Play, backup recovery and **44 visual scenes** succeeded. Full evidence artifact `sector-rebound-combat-cues-evidence` was uploaded. Initial CI 41390426212 correctly caught a lightweight smoke DOM stub missing `setAttribute`; the compatibility guard was added without changing normal browser/Android appearance, and the complete rerun passed.
- Android APK was not rebuilt or installed for this HUD pass.

## Physical owner acceptance and next decision

Continue testing the already-built v0.9.64 warning cues on the actual phone, including pilot-only Close Combat, vehicles and CTF. Once cue readability is accepted, package the combined HUD follow-up as a higher-versionCode install-over APK, keeping the same preview app ID and signer. Then observe whether **CYCLING** feels useful without distracting from bounce angles and whether the counter becomes **READY** in sync with the next permitted shot.

# Sector Rebound — CTF human/escort corridor clearance (experimental)

**Date:** 2026-11-02. **Branch:** `experiment/ctf-human-escort-lane-clearance-v1`.
**Parent/rollback:** `audit/ctf-armed-attacker-v1`; latest fully passing observational trace at commit `671d593b8740c40331017c0170248fd503015840`, [run 41508122220](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41508122220).
**Status:** isolated gameplay experiment; not approved for APK integration or stable `main`.

## Confirmed issue and evidence

Read-only seed-102 real-engine trace across three scripted controllers showed both no player deaths and a reproducible movement deadlock. At about 20 simulated seconds, the unarmed/precise player reaches (318.8, 595), then oscillates vertically by less than one world unit through 180 seconds while a **friendly on-foot pilot remains at 33.1 units**. The cautious attacker stopped earlier at (263.9, 594.3) with a **friendly tank 42 units ahead**. These match combined character collision radii, and all three scripts attempted to move into the next connected eastward corridor cell. The earlier stationary-only detector was blind to the tiny oscillation. A separate seed-101 precise run likewise stopped behind the same friendly pilot at about 33 units.

The maze graph remains connected. This is physical teammate congestion in the observed simple straight-line controller, **not evidence of bad damage balance or globally broken maps**. Human steering around the teammate has not yet been verified on an Android device.

## Small and reversible gameplay experiment

The game already includes CTF-only bot-versus-bot lane clearing, but explicitly excluded human seat 0. Extend a **friendly escort** in Solo CTF only:
- When the human is within 115 units, facing toward the nearby escort (8–96 units forward) and laterally within 70, the escort checks physical side clearance 48 units to either side.
- It uses standard steering to step sideways until it is at least about 48 units off the approach axis; it then **waits** off to the side until the human has passed.
- Keep original actor collision, maze walls, pilot/tank movement, fire rates, damage, hitboxes, bot targeting, flags, team identification, and respawn rules. Never teleport or phase.
- The special case applies only to an actual allied `escort` CTF decision, local Solo human alive, and physically reachable side space. No changes to scored FFA/TDM, Survival, non-CTF bots or LAN authority.
- Both browser and embedded Android `game.js` are mirrored, with original versions preserved by branch ancestry.

## Required QA and acceptance

1. Exact-source browser and Android mirror checks and all preexisting 12 attacker-profile matches.
2. Seed 102 must show **at least one** scripted profile move closer than 680 world units to the opposing flag (previous closest 721–773) without changing physics or creating invalid states. Test failure is evidence to reject or rework this prototype, not justify cheating.
3. Existing CTF bots/captures, Forward Bays 300-seed, Quick Play, saves and UI snapshot tests must remain green.
4. Review natural CTF matches for regressions: defender's ability to intercept, Cyan escort's support, idle movement, accidental lane thrashing and persistent body blocks. Bot target decision may change as expected; no shot damage/time knobs.
5. Physical Android owner comfort test before acceptance. Same-Wi-Fi LAN remains untested. Stable `main`, approved P-03 pilot and preview v0.9.65 untouched.

Do **not** merge to `main` or build a production-signed release as a consequence of a green scripted test alone.

## First A/B candidate failed its real-game gate — diagnosis preserved

[Run 41509680268 FAILED the deliberately strict seed-102 progress assertion](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41509680268); browser and Android source parity and objective rule checks had passed, but the attacker remained behind the escort. The failure is **not accepted** as an implementation success and did not reach the later full regression steps. The next [instrumented run 41510003761](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41510003761) was likewise rejected at the same assertion and recorded the actual cause: escort at (305.9,594.0) when human stopped (263.9,595.1), or at (351.9,594.0) when the human stopped (318.8,595). Both bot-side 48-unit lateral probes were blocked by physical maze walls, so a strictly side-only yield never activated. The escort's decision was `escort`, not enemy interception, and the current `ctfHumanYieldSide` stayed zero. This disproved the initial side-pocket hypothesis for the particular narrow corridor.

**Second candidate:** in addition to safe lateral yielding when a pocket exists, a blocked-side friendly escort now tries to advance 36 units forward along the human's approach heading when the proposed position is physically clear of walls and live actors. It moves using ordinary bot steering and speed, no teleport/phasing. If neither side nor forward is clear, the original collision remains enforced rather than silently bypassed. The same strict seed-102 movement gate, twelve contested real-match cases and complete regressions must be rerun. First version of this addition is preserved in gameplay commits `18e2a74` and `4688e20` (web/Android mirror respectively). No changes have been merged to main or distributed as APK.

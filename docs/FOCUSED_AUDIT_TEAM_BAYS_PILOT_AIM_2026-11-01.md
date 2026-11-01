# Sector Rebound — Focused Audit: Team Deployment, Vehicle Placement, Pilot Aim Fairness and UI Overlap

Date: 2026-11-01. Source examined: owner-hand-test CTF preview branch `test/ctf-overall-android-apk-2026-11-01`. **This is a review and proposed acceptance plan only; gameplay is unchanged.** Source baseline with pinned AOSP upgrade-compatible 200003 preview signer is preserved.

## Owner physical Android feedback

- Current CTF is enjoyable, but vehicles can feel crowded or unevenly organized; check overlapping actors, parked vehicles, controls, flag markers and UI.
- On-foot pilot-vs-pilot sidearm duels feel too exacting on a phone.
- Bots seem to acquire/aim at the player outside their visible camera field.
- Team modes should stage and respawn from their own recognizable Forward Bays; FFA should remain spatially distributed.

## Confirmed current implementation (code inspection, not claims of physical QA)

1. `web/game.js` initial match positions: `startingPosition()` uses six general-purpose maze cell locations. `initialState()` plans/team-places Forward Bays **only** if `config.forwardBayExercise` is set. Current CTF and Forward Bay exercise enable this explicitly; regular `scored_tdm` and `survival_teams` do not. Starting positions use `i%2` for Blue/Coral team only when bays are enabled, and a two-slot wraparound; >2 same-team participants risk duplicate spawn slot centers.
2. `tryCqcRespawn()` enumerates every grid cell and passes them to `SectorScored.chooseSafeScoreSpawn()`, which filters nearby actors, bullets and enemy sightlines, but **does not require the candidate to be near its own Forward Bay**. CTF pilot deaths use this same scored respawn mechanism; thus initial CTF deploys at the bay but later may respawn anywhere safe. This merits an explicit player-facing base/respawn design.
3. `spawnVehicles()` places one occupied tank per actor, then three spare vehicles, one initially searched near Cyan's first starting position, the remainder map-wide and optionally balanced for corridor-distance access. `initialState()` moves two parked spares to the two Forward Bays only in the opt-in exercise. `deployVehicle()` adds replacements in shuffled cells at least ~90 from other active vehicles and ~180 from living actors; it is not team-territory-aware. Normal tank respawns use `vehicleSite()` near last position, subject to collision checks.
4. `botInput()` selects actual enemy positions as navigation/combat targets. It fires when aiming within a skill-dependent broad cone (~0.33 radians on normal) and with maze line-of-sight at world distance below 385. **No check restricts target to the human's visible camera footprint.** Line-of-sight does respect walls. A bot can shoot at a human outside the viewport, depending on phone aspect/zoom. Bot accuracy is not literally guaranteed, but acquisition/rotational awareness can feel perfect.
5. `tankMove()`: local solo human on-foot aim turns up to 6.5 rad/s; FIRE drag supports independent aim vector, no near-target aim assistance currently. Pilot target collision radius is 14 normally, 17.5 for scored sidearm. `cameraZoom()` uses on-foot 1.07 vs tank 0.82 and mech 0.77, substantially less world visible vertically on foot.
6. Existing `forward-bays.js` plans deterministic, connected, two-entrance strongpoints. Existing Forward Bay browser QA examined 300 generated maze layouts. That result should **not** be misrepresented as proof that all-team-mode spawn distances, all pilot seats, physical phone controls, and every vehicle parking arrangement are already accepted.

## Recommended development sequence — isolated changes, tests after each milestone

### A. Spatial/overlap audit first (no combat changes)

Write a deterministic 100–300-seed simulation per maze size and mode to log exact actor and garage/bay/flag/vehicle positions at time zero, 30s, after ejection, after vehicle recovery, after KO and after respawn. Test:
- Live actor vs actor clearance, parked vehicle entry footprints, vehicles vs walls/flag pedestals, HUD vs control overlap at 740x360, 960x540, narrow landscape and varying DPI.
- Navigation lane clearance from each Forward Bay entrance; runner/defender collision congestion; any spawn inside another actor.
- Corridor-distance (not just Euclidean) to nearest usable spare for Blue and Coral across many generated seeds.
- Preserve collision truth; parked vehicles remain non-solid until entered; no teleporting or invisibility to paper over defects.

### B. Universal team Forward Bays

Make `teamMode==='teams'` and `teamMode==='coop'` eligible for Forward Bay plan after ensuring team assignment reflects actual human/bot sides and map/player counts. Apply to Team Survival, scored TDM, CTF, and explicitly selected Custom team matches, not FFA, CQC, or solo survival. Design:
- Team staging and respawn at multiple distinct clear slots **in/near its own bay**, facing safe outward directions; spawn protected temporarily, but no damage immunity while actively shooting.
- Safe fallback within team region if flag/base is contested, no spawn-in-place against camping attackers; do not silently spawn across the full opponent territory.
- Validate enough distinct slots for 1–5+ actors with no duplicate live centers or impossible bay entrance positions.
- In LAN, host owns team/base selection and authoritative spawns; guest sees mirrored basis. Keep existing CTF bot roles.
- Do not alter scoring, first-to-three, tank pace, or weapons to solve spawn geometry.

### C. Structured fair vehicle system

- One starting vehicle per actual driver where mode rules require it.
- A clearly marked recoverable spare near **each** team Forward Bay (fair corridor distance to garages), plus explicitly **neutral** spare(s) in contested central territory; no random vehicle dropped onto flags or active spawn lanes.
- Avoid clustering, duplicate placement, and inaccessible garage locations; when replenishing, choose the intended category (team bay vs neutral) and check occupancy and bullets.
- Use a separate FFA distribution policy prioritizing equal distance and exploration, not fixed team bases.
- Audit vehicle availability and mech/tank allocation for balance rather than equal counts alone.

### D. Pilot aim and AI perception — baseline, then small A/B changes

Separate **bot awareness**, **human aiming friction**, and **damage/collision balance**. Do not change all three at once.
1. Audit bot line-of-sight acquisition and shots from outside the pilot's rendered camera. Measure distance to target, camera visibility, time-to-first-shot, hit rate by bot skill and map size, and how often humans are hit while an unseen bot is firing.
2. Prototype non-cheating bot perception with shorter detection when engaging human pilots, finite reaction/turn commitment and last-known positions rather than continuous perfect tracking of unseen humans. Preserve walls, bot-versus-bot gameplay and objective awareness.
3. Then prototype **optional, very light pilot-only soft aim assist** (initial A/B proposal: target visible on-screen, enemy, actual LOS, nearby 160–220 world units, within about 4–6 degrees of the player's current manually chosen firing direction). Limit angular adjustment smoothly; no snap, homing bullet, autofire, walls, offscreen target acquisition or tank/mech assist. Measure pilot hit rates, accidental target selection and perceived fairness against unchanged AI. Consider none/low settings and symmetrical human support for future LAN.
4. Do not increase bullet damage or global hitboxes simply to fix touch aiming. Current larger scored pilot sidearm radius 17.5 already gives some forgiveness; verify what is actually difficult on physical screens.
5. Evaluate optional modest on-foot camera pullback **separately** after the aiming/perception tests to avoid changing the silhouette/feel and ability to aim without evidence.

### E. UI / polish pass after geometry and combat decision

Check simulated HUD/control geometry at 740x360, 960x540, short height and tall landscape ratios, plus physical touch zone screenshots. No game mode, minimap, score strip, interaction buttons or joystick/fire control may overlap or obscure meaningful combat/bay cues. Do not treat an image-generation concept as a screenshot of the game. Maintain tactical identity and pilot/vehicle readability.

## Acceptance and release rules

- Targeted Chromium + Node contracts after each meaningful change; real full match/seed tests and browser regression afterwards; Android/Web asset byte parity.
- Full visual and Android build QA, then a **same-signer** preview using actual installed Preview 100061's public AOSP test certificate SHA256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`, the same `com.playereden.ricochetrumble.preview` package and monotonically increasing Android version code **greater than 200003**; never demand reinstall.
- No merge into stable `main`, mutation of prior passing CTF branches, real Play signing release or 2-phone LAN acceptance until distinct evidence.
- Treat current device feedback as the start of a focused audit, not proof of a specific mechanical fix.

Next practical task: generate a diagnostic spawn/garage/respawn seed-matrix and visible-target/AI shot logs, analyze it, then implement A/B changes only where measured evidence and the owner's play feedback align.

# Vehicle ricochet tempo — controlled balance experiment

**Source:** User's Tank Trouble-inspired feedback, 2026-10-28. The desired fantasy is *angle your cannon, shoot into a maze, let ricochets work while you reposition, and treat active shells as hazards rather than outrunning them*. This is a design principle, **not a request to copy Tank Trouble assets or code**.

**Prototype status:** isolated `tuning/vehicle-ricochet-tempo-v0930` based on exact existing v0.9.29 scored vehicle FFA source. **No public APK, no merge, no owner phone verdict** at this point.

## Verified current mechanics

From `web/game.js`:
- Original player tank forward/strafe movement target **222 world units/s**, AI **178**; mech is **0.76×** these speeds.
- Tank shell speed **415 world units/s**, 2.55-second shell lifespan, default four in-flight projectile slots, minimum .36-second firing interval, maximum five wall bounces, and returning shots can hit their shooter after 0.38s and at least one bounce.
- Both tanks and mechs currently rotate their facing toward the move-stick direction up to **12 rad/s (~688°/s)**. A tank cannot presently freely rotate its barrel on the spot from a stationary stick; be careful making rotation too slow without solving intentional stationary aiming.

Tank shells already exceed top tank speed, but only by **1.87×**. Current tank crosses a 132-unit grid cell in ~0.59 sec at full velocity, while its shell crosses in ~0.32 sec.

A relevant inspiration from Tank Trouble is limited active shots that keep bouncing and may harm the shooter; **do not blindly equate its exact timing values to ours**.

## First single-variable-family A/B

**Only when `matchModeId==='scored_ffa'` and an actor is in a vehicle:**

| Variable | Baseline v0.9.29 | Experiment | Reason |
|---|---:|---:|---|
| Player tank top move target | 222 | **185** (-16.7%) | Position deliberately before firing |
| Bot tank top move target | 178 | **152** (-14.6%) | Keep AI/players closer in relative pacing |
| All vehicle turn caps | 12 rad/s (~688°/s) | **5.5 rad/s (~315°/s)** | Reduce snap-turn and preserve aimed ricochets |
| Mech movement | 0.76 of base | **still 0.76 of base** | Keep relative vehicle identities |
| Tank shell velocity | 415 | **415**, untouched | Retain readable trajectories |
| Shell life | 2.55s | **2.55s**, untouched | Avoid introducing a larger bullet hazard field simultaneously |
| Active shells / cooldown | 4 / .36s | **unchanged** | Test speed & movement first |
| Own ricochet vulnerability | after >.38s and bounce | **unchanged** | Returning shots remain dangerous |
| CQC pilot, normal Survival, LAN host, on-foot pilots | as accepted | **unchanged** | Avoid changing unrelated modes |

Ratio shell:tank increases **1.87× → 2.24×**. Approximate full-speed tank 132-unit cell traversal increases **0.59s → 0.71s**. This does not invent an inertia mechanic or boost bullet damage.

## Hard gameplay questions before broadening

- Can a tank **aim deliberately while stopped**? Current facing turns only while joystick movement input exists. Slowing turn could make accurate angular shots *harder* until we offer stationary turn-in-place or an independent aim gesture. **Test this explicitly** before rolling speed changes into all modes.
- Is 10 *true pilot* KOs in 4 minutes too ambitious with vehicle armor and slower movement? Measure time-to-contact, armor hits, actual pilot KO rate and draw frequency across 50+ organic bot games before tuning score/time.
- Are reflection paths readable on small vs standard/large mazes? Test 300 seeded maps plus bounded ricochet paths, self-hit frequency and no wall clipping.
- The new unit test checks AI and player movement rate, turn cap, shell speed/life/cap/cooldown, owner-bounce danger code and unchanged Survival/CQC behavior. Node and Chromium/Android full CI required for actual APK.

**Next step if physical play feels better:** use the same consistent vehicle movement design across Survival/FFA/TDM after explicit signoff, then separately evaluate shell lifespan/cap and optional "hold to turn in place" aiming controls. Keep originals for rollback. Do **not** declare v0.9.29 itself broken based on a design hypothesis.

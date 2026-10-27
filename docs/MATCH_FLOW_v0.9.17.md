# Sector Rebound v0.9.17 — Match Flow, Combat Readability & First-Play QA

## Player direction
Continue stabilization while deferring real Android audio and two-phone Wi-Fi playtests. Focus on **match pacing, combat readability, and a lightweight first-match introduction**, not new game modes or stronger vehicles.

## Shipped changes
1. **First-play field coach.** One short, nonblocking FIELDGRID label appears on the first solo match to explain moving-to-aim and holding FIRE. If that pilot exits or ejects, it explains finding and boarding a replacement. The first collected supply explains its temporary timer. These prompts appear only within that first guided solo session. The introductory hint's completion is stored locally as `rr-coach-v0917`. All prompts auto-dismiss; none captures touches, alters movement, or pauses play.
2. **Projectile capacity clarity.** The bottom fire HUD explicitly distinguishes `4/4 READY` from `0/4 IN FLIGHT`. The count is simultaneous projectiles, **not** stored ammunition. The low-armor status chip receives a more visible but restrained warning border.
3. **Quiet combat pacing.** A single `CONTACT SEARCH · CHECK THE RADAR` reminder appears after 28 seconds of solo play with no valid armor/pilot hits, if enemies exist. Successful hits restart the quiet counter. It does **not** reveal enemy locations, accelerate bots, force a countdown, or change LAN messages. No spam or repeated tip within a match.
4. **No speculative gameplay rebalancing.** Weapon caps, pilot/tank/mech health and handling, bot aim/pace, camera, audio, original maze mechanics, and host/guest network protocol are unchanged from v0.9.16.

## 30-second diagnostic audit
The existing 18 fixed-seed scenarios have been extended from 15 to **30 seconds** per scenario across small, standard and large arenas, rotating bot difficulty. The stationary human is intentionally unrealistic, and the report **is not a human engagement or win-rate study**.

The longer test revealed one apparent 7.38-second stationary bot near another tank. The diagnostic initially labeled it a navigation stall, but inspecting the precise locations revealed a close-range duel. We corrected the instrumentation to separate:
- **Actual navigation stalls:** near-zero movement when *not* in visible close combat
- **Close-duel holding:** low motion while engaging an opponent under 115 world units away with clear line of sight

With that distinction the last diagnostics reported **0.02 seconds** maximum true navigation stall; the observed close-contact holding remains visible as `closeDuelSeconds` in each scenario. The brief experimental steering change was reverted to v0.9.16's tested behavior instead of solving the wrong problem.

In the sampled 30-second windows none of the 18 simulated matches fully completed; several produced kills. This does not establish a real match-length average, and we should continue collecting data before altering time limits or damage.

## Test/QA gates
- Existing gameplay regression suite, procedural generation, bot navigation, pickup behavior, actor separation, after-action UI, and LAN state model
- New tests: introductory guidance visible and timed, projectile capacity text changes, nonintrusive radar reminder shown only once
- Browser vs Android game sources remain byte-identical
- Real Chromium screenshot QA at 740×360, 915×412 and 1280×720
- New **context-coach screenshot** at all three sizes; coach must be fully within viewport
- Fullscreen and menu overflow checks retained; Android debug APK built by GitHub Actions
- Physical two-phone testing, Android audio, and longer human playtesting remain pending and are not claimed verified.

## Checkpoint
Branch: `dev/sector-rebound-match-flow-v0917`
Rollback: `dev/sector-rebound-combat-intelligence-v0916`
Android versionCode: 34, versionName `0.9.17-match-readability`
QA output: `sector-rebound-v0.9.17-pacing-qa`, `sector-rebound-v0.9.17-visual-before-after`, `sector-rebound-v0.9.17-debug-apk`.

## Suggested next measured improvements
Measure match completion and restart rates in a small number of **full active human play sessions**, solo first, before considering a match timer. Check whether the IN FLIGHT meter and the first-match hints reduce player confusion. Keep audio and host/guest QA queued until the owner has two phones available.

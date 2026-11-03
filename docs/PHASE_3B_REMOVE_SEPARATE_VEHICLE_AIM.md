# Sector Rebound Phase 3B — Remove separate vehicle AIM pad (owner direction, 2026-10-31)

**Owner feedback:** "I don't think we need the whole aim function thing now that we actually got the movement/rotating down good." This is scoped to the third on-screen **vehicle AIM thumbstick**, not to a dismounted pilot's distinct FIRE-drag function.

## Decision and scope
- Tanks and mechs in scored FFA, TDM, Custom scored, Survival use **left MOVE joystick for steering**, **right FIRE button for shooting**. The previously approved Solo-tank center pivot stays, and the scored tank angular cap stays at **2.6 rad/s** (FFA/TDM speed 166 human / 136 bot). No separate slower 1.8rad/s vehicle AIM control or third thumb region.
- Remove the AIM button markup, its responsive-layout CSS, device touch event wiring, aim input vector path for vehicles, obsolete HUD labels, and inaccurate Help/first-time tips. The simpler two-control layout automatically falls back to existing original comfortable MOVE and FIRE sizes.
- **Keep pilot FIRE-drag** for CQC and dismounted pilot situations; that is a distinct mobility/precision feature. LAN input normalization, bot behavior, ricochet projectiles, operator scores, ARMOR / PILOT damage FX, sound, vehicle hitboxes, team assignment and user profiles remain unchanged.
- Use a new once-only scored control briefing key `rr-coach-scored-vehicle-v2` so even players who saw the retired AIM instruction receive the new **MOVE TO STEER · TAP FIRE TO SHOOT** tip once; previous stored preferences and Dossier remain intact.

## Real test contract
- Headless real engine `tankMove()`: 90° scored tank joystick pivot around exact center at the retained 2.6rad/s cap, without shooting; reject legacy vehicle independent aim vectors; FIRE still sends shots; TDM and mech steer normally, pilot FIRE-drag still works.
- Real Chromium mobile layouts: no extra AIM target; joystick and FIRE touch geometry kept distinct at 740×360, 915×412 and 1280×720. Actual pointer drag produces a MOVE vector without firing; releasing clears input. Preserve CQC and scored FFA/TDM actual combat/After Action results.
- Fast test, full Chromium/Android QA, signing/package/asset parity on the exact commit. Keep build experimental until owner phone review.

## Rollback
- [Pre-removal signed-preview source checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100006-pre-aim-pad-removal), commit `b4372557e1fa174b8b71374e781bbf8dc9b73bc2`.
- [Last owner-accepted armor-impact checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100005-armor-accepted), commit `990968eea5c2d17503319b4fc043d739bcfc4a67`.

**Phone acceptance pending:** pivot 90°/180°, precise bank shots using left movement direction, FIRE while moving, mech cornering, pilot ejection and FIRE-drag. If joystick-only steering sacrifices bank-shot precision, adjust alignment/deadzone narrowly rather than silently re-adding a third control.

**Stable main gameplay remains unmerged**, draft PR #85 integration candidate. This is not a Google Play release.

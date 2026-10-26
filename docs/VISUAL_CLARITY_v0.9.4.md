# Ricochet Rumble — FIELDGRID v0.9.4 visual and mobile readability audit

## Source
- Based on `dev/fieldgrid-visual` v0.9.3 and an actual Android landscape screenshot from a physical device (1536 × 674).
- Changes are in **canvas/CSS/HTML code**, not generated artwork or screenshot overlays.

## Findings and repairs
1. **Interruptive banner:** bot damage/status updates used a 320×44 center-anchored block. Moved to a compact, upper-left event tag. Bot life-loss messaging is visually quieter than urgent deployment events.
2. **Radar clipping:** a vehicle deployment pulse near the world boundary could visually escape the minimap, as visible in the screenshot. Added actual canvas clipping before drawing minimap decorations and rings.
3. **Mech silhouette:** the first overhead mech looked like a colored rectangle. Redrawn with physically separated paired legs and arms, a central cockpit, and a forward weapon. No gameplay collision size changed.
4. **Projectile silhouettes:** pilot sidearm shots are deliberately thinner with low bloom; tank rounds remain prominent; mech rounds have a larger outlined halo. Enemy/team color remains encoded in shot trails.
5. **On-foot status:** text now reads `ON FOOT · FAST + ARMED` to express the intended pilot role, rather than implying the only viable action is finding a tank.
6. **Help correctness:** removed old description claiming every hit removes a life. Armor is depleted first; pilot hits on foot remove lives. Help calls out pilot speed, small size, and sidearm.
7. **Thumb UI:** replaced the decorative joystick star (could look like an ability icon) with a neutral dot; slightly reduced Fire button glare while preserving its hit area.

## Gameplay balance intentionally preserved
- Player starts inside a 3-armor tank for instant action; an on-foot start is not an extra menu option.
- A human pilot has nominal speed 268 versus tank 222 (~20.7% quicker), movement radius 10 versus 21 for a tank, and hit radius 14 versus 26 for a vehicle. Both still suffer solid-wall collision.
- Pilots remain able to damage tank/mech armor with a non-ricocheting sidearm; a destroyed vehicle ejects its surviving pilot.
- Mechs keep 4 armor, reduced movement speed, limited shells and slower firing.

## Verification
- `node tests/smoke.mjs` including v0.9.4 assertions for pilot-versus-vehicle combat and HUD/radar behavior.
- Browser landscape checks at 740×360, 915×412, 1280×720 and 1536×674; no JavaScript errors or document scroll.
- Screenshot comparisons using an identical fixed arena seed, plus forced proximity/readability states for pilot and mech.
- Android assembly and APK content verification are tracked separately. Real Android two-device networking and performance remain unverified.

## Remaining priorities
- Combat contrast in motion (bright projectile particles versus walls, dim devices).
- Two-phone co-op/FFA device QA, camera clarity and match duration.
- Pilot interaction prompt layering when pilot and parked vehicle overlap.
- Consider viewport aspect-ratio adjustments *only* after measuring actual safe thumb reach on devices.
# Pilot Survival — experimental slice (v0.7.0)

Branch: `dev/pilot-survival`. Main remains the known-good Classic Rumble 0.6.3 line.

## Core rules

- Pilot has **two personal lives**. On-foot enemy projectile hits cost a life and respawn the pilot on foot.
- Vehicles have **three independent armor points**. A vehicle hit consumes armor but does **not** consume a pilot life.
- Vehicle destruction **ejects** the pilot, with 1.35 seconds of protection. Shooting cancels this protection.
- Empty vehicles are visible in the world and marked on the minimap. Press **ENTER** within interaction range; press **EXIT TANK** to abandon one. Keyboard shortcut: **E**.
- On foot, movement is faster, the collision radius is smaller and the sidearm fires short-lived, non-ricocheting rounds. Tank shells ricochet as in Classic.
- Abandoned tanks persist. Wrecked tanks are available again after 9 seconds.
- One nearby vehicle is intentionally placed at the starting location to avoid frustrating first-time searches.

## Scope boundaries

- **Pilot Survival is solo-only in this slice**. Current same-Wi-Fi Host/Join still starts Classic. This prevents a half-implemented vehicle protocol from affecting the multiplayer foundation.
- Existing Classic modes, bullet caps, team options, mazes, HUD/controls, audio and old smoke regressions are retained.
- Future vehicle types should be data driven and may have different size, seats, guns and terrain restrictions.

## Acceptance and known unknowns

- Tests: Classic suite, entering/exiting, armor absorbing hits, pilot ejection, on-foot damage, sidearm, rematch mode and Classic isolation.
- Browser screenshots tested at 740×360, 915×412, and 1280×720. No scroll overflow or uncaught JavaScript errors.
- **Not yet physically tested on Android**, nor benchmarked for realistic mixed pilot/bot fight durations.
- Planned next: bot decisions regarding vehicles, player-vs-player Pilot Survival state authority, polish, two-player playtests, vehicle roster prototype.
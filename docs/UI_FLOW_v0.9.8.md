# Sector Rebound v0.9.8 — UI & Flow Quality Pass

## Scope
- Preserves proven arena art, procedural map generation, pilot/tank/mech combat balance, team logic and LAN protocol.
- Reworks UI toward concise FIELDGRID training instruments: fewer decorative glyphs, consistent rectangle/panel/border system, more deliberate type hierarchy, compact contextual help, and practical pause actions.
- Unoccupied vehicles are training projections: non-solid to pilots, occupied vehicles, bots and projectiles. They become physical when entered. No additional mode or menu switch. Destroyed wrecks stay cosmetic.

## Regression criteria
1. A living on-foot player can walk through an unoccupied tank/mech.
2. A driven tank can also pass through unoccupied vehicles; no bot-specific exception.
3. Bullets pass through parked projections; occupied vehicles still take damage.
4. Maze wall collisions and actor-on-actor collisions remain solid.
5. Nearby interaction still transfers vehicle ownership; and ejection still preserves pilot lives.
6. Solo, settings, pause/help, and LAN entry stay functional on 740×360 and other landscape widths.

## Outstanding
Physical device readability and thumb reach; two-phone host/guest test and on-device frame rate; Android debug key means users may need to uninstall before upgrading.
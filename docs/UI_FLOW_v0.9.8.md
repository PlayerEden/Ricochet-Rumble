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

## v0.9.8.1 corrective QA (October 26, 2026)
- **Entry safety:** unoccupied tank/mech remains intangible for movement and bullets. Boarding now checks that no other living actor is standing on its deployment point. The vehicle stays available and a short message explains why ENTER could not activate.
- **Mobile typography:** added Android's offline `sans-serif-condensed` fallback so FIELDGRID headings remain compact even without an installed Roboto Condensed font. Body font continues to favor readable Roboto/system sans.
- **Small landscape:** keep the HELP caption on one line, with tighter eyebrow spacing at 390px height and below.
- **New smoke coverage:** checks attempted overlapping boarding, successful boarding once clear, identical web/Android assets, and the offline font fallback. Game rules, arena art and network messages are otherwise unchanged.
- **Verification:** gameplay smoke tests, Android debug APK build, and artifact upload all PASSED on October 26, 2026 ([workflow run 40414962370](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40414962370)). Physical phone/thumb-reach and two-phone LAN testing remain outstanding.

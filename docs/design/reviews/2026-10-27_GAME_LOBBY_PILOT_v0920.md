# FIELDGRID — Game Lobby & Minimal Pilot Design Audit (v0.9.20)

**Status:** Experimental visual direction; not yet adopted as final shipping style.
**Parent branch:** `dev/sector-rebound-pilot-silhouette-v0919`
**Scope:** Main menu / true overhead on-foot sprite only. No progression or monetization UI is activated.

## Player feedback

- Previous home screen resembled a government training dashboard or administrative form, not a mobile game.
- The on-foot pilot was recognizable as a pilot only when zoomed: too many shoulder rectangles, reflective gun segments and a mechanically complex silhouette looked like a tiny robot or miniature tank.
- Desired: grounded/simple but intentionally designed, with a proper mobile game home screen, not AI-generated decorations.

## Reference learning (not copied)

- [Soul Knight's user-facing menu](https://soul-knight.fandom.com/wiki/Main_Menu) makes the path to gameplay obvious and keeps extra functions secondary.
- [War Robots hangar guide](https://warrobots.com/en/posts/401) centers combat hardware and the main **To Battle** action, instead of instructional prose.
- [Brawl Stars home screen screenshot archive](https://www.mobygames.com/game/119277/brawl-stars/screenshots/iphone/1246165/) illustrates foregrounding a featured playable identity, clear mode and prominent play control.

Lessons: **one strong visual subject, one primary CTA, secondary routes subordinate, game identity first, metadata second.** Avoid copying layouts, colors, icons or graphics from those properties.

## v0.9.20 home

- `SECTOR REBOUND` identity remains in the home header, never in the live combat HUD.
- On the left, a substantial hero preview drawn from **the real `drawTopTank` routine** (no standalone 3D render, external image, or promised feature). The stage maintains the industrial arena palette with subtle map lines.
- On the right: ready status, succinct phrase, **QUICK PLAY** primary button, then secondary **PLAY TOGETHER** and **MATCH SETTINGS**. The Help action is still available in the upper-right.
- Footer truthfully says LOCAL SIMULATION and NO ACCOUNT REQUIRED. It does not show fictional player currencies, rank, profile, or a locked shop.
- Existing `data-action` bindings, menu recovery, pause, settings, help, LAN flows, and Android back navigation remain the same.
- The main menu now uses a near-fullscreen lobby composition rather than a mid-screen terminal dialog. Non-home panels retain their previous behavior so the scope stays small.

## Minimal on-foot operator

Use the strict top-down camera. Character must read as **head > torso/arms > separate feet**, with no artificial miniaturized anatomy detail:
1. Two individually moving boots, each 10×7 world render units, with small highlights.
2. Dark compact torso with thin faction-color collar/vest line.
3. Two rounded shoulder/hand shapes, *not* long rectangular armored treads.
4. A forward round helmet with a single short bright visor mark.
5. Very short pistol that does not dominate the character silhouette.

No stats, collision geometry, movement speed, firing or ejection are changed; only `drawTopPilot` geometry and drawn details.

## Verification checklist

- 740×360 / 915×412 / 1280×720 actual Chromium menu screenshots and in-game pilot idle/walk snapshots.
- Menu layout fits without scroll or clipped buttons; Quick Play is comfortably tappable. Preview draws actual game unit.
- Menu → settings → menu, menu → help → menu, Quick Play, pause, after-action are all still functional.
- Pilot stride remains counter-stepping and feet stay visibly separated at normal zoom.
- Web assets mirror Android assets; standard smoke suite / 18 seeded diagnostics / Android SDK 36 debug APK and unsigned AAB build.
- No claims about two-phone Wi-Fi or physical-phone evaluation until performed.

## Future visual plan

Once menu/pilot are approved, integrate the actual Pilot Dossier profile and cosmetic icon selection into a genuine home shortcut. Do not place a dead SHOP, PROFILE, or HANGAR action before its corresponding system and save flow exist.

## Reversibility

All code changes belong on `dev/sector-rebound-lobby-pilot-v0920`, while the v0.9.19 branch and its [public APK preview](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.19-pilot-preview) remain available. Keep PR draft until owner reviews screenshots and an Android install.

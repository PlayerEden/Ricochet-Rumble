# Sector Rebound -- Pilot Lab B: strict overhead correction

**Created 2026-10-27.** Owner rejected Lab A after actual Android testing: "It's like you keep trying to make it like 2.5d ... looks like it's low crawling ... It's straight top down. ... basic ... head and shoulders ... go research." This is direct visual direction, NOT a request for new camera perspective.

## References researched (study, do not copy)
- [Camera-perspective explanation](https://www.missroot.com/learn/camera-views/): overhead shows tops of heads; 3/4 presents forward faces and more vertical height.
- [Hotline Miami top-down actual gameplay reference](https://www.newgamenetwork.com/article/737/hotline-miami-review/): orientation, small unit footprint, striking readability.
- [Police Stories screenshot](https://www.gamegrin.com/directory/game/police-stories/images): head/shoulder visibility and body suppression.
- [Door Kickers 2 gameplay screenshot](https://strategyandwargaming.com/2021/01/23/door-kickers-2-review-a-classic-in-the-making/): small overhead operator shape and compact weapon hold.
- [Animated overhead sprite pipeline](https://lpc.opengameart.org/content/animated-top-down-survivor-player): animation can be layered but must not force perspective mismatch. Reference only; no source art reused.

## Correction from Lab A
Lab A looked like a prone/low-crawling human or a turret because it extended rear-facing boots and a long vest horizontally toward -X while helmet/handgun protruded toward +X. The shape became a two- or three-part vehicle even with human words in its comments. The correct angle is **exactly 90 degrees down**.

## Lab B implementation contract
- Top of round helmet occupies the visual center; no upright profile, face, side-on visor or implied camera tilt.
- Two shoulder pads directly to either side of the helmet; a small short vest barely visible underneath, not a long horizontal chest/hips/legs.
- No drawn legs in idle: only subtle shoulder wiggle from existing stride data. This keeps the footprint human at `1.07` pilot camera.
- Tiny handheld sidearm offset by the lower hand. No straight centerline barrel through the helmet. Team paint limited to small shoulder panels.
- Preserve FIELDGRID three-value style, unchanged top-down actor rotation, controls/hitboxes, shot location/hit registration, zoom and all game mode logic.
- Keep softened on-foot locator, label and triangle inherited from Lab A, pending real phone judgment.
- No portraits/cosmetics or externally licensed artwork copied.
- **Lab A kept intact** at [test release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.23-pilot-lab-a-test) and prototype branch. Lab B is a NEW isolated revision; main and PR #24 remain unchanged.

## QA
- Existing complete smoke regressions and byte-for-byte Android/Web JS parity.
- New unit drawing checks verify large circular helmet, two shoulder pads, no feet or long low-crawl silhouette, weapon offset, flash, finite geometry, balanced Canvas saves/restores and camera `1.07`.
- Real Chromium before/after at 740×360, 915×412 and 1280×720, with on-foot walking, direction and fire; baseline dev5. Debug APK must be compiled and release provenance recorded.
- This corrects rendering only. It is **not approved** until owner sees actual normal-size phone screenshot/installs and responds.

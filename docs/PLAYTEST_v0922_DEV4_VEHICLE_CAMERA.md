# Sector Rebound — v0.9.22-dev4 vehicle camera phone test

**Status:** Automated dev4 QA underway at time this checklist was created. A build passing CI is not the same as acceptance on the user's actual Android phone.

**Owner's verified preference (2026-10-27):** The pilot's dev3 zoom now feels good. Move the tank and mech cameras farther back to show more tactical surroundings, **do not zoom the pilot out again**, especially since the future Close Quarters mode is on-foot only.

## Build identification
- Code: draft [PR #24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24), branch `dev/sector-rebound-quick-play-v0922`. Keep PR in draft pending real-phone review.
- Camera: pilot **1.07 (unchanged)**, tank **0.87** (was 0.98), mech **0.82** (was 0.94).
- Test after actual full QA: obtain the release tagged `v0.9.22-dev4-vehicle-camera-test`. Compare visually against proven [v0.9.22-dev3 camera APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev3-camera-test). Never mistake a dev3 APK for a dev4 APK.
- These are *debug* Android builds; a different debug signing certificate may prevent in-place updates. **Uninstalling deletes app data**. Back up/accept any loss before replacing a previous build.

## Hands-on test plan
- [ ] **Pilot unchanged:** Eject at the beginning of a round, take screenshot, compare to last screenshot. On-foot camera distance should be dev3-equivalent (1.07); no shrinking of pilot view in solo mode. Touch/joystick/fire and compass remain the same.
- [ ] **Tank wider:** Get into tank and play a full round. Compared to dev3, see meaningfully more field to the sides and ahead, while enemies and ricocheting shots are still large/readable enough.
- [ ] **Mech widest:** Switch to mech; see even more area than tank. Compare player outline to bullets; assess whether mech is now too far away for aim and dodge.
- [ ] **Transitions:** Enter/exit tank and mech and confirm camera eases without snap, oscillation, or temporarily misplacing action buttons.
- [ ] **Perimeter:** Use a SMALL map, drive to the walls and all four corners; inspect for unrendered black gutters, exposed world edges, missing tiles or false terrain collisions.
- [ ] **Other sizes:** Try STANDARD and LARGE arenas; camera must still follow without jitter or odd clipping.
- [ ] **Procedural battles:** Finish several games and use NEXT MATCH; verify that widened vehicle camera survives new seeds and does not alter the pilot view.
- [ ] **Performance:** Play 5 minutes with 3–4 bots; note frame drops, overheating, phone rotation and any controls that become unusable. The bigger view could draw more tile details.
- [ ] **Game feel:** Do you see more enemies/ricochets in time to react? Does the field now feel strategically spacious, or too distant?
- [ ] **Future CQC:** No special CQC mode is shipped in this build. Keep the pilot-specific camera for eventual pilot-only CQC mechanics. See the [mode bible](design/20_MATCH_MODES_BIBLE_DRAFT.md).

## Report template
```text
Build: v0.9.22-dev4 vehicle camera
Phone model / Android version:
Pilot zoom unchanged?:
Tank camera too close / good / too far:
Mech camera too close / good / too far:
Touch and enemy readability:
Small-map outer edges / gutters:
Camera transitions:
FPS / lag / heat:
Anything else:
Screenshot(s):
```

Document human findings in ChatGPT / [PR #24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24). Record deviations in [pilot art #26](https://github.com/PlayerEden/Ricochet-Rumble/issues/26) or [combat feel #27](https://github.com/PlayerEden/Ricochet-Rumble/issues/27) only if they belong there. Two-phone Wi-Fi LAN remains deferred until the owner can test it. Audio/music remains deferred.

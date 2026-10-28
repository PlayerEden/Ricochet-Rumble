# Sector Rebound — vehicle touch ergonomics v0.9.31

**Status:** DRAFT A/B control redesign for scored vehicle FFA only, based on existing v0.9.30 tactical AIM controls. **NOT in stable main.** User tested v0.9.30 on Android and said it was "not bad" but AIM felt cramped/out of place, tank rotation remained overly sensitive, and the tank might be slightly too fast. Specific request: research other mobile games' touch layouts and revise our buttons and vehicle handling thoughtfully. Preserve user-approved v0.9.28 pilot CQC aiming.

## External layout research and the decision

- Graham McAllister's *A Guide to iOS Twin Stick Shooter Usability* (Game Developer): `https://www.gamedeveloper.com/design/a-guide-to-ios-twin-stick-shooter-usability`. Typical successful mobile twin-stick shooters put movement left, aiming right; static vs dynamic placement, visible feedback, and the active joystick region significantly alter ergonomics.
- Apple's *Game controls* design guidance: `https://developer.apple.com/design/human-interface-guidelines/game-controls`. Controls should respect thumb reach and screen safe areas; action touch targets typically >=44x44pt.
- Google's *Android touch target size*: `https://support.google.com/accessibility/android/answer/7101858?hl=en`. Prefer interactive targets >=48dp, commonly with >=8dp spacing.
- Brawl Stars controls explanation: `https://brawlstars.fandom.com/wiki/Beginner%27s_Guide`. Left stick handles movement; right attack stick permits direction control before shooting on release. Unlike Brawl Stars, **Sector Rebound uses limited ricochet shells and deliberate fire**, so this prototype does not auto-fire on AIM release and does not add aim assistance or homing.
- GDevelop's *2D Twin Stick Shooter* example: `https://gdevelop.io/game-example/free/starting-twin-stick-shooter`. Independent mobile virtual joysticks for movement and shooting validate separate thumb axes as a familiar pattern; our control splits aim and shell launch for intentional bank shots.

**Root diagnosis from our v0.9.30 source:** Scored vehicle FFA showed a thin ~34-40px-tall AIM button **above** a large ~96px FIRE button in a vertical stack. AIM direction was calculated relative to the finger's initial landing point, so reaching around the cramped button and dragging could produce an inconsistent-feeling reference. Maximum vehicle turn rate remained **5.5rad/s ≈315°/s**.

## Test design (v0.9.31 draft)

- Only in **scored vehicle FFA when driving**: Reflow the right-hand controls **side by side** into a true large **~98-112px circular AIM pad** on the left, a separate **~64-76px FIRE** on the right, and ENTER/EXIT above FIRE. MOVE stays on opposite side. FIRE never shares the AIM touch pointer. Space between thumb pads is >=12 CSS pixels on normal viewports; on narrow screen each remains thumb-sized. An inner knob and crosshair show your thumb's aimed vector.
- AIM reference point is now the **fixed geometric pad center**, not the original down-event location. A deliberate **~17% radius dead zone** prevents tiny touch jitter from causing a direction change; once actively aiming, returning to the center retains the last vector instead of snapping to movement. Dragging outside the edge clamps the visual knob while keeping directional aim. Lifting or canceling resets pointer and visual knob; tank retains last actual heading.
- **Vehicle FFA human tank target speed 185→178** (~4% additional reduction), AI 152→146 in the same match, vehicle (tank/mech) max turning **5.5→3.6rad/s (315→206°/s)**. Mech retains its existing .76 relative speed factor. Pilot on-foot behavior, shell speed 415, shell life 2.55 seconds, four active shells, ricochet limits and scoring logic unchanged.
- User can now stand still, move, aim without firing, then tap FIRE. This mode has **no auto-aim, no release-to-shoot, no new damage or cooldown buffs**. Existing auto-fire preference follows prior behavior, if enabled.
- **No changes** to CQC pilot aiming, Survival/Team Survival physics, LAN host/guest, rendering, game progression, alternate left-hand layout, menu layout, default preferences and physical APK signature.

## Mandatory evidence before owner APK

- [x] Automated fast Node regression: unchanged 300 seeded maze checks, CQC/Survival, scoring, tank/mech/AI speed and turning, shooter/sidearm and shell stats, centered AIM pointer, releasing resets visual feedback, wrong pointer and jitter safety.
- [x] Chromium real GUI mode test with pointer down → direction drag → release; **AIM and FIRE rectangles must not overlap and must stay >=96px / >=64px at 740x360, 915x412, 1280x720**; HUD/top safe boundary, ENTER and reverse controls; no firing from AIM.
- [x] Full Chromium screenshots and Android debug APK + unsigned AAB both pass on one exact source SHA. Publish immutable test APK only when exact QA passes; no rebuild/resigning from source later, no manual phone QA assertion.
- [ ] Owner physical Android verdict on rotation feel, thumb reach and finger layout, especially whether holding AIM and tapping FIRE is natural, plus FFA 10-pilot-KO/4-minute pacing and on-foot transitions.

**Fallback:** [Original v0.9.30 tactical vehicle AIM Android APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.30-tactical-vehicle-aim-test), [v0.9.29 scored FFA](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.29-scored-vehicle-ffa-test), and [owner-approved v0.9.28 CQC](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.28-cqc-aim-feel-test) must remain available. DRAFT PR stack #41→#42→#44→#45→#46→#47→#48→this draft; do not merge out of sequence.

## Deferred questions

Test optional `aim on release`, adjustable turn-speed settings, floating right stick, and customizable control positions only after this simple familiar layout's real-hand feel is known. Avoid expensive customization menus while basic vehicle controls remain unsettled. A slow hull may encourage boring timeouts unless the 10-KO/4m match is separately balanced from measured play.

## Exact automated QA and Android owner test artifact — 2026-10-28

- **[Fast regression 40644655239 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40644655239)** including all existing 300-seed, CQC/Survival, scored FFA and vehicle turning/aiming checks. Updated tests include new physical fixed-center AIM vector/knob behavior, wrong-pointer cancellation, shot-free aim, true pilot KO integration and preservation of original shell physics.
- **[Full real Chromium + Android 40644655389 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40644655389)**: real mouse/touch AIM down→drag→release, visible knob, actual geometry at 740×360, 915×412, 1280×720, normal menu→real scored match→After Action→NEXT MATCH, paired Web/Android file parity, debug APK and unsigned AAB. **Exact gameplay/test SHA: `d7aab8330c3ff06ebf21fd402cee230a9620b05a`**. Subsequent documentation changes do not modify tested executable or QA source.
- **[v0.9.31 Vehicle Thumb Comfort Android test release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.31-vehicle-thumb-test)**, [direct original tested APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/download/v0.9.31-vehicle-thumb-test/sector-rebound-v0.9.31-vehicle-thumb-debug.apk), QA screenshot ZIP and SHA-256 manifest. Exact original debug APK copied **byte for byte** from passing CI; published without rebuild/resign via one-time [publisher 40645256585 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40645256585), followed by removal of one-use workflow.
- [Draft PR #49](https://github.com/PlayerEden/Ricochet-Rumble/pull/49) correctly based on draft stationary AIM PR #48, ahead 13 / behind 0, 9 focused files. **Stable main runtime v0.9.21 unchanged.**
- **Pending human verdict:** Owner has NOT tested v0.9.31 on a physical phone. Prior v0.9.30 verdict is source of proposed changes; do not mark v0.9.31 controls as user-approved until played. Confirm thumb comfort at real landscape dimensions, shell misfires, responsiveness, and vehicle KO/respawn pacing. No long-term 50+ natural match balance claim.

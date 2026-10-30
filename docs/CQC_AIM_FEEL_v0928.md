# Sector Rebound — CQC Dual-Thumb Aim & Hit Feel v0.9.28 Draft

**Why:** The owner physically played v0.9.27 and said aiming/killing feels excessively precise, and the pilot swings/rotates very quickly. Initial v0.9.27 feedback was positive overall. Avoid rebuilding the controls or making combat aim automatically.

**Current state:** Experimental v0.9.28 feel prototype based on [v0.9.27 gameplay PR #44](https://github.com/PlayerEden/Ricochet-Rumble/pull/44) (which itself remains DRAFT and depends on clean #41 + pure score #42). No merge to stable `main`.

## Diagnosis grounded in existing physics

- Before this change, `tankMove` oriented the player toward joystick movement every update, with max 12 rad/s (~688 degrees/s), even in on-foot CQC.
- Player on-foot move speed 268 world units/s, aiming completely through the left thumb. A 14-unit pilot center tolerance combined with small fast moving characters and one-hit weapons can feel pixel-perfect.
- Right thumb FIRE was binary press/hold, without independent aiming. This created overshooting and disallowed moving one direction while shooting another.

## Small reversible CQC-only pilot polish pass

1. **Right thumb FIRE drag to aim:** press/hold FIRE as before, then drag the same finger 14+ screen pixels in the desired direction (relative to press position). Pilot facing follows this independent vector while left-thumb move remains unchanged; fire continues during drag. Below 14px, slight movement jitter is ignored. On release, cancel, lost capture, menu or app blur, the aim state resets. Holding without dragging remains the previous joystick-facing behavior. Applies **only** to local player in CQC, not Survival and not LAN, tanks or mechs.
2. **Measured turn cap reduced to 6.5 rad/s (~372°/s),** down from 12 rad/s (~688°/s) for the local CQC human. This is a first playtest proposal; avoid applying slow turn to bots, vehicles or other game modes, and tune by natural hand feel.
3. **Slightly wider CQC-only sidearm impact tolerance,** pilot radius from 14 to 17.5 world units (25% increase). The exact same hit rule applies to AI pilots and the human; no homing, instant aim-snap, damage boosting, wall penetration or shield bypass. Sidearms in Survival, tank/mech projectile collision and wall physics remain unchanged.
4. HUD mini-caption now reads **HOLD · DRAG TO AIM** when in CQC. Help describes the touch scheme.

## QA

- Existing 300-seed procedural maps, tank/mech, Survival/Team Survival, Quick Play, CQC scored KO/respawn/time/results and canonical score mirror tests must continue to pass.
- New Node test checks turn cap, independent right-thumb heading while moving or stationary, bot/Survival rotation unchanged, 14-px aim jitter protection, other-pointer rejection, FIRE held + release reset, and fair CQC projectile collision tolerance.
- Real Chromium simulates physical mouse/pointer down, drag and release on the actual FIRE button, with gameplay controls and default CQC stage. Three phone landscape dimensions inspected; validate no menu or HUD overlap.
- Android debug APK + unsigned AAB required from **exact same CI-passed source**, then owner physical handset comparison with v0.9.27.
- Test both quick tap FIRE and hold-drag FIRE: shots must align with pilot facing, not teleport or redirect around walls. User should be able to walk one way and fire another without accidentally moving the joystick. Compare whether user can consistently hit moving bots; if drag feels awkward, consider a distinct optional dual-stick aim surface later instead of forcing it.
- Preserve debug test rollback [v0.9.27 known-good](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.27-cqc-scored-test). No Play signature, save migration or LAN claims.

**Non-goals:** auto-aim, aim lock, player-only unfair hitbox, changed vehicle handling, recoil spread, Google Play release, new mode. This is a pilot aiming ergonomics test.

## Exact verified QA + owner candidate (2026-10-28)

- **Fast regression [40636487876 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40636487876):** original 300 seeded procedural arenas, Survival and Team Survival, CQC 10 KO/respawn/draw, CQC human 6.5 rad/sec movement/aim, independent FIRE aim while walking/stationary, 14px jitter guard, wrong pointer rejection, fair 17.5 radius all CQC pilots, original Survival pilot 14, tank/mech and bot 12 rad/sec preserved.
- **Full browser + Android QA [40636487887 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40636487887):** actual Chromium FIRE-button pointerdown→drag→up test, UI at 740×360/915×412/1280×720, Quick Play and CQC real KO-to-win→NEXT MATCH→draw, debug APK and unsigned AAB. Source SHA **`d98f1f88f773b2cd53535f81a94290721adb0dac`**, subsequent documentation-only updates don't alter executable/test code.
- **[Immutable experimental v0.9.28 Android test release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.28-cqc-aim-feel-test)** includes [exact unchanged QA debug APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/download/v0.9.28-cqc-aim-feel-test/sector-rebound-v0.9.28-cqc-aim-debug.apk), screenshots/QA ZIP, SHA-256 hashes. One-off publisher [40637073675 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40637073675) copied the original passing Android APK without rebuilding or resigning, then the one-off workflow was deleted.
- Draft [PR #45](https://github.com/PlayerEden/Ricochet-Rumble/pull/45) now targets only its CQC source branch [#44](https://github.com/PlayerEden/Ricochet-Rumble/pull/44). **Keep both DRAFT**, do not merge into stable main before actual user evaluation. Existing [v0.9.27](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.27-cqc-scored-test) remains phone-tested rollback.
- **Unclosed human acceptance:** Does independent right FIRE thumb dragging actually feel more natural on the user's Android? Is pilot turning too slow now? Is the more generous CQC-only hit tolerance fun without making bots unfairly lethal? All real-world feel judgments remain pending.

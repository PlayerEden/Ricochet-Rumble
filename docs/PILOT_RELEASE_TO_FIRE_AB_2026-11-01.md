# Sector Rebound — Pilot FIRE Control A/B: HOLD vs DRAG / RELEASE
**Date:** 2026-11-01 (CI recorded in UTC 2026-11-02)
**Status:** isolated experimental source. No Android APK is issued and stable `main` is unchanged.

## Feedback and hypothesis

Owner reported that pilot-vs-pilot sidearm combat feels demanding on Android. Open-book comparison found that existing FIRE-drag begins **firing immediately when pressed** but only starts independently aiming once thumb movement passes 14 CSS pixels. Therefore the first projectile can leave before the player settles on the intended direction. We should test an alternate touch gesture **without changing accepted vehicle steering, bullet ricochets, AI navigation, scoring or LAN**.

## Opt-in A/B paths

**Control A — default HOLD:** Old FIRE button behavior stays unchanged, including automatic repeated shots while held (subject to cooldown), FIRE-drag steering, keyboard SPACE, and existing auto-fire preference.

**Control B — PILOT RELEASE TO FIRE (TEST):** A checkbox under existing Settings comfort controls, defaults **OFF** and saves under the unchanged `rr-options-v06` preference object. Works **only for the local on-foot pilot in solo matches**. Hold FIRE to preview the intended direction and steer the pilot, drag for fine direction, then lift to request **one** sidearm shot. If the thumb never moves beyond the established 14-pixel drag threshold, a quick tap simply shoots straight ahead. The pilot must rotate by the existing maximum **6.5 rad/s** turn cap to within 0.1 rad of the chosen aim, rather than teleporting or rotating the projectile. A shot request expires after 0.7 seconds if the operator cannot safely align/fire. A normal shot obeys shell capacity, sidearm cooldown, collision, shielding and the existing optional low aim assist.

**Safety and transparency:** Touch cancellation or lost pointer capture never fires; `releaseControls()` resets all queued shots on pause, app blur or menu changes. Match start and rematch reset old pending requests. Pilot loss/mode transitions abort pending shots. Keyboard Space still fires immediately in alternative mode; LAN both seats remain on existing FIRE-drag and host authority; vehicles fire on hold and still steer normally; auto-fire continues working outside the alternative local Solo on-foot case. The HUD fire caption changes to **DRAG / RELEASE** on-foot only when alternative is selected. FIRE's accessibility label describes this action. A short line shows proposed aim until the first wall and does not reveal hidden targets, lock on, change hitboxes, or fill the screen with another floating menu.

## Automated acceptance tests

`tests/pilot-release-aim-qa.mjs` uses **real Chromium pointerdown/move/up** and production `step(1/60)` physics, spanning 740×360 and 960×540, 3 seeds per viewport, and 24 fixture entries. Tests explicitly verify release never fires prematurely on press/drag, successful one-shot queue/cooldown after releasing, cancel and pause discard a pending request, old HOLD still fires immediately, keyboard Space still works, opt-in OFF by default and saved preference survives a reload. The test observes actual sidearm cooldown rather than requiring the bullet to remain in the arena after hitting a legitimate maze wall.

[Initial complete passing gameplay run 41367716172](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41367716172) at `2324cb6991066ec01a7f37dc3e88d4a671fb02f4` also includes previous 9 pilot AI fairness fixtures, route-fair vehicle tests, team Forward Bays, CTF objective bots / human flag theft, Quick Play and browser visual regression. The last HUD-label/accessibility refinement is a later source commit; it must pass its own entire CI run before being called fully verified.

## Physical owner acceptance still needed

On the actual Android phone, compare one CQC fight and one ejected-pilot fight in each setting. Check (a) hold feels familiar, (b) preview is visible but not cluttered, (c) release fires where pilot has visibly rotated, (d) fast taps do not become excessively delayed, (e) pushing past the edge of the FIRE touch circle still behaves predictably, (f) the menu stays readable at the device's landscape resolution. Device timing, actual subjective difficulty and 2-phone LAN have not been certified by browser tests.

## Rollback and signing requirements

Current isolated branch: `experiment/pilot-release-aim-preview-v1`. Prior passing AI reaction checkpoint: `experiment/pilot-ai-reaction-window-v1`, [CI 41364787523](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41364787523). Stable main and PR #85 are unmodified. Installed owner test preview remains `com.playereden.ricochetrumble.preview` versionCode **220001**. A future hands-on APK must keep the installed certificate SHA-256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc` and use a **strictly higher** versionCode; do not require uninstall.

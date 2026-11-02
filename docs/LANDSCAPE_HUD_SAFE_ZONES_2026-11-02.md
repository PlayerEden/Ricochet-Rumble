# Sector Rebound — Phase 2C: Landscape HUD Safe Zones

**Date:** 2026-11-02.  
**Branch:** `experiment/landscape-combat-hud-safe-zones-v1`.  
**Starting checkpoint / instant rollback:** `experiment/solo-bot-last-seen-pursuit-v1` at `3438a7a01778db8290b64526e42473201b2177e0`.  
**Stable main and installed v0.9.64 APK:** untouched.

## Source audit findings

1. **CTF clock and objective collided.** The live match countdown was positioned at top center around 49px; the CTF objective occupied the same center position around 47px, so both could show simultaneously.
2. **Power-up and scored clock collided.** The active power-up pill was positioned near the same vertical height and horizontal center as the scored clock. CTF status was also in that zone.
3. **Coach guidance and objective overlapped.** On short Android landscape screens, the contextual coach appeared about 72px from the top, interfering with the low CTF objective and power/timer labels.
4. **The corrected cooldown text wasn't visible where needed.** An earlier max-height 390px CSS rule hid the text weapon meter, leaving only non-verbal availability bars on common 320–360px-high landscape screens.

## Small scoped implementation

- The CTF objective text now **begins with the actual authoritative countdown** and the separate scored clock is hidden during CTF only. Scored FFA and TDM retain their existing clock position. This avoids duplicating the time or removing objective guidance.
- Power-up status takes a second vertical position when either the scored clock or CTF objective is visible. Coach guidance moves below the objective and below any active power-up pill.
- A temporary combat toast takes precedence over a coach hint, avoiding superimposed notifications. The coach continues after the toast expires, if its own timer remains active.
- Readable `READY / CYCLING / IN FLIGHT` meter text is kept on short landscape screens in a small font below FIRE, in addition to accessible descriptions and slot bars. No change to FIRE/joystick hit targets, camera, movement, pilot/vehicle shooting, or AI.
- Android embedded `game.js` and `style.css` are byte-identical to the website assets; parity is enforced in CI.

## Focused test

New real-Chromium `tests/landscape-hud-safe-zones-qa.mjs` measures element boxes and visible states under **six landscape viewports** (568×320, 640×300, 740×360, 915×412, 960×540, 1280×720), **seven combinations** (Solo pilot, scored timer, scored timer + power + coach, CTF objective, CTF + power + coach, CTF + toast + power, scored + toast), and **normal and left-handed controls**: **84 geometry fixtures**.

The browser test checks safe-area bounding boxes, no menu/score/time/CTF/power/coach/toast/control overlap, at least 80px touch control width, a visible textual shell meter and the single integrated CTF countdown.

The existing actual CTF simulation checks dynamic mission/flag transitions; the full release regression additionally covers combat, Android assets, objective AI, Forward Bays, multiplayer, and visual snapshots.

**Verification COMPLETE — PASS:** [GitHub Actions run 41475978907](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41475978907), tested source commit `11568258bd1163c6307ef8e51077374ad3e2771e`. All **84 real-browser geometry fixtures** passed: 6 viewports × 7 HUD state combinations × 2 control hands. Existing regressions passed as well: **27 bot perception**, **42 guest combat feedback**, **45 shell HUD**, **27 enemy warning**, **18 bot shot cadence**, **48 touch-input**, 300-seed Forward Bays, CTF actual captures/rematches, and **44 visual screenshots**. QA artifact `sector-rebound-combat-cues-evidence`, id `13157697437`.

First rounds of the new layout test revealed previously unmeasured conditions: zero-opacity toast mistakenly considered visible (test corrected), then a **real 2px overlap** between scoreboard and scored-match clock on 740×360 (CSS corrected). Responsive CTF offsets were also adjusted to keep the power-up status below the objective on taller landscapes. Subsequent full run passed. Phone acceptance is still required, and no Android APK has been built for this branch.

## Deferred / owner testing

Actual phone geometry, font scaling, Android display cutouts and unusually narrow views still require physical acceptance. Do not build an APK until combined planned change gates are green and versionCode is strictly larger than 260001 with the same preview signing certificate.

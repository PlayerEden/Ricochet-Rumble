# Sector Rebound — v0.9.22-dev2 Android Phone Playtest

**Build:** [v0.9.22-dev2 test/debug APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/download/v0.9.22-dev2-test/sector-rebound-v0.9.22-dev2-qa-debug.apk)
**Release:** [v0.9.22-dev2-test](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev2-test)
**Exact tested source:** `e1f13f99a023792773ef25482572f6c5ed938363` (draft [PR #24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24)).
**Automated QA:** [run 40594730629 — passed](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40594730629).
**Android internal versionName:** `0.9.21-game-feel` (legacy value despite actual dev2 gameplay); `versionCode 38`, package `com.playereden.ricochetrumble`.
**Date:** 2026-10-27. This is a debug playtest prerelease, **not** a Play-signed or accepted public v1 build.

## Before installing
- Download the single `.apk` linked above (not the temporary Actions ZIP or unsigned AAB). Use Android Files/Downloads to open it, then permit installation from the source application if Android asks. Disable that permission again afterward if you prefer.
- **Existing install warning:** GitHub runner debug signing certificates may differ. If Android rejects an update to an existing Sector Rebound/Ricochet Rumble package, do not uninstall it until you are comfortable losing its local app data/settings or have a known-working backup. Uninstalling clears app data. You can test on another phone first instead.
- Report Android version, device name, whether it upgraded in place, and portrait/landscape behavior.
- This APK has not been physically tested by the developer's phone in this chat.

## Testing sequence — priority order

- [ ] **1. Startup and controls.** Launch in landscape. Main menu loads, animated tank/mech preview feels smooth, buttons aren't clipped, text is readable on a real screen. Enter Quick Play, steer, shoot, ricochet, enter/exit a tank or mech. Try an extended 5-minute fight.
- [ ] **2. Settings and modes.** Match Settings → **Quick Play Modes + Advanced**. Verify two options: **Free-for-All Survival** and **Team Survival**. With both disabled, Quick Play must not start; with one selected it must work; with both selected it must rotate. Exit/reopen the settings, then restart the app and check whether selections persist.
- [ ] **3. Match flow and procedural geometry.** Play at least three completed solo rounds. On each After Action screen select **NEXT MATCH** rather than MAIN MENU. Confirm the arena truly changes layout every time, controls work immediately, no old bullets/bots/results remain, and no sudden forced rematch starts by itself. When both modes are selected, check that mode names rotate without an immediate repeat. With only one enabled, it repeats with a *different* maze.
- [ ] **4. Vehicle versus operator deaths.** Have the vehicle's armor destroyed; the pilot should eject and remain alive. Shoot an enemy vehicle until the opponent ejects; its destruction should **not** award an operator KO by itself. The KO should be counted on real pilot elimination. Lose a pilot life and respawn if lives remain.
- [ ] **5. After Action accuracy.** At the end of a naturally completed match, check that VICTORY/DEFEAT makes sense, **OPERATOR KOs**, **DEATHS**, **MATCH TIME** (`MM:SS`) and **LIVES LEFT** reflect what happened. Let the results screen sit for several seconds: numbers should not change. Try a real win and loss, where possible. A practice round with zero bots should not invent a result.
- [ ] **6. Pause / background / audio.** Pause for roughly 10–20 seconds; match timer should not count the pause. Press Home/switch apps and return; controls should not remain stuck and music/SFX shouldn't overlap. Check sound/music toggle independence and that the menu and battle audio aren't too loud.
- [ ] **7. Mobile UI.** Inspect the result screen and expanded Match Settings at the actual device resolution: no clipped text, tiny impossible-to-tap buttons, overlap with navigation bars/camera notch, or forced scrolling that hides NEXT MATCH/MAIN MENU. Turn the device sideways/portrait and back to landscape; note any cut-off screens or frozen controls.
- [ ] **8. Optional same-Wi-Fi LAN.** Only if you have two phones: host on one, discover or enter IP:port on the other, connect, fight, pause/reconnect, and observe if both see consistent movement/hit state. **Do not expect the new solo playlists or result stats to work in LAN yet**; host-authoritative match results are still future work. Record distinct phone models/Android versions and how the connection failed.

## Feedback to send back

You can simply paste:

```text
Sector Rebound v0.9.22-dev2 phone test
Phone / Android version:
Installed successfully? (upgrade or fresh install):
Controls / FPS / responsiveness:
Music / sound:
Settings + 0/1/2 mode selections:
Next Match + new maze + mode rotation:
Vehicle ejection vs pilot death:
After Action KOs / deaths / duration / lives:
Any UI clipping / portrait-landscape issues:
Optional LAN two-phone test:
Bugs: steps to reproduce, expected versus actual, how often:
Overall feel / what should improve next:
```

Screenshots or short videos are especially valuable for layout, camera, animation and combat. Note whether a defect happens **every round** or intermittently, and include the mode/map size/bot count. Link any substantial new bug in [issue #22 (device acceptance)](https://github.com/PlayerEden/Ricochet-Rumble/issues/22) or report in ChatGPT for triage.

**Important:** This checklist covers manual human acceptance, which automated tests cannot establish. Keep [PR #24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24) in draft until owner phone results are reviewed. Do not overwrite the known-good `main` or earlier preview releases solely to distribute the test build.

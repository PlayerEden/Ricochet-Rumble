# Sector Rebound — v0.9.15 Combat Feedback & After-Action Quality Pass

## Goals and restraint
The player approved work on **audio identity, impact feedback, match pacing/clarity, and replay flow**, while preferring to preserve v0.9.14 physics/balance. This experimental branch changes no projectile caps, life counts, map generation, speed or armor values. No purchased assets or network calls.

## Synthesized, offline audio
The old generic short square oscillator is replaced by named `audioCue(kind)` profiles, lazily using one shared WebAudio AudioContext with short envelopes. Distinct tones exist for:
- Tank, mech and on-foot pistol launches
- Wall ricochets and bumper ricochets
- Armor impact, pilot life loss, pilot ejection, barrier absorption
- Pickup collection
- Victory and defeat (short melodic motifs)

Ricochet/bump cues are time-throttled to prevent a long volley from producing hundreds of simultaneous sounds. Sounds use falloff by distance, honor the existing sound preference, do nothing when the browser audio API is unavailable, and create no static audio files.

The v0.9.14 optional screen-shake setting stays off by default. Impact FX are enhanced with short directional sparks around the existing hit/ejection rings; barriers receive their own purple absorption ring. Hit/guard/ejection feedback uses existing serialized `fxEvents` packets. No new transport or message types are required. On LAN guests, event-driven sounds are played only for newly received FX IDs. Results cue is one-time per match, not every HUD refresh.

## After-action UI
The old canvas-painted report is replaced by a responsive, touchable FIELDGRID debrief. It shows:
- **SECTOR CLEARED / LOST**
- Existing match-event headline
- **Operator KOs** (accurately names `state.kos`, which counts kills, not all hits)
- Lives remaining and success/defeat
- **NEW SECTOR** (host/solo/duel only) or **AWAIT HOST REDEPLOYMENT** for guest
- **MAIN MENU** available to return/disconnect

Large titles remain in the menu and results, never during ordinary combat. The results panel handles narrow landscape sizes, safe-area padding and touch focus. The rest of the game stays fullscreen.

## Tests
- Existing >600 assertion game smoke suite; 180 deterministic maze seeds, 1500-frame simulation, combat/power-ups, bot/vehicle recovery, and LAN snapshot protocol.
- New assertions exercise sound mute/no-AudioContext behavior, per-vehicle cues, ricochet throttling and win motif; results DOM stats, defeat/success styling, rematch and return-to-menu.
- GitHub Chromium QA captures baseline vs updated home/settings/help/arena/moving/pause at 740x360 / 915x412 / 1280x720.
- Additionally, the new results panel is captured as a **layout fixture at all three viewports** (fixture, not a recorded real match), with containment and minimum button-size checks.
- Android debug APK built from bundled browser assets; web/android parity tested.

## Remaining manual acceptance
- Verify synthesized audio on a real Android phone with audio enabled and off; ensure ricochet mix is not shrill or loud after several simultaneous shots.
- Run several matches to judge whether clearer hit sounds and aftermath increase satisfaction without fatigue.
- Verify results buttons with Android landscape safe areas and inspect the result report after real wins/losses.
- Real host and guest on two separate phones remain untested. Confirm that host can start another match while guest gets an understandable wait cue, and that guest FX/cues do not double-play.
- Do not claim zero remaining bugs or proven engagement improvements; a short real playtest is the next gate.

## Branches
- Experiment: `dev/sector-rebound-feedback-v0915`
- Rollback: `dev/sector-rebound-camera-qa-v0914`
- Android versionCode 32, v0.9.15.

# 21 — Music & Sound Identity Bible

**Status: PROPOSAL ONLY. No new music is generated or installed by this document.**
**Date:** 2026-10-27.

## FIELDGRID soundtrack direction

A quiet, atmospheric electronic identity rather than bombastic action trailers: warm bass, restrained drum-machine taps, short synth arpeggios, industrial texture, occasional tonal motif, NO vocals, no stock cinematic risers, no imitation of another game's melody. The existing mechanical weapon SFX must stay more prominent than background music.

Proposed scenes:
- Main menu: calm 80–100 BPM original pulsing loop with subtle rhythm and spacious synth pads.
- Combat: 105–125 BPM rhythmic variation using related chords/motifs, clear frequency space for impacts and ricochets.
- Objective/last moment: optional brief filtered tension layer, not a strobe of warning sounds.
- Match outcome: existing win/lose stinger or new restrained motif with short ducking.

## How we can make it

**Option A — original procedural Web Audio composition.** Hand-author an 8–32 bar deterministic loop with a lightweight scheduler, simple oscillator voices, low polyphony, volume envelope, no downloaded samples or soundtrack license complexity. This is an excellent low-cost first proof.

**Option B — curated generated instrumental.** Runway's connected music-generation tool can make a short loop or full instrumental when the workspace has a paid plan and credits. Render candidates as creative input, check suitability and commercial rights, edit/tidy loop points, then bundle an offline audio asset. Runway permits commercial use subject to conditions, but this does not guarantee output exclusivity or copyright status. Do not generate at a cost without an explicit production choice.

One or two excellent tracks are better than 15 placeholder loops. Don't ship royalty-unclear music or track references that mimic a recognizable copyrighted theme.

## Runtime contract

Independent Music and SFX toggles, conservative music mix, user-gesture start in Android WebView, gentle menu/game crossfade, suspend/duck on backgrounding/calls/pauses, honor mobile audio focus and reduced-noise preferences. No music during Android background, no wasted CPU loops after exiting, no overlapping duplicated voices after rematch or LAN. Offline playback, no external music streaming.

Sources:
- https://developer.chrome.com/blog/web-audio-autoplay/
- https://googlechrome.github.io/samples/webaudio-suspend-resume/
- https://developer.android.com/media/optimize/audio-focus
- https://help.runwayml.com/hc/en-us/articles/21668707517587-Can-I-use-the-content-I-made-in-Runway-for-commercial-purposes

## First approved-work gate

Produce one ORIGINAL simple menu loop, and optionally a combat variation; audition on a phone speaker at normal volume, confirm a clean repeat seam and that game hits remain audible. Keep editable source, export, license/source, and sound-mix testing in GitHub. This section is a plan, not completed media.

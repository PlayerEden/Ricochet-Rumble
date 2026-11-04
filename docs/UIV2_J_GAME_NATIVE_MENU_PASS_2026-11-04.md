# Sector Rebound — UIV2-J: game-native menu presentation
**Player direction:** 2026-11-04. **Location:** draft PR #140, NOT production. **Reference principle:** the clarity and presence of a modern mobile game interface (World of Tanks Blitz is a reference for hierarchy and vehicle-centric presentation, not a visual asset source or a design to copy).

## What feedback established
- The prior UIV2-I no-scroll correction was necessary but insufficient. Reducing HTML card dimensions does not, by itself, feel like a finished game.
- The home screen's vehicle/world framing is stronger than secondary screens. Repeating rectangular panels, equal emphasis and system jargon makes the rest look like a web dashboard.
- Keep landscape-first, one-screen primary navigation, readable 44px-equivalent touch actions and the game's existing tactical cyan/navy/amber identity. Scroll only genuinely long, optional or dynamic data.
- All UI claims and screenshots must be demonstrated on a real phone before promoting this to main. Do not mislabel a browser check as physical-device acceptance.

## J1 — Mode Select: operation board (first experiment)
- [x] Keep the four original core operation IDs, labels and action routes, plus Practice, Daily, and Field Exercises / experimental options.
- [x] Relocate the existing Back button to the title header; avoid a giant full-width footer that wastes space.
- [x] Place a live preview powered by the **existing actual tank/mech Canvas renderer**, including equipped paint, into the screen header. Not fake art, screenshot stock, AI graphics or a second simulation.
- [x] Reduce repeated card framing. Tactical accents identify the four real modes, not fake ranks or unlocks.
- [x] Keep the experimental choices as a focused replacement, not a longer scroll.
- [x] Mirror native Android/WebView assets and add a browser regression that checks the live preview and Back hit target.
- [ ] Five-size browser, native Android, asset parity, gameplay and LAN regression on the **final commit**.
- [ ] Physical-phone owner screenshot/feel approval. Only then decide whether to keep this direction.

## J2 — Mission Setup: two levels rather than an admin form
On the primary page, emphasize a short match summary, arena size, bot count, and the main START action. Keep advanced controls and playlists discoverable but in their own focused screens. Avoid generic numbered administrative cards for everything. All native selectors, values and preference keys stay exactly as they are.

## J3 — Local / Hangar / Dossier: distinct jobs
Local Play should read like a room-selection screen, not network diagnostics; technical IP should be on manual join/host details only. Hangar should foreground the existing real vehicle model and cosmetic choices, not a spreadsheet. Dossier should foreground meaningful performance and equipment, with deeper details subordinate. Do not fabricate account/cloud services, rewards, statistics, skins or matches.

## J4 — tactile feedback and transitions
Evaluate short screen-entry and button-state feedback, restrained sound only if existing audio settings permit, reduced-motion compliance, and visible selected/focused states. Preserve device battery, low-end WebView support and Canvas fallback. No introduction of third-party assets or render engine migration without separate evidence.

## Non-negotiable acceptance
1. 568×320, 640×360, 740×360, 915×412 and 1280×720 real-browser captures; hit-test every core button and inspect selected/expanded state.
2. Mode, setup, local intro and dossier primary screens must have no scroll/clipped controls. Long Help/Backup/LAN lobby/advanced details may scroll within their own sections.
3. Web and Android assets byte-equivalent; Gradle packages real bundle; WebGL-disabled fallback works.
4. All existing gameplay, saves, live LAN protocol, scores, cosmetics and music preferences preserved. No changes to owner package/signing or main.
5. Do not merge draft PR #140 or publish as owner-ready until automated QA and physical Android feedback pass.

**Working rule:** compare actual phone screenshots against game-native design goals, not just CSS bounds. A geometrically valid screen can still look unfinished.

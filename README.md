# Ricochet Rumble

**v0.8.0 — Unified Arena experimental build** (branch `dev/unified-arena`). A compact, free Android arcade game about pilots, tanks, ricochet shots, and exploring large mazes. The game is entirely bundled in its APK; no additional apps are required for solo and nearby-Wi-Fi matches.

## One game, your settings

Select **Quick Play** to start driving immediately. Every tank has **3 armor** and protects its pilot. If destroyed, the pilot automatically ejects and keeps their lives (default **2**), uses a sidearm, and can enter an empty tank nearby. On-foot pilots can pass through **empty parked tanks** so they aren't trapped in tight corridors. Empty tanks remain valid cover from gunfire.

- **Quick Play:** instant solo against computer tanks.
- **Match Settings:** arena, number of bots, bullet cap, pilot lives, AI skill, team rules and comfort preferences. These configure the one game, not distinct game modes.
- **Play Together:** nearby same-Wi-Fi host / find, no passwords, room codes, servers or accounts. Local-IP join is a backup. Multiplayer pilot/vehicle input is now wired but must still be tested on physical devices.
- **? Help:** concise in-app controls guide.

The player can enter/exit a tank with the contextual button; the game only shows ENTER near an empty, usable vehicle. Movement is via thumb joystick with Fire on the opposite side. Control swap, optional auto-fire, sound and shake settings are available.

Five arenas include Foundry, Crossroads, Pinball, Labyrinth and Maze XL. Large mazes have a following camera and minimap, while the small arenas allow shorter fights. Bots, hits, power-ups, and team matches are part of this same game.

## Build and verify

- Browser: open `web/index.html` in a browser, or use the bundled self-contained demo from the chat.
- Automated QA: `node tests/smoke.mjs` (no npm install required).
- Android source: `android/` (Android 8.0/API 26 or newer). GitHub Actions can compile a debug APK using a manually or workflow-triggered build, no paid services and no GitHub secret required.
- Web and Android game assets are synchronized; keep both copies aligned.

**Installation:** GitHub-hosted debug builds may be signed with different ephemeral certificates; uninstall the previous version if Android rejects an update. That clears app-local settings. Permanent release signing is optional and not used by the basic debug workflow.

### QA and limitations

Read [`docs/UNIFIED_ARENA_v0.8.md`](docs/UNIFIED_ARENA_v0.8.md). Unit and browser tests don't prove performance or networking on actual Android phones. Keep this experimental branch separate from `dev/pilot-survival` and `main` until verified.

### Future ideas

More vehicle types, a two-person driver/turret vehicle, Pocket Racers, and Scrap Climbers are ideas for later development, **not added in v0.8**. The goal remains a game that's easy and fun in seconds.
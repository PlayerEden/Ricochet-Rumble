# Ricochet Rumble

**v0.6.3 — Combat Feedback & Maze Performance** · Self-contained Android tank arcade with offline solo and local same-Wi-Fi multiplayer foundation.

Ricochet Rumble is a tiny, free tank-maze game. Move with the left analog stick and hold Fire at the right. Shells ricochet around maze corners, tanks have multiple lives, and fights continue across individual respawns. Play in five arenas including two much larger, seeded mazes with a following camera and minimap.


## v0.6.3 refinement (2026-10-26)

- Added **nearby-wall spatial lookup** for tank movement, shells, and bot visibility checks. Large mazes no longer scan every wall for each collision test; wall-collision parity is regression-tested across all arenas.
- **Local-only damage feedback**: taking a hit briefly highlights the screen edges. Distant bot-on-bot hits no longer shake your camera. Guest damage is presented using synchronized hit events.
- **Gunfire sound radar**: recent *hostile* shots within hearing range produce short-lived orange pulses on the maze minimap. Does not expose enemy positions constantly or through a permanent radar wallhack.
- **Distance-aware sound effects** for shots, collisions and hits. Faraway tank sounds are quieter; the network guest receives the shared combat effects too.
- **Bots ease off at point-blank range** when they have a clear shot instead of constantly ramming opponents.
- HUD now says **HITS** instead of misleading **KO** (the recorded counter counts successful hits, not final eliminations).
- Preserved five arenas, teams, lives, projectile limits, continuous respawns, fixed-step gameplay and the no-password test APK build. No new network servers or accounts.

See [`docs/RELEASE_v0.6.3.md`](docs/RELEASE_v0.6.3.md) for verification scope and remaining device tests.

## v0.6.2 refinement (2026-10-26)

- Optional **Swap Controls** for left-handed/right-handed comfort; swaps Fire and joystick sides without changing tank handling, and saves locally.
- Compact **? Help** guide available on the main menu, explaining ricochets, lives, teams and basic touch controls.
- Shells now spawn against the *near side* of a wall when your turret is close, rather than potentially passing through a wall during the initial shot.
- When Android backgrounds the game, an active host receives a local pause and the app attempts to send an immediate paused snapshot; guests send a neutral input. Android may disconnect a hosted game on stop, so this is not a promise of background networking.
- Short-landscape menu alignment/controls verified using Chromium at 740×360, 915×412 and 1280×720 without webpage overflow.
- No new game modes, monetization, backend accounts or required apps.

## Play modes

- **Solo vs bots**: start right from the main menu; set 1–4 bots, lives, shots-per-tank and Relaxed / Standard / Challenge bot AI.
- **Two-phone nearby game**: host or discover a session on the same Wi-Fi network through the bundled Android app. Join by local IP is a fallback. **Physical two-phone acceptance testing is still pending.**
- **Keyboard duel**: two players on one keyboard in a compact arena (WASD + Space / arrows + Enter).
- **Match modes**: free-for-all, humans vs bots, or two teams. Friendly fire is off for teammates.

## v0.6 refinements

- Fast-access mobile game menu; separate settings screen avoids burying Play under a tall form.
- Settings and comfort preferences persist locally (arena, bots, rules, sound, screen shake and optional auto-fire). No account or remote storage.
- Fixed-time simulation for more consistent pace at lower rendering rates; better camera smoothing and maze floor drawing/culling.
- Readable bullet-ready indicator near the Fire button, clearer local tank indicator and minor tank/floor graphic polish.
- Wall-aware bot shots, bot difficulty, shooting cancels respawn immunity, and ricocheted shells can hit their own shooter after a grace period.
- Host menu pauses for both participants, clears held controls, and resumes properly; client Wi-Fi routing preferred even when cellular is on.

Full findings, test scope and deferred items: [`docs/QUALITY_AUDIT_v0.6.md`](docs/QUALITY_AUDIT_v0.6.md).

## Building and testing

- Browser: open `web/index.html` with a local static server (or use the self-contained HTML preview supplied in the chat).
- Game logic QA: `node tests/smoke.mjs`.
- Android: project is in `android/`; GitHub Actions workflow `.github/workflows/build-apk.yml` builds an unsigned-for-release, **debug-signed APK** through `gradle :app:assembleDebug`. The APK contains all HTML, CSS, JavaScript and game assets, with no downloads during play.
- App package: `com.playereden.ricochetrumble`; Android 8.0+ minimum.
- Same-Wi-Fi multiplayer is experimental: test discovery, connectivity and controls on two real devices before calling it production-ready. Remote internet P2P, cross-network friends and push invites are not implemented.

**Distribution/signing note:** GitHub debug APKs may use a different signing certificate on different runners. If Android refuses to install an updated debug build over a previous one, uninstall the old debug version. Establish a persistent **private** release-signing identity before shipping reliable in-place updates; never commit private keystores to this public repository.

## Future independent games

- **Pocket Racers**: short top-down racing game for two phones.
- **Scrap Climbers**: build eccentric blocky vehicles and compete for climbing distance.

The long-term goal is reusable zero-cost local multiplayer technology, while each game stays enjoyable offline. The project does not require ads, external game assets, subscriptions or server hosting for solo/LAN play.

## Experimental Pilot Survival (v0.7.0 alpha)

This is intentionally **not** part of Classic Rumble. On the `dev/pilot-survival` branch, tap **Pilot Survival · New Alpha** to test the new solo rules. You begin on foot with two lives and a short-range sidearm. A parked tank appears near your spawn; approach it and tap **ENTER**, or use **E** on a keyboard. Tanks have three armor points. When the tank loses its last armor point, you eject with brief protection; pilot lives remain untouched. You can also leave a healthy tank at any time using **EXIT TANK**. Wrecked garages respawn usable tanks after a cooldown.

This is a foundation for future vehicle types, not a finished mode: vehicle variety, repairs, balancing and **pilot-mode two-phone networking** remain future work. Current LAN multiplayer continues to use the **Classic** rules. No login or extra setup is required for this experimental solo version.

The Android app now has a distinct Ricochet Rumble launcher icon, using the artwork concept previously generated for this project.
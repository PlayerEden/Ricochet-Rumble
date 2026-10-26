# Ricochet Rumble

**v0.6 — Mobile Quality Pass** · Self-contained Android tank arcade with offline solo and local same-Wi-Fi multiplayer foundation.

Ricochet Rumble is a tiny, free tank-maze game. Move with the left analog stick and hold Fire at the right. Shells ricochet around maze corners, tanks have multiple lives, and fights continue across individual respawns. Play in five arenas including two much larger, seeded mazes with a following camera and minimap.

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
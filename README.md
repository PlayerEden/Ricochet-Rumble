# Ricochet Rumble

**v0.5 — Maze Chase + Match Rules (Android test build)**

## What's new

- Five arenas: original Foundry, Crossroads, Pinball, plus two **seeded, connected, large labyrinths** (12×8 and 20×13 cells). Each maze includes loops, walls and dead-end routes.
- Local player's **smooth following camera** on both Android phones. One player cannot see the entire giant map at once. A small minimap shows maze geometry, your position and nearby opponents.
- **Bullet capacity per tank**: 1, 2, 3, 5 or 8 active shells. Firing again at capacity does not spawn another shell; shells expire or disappear on hits and can be fired again.
- **Match configuration**: 0–4 extra bots in two-phone modes (solo always requires at least one), 3/5/10 lives, Free-for-all / Humans vs Bots / alternating Teams. Friendly fire is disabled in team modes.
- Bot navigation uses grid paths through the procedural maze, not just straight-line pursuit. Larger local maze modes are disabled for same-screen keyboard duel since players couldn't both follow separate cameras.
- The host serializes the **maze seed, bots, lives, teams, shells and match config** so guests reconstruct the exact same map. The Android LAN packet maximum is raised to 32 KB for larger state snapshots.
- Existing full-screen landscape, thumb joystick, respawn protection, power-ups, bounces and Pinball bumpers preserved.

## Verification

- `node tests/smoke.mjs` verifies bullet caps, respawns, 4 bots, friendly fire, seeded maze consistency, following camera, LAN snapshots, and old Pinball collisions.
- Chromium layout/script checks at 915×412, 740×360 and 1280×720; no runtime errors or document scroll overflow in those runs. Screen captures are available in the ChatGPT session.
- GitHub Actions builds the Android debug APK on workflow changes; no paid infrastructure is required for a public repository's standard hosted runner.
- Two physical Android phones still need to test discovery, connection handling, larger snapshot behavior, and real gameplay performance. The first APK is a **test build**, not device-certified multiplayer.
- Debug signing keys may differ between runs. Uninstall older debug APK before installing a new build when Android reports signature incompatibility.

---

# Ricochet Rumble

**v0.4 — Full-screen landscape Android game pass**

Ricochet Rumble is a self-contained Android tank arcade game with local Wi-Fi two-phone play support. The Android app uses a hardware-accelerated WebView to render an offline canvas game. This is **not a native OpenGL renderer**, but it behaves like a fixed full-screen game rather than a scrolling webpage.

## v0.4 changes

- Immersive landscape Android screen, with status/navigation bars hidden and no WebView scrollbars or overscroll.
- Responsive fixed-viewport arena and independent thumb controls on the left and right of the battlefield.
- Integrated lives/KO HUD and an in-game full-screen menu.
- Browser portrait fallback asks for landscape; Android itself requests sensor landscape.
- Android Back opens the in-game pause/menu instead of reloading the entire app.
- App backgrounding pauses local solo/keyboard games; controls release on focus loss.
- All game data remains bundled inside the APK and does not download external assets.

## Test scope

- `node tests/smoke.mjs` tests core gameplay and network message shape.
- Browser layout checked at 915×412, 740×360, 1280×720 and 393×852. No document overflow or JS page errors observed in the test viewport.
- GitHub Actions build is a manually triggered debug APK workflow (an automated one-off build on workflow edits is also enabled).
- Two physical phones still need to validate local discovery, controls, and gameplay performance. Cross-network P2P and online friends are **not implemented**.
- GitHub Actions debug signing keys may change across runs. If Android rejects updating an old debug version, uninstall the old test build and reinstall; later releases need persistent signing keys for in-place updates.

---

# Ricochet Rumble — v0.3 playable arcade prototype

A free, self-contained 2D tank duel. This project is completely separate from SudokuTogether and is intended to become a simple Android two-phone P2P game.

## Play now

Open `web/index.html` in a browser or open the standalone `Ricochet_Rumble_v0.3_Playable_Demo.html` supplied separately. Select **Foundry**, **Crossroads**, or **Pinball**, then choose **Play vs Bot**. You can also choose **Two players · One device** for local keyboard play.

- Touch: 360° analog movement joystick, **hold Fire** to shoot; Menu pauses single-device play.
- Keyboard: Player 1 WASD and Space; player 2 Arrow Keys and Enter.
- Each player has **five lives**. Hits cause immediate respawns and a ~1.8 second shield instead of resetting play.
- **Three arenas**: Foundry (original), Crossroads (choke points), Pinball (functional bullet-deflecting circular bumpers).
- **Three powerups**, collected by touching glowing pickups: Rapid Fire (7 sec), Turbo (7 sec), and Barrier (one hit blocked, expires after 4 sec). Pickups appear periodically, one at a time. Pickups and buffs disappear on death; respawn shield still applies.
- Synthesized sound effects and lightweight particles on shots, impacts, rebounds, and pickups; projectile trails and brief muzzle flash.
- Menu > **Next Arena** changes arenas and resets lives; **Rematch** resets the current arena. The game doesn't restart when an individual tank is hit.

## The Android networking architecture (not yet device-verified)

The `android/` project contains a Java WebView host that packages `web/` assets into one APK. Java sockets plus Android Network Service Discovery are used for local Wi-Fi hosting/joining. The host simulates both tanks and sends authoritative snapshots. This v0.3 game snapshot includes arena layout selection, active pickups, buffs, and event identifiers, in addition to lives, tanks, and shells. Clients transmit joystick and fire input.

**Important limits:** The browser demo is solo/local keyboard only; no browser phone-to-phone multiplayer. An Android APK has not yet been compiled or tested on two phones here. The Android wrapper is same-Wi-Fi P2P source only, *not* cross-network online multiplayer yet. No friend list or matchmaking exists. The source is prototype-level and needs actual device verification and networking hardening before broad use.

## Android APK build

GitHub Actions' `.github/workflows/build-apk.yml` is manually triggered rather than automatic to help conserve monthly free-tier minutes. After creating a **separate** GitHub repository and adding the source:

1. Go to **Actions → Manual Android Debug APK → Run workflow**.
2. Download the `ricochet-rumble-0.3-debug-apk` build artifact (after a successful workflow).
3. Install on two Android phones on the same unisolated Wi-Fi. Host on one, find/join on the other. Manual local-IP entry remains a fallback.

You can instead use free Android Studio / SDK 35 and Gradle 8.9 locally to build `:app:assembleDebug` from `android/` (the project doesn't bundle a Gradle wrapper JAR).

Android application ID: `com.playereden.ricochetrumble`. **Debug builds made on separate GitHub runners may have different signing certificates**, preventing in-place update installation. A persistent signing key, stored privately, should be set up before relying on updates. This repo does not include a signing key.

## Checks completed for v0.3

- `node tests/smoke.mjs` verifies lives, respawns, analog controls, all three arena choices, Pinball deflections, pickups/buffs, barrier hit absorption, remote-state snapshot content, and host/client message plumbing.
- Chromium desktop and mobile browser views were checked for JavaScript exceptions and mobile horizontal scrolling. Screenshot evidence is packaged separately.
- Game UI/assets included in Android wrapper are byte-for-byte copies of `web/`.
- No Android build or physical two-device testing was completed. Browser and JVM-style checks do not establish real network reliability on Android hardware.

## Planned work, not implemented

1. Compile APK and run LAN host/client playtests on the two real Android phones. Fix lifecycle, jitter, reconnection, discovery and control feel.
2. More polish based on hands-on feedback; small arenas, funny variations, projectile balance.
3. Optional internet P2P with integrated signaling and possibly a relay, **without requiring a second app**. Direct cross-network connections are not guaranteed behind every router.
4. Optional paired-friend system, online presence, one-tap invites. No paid tier should be required for the private two-player game.
5. **Future separate games:** a fast top-down two-player racer; and a blocky hill-climb challenge where players build goofy physics contraptions then compete to travel farther. Keep each simple enough for short sessions; explore reuse of the eventual multiplayer connection foundation.

For this alpha: **no accounts, ads, third-party art, paid APIs, external gameplay assets, or ongoing hosting costs.**
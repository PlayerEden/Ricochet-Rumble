# Ricochet Rumble v0.6.3 — Combat polish and maze performance

Date: 2026-10-26. Focused polish pass built on the working v0.6.2 release. No new major game modes.

## Changes and why

1. **Collision performance:** index static wall segments in 128-world-unit buckets, then query only nearby segments for circle collisions and bot line-of-sight sampling. Camera rendering still culls off-screen walls. Original exact circle-rectangle overlap behavior and boundary checks remain unchanged.
2. **Readability and fairness:** damage vignette and shake affect only the player who took damage, rather than every bot hit anywhere on the map. Host authoritative FX now include victim and source metadata so the joining phone can see its own damage flash.
3. **Find the fight, not a wallhack:** recent shots from enemies within 1,000 world units emit short-lived sound rings on the minimap. Nearby allied and self gunfire does not get highlighted as a hostile contact; enemy tank positions stay hidden beyond the existing short minimap visibility range.
4. **Better audio space:** SFX fade with distance from the local tank. The guest also hears synchronized shot and hit events.
5. **Bot close combat:** a bot that can see its opponent eases off speed inside 115 units, reducing constant ramming.
6. **Accurate language:** HUD counter previously called `KO` is per-life hits and is now labeled `HITS` without changing save/network field keys.

## Evidence

- `node tests/smoke.mjs`: all preexisting gameplay, networking, and Android-background regression checks pass; 700 samples across five maps compare indexed wall collision with the exact original wall scan; sound radar events expire; local hit feedback does not trigger from bot damage; a 4-bot Maze XL stress run keeps projectiles/FX within caps.
- `web/` and Android bundled HTML/CSS/JS are byte-identical.
- GitHub Android Debug APK CI compiles the build and smoke-tests it; the successful run is linked in project history. No private signing secrets or payment configuration required.

## Not yet verified

- Real-phone responsiveness, thermal performance, and actual FPS improvement. The index is a code-level optimization; automated tests do not establish a specific frame-rate gain on hardware.
- Two phones on one Wi-Fi: discovery, reconnect, native bridge pacing, packet loss and guest responsiveness.
- Touch ergonomics and how readable gunfire pings are on differently sized displays.
- No remote internet P2P or cross-network friend invites; these remain separate future work.

## Update caveat

This is another debug APK from ephemeral GitHub runners. Installing over older debug builds may fail because the signature changes. Uninstall the previous build if that occurs; uninstallation removes local game settings.
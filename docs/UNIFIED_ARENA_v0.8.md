# Ricochet Rumble — Unified Arena v0.8.0

## Purpose
One understandable arcade game, not duplicate Classic/Pilot Survival screens. The player should be able to open the app, press Quick Play, and begin battling immediately.

## Player flow
- **Quick Play**: start in a three-armor tank, with configurable pilot lives (default two). Tank destroyed → pilot safely ejects; on-foot pilot is faster, has a short-range sidearm and can find an empty replacement tank.
- **Match Settings**: arena, up to four bots, per-tank bullet limit, pilot lives, bot skill, team rules, and optional comfort settings. These are options for the same game, not separate modes.
- **Play Together**: one host / one guest over the same Wi-Fi, with same pilot/tank rules and host-authoritative outcomes. Host sets rules. No backend accounts, no room code, and no paid service.
- Enter/Exit button is contextual: shown only if in a tank or close to an available parked one.

## Changes from v0.7.1
- Consolidated Classic and Pilot Survival menu actions into one unified mode with vehicle gameplay always enabled for new matches, solo and network.
- Spawn everyone already driving a tank so gameplay starts immediately. Spare vehicles spawn near the player and elsewhere for after ejection.
- Walking pilots may pass through **empty parked** tanks so narrow corridors don't become frustrating. Tanks themselves still collide with parked tanks. Empty vehicles still absorb projectiles.
- Redrew top-down pilot and both parked/driven tanks using a consistent silhouette. Reducing angled pseudo-side views improves recognizability.
- Minimized live HUD labels and made contextual Enter/Exit replace the constant Find Tank control.
- Guest pilot Enter/Exit now sends an explicit `interact` packet; Android transport accepts the packet and the host performs the authoritative action.
- Simplified the menu to Quick Play, Match Settings, Play Together and Help. Arena selection moved into Match Settings.
- Pilot lives default to 2; 3 and 5 available in settings. Tank armor defaults to 3. No new content systems or vehicle types in this pass.

## Quality gates completed
- `node --check web/game.js`
- `node tests/smoke.mjs` (unified gameplay, collision, 120 maze seed cases, 1,500-frame stress, guest interaction synchronization through JS harness)
- Browser landscape layout + JS error checks at 740×360, 915×412, 1280×720.
- Android and web assets identical, Android build compiled by GitHub Actions (if a linked successful run is provided).

## Remaining limits
- **Pilot and vehicle networking is not yet accepted on two physical phones.** JS and transport filters are tested separately; packet latency, Wi-Fi discovery and disconnect behavior must still be field-tested.
- On-foot through parked tanks is deliberately arcade abstraction, not full physics realism.
- Team and AI balancing needs hands-on playtest. Big mazes with one bot can still feel quiet.
- Debug APKs are signed by GitHub's ephemeral key and may need old APK removed; removing the APK deletes local settings.
- No online internet cross-network matchmaking or friends list yet.

## Branch safety
Experimental work belongs to `dev/unified-arena`. Keep `dev/pilot-survival` at its last tested alpha and `main` at the stable tank game until visual/device acceptance.
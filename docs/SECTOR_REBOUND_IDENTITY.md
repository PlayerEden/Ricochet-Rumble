# SECTOR REBOUND / FIELDGRID — identity & lore notes

**Development direction approved October 26, 2026.** Scope: title, concise in-game framing, and clear connection to an earlier fictional program. This document records proposed shared-universe direction, not a retcon of the Operation PHOSPHOR game bible.

## One-line identity

*A later-generation FIELDGRID pilot exercise: deploy, eject, adapt, rebound.*

- **Sector Rebound** is the name of the playable combat exercise, not a separate menu mode.
- **FIELDGRID** is the advanced arena-simulation architecture/facility. Leave as a secondary in-world identifier, not necessarily as the public franchise title.
- **Project CATHODE / Operation PHOSPHOR** is the predecessor grid-training era in the shared fictional technology lineage. Early operators shaped lethal trails; generations of simulation research now train real human pilots with tanks, mechs, and simulated weapons in modular proving sectors.
- Players need not read this to enjoy a match. Use small environmental details, optional short field notices and the occasional archived program reference instead of mandatory exposition. Do not reveal the mystery of NEXUS or claim the old game's unresolved story has been answered.

## Visual language

Continue the existing graphite/blue-gray industrial arena, top-down vehicle silhouettes, cyan for player, coral for threat, violet for specialized mech, and muted warning amber. The new **SR** monogram replaces **RR** in the launcher and main-menu mark. Prefer legible physical geometry over elaborate illustration. No return to retro CRT.

## Naming safety / compatibility

A general web search as of 2026-10-26 did not reveal an obvious exact-title game called `Sector Rebound`. It does **not** establish trademark availability. Search USPTO live and dead marks, related games/software services, state/common-law usages and game storefronts before publication.

Keep Android applicationId `com.playereden.ricochetrumble`, internal JS namespace `window.RR`, Wi-Fi DNS-SD service **type** and project repository URL unchanged in this iteration to avoid breaking discovery or installs. Android discovery **display name** may say Sector Rebound. Do not rename technical APIs just for presentation.

## Release acceptance

1. Search the current UI/Manifest for stale player-facing Ricochet Rumble strings. Historical documents may retain them.
2. Confirm the same match logic and settings work with the new title.
3. Run smoke tests, build an APK on the branch, inspect bundled assets and verify the launcher image.
4. Verify the game renders and the title doesn't overflow on compact landscape screens.
5. Two-phone play and device performance remain unverified until user testing.
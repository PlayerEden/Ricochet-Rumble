# Sector Rebound — Friendly unit pass-through (experimental)

**Date:** 2026-11-02. **Status:** Isolated experiment; not in stable `main`.
**Base/rollback:** last fully verified owner APK source `cc6223e9a70c081630ea27ecc557056c5aa3d4d1` (v0.9.66 CTF escort experimental).

## Design decision
Friendly **pilots, tanks and mechs** are non-solid to each other in team-based modes (including cooperative teams and any host-authoritative team rules). Enemies continue to physically block movement, FFA units continue to block one another, and solid maze walls remain solid. Parked vehicles remain pass-through as before; an occupied vehicle cannot be boarded. Friendly-fire immunity and self-ricochet rules are unchanged.

## Narrow code changes
- Reuse actual `teamOf()`/`friendly()` identities through `solidOpponent()`; do not infer teams from skin color or human/bot identity.
- `tankMove()` actor collision checks only opponents, for both physical pilots and occupied vehicles. Collision separation of existing enemy overlaps is retained.
- `vehicleEntryClear()` and `pilotExitSite()` treat enemy actors as solid but don't reject safe vehicle entry/exit solely because an ally is nearby. A second driver still cannot enter a vehicle with an occupant.
- Remove the recently added **Solo CTF human-escort lateral/forward yielding workaround**; this experiment tests friendly pass-through directly. Older CTF bot route logic still exists and should be audited for redundancy before promotion.
- Keep projectile collision and `friendly()` checks unchanged; friendly shots cannot hit friendly units. Do not give overlapping friends enemy-proof cover or extra armor.
- Update the exact browser and Android game assets together; no unrelated mode scoring, save schema, speed, weapon damage or Android package changes.

## Focused regressions
- Real `tankMove` controlled fixture must demonstrate tanks AND pilots crossing teammates in two team configurations (`teams`, `coop`) without moving through actual enemies in those same modes.
- In FFA, every other actor remains solid. Explicit maze collision fixture stays solid.
- Same-seed seed-102 real CTF input-driven player should pass the ally bottleneck and reach within 680 units of the enemy flag, without teleport or speed changes. CTF capture, return, interceptions, hit logic, other seeded maps and actual match outcomes must still be inspected.
- Full browser + Android source parity, CTF natural-match, 300 Forward Bay seeds, Quick Play, save/backup, first-match and all visual screenshots.
- Independent pilot/weapon-aim, AI-shot parity, HUD/readability, landscape and Android build/signing tests before distributing an owner APK.

## Owner acceptance remains required
A new player can walk **through** a friendly actor and see both sprite silhouettes overlap; visual clarity and whether this feels natural is an owner gameplay verdict, not an automated guarantee. Verify friends cannot shield incoming bullets, enemies still stop movement, allies cannot hijack occupied vehicles, CTF/Team Survival/TDM continue to function, LAN host/guest physics agree and saved progress survives a compatible install-over. No production release or merge until these gates are reviewed.

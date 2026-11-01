# Phase 4A — Free Offline Hangar / First Real Paint Customization (2026-10-31)

## Approved baseline
Owner approved **Preview 100008** simple MOVE + FIRE, after previously approving the corrected tank center pivot and differentiated armor effects. Preserve exact [100008 rollback checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100008-move-fire-approved), source `cf6ec75f269924014ae7262f56d599d159afa083`. No stable main runtime merge. This Hangar slice is a new unapproved experiment until owner phone test.

## Implemented cosmetic slice (free and offline only)
- Hangar accessible from the main menu and Dossier, with four **free, immediate** fixed palettes **STANDARD / MOSS / DUNE / OXIDE** already present in the existing `FIELDGRID_UNIT_SKINS` modular art roles. This uses the current approved tank, mech and pilot geometry, never introduces generative textures or artificial rarity.
- Only **the local human (seat 0) in offline Solo** uses selected unit armor-panel material when playing or changing vehicle; the showroom tank/mech also previews that finish. Standard is the default and renders identically to the approved version. All other actors, LAN and team combat logic remain on default.
- Strict v1 local preference `rr-hangar-paint-v1`: `{version:1,equipped:'fieldgrid.moss'}`; only known stable IDs allowed, unknown selections rejected, corrupted/unknown future values fall back to Standard. Selection persisted locally and included in the existing user-controlled export/restore backup, with future schema protection. Existing saves and scores are neither migrated nor reset.
- Paint does NOT change combat color/side identification, hitboxes, collision, speed, armor, lives, projectile trajectory, audio, damage/KO/score, pilot silhouette, or network packets. Existing team identification ring/locator is drawn from `combatColor` independent of paint.
- No real-money store, no entitlements, payments, ads, claims of pilot portraits or earned rewards. The existing Dossier eligibility remains **concept only**.

## QA and manual gates
- Headless: real game-source Hangar UI route and equip persistence, fixed resolver material values for tank/pilot, invalid ID rejection, no combat state changes, regression of standard team paint.
- Backup module: validate known Hangar ID, export/restore roundtrip alongside Dossier and preferences, rejection of unknown IDs and preservation of newer format.
- Android HTML/CSS/JS and backup module mirror WebView assets byte-for-byte. Fast and full Chrome/Android QA plus a signed test APK required before announcing as verified.
- **Owner phone test:** from main menu open HANGAR, equip Moss/Dune/Oxide, open Solo and inspect tank/mech/pilot after ejection; revert to Standard and compare approved visuals. Check responsive menu at phone landscape and Dossier remains intact after in-place update. Report team identity/readability at actual device scale. Any visual incoherence gets a rollback to Preview 100008.

## What is NOT implemented yet
Earned unlocks, pilot profile portraits, advanced patterns, custom vehicle-by-vehicle slots, persistent network-visible paint, commerce, Play account sync, online ranked, and production signing. These remain later iterations, not implied by this starter feature.

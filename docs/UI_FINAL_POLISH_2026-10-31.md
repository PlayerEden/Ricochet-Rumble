# Final player-facing usability polish — 2026-10-31

## Source observation and scope
Owner liked Preview 100026 real Android UI. Screenshots identified excessive Help text, a giant gold primary Back action there, an unclear scored HUD showing "YOU KOs 3 ♥", a timer detached beneath Menu, and flat Dossier stats. This release changes **only UI presentation and player-facing copy**, NOT combat logic or stored data. Rollback: [immutable Preview 100026 checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100026-before-ui-final-polish), source `5222063951f42f2bafbee72c276eba3cf855b37a`.

## Changes
- Help becomes a self-contained HTML template with compact **Move / Fire / Survive / New Sector** cards, neutral **top-right Back** and optional `details` for pilot drag-to-aim, vehicle steering/ENTER, shell capacity and scored-vs-survival rules.
- Scored HUD: **hide the survival-only ♥ via explicit CSS** (the JS already toggled `hidden`, but there was no matching display rule), preserving current actual KO computations. Team modes clarify BLUE/RED KO labels.
- Scored match countdown is visually grouped below the center scoreboard/vehicle-state pill rather than parked under MENU. Keep clock inactive in Survival, score math and top HUD horizontal spacing untouched.
- Dossier: victories and operator KOs emphasized with restrained cyan, while all six data cards/mode rows remain accessible. No changes to save schema, records, statistics, unlocks or storage.
- Correct semantic Back coloring/placement in Help. All quick-play, custom, LAN, pause, Hangar and Dossier paths remain.

## Required QA gates
- [Draft PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85), Android/web byte-for-byte asset parity and signed Preview build. `main` stable gameplay intentionally remains older.
- Real Chromium click Help from Home, verify concise cards, expandable advanced text, top Back, neutral Back computed color, and no unneeded scrolling at 568×320 / 740×360 / 915×412 / 1280×720.
- Real scored CQC / FFA / TDM simulation must confirm KO score remains correct, the heart is NOT rendered, timer visible and no MENU overlap; Survival retains life icon and hides countdown.
- Dossier records/backup and settings save must survive re-navigation. Existing full real Chromium geometry and gameplay flow suites must pass; keep physical two-phone LAN and phone acceptance pending.

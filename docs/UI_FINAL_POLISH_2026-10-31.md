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

## Verified results and screenshots
- [Exact-head Chromium test run 41230914578 succeeded](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41230914578), **102 responsive scenes / 0 layout issues** (five landscape sizes); successful actual match flow and navigation, with the new Help/heart/timer regression expectations. [Screenshots and geometry JSON evidence](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41230914578/artifacts/13054100106). User-visible snapshots checked at 740×360 for Help, CQC/vehicle scored HUD, and Dossier.
- [Signed test Preview 100030 build succeeded](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41230914588), exact source `0fcc02c337f4a2c3df8b9156a4e34f75a09ee521`, same test-only preview signing key and app ID as 100026, SHA256 `8b5a34f92a3a25be9c51626ccc1bd16dd27a7f9f105d8981e1be34b2e94fea52`. APK itself extracted and asset contents checked against implementation. [QA-approved source checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100030-final-ui-qa-pass).
- The original [CI run 41230822512](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41230822512) identified clock alignment with the *viewport* rather than offset scoreboard, so CSS was corrected before the successful run. Previous failed runs 41230679663/41230706496 were transient syntax and outdated mock-template assumptions, corrected before final release. No unresolved source/test failures in final exact-head run.
- **Pending:** actual owner phone comfort and saved-progress upgrade, two-device LAN, private Play signing, and explicit merge decision. No automated test substitutes for those.

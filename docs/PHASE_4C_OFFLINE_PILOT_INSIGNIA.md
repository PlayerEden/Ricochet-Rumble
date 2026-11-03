# Sector Rebound Phase 4C — Offline pilot insignia identity (2026-10-31)

## User direction / approved state
User responded "lets continue" after verified **Preview 100013** with two earned unit paint finishes. Implement first *playable* operator identity slice, not a speculative store. Exact rollback checkpoint [`checkpoint/sector-rebound-preview-100013-earned-paints-approved-for-next-phase`](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100013-earned-paints-approved-for-next-phase), source `0273a243393476c9ba5898f8bf589ee4be5ed15b`. [Fast PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41178083521), [full real Chrome/Android QA PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41178083535), [signed Preview 100013 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41178079901). Existing four free + two earned paint finishes unchanged.

## Implemented
- Distinctive small *operator insignia* (not physically mounted on an Android weapon, not a new pilot 3D/2.5D sprite). **FIELD ◇** is free; **VECTOR △** requires 3 completed offline Solo matches; **ACE ✦** requires 10 operator KOs; **COMMAND ◆** requires 12 completed Solo wins. These use only the existing validated local Dossier metrics `matches`, `kos`, `wins`—no new statistic or fabricated entitlements.
- All icons are small flat geometric glyphs in the existing tactical Hangar. The picker shows disabled badges with live progress and the selected icon. The Dossier header displays the equipped emblem and label. No match/HUD controls or camera changes.
- Version 1 `rr-hangar-paint-v1` continues to store paint in `{version:1,equipped:'fieldgrid.moss'}` for the default FIELD badge; for other emblems it stores `{version:1,equipped:'fieldgrid.moss',emblem:'mark.ace'}`. This preserves existing paint-only backup bytes and saved records. Strictly validate the optional `emblem` in backup/restore, and never claim unlock from importing a preference if the validating Dossier metrics do not qualify. Unknown/invalid emblem IDs rejected.
- Refine confusing *future pilot icon concept* wording in the Dossier to differentiate old future-only milestones from the REAL selectable insignia now in the Hangar. Do not alter `web/dossier.js` future eligibility catalog or existing user match history.
- Local Solo/Dossier identity only. It is NOT a network-visible pilot icon or a purchased item, and does not affect AI, team markers, aim, hitboxes, armor, damage, KO/scoring rules, movement, LAN, monetization or the Google Play production signing path.

## Verification / gates
- Fast game-source regression: real isolated Dossier recording 0→3 matches, 10+ operator KOs, 12 wins; lock enforcement, correct badge glyph IDs, saving restores selected paint and badge, reverting to FIELD keeps old two-property JSON shape.
- Backup integration tests: old two-field file valid, optional three-field `emblem` valid, exact export/restore roundtrip, unknown IDs and unrecognized extra fields denied, future versions remain protected.
- Full Chromium mobile screens: disabled badge buttons on a new profile; after genuinely completed matches, VECTOR becomes enabled; operator badge equipped by actual click persists to localStorage and appears on Dossier. No horizontal clipping at 740×360, 915×412, 1280×720.
- Android APK: verify WebView parity, package ID/version monotonicity and same test-only AOSP signer for install-over updates. **Owner phone acceptance still required** to approve visual fit, Dossier retention, paint persistence and exact unlock behavior. Stable main is documentation-only; draft [PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85) remains unmerged.

## Rollback
If UX is distracting or saved progress affected, restore `0273a243393476c9ba5898f8bf589ee4be5ed15b` from the checkpoint. Never uninstall an existing app to test a package update unless user first backs up local stats. No automatic merge or Play publish.

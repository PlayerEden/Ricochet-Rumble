# v0.9.36 Custom Match local presets — milestone QA

**Candidate, not yet QA-accepted.** Source branch `feature/custom-presets-v0936` depends on v0.9.35 Custom Match; review as draft. Stable main unmodified.

## Expected shipped behavior
- Collapsible, phone-landscape LOCAL PRESETS section. Max 5 named saved match configurations; 1–24 character safe names. Duplicate names matched case-insensitively, no accidental replacement or hidden slot overwrite.
- Saved rules validated via existing `normalizeCustomDraft`; unsupported mode discarded on load; out-of-range fields fall back safely.
- Presets persist locally under new versioned key `rr-custom-presets-v1`, separate from `rr-custom-v1` active draft and old `rr-options-v06` Quick Play settings.
- Select + LOAD explicitly changes custom editor draft; two-step DELETE requires same selected name and cancels after selection/edit changes; RESET TO DEFAULT returns active draft to validated default without touching named presets or Quick Play.
- Corrupt JSON, unsupported version, invalid names/entries, storage denial and capacity overflow cannot crash or falsely report success. No HTML injection in displayed names.
- No cloud sync, account requirements, fake online persistence, save migration of game progression, cosmetic unlocks or changing scored game mechanics.

## Per-feature QA checklist
- [ ] Fast source mirrored Web/Android HTML/CSS/JS and scored kernel syntax/check parity
- [ ] Full smoke regression, 300 seeded arenas, named preset save/load/reset/delete, validation, persistence and Quick Play isolation
- [ ] Real Chromium local preset save -> reject duplicate -> reset -> reload -> load -> confirm deletion; actual Custom Survival/TDM remains playable
- [ ] Real 740x360, 915x412, 1280x720 landscape sizing with preset fold open/closed, controls reachable and no Help overlap
- [ ] Android debug APK/unsigned AAB built on identical code SHA; archive exact original APK & QA evidence/checksum
- [ ] Manual phone verdict, offline storage after app install/upgrade, and two-device LAN remain explicitly **pending**
- [ ] 50+ natural bot matches/pacing fairness is another dedicated future gate, not substituted by force-scored test

**Exit:** Only mark automated gate green with real CI evidence; do not merge into main or promote scored Quick Play without owner acceptance.

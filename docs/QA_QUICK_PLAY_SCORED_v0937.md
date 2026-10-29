# v0.9.37 scored Quick Play opt-in — independent milestone QA

**Status:** Under test; new dependent experimental branch `feature/quick-play-scored-opt-in-v0937`, parent unapproved v0.9.36 custom presets. No stable main merge.

## Implementation acceptance
- Default only Survival FFA + Team Survival, including legacy/null v1 `rr-options-v06` playlist payloads. All three scored modes unchecked; opt-in must be explicit.
- Checkbox choices validated by single allowlist and saved in existing versioned Quick Play preference schema; unknown modes discarded; empty selection blocks starting Quick Play.
- Mixed shuffle bag visits each selection before repeating and avoids immediate duplicate between bags. New procedural seed and match ID on every NEXT MATCH.
- Scored CQC, scored FFA and scored TDM all reuse real rule kernels with genuine pilot KOs and correct team aggregation/score targets/clocks. Scored maps, AI roster, shells and lives use fixed tested presets, ignoring unrelated Survival size/bot settings.
- Explicit `quickPlayMatch` provenance: scored and Survival Quick Play rounds rotate on the After Action replay; standalone CQC/FFA/TDM test buttons and Custom Match always replay the same mode/rules. No changes to LAN, scored kernel, controls or cosmetics.
- Settings show truthful count/status and clear scoring-trial warning, without compromising small landscape HELP or touch hit targets.

## Evidence required
- [ ] Fast syntax, Web/Android code/assets parity, 300 seeded maze and regression tests including mixed/scored shuffle/clock results
- [ ] Real Chromium settings default state → saved opt-in → all 3 scored rounds and actual draw/After Action → fresh rematches → standalone button nonrotation
- [ ] 740x360, 915x412 and 1280x720 menu/settings/scoreboard visual QA
- [ ] Android debug APK + unsigned AAB from exactly tested code SHA; original binary prerelease with QA screenshots and SHA256
- [ ] Real owner mobile acceptance of controls, score pacing, AI teammate effectiveness and mode variety; 50+ naturally simulated bot rounds (still pending)
- [ ] Two-phone LAN and Google Play production signing unchanged/pending

Do not mark code as automated PASS or publish the test APK until the actual CI passes. No automatic merge to stable main.

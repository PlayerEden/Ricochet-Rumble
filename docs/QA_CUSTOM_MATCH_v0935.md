# v0.9.35 Custom Match — automated milestone verified (2026-10-29)

**Code and automated QA gates PASSED**, physical-device and completion scope are still OPEN. The exact validated gameplay/test SHA is `8d7f8c7b42804f87a9203d5b8cc4055c408560c3`: [fast CI 40830083491 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40830083491), [full actual Chromium custom flow + landscape screenshots + Android debug APK/unsigned AAB 40830083479 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40830083479). [Immutable experimental v0.9.35 prerelease](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.35-custom-match-test) archives the **original exact QA-tested debug APK**, screenshots/QA ZIP, and SHA256 file. One-time release flow [40830719720 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40830719720), then the temporary workflow was deleted.

**Defect caught/repaired during the milestone audit:** Extra lobby action row on 740x360 landscape overlapped/intercepted the HOW TO PLAY help button, detected by Chromium pointer-click test [failed run 40829835912](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40829835912). Fix condensed TDM+Custom onto same final lobby row without removing functionality; subsequent Chromium visual and actual Custom Match tests PASS. Also ensured disabled scored-mode fields show their actual fixed values, not stale Survival defaults.

**Remaining acceptance:** real physical Android comfort and readable text; restart/reinstall/version migration; procedural team fairness and >=50 natural bot games; **Reset to Default, named local Save Preset/Load Preset** as requested by [Custom issue #38](https://github.com/PlayerEden/Ricochet-Rumble/issues/38); score/time mutators only after bounded testing; two-phone LAN and Google Play production signing remain unaccepted. Draft PR #54 stays stacked on v0.9.34; do NOT merge into main without explicit owner approval.

---

# v0.9.35 — Custom Match milestone audit

**Status:** Candidate under test. Branch `feature/custom-match-v0935` is stacked on v0.9.34; never equate tests with phone approval or Play-readiness.

## Functionality under review
- Independent tactical Custom Match menu and preview; full Survival FFA/Team Survival controls (3 map sizes, bots 0–4, 3 skill choices, 2/3/5 lives, validated 1/2/3/4/5/8 shell cap), honest zero-bot practice and Team Survival ally count.
- CQC, scored vehicle FFA, and TDM are available as *fixed experimental score/time/maps/roster presets* with adjustable AI skill. Locked controls clearly disclosed. No custom scoring sliders, XL, 3v3, online rooms or arbitrary physics.
- Own versioned `rr-custom-v1` strict-allowlist draft storage; no overwrite or modification to `rr-options-v06` Quick Play preferences and shuffle bag.
- After Action: same-rules fresh-sector/match ID, Edit Rules reopening last draft, and Main Menu. Match results use actual existing combat and scored kernels.

## Mandatory audit gates
- [ ] Node syntax and byte-for-byte Android/Web HTML+CSS+JS parity; 300 deterministic seeded arenas
- [ ] Headless modes, invalid input fallback, saved rules, Team bot minimum, no-bot practice, scored locks, rematch and prior modes
- [ ] Real Chromium click/select navigation editor -> Custom Survival -> win -> new sector -> Edit Rules -> Custom TDM; 740x360, 915x412, 1280x720 mobile layout
- [ ] Android installable debug APK and unsigned AAB with exact QA source SHA, immutable GitHub release/QA archive/checksums
- [ ] >=50 naturally completed bot matches per scored mode and physical phone touch/UX acceptance, **manual pending**

Previous accepted/working release remains v0.9.34 experimental, v0.9.21 is stable main.

**CI trigger note (2026-10-29):** Temporary PR base to main is solely for GitHub's main-only CI dispatch; restore draft PR #54 to its direct v0.9.34 parent after checks. No merge authority or phone acceptance.

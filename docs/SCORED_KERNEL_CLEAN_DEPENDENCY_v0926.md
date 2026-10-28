# Scored Match Kernel — Clean Dependency Handoff

**Status:** Source-only regression module; NOT selectable, not imported by the game or Android.  
**Dependency:** [Draft clean runtime PR #41](https://github.com/PlayerEden/Ricochet-Rumble/pull/41) from current stable main, which exact-mirrors the QA-passed [v0.9.25 Android release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.25-team-survival-allies-test).  
**Origin:** [Old scored-kernel draft #39](https://github.com/PlayerEden/Ricochet-Rumble/pull/39); this is a byte-identical *focused port* of its pure source/test, without its 61+ inherited prototype commits.

### Scope

- `game-data/rules/scored-match.v1.mjs`: pure score/timeout/draw state, per-player and per-team KO accounting and unique incident checks, and conservative safe spawn candidate ranking.
- `tests/scored-match-kernel.mjs`: exact pretested 20 test groups from #39.
- `.github/workflows/ci-smoke.yml`: one additional regression step.
- These modules remain outside the current WebView IIFE and Android assets. **No game behavior, saved modes, GUI, navigation, map generation, versions or debug APK changes.**
- This feature branch is derived from [clean branch](https://github.com/PlayerEden/Ricochet-Rumble/tree/integration/clean-v0925-approved-systems) for simplified future integration.

### Next feature acceptance

Implement CQC as an actual pilot-only scored preset in a *new* gameplay PR after the core branch is accepted. Required: deaths produced by real combat and unique per-match incident IDs, safe respawn hold/retry, countdown clock pausing with menu, opponent score and win/draw HUD, real results panel, fresh procedural arena and actual 10-KO or 3-minute finish; compare against untouched finite-life Survival. No new Quick Play choice until tests and owner phone review.

For full release, signing/versioning and data preservation are a separate tracked P0. LAN host authority needs safe protocol and two-phone acceptance, not implied by unit tests. See [Quality Audit PR #40](https://github.com/PlayerEden/Ricochet-Rumble/pull/40).

### Gate / rollback

- [ ] New fast CI on clean dependency passes, including 20 scored module tests, 300 seed validation, legacy survival and Android/web parity.
- [ ] Retarget PR base to clean integration #41 after independent CI verification, so the review diff is ONLY 2 files plus workflow and this document.
- [ ] Keep PR DRAFT; never merge new standalone scored module as if CQC/FFA/TDM already worked.
- Old #39 remains an archived origin, not an additional required merge.

# Sector Rebound — Clean v0.9.25 mainline integration candidate

**Status:** NEW **DRAFT** integration for owner review, not a main merge or Play release.
**Branch:** `integration/clean-v0925-approved-systems` forked directly from current `main` after quality audit.
**Source of shipped gameplay/art:** immutable exact v0.9.25 Team Survival source tag `96be4c0540419d909a5ca20b444a1841d7354834`.
**Known-good rollback APK:** https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.25-team-survival-allies-test

## Why this exists

Prior development history has six draft PRs (#24 Quick Play, #31 Lab D, #32 Lab E, #34 QA integration, #35 Team Survival and #39 scored kernel), stacked on top of each other. Merging each PR blindly risks duplicated/conflicting commits and unnecessary experimental milestones. The user accepted the Lab E look and After Action functionality provisionally, but has not explicitly signed off the v0.9.25 Blue/Red AI teammate build on physical Android.

Instead of merging old PRs, snapshot the **exact, CI-tested runtime state** of the v0.9.25 release into a new branch **based on today's `main`**, with a focused diff. This does not incorporate scored Deathmatch code or change Android package version/signing.

## Exact-source manifests

All 6 production runtime files are copied **byte-for-byte** from the immutable v0.9.25 release source. No new physics, art, menu behavior, gameplay rules, camera changes, LAN protocol changes or Android signing changes made during integration.

- `web/game.js` and `android/app/src/main/assets/game.js`: Git blob `084d50faba8b586824bc96f3733d7d9c6aed7b59`.
- `web/index.html` and `android/app/src/main/assets/index.html`: blob `0fa1eaadde03c4dc9f1e1baeae1679067183d35c`.
- `web/style.css` and `android/app/src/main/assets/style.css`: blob `0f61b21d4a8f371cb9bba63661568a17d96f6e93`.

No source change in those files is needed before testing; if a new bug is found, fix separately and retest on an explicit new source commit.

## Exact QA inputs

- `tests/smoke.mjs`: exact tested [QA audit #40](https://github.com/PlayerEden/Ricochet-Rumble/pull/40) regression suite with **300 seeded mazes**, 18 longer simulated bot sessions, 1500-frame stress, team identity and Quick Play logic. Source blob `eae746afa5825f9736f7729ca59f3613302d4ff1`.
- `tests/visual-qa.mjs` v0.9.25 screenshot suite, 740×360, 915×412, 1280×720.
- `tests/quick-play-live-flow-qa.mjs`: real Chromium victory, defeat, fresh maze and mode, persistent saved playlist and team bot counts.
- `.github/workflows/build-apk.yml`: original v0.9.25 full Chromium+Android QA path.

## Automated gates

- [x] [Fast CI 40633223788 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40633223788): 300 seeded arenas, AI/team/survival regressions and identical Web/Android assets.
- [x] [Full Chromium QA 40633223774 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40633223774): real responsive snapshots and live victory→NEXT MATCH→defeat/playlist persistence.
- [x] [Android debug APK and unsigned AAB build 40633223774 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40633223774) on exact tested source SHA `eaff10f4a059dbbdf9c386c6459fbc1cc1accea7` (not Play signed).
- [x] GitHub compare verified directly branched from `main`, exactly 11 changed review files, all six production assets exact Git blob equality with immutable v0.9.25, and PR mergeable. (Latest main documentation-only additions may cause a nonzero behind count; reconcile before merge.)
- [x] Archived exact passing source SHA and CI URLs here and in [main project status](https://github.com/PlayerEden/Ricochet-Rumble/blob/main/docs/PROJECT_STATUS.md); immutable v0.9.25 release remains known-good rollback.

## Human/device gates still open

- [ ] Owner physically tests [v0.9.25 APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.25-team-survival-allies-test): can see one Blue AI ally and Red enemy, correct occupied tank/mech colors and friendly AI behavior, true results and NEXT MATCH.
- [ ] Verify Android upgrade path with **stable signing** and monotonic internal version fields. Current `android/app/build.gradle` versionCode 38 and versionName `0.9.21-game-feel` are not corrected by this QA-only snapshot.
- [ ] Save preservation/reinstall warning; `allowBackup=false` and debug certificate changes mean uninstall may erase data.
- [ ] Two-phone LAN remains unverified; source-level protocol security and bounds need additional work before public multiplayer.
- [ ] Scored CQC/FFA/TDM remain unplayable in this branch; source-only kernel #39 is intentionally excluded.
- [ ] Full signed Google Play AAB and production rollout are separate.

## Promotion plan

1. Treat this branch as the **one review candidate** to bring accepted v0.9.25 functionality onto stable `main`; leave #24/#31/#32/#34/#35 and #39/#40 as historical/dependent draft references, not things to click-merge indiscriminately.
2. Once human team-color check and production change review are satisfied, promote this candidate with explicit owner approval and a recorded exact source SHA; preserve known-good v0.9.21 and v0.9.25 tags.
3. Build scored pilot-only CQC as a separate future PR branched from a known tested unified source, then reuse its scoring/respawn rules for FFA/TDM and Custom Match.

## Actual automation outcome / exact source (2026-10-27 local)

- **Fast CI [40633223788 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40633223788)**; **Full real Chromium + Android [40633223774 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40633223774)**. Both checked out code SHA `eaff10f4a059dbbdf9c386c6459fbc1cc1accea7` (subsequent document-only commits do not modify gameplay, tests, or build workflow).
- Actual full QA run uploaded `sector-rebound-qa-40633223774-1` screenshots (~6.2MB), `debug-apk-40633223774` (~85.6KB), and `unsigned-aab-NOT-FOR-PLAY-40633223774` (~73.9KB). **These are Actions artifacts that expire, not an immutable new release**; existing v0.9.25 permanent release remains the preferred owner Android test. APKs can have different debug signing/metadata even with byte-identical bundled game assets.
- **Remaining blocking manual checks:** owner phone verification of BLUE allied bot and RED opponents/vehicles and next match; Android reproducible signing/version migration; two-phone LAN protocol and user data continuity. **PR stays DRAFT**. Do not imply QA test actions amount to owner acceptance.
- [Source-only scored rules PR #42](https://github.com/PlayerEden/Ricochet-Rumble/pull/42) is a separate follow-on with 20 passing tests but no live scored mode, and its base is this branch. [Playable pilot-only CQC issue #43](https://github.com/PlayerEden/Ricochet-Rumble/issues/43) is the next gameplay deliverable after acceptance.

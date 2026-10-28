# Sector Rebound — Roadmap to Google Play v1.0

**Planning checkpoint:** 2026-10-27  
**Status:** Ordered development plan for review, **not a record of implemented features**.
**Completeness / missing gates:** [Prioritized roadmap audit and launch decisions (2026-10-27)](ROADMAP_COMPLETENESS_AUDIT_2026-10-27.md) — tracks first-run onboarding, testable fairness/bot targets, durable saves, Play/signing/license and exact v1 scope, without inflating the active feature list.  
**Current playable reference:** [v0.9.21 game-feel preview](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.21-polish-preview) (automated QA passed; owner phone acceptance outstanding).  
**Design references:** [Mode Bible](design/20_MATCH_MODES_BIBLE_DRAFT.md), [After-Action Bible](design/23_QUICK_PLAY_AFTER_ACTION_BIBLE_DRAFT.md), [Procedural Arena Identity](design/24_PROCEDURAL_ARENAS_IDENTITY_DRAFT.md), [Music Bible](design/21_MUSIC_AND_SOUND_BIBLE_DRAFT.md), [Pilot Icon Bible](design/10_PILOT_ICON_BIBLE.md), [Play foundation](PLAY_LAUNCH_v0.9.18.md).

## New comparative scored-mode research (2026-10-27)

Following owner request to benchmark how Halo, Call of Duty, Brawl Stars and vehicle games actually handle scored TDM/FFA, completed [**Deathmatch Benchmarks and Balance v1**](research/DEATHMATCH_BENCHMARKS_AND_BALANCE_V1_2026-10-27.md). This is a **source-backed design/QA plan, not shipped functionality**. Proposed first short-session targets: pilot-only CQC 10 KOs / 3 min (scoring kernel), vehicle FFA **10 KOs / 4 min** with 1 player + 3 AI ([issue #37](https://github.com/PlayerEden/Ricochet-Rumble/issues/37)), and honest balanced **2v2 TDM 15 TEAM KOs / 5 min** ([issue #36](https://github.com/PlayerEden/Ricochet-Rumble/issues/36)). After measurable fairness/performance, evaluate 3v3 with 20–25 / 6 min and an optional owner-suggested 30-KO Marathon. Do **not** silently replace existing FFA/Team SURVIVAL (last side standing) with a score race; they remain distinct modes. Full code-based KO vs armor/ejection distinction, safe dynamic respawns, true team bot participation, 300+ maze seeds, bot match telemetry and Android acceptance precede any playlist release. Existing [draft Team Survival fix #35](https://github.com/PlayerEden/Ricochet-Rumble/pull/35) is QA-passed but still awaits owner physical approval, and isn't scored TDM.

## Owner-approved camera milestone and immediate execution (2026-10-27)

- **Camera decision approved for now, not a request to retune zoom again:** pilot **1.07**, tank **0.82**, mech **0.77**, rendered apron **420** from the QA-passed [v0.9.22-dev5 test release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev5-final-camera-test). Last owner response: "I say we are good for now." Current changes are still on **draft PR #24**, not main. Do not equate camera acceptance with complete feature or multiplayer acceptance.
- **Close the v0.9.22 foundation responsibly:** Spot-check actual physical Android **Quick Play 0/1/2 mode selections, NEXT MATCH rotation/new maze, actual victory/defeat and KOs/deaths/time/lives**, and review the full automated QA already passing. Triage any findings. Then promote the accepted code through PR #24 and preserve a tagged rollback. Resolve Android internal versionName mismatch and signing plan before production Play delivery (not required to count camera acceptance).
- **Next independent player-facing arc — PILOT READABILITY [#26](https://github.com/PlayerEden/Ricochet-Rumble/issues/26):** Original, clear human head/torso/arms/legs and aimed sidearm from a top-down viewpoint; movement/recoil animation with performance and 3 phone-sized screenshot comparisons. Draw original art, do not copy other games' sprites. Design at the locked **1.07 foot camera**. Keep hitboxes/input unchanged.
- **Then MEASURED GAME JUICE [#27](https://github.com/PlayerEden/Ricochet-Rumble/issues/27):** Make ricochet, armor-break/ejection, actual operator KO and end-of-round feedback readable and satisfying. One small implement/test pass at a time, no particles/audio overproduction or competitive rule changes.
- **First true new mode: PILOT-ONLY CLOSE QUARTERS:** Small generated arena, absolutely no vehicles or boarding, genuinely scored operator KOs, safe fast respawns, clear 3-minute/score target and proper After Action. Only after real test approval should it appear in the Quick Play playlist.
- **After CQC:** True scored FFA, then Team Deathmatch, with tested spawns, bots, score/time/end-state and procedural arena connectivity. These should be distinct playable mechanics, not renamed survival presets.
- **Later:** Fair procedural generators and map seeding audits, offline Pilot Dossier/cosmetic identity, optional local/remote multiplayer, original audio (user may create Suno tracks), release signing/privacy and Google Play. The owner deliberately deferred two-phone LAN and music while current combat/art is refined.

**Development discipline:** No more feature work piled onto PR #24 once it is acceptable. Close it, cut a dedicated pilot-art branch from accepted main, gather Android screenshots + tested APK, record QA and rollback at each milestone. Current code is offline-first; do not present unimplemented CQC, scored modes, matchmaking, profiles or purchases as functional.

## Cross-cutting release gates added by the plan audit

[2026-10-27 full development-plan coverage and gap report](DEVELOPMENT_PLAN_COVERAGE_AUDIT_2026-10-27.md) is the companion dependency checklist to this phased roadmap. It **does not rewrite the approved artistic direction** or claim future features are implemented.

1. **Procedural authenticity [#28](https://github.com/PlayerEden/Ricochet-Rumble/issues/28):** new random *seed* alone is insufficient to promise a genuinely different arena geometry. Record generator version and normalized topology fingerprint, bounded recent-layout deduplication, valid/fair connected map and objective geometry, 300+ seeds per implemented mode/size, and deterministic failed-seed replay.
2. **Save/update continuity [#29](https://github.com/PlayerEden/Ricochet-Rumble/issues/29):** define versioned offline progression/preferences, migration/atomic writes, backup/restore policy, and exactly-once rewards before Pilot Dossier/IAP. Current debug signer conflicts and Android `allowBackup=false` can cause local data loss; no persistence claim until tested.
3. **Launch boundary/quality [#30](https://github.com/PlayerEden/Ricochet-Rumble/issues/30):** confirm with owner whether **offline-only v1** is acceptable while two-device LAN remains unaccepted; decide first-launch cosmetics/commerce scope; require realistic device/frame-time/heat/touch/resume acceptance, content rating, privacy/Data safety, trademark and asset/music rights, Play Console account-specific testing, and signed AAB upgrade QA. Do not assume online play, monetization or 18 finished pilots are mandatory for the first acceptable release.
4. **Identity/version discipline:** final release signing/custody [#20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20), immutable Android app ID before Play publication, incremented versionName/versionCode, restore/update strategy, and separate debuggable vs official Play releases.
5. **Release pacing:** after approved camera and v0.9.22 PR closure, create **a separate pilot-art PR**, then separate combat-feedback PR. No new score modes or cosmetic shop before those mechanics exist. Respect owner's deferral of audio and physical LAN testing.

**Current official Google Play requirement checks (as of 2026-10-27):** Android new apps/updates target API 36 since August 31, 2026; our Gradle build currently targets 36. Personal Play developer accounts created after November 13, 2023 have a conditional 12-tester/14-day closed test before applying for production access. A Data safety declaration and privacy policy may be required even when no data is collected. Recheck the current Play Console rules and the actual account's eligibility before submitting: [API policy](https://support.google.com/googleplay/android-developer/answer/11926878), [account testing](https://support.google.com/googleplay/android-developer/answer/14151465), [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469).

## Product promise

A compact, satisfying, original **mobile ricochet combat game**: every match gives all participants a **new procedurally generated maze**; success comes from piloting, situational awareness, ricochet geometry, team coordination, adaptation and some luck. Tanks/mechs, dismounted pilots and optional cosmetic identity give continuity. No purchased item changes combat outcomes.

We prioritize a smaller excellent game over a large unfinished live-service feature list.

## Actual technical baseline / risk

- The tested v0.9.21 development source is now on `main` after [merged PR #23](https://github.com/PlayerEden/Ricochet-Rumble/pull/23) and [full Android/visual QA](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40590979779). This is **not** a signed Google Play production release.
- The old `main` v0.6.3 era is preserved at `archive/legacy-main-v063-before-sector-rebound`. Historical chained PRs #1–#17 were closed as superseded **after** verifying their heads are included in merged `main`; old branches/releases are kept for rollback.
- Current local Wi-Fi host/guest code exists but physical two-phone correctness is **not yet verified**.
- Android API 36 debug APK and **unsigned** AAB work exists. Production release signing, app listing, privacy, purchase systems and devices QA remain open.
- Pilot portraits are **style-review SVG candidates** only; profile, entitlements and purchasable items have not shipped.

## Execution order / exit gates

### Gate 0 — Safeguard and integrate the baseline (FIRST)

1. Identify one canonical branch containing the latest v0.9.20 game plus all existing design docs.
2. Audit diff against parent history and public release; ensure web/Android assets mirror each other.
3. Preserve source, design bibles, tested APK download, failure seeds and screenshots in GitHub; do not depend on chat memory or ChatGPT Library.
4. Run game smoke/visual tests and Android debug APK + unsigned AAB; fix mismatches **before** building new modes.
5. Keep public Play publishing/release signing separate. Set a tagged *development* checkpoint after review.

**Exit:** one known-good baseline and rollback, source-backed test evidence, no invisible branch dependency.

### Gate 1 — Small, intentional game-feel pass (v0.9.21 concept)

- Remove filler menu wording and build info from main stage; retain actual working help/settings.
- Add subtle cycling or animation of **real existing tank/mech renderer** in the menu, respect reduced motion.
- Try a modest **6–8% world-view pullback** for tank, mech and pilot separately, with edge/phone-size screenshots.
- Try two even simpler foot-operator silhouettes at real game scale, not enlarged only; approve only one.
- Independently prototype **original** low-volume menu/combat synth music with Music/SFX controls and pause/Android focus. If it complicates this gate, ship it as a dedicated small follow-up rather than blocking mode work.

**Exit:** menu looks like a game, pilot is readable, mobile controls remain usable, no regression to tank/mech combat, tested APK.

### Gate 2 — Data-driven matches, playlists, and continuous Quick Play (v0.9.22 concept)

- Introduce `matchModeId` separate from app/network modes.
- Mode rules declare allowed maps, vehicle availability, teams, respawns, objective, score/time and spawns.
- Save enabled playlist modes; use a shuffled bag to avoid immediate repeat when possible.
- After-Action snapshot: verified KOs, outcome, match duration and correct mode details; do not fabricate unavailable metrics.
- Two explicit choices: **NEXT MATCH** → fresh mode-compatible maze; **MAIN MENU** → end session.
- Enforce **fresh procedural maze every round**; deterministic seeds allow debugging; host authoritative in LAN.
- Add per-session accumulated match results later without double-counting.

**Exit:** selection/continuation passes deterministic tests with existing gameplay even before all new modes are ready.

### Gate 3 — Finish three core gameplay modes (v0.9.23–0.9.25 concepts)

1. **Close Quarters:** small pilot-only arena, no vehicles/repair, scoring and safe fast respawn.
2. **FFA:** standard/large procedural vehicle battles, scored operator eliminations, time/KO targets, safe re-entry.
3. **Team Deathmatch:** fair teams, score, friendly ID, spawn-group validation; investigate in-map Forward Bays only after simple TDM works.

**Exit:** complete-match simulated and real play sessions, fair spawns, no indefinite games, correct victory/defeat/draw and persistent mode selection.

### Gate 4 — Pilot Dossier and earned cosmetics (v0.9.26+ concept)

- Offline-first schema-versioned callsign/profile, equipped avatar ID, lifetime KO/win/service stats and migration/backups.
- Confirm style of Recruit/Relay/Cold Cell **at 32/48px** before completing further roster waves.
- Earned starter and service cosmetics, basic tank/mech colors with parametric renderer and no combat benefit.
- Equipment ownership changes only from approved unlock events or verified transactions; future online syncing is optional.
- Hangar in menu is cosmetic; in-world Forward Bay is a different, mode-specific building.

**Exit:** reinstall/upgrade/missing-save recovery and no duplicated rewards; readable selection screens; stable IDs.

### Gate 5 — Audio, commerce and Play readiness (only after core retention quality)

- Two original music scenes with safe volume, suspend/resume and independent toggle; polished SFX.
- **Optional** rewarded ads outside active matches, only cosmetic rewards, privacy/data-safety reviewed.
- Small direct-purchase cosmetic offerings via actual Play Billing SDK, restore/refund/revocation/acknowledgement. **No pay-to-win.** No paid random gacha in the first launch plan.
- Secure secret-managed signed AAB with final package ID, privacy policy and Data safety; licensed asset provenance; correct Play Console ownership.
- Full phone touch/cutout/back navigation/low-end performance/accessibility and 2-device Wi-Fi tests.
- Store screenshots must show actual game, not mockups.

**Exit:** tested signed candidate, accurate listing and declarations, app can run offline as described.

### Gate 6 — Launch candidate / v1.0

Only when all core modes intended for v1.0 have passed hands-on acceptance and release QA. Publish a controlled test release, collect feedback, fix blockers, then submit production after account eligibility/review. Do not infer closed testing requirements from choosing to sell the app: Google Play account types and eligibility must be checked at submission.

## Post-v1.0 candidates (not launch blockers)

- Capture the Flag, balanced generated bases, flag pickup/return and objective bots.
- Elimination / spectator cam, one-life and finite-life variants.
- XL arena only after AI/camera/frame-time evidence.
- Daily seed/sector challenges and leaderboard integration.
- More cosmetics, trail effects, projectile finishes, optional Play Games sync.
- Remote internet PvP only with robust hosting/cheat mitigation and viable service budget.

## A practical rule for each development slice

**One primary player-facing change → matching tests → actual before/after screenshots (three landscape resolutions) → Android APK → GitHub pre-release link → review.**

Never declare a future feature present solely because it exists in a Bible. Never merge a failing branch. No nonfunctional profile/shop buttons, fake purchases or filler content.

## First action / immediate next build

**Gate 0 mainline integration is complete.** The v0.9.22 Gate 2 foundations (honest survival presets/playlists, fresh-sector NEXT MATCH, immutable results and camera) are in [draft PR #24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24) with [passing full Android/visual QA](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40601021890) and a permanent debug test APK. **Camera alone is owner-approved.** Next finish targeted phone acceptance of playlist/results, then review and merge PR #24. The next new feature branch is original pilot art #26, then combat feel #27; real CQC mode follows. Manual two-phone LAN acceptance and Google Play signing/compliance remain later gates.

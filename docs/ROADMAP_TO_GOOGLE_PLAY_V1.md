# Sector Rebound — Roadmap to Google Play v1.0

**Planning checkpoint:** 2026-10-27  
**Status:** Ordered development plan for review, **not a record of implemented features**.  
**Current playable reference:** [v0.9.21 game-feel preview](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.21-polish-preview) (automated QA passed; owner phone acceptance outstanding).  
**Design references:** [Mode Bible](design/20_MATCH_MODES_BIBLE_DRAFT.md), [After-Action Bible](design/23_QUICK_PLAY_AFTER_ACTION_BIBLE_DRAFT.md), [Procedural Arena Identity](design/24_PROCEDURAL_ARENAS_IDENTITY_DRAFT.md), [Music Bible](design/21_MUSIC_AND_SOUND_BIBLE_DRAFT.md), [Pilot Icon Bible](design/10_PILOT_ICON_BIBLE.md), [Play foundation](PLAY_LAUNCH_v0.9.18.md).

## Product promise

A compact, satisfying, original **mobile ricochet combat game**: every match gives all participants a **new procedurally generated maze**; success comes from piloting, situational awareness, ricochet geometry, team coordination, adaptation and some luck. Tanks/mechs, dismounted pilots and optional cosmetic identity give continuity. No purchased item changes combat outcomes.

We prioritize a smaller excellent game over a large unfinished live-service feature list.

## Actual technical baseline / risk

- Latest tested preview is v0.9.21 on `dev/sector-rebound-polish-v0921`; the integration candidate includes that source, but has not yet been accepted into default `main`. This is not a Google Play production release.
- As of integration preparation, GitHub `main` carried historical v0.6.3 source and latest v0.9.21 is a **review-pending integration candidate**. PRs #1–#17 form a largely chained draft history. Do not bulk-merge or delete; review integration branch, PR CI, source provenance and rollback separately.
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

**v0.9.20 baseline and the v0.9.21 game-feel preview exist and passed automated tests.** Finish the reviewed mainline integration/maintenance gate; then begin Gate 2 (real mode architecture and Next Match loop). Manual phone acceptance remains separate from automation.

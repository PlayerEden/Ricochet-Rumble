# Sector Rebound — Project Status & Chat Handoff

**Last checked:** 2026-10-27 (v0.9.21 mainline merged and historical PRs closed)  
**Project:** Sector Rebound (repository retains the historical name Ricochet-Rumble)  
**Purpose:** The first file to read when resuming development, switching chats, or handing work to another contributor.  
**Maintenance rule:** Update this file **in the same work session** as any new milestone, major decision, release, or changed blocker. Always distinguish tested code from proposed designs.

**Mainline baseline:** `main` contains the working Sector Rebound **v0.9.21** code and design archive after [merged integration PR #23](https://github.com/PlayerEden/Ricochet-Rumble/pull/23), merge commit [`4372ad95`](https://github.com/PlayerEden/Ricochet-Rumble/commit/4372ad95f19eb30256b216a101b16bb529df7980). [Full Android, Chromium and gameplay QA run 40590979779](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40590979779) passed on integration SHA `27cc06336b982a6a1569fe5b3c9a00fd641939e0`; [fast CI](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40590979843) and design validation also passed. No gameplay code was changed after that test. See [permanent integration QA record](QA_MAINLINE_v0921_2026-10-27.md).

**Repository cleanup:** Historical draft PRs **#1–#17 closed as superseded** with explanations, not independently merged or deleted. All their heads were confirmed ancestors of the integrated code; the [branch register](BRANCH_REGISTER.md) retains historical references. The original v0.6.3 `main` is preserved at `archive/legacy-main-v063-before-sector-rebound`. [Repository audit](GITHUB_AUDIT_2026-10-27.md) is a pre-cleanup historical snapshot, not current repository status. No open PRs remained immediately after consolidation.

**QA archive secured:** [Original screenshot/simulation ZIP](https://github.com/PlayerEden/Ricochet-Rumble/releases/download/v0.9.21-polish-preview/v0921-integration-qa-40590979779.zip) and [SHA-256 manifest](https://github.com/PlayerEden/Ricochet-Rumble/releases/download/v0.9.21-polish-preview/v0921-integration-qa-MANIFEST.txt) are now permanent assets of the existing v0.9.21 pre-release; [archive workflow passed](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40592143998). #21 closed; existing APK unchanged.

**Remaining work:** [#19 CI/release preview validation](https://github.com/PlayerEden/Ricochet-Rumble/issues/19) (normal CI and Android QA proven; new immutable publishing workflow not yet exercised); [#20 signing-key custody and package identity](https://github.com/PlayerEden/Ricochet-Rumble/issues/20); [completed #21 durable QA evidence](https://github.com/PlayerEden/Ricochet-Rumble/issues/21); [#22 physical Android/two-device LAN acceptance](https://github.com/PlayerEden/Ricochet-Rumble/issues/22). Do not conflate these with new gameplay implementation.

## Start here — exact state

| Item | Status |
| --- | --- |
| Repository/default branch | [PlayerEden/Ricochet-Rumble](https://github.com/PlayerEden/Ricochet-Rumble), **`main` now contains v0.9.21** and project documentation after merged PR #23 |
| Latest tested development preview | **v0.9.21 game-feel preview**, [GitHub Release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.21-polish-preview) (debug APK, not Play-ready) |
| Latest consolidated source | [`main`](https://github.com/PlayerEden/Ricochet-Rumble/tree/main) at integration merge `4372ad95`; the original v0.9.21 branch and closed PR #17 are kept for provenance |
| Preserved pre-polish development checkpoint | `dev/sector-rebound-integrated-v0920`, from [integration notes](https://github.com/PlayerEden/Ricochet-Rumble/blob/dev/sector-rebound-integrated-v0920/docs/INTEGRATION_CHECKPOINT_v0920.md) |
| Automation status | **Passed** on integration candidate: [full Android + Chromium + gameplay run 40590979779](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40590979779), alongside latest fast smoke and design validation |
| Human acceptance status | **Pending**: real Android pilot visibility, camera/controls, music level; long play session and **two physical phones on the same Wi-Fi** |
| Next implementation | **v0.9.22 — mode/Quick Play architecture, verified result snapshots, NEXT MATCH flow and a new generated sector every round** |

**Source of truth:** use tested `main` for the next development slice. The previous game branches remain for rollback, and the now-closed chained PRs remain as archived discussions. A successful GitHub build does not establish physical-phone reliability or Google Play readiness.

## What works versus what is only planned

### Implemented in the v0.9.21 preview
- Offline solo ricochet combat: player, bots, tanks, mechs, on-foot pilots after ejection, movement/combat, supplies, maze navigation, minimap and after-action screen.
- Procedurally generated seeded small/standard/large mazes; existing setup offers FFA, humans-vs-bots and teams, but **these existing team options are not the new score-based playlist modes**.
- Same-Wi-Fi host/guest code and Android packaging; two-physical-device play has **not** been accepted as reliable yet. No remote internet matchmaking.
- Game-first home lobby, real tank/mech display cycling every eight seconds, simplified human pilot, roughly 7% extra camera view, original offline WebAudio experiment with separate MUSIC/SOUND FX controls.
- Android API 36 compilation; downloadable **debug** APK and **unsigned** AAB verification, not a signed production Play release.

### Designed but **not** implemented
- Selected-mode Quick Play shuffle bag, complete-match score/time rules, verified per-mode scoreboards and continuous Next Match session flow.
- Pilot-only Close Quarters, score-based Free-for-All, Team Deathmatch, Capture the Flag, Elimination, Forward Bays/Field Depots, XL field and mode-specific spectator/respawn systems.
- Pilot Dossier profile, persistent progression, earned/purchased cosmetic inventory, store, ads, cloud backup, Google Play Games, Billing, remote matchmaking or public PvP servers.
- Live cosmetic/avatar roster: SVG prototypes and design catalog exist; no player-entitlement or purchases have shipped.

## Non-negotiable game identity

**Every sector is different.** A Quick Play round gets a **new, mode-valid, connected procedural maze** even when the playlist chooses the same mode again. The same participants must see identical authoritative geometry and objectives. Randomness creates variety and occasional luck, while spawn access, team fairness, alternate routes and clear ricochet combat keep skill relevant. Log reproducible seeds for bugs; don't make a permanent memorized-map rotation. Preserve vehicle/pilot tactical tradeoffs and never sell competitive advantages.

**Player-facing flow:** Home → choose supported modes → QUICK PLAY → concise mode briefing → battle → true AFTER ACTION result/statistics → player chooses **NEXT MATCH** or **MAIN MENU**. Never silently start the next match; never force login, ads or shop screens into this loop.

## Ordered development gates

| Gate | Milestone | Current state / exit test |
| --- | --- | --- |
| 0 | Preserve and integrate known-good code | **Complete:** reviewed v0.9.21 game integrated into `main`, tested full QA, old main and rollback branches preserved. |
| 1 | Game-feel/menu/pilot/camera/synth music | **v0.9.21 automation passed**; owner's physical-device acceptance pending. |
| 2 | v0.9.22 mode IDs + Quick Play foundation | **NEXT:** implement in small isolated slices, not a wholesale rewrite. |
| 3 | Core modes Close Quarters, scored FFA, TDM | Planned v0.9.23–0.9.25 concept; verify real match pacing, scoring and map fairness. |
| 4 | Offline-first Pilot Dossier/Hangar + earned cosmetics | Planned v0.9.26+; versioned saves, stable cosmetic IDs, no fake purchase buttons. |
| 5 | Complete audio, optional privacy-reviewed monetization, Play submission readiness | Not shipped; signed AAB, identity, Data safety/privacy, purchase recovery and hardware QA required. |
| 6 | v1.0 controlled release | Only after passing real-device, long-match, mode, and store compliance gates. |

**After v1.0 candidates, not launch blockers:** CTF, Elimination/spectating, larger maps after performance validation, seed challenges, and remote online PvP if a sustainable architecture is designed.

## v0.9.22 implementation plan — next work, not yet accomplished

1. **Architecture only:** Create stable, validated `matchModeId` presets **separate** from the existing solo/host/guest network state and legacy team setting. Start with the actual modes currently supported; do not pretend CQC/TDM score modes already work. Declare objective, allowed sizes/vehicles, team rules, score/time and respawn policies per preset.
2. **Persist the player playlist:** Stable versioned preference; enable/disable released modes; handle zero selected, one selected, retired IDs and no-repeat shuffled-bag behavior with deterministic tests.
3. **Verified results:** Build an immutable final-match snapshot and one-time completion event. Include only metrics currently credited by real game events. Correctly distinguish *pilot/operator elimination* from vehicle destruction/hits. Add match clock/death/score counters only with tests.
4. **Real After Action:** Show truthful mode/outcome/core stats, then functional **NEXT MATCH** and **MAIN MENU**. This must work solo before LAN. Don't fabricate accuracy, economy, rank, flag captures or undefined scoreboard totals.
5. **Fresh match on continuation:** New match ID, new seed and validated maze, clean stats/teams/objectives with retained selected modes and optional session totals; a short next-mode briefing. A single selected mode repeats with a **different sector**.
6. **LAN adaptation after solo QA:** Host remains authoritative for mode, seed, state, stats and continuation; guest cannot independently start the next round. Test with two actual Android phones before calling it ready.

**Acceptance for Gate 2:** tests for mode subsets and shuffle behavior, accurate outcome attribution, no double-counting, no stale controls, map freshness/connectivity, deterministic failure-seed replay, Android Back/background behavior, and before/after screenshots at 740×360, 915×412 and 1280×720. Full smoke suite; Android/web bundle parity; debug APK and unsigned AAB as appropriate. Keep a rollback branch. Real on-device review remains separate from CI.

## Canonical detailed references (on the current development branch)

- [Google Play v1.0 roadmap](https://github.com/PlayerEden/Ricochet-Rumble/blob/dev/sector-rebound-polish-v0921/docs/ROADMAP_TO_GOOGLE_PLAY_V1.md) — detailed gates and open launch questions.
- [Match modes & playlist Bible](https://github.com/PlayerEden/Ricochet-Rumble/blob/dev/sector-rebound-polish-v0921/docs/design/20_MATCH_MODES_BIBLE_DRAFT.md) — proposed mode rules, respawn/vehicles, Forward Bays.
- [Quick Play/After Action Bible](https://github.com/PlayerEden/Ricochet-Rumble/blob/dev/sector-rebound-polish-v0921/docs/design/23_QUICK_PLAY_AFTER_ACTION_BIBLE_DRAFT.md) — shuffle bag, stat truth, solo and LAN continuation.
- [Procedural Arena Identity](https://github.com/PlayerEden/Ricochet-Rumble/blob/dev/sector-rebound-polish-v0921/docs/design/24_PROCEDURAL_ARENAS_IDENTITY_DRAFT.md) — generation/fairness/seed replay.
- [FIELDGRID design archive](https://github.com/PlayerEden/Ricochet-Rumble/blob/dev/sector-rebound-polish-v0921/docs/design/README.md) — graphics/pilots/cosmetics, with approval gates.
- [v0.9.21 game-feel audit](https://github.com/PlayerEden/Ricochet-Rumble/blob/dev/sector-rebound-polish-v0921/docs/design/reviews/2026-10-27_V0921_GAME_FEEL_QA.md) — exact code/QA/manual limitations.
- [Development protocol](DEVELOPMENT_PROTOCOL.md) — branch, release, testing, review, and chat recovery conventions.

These linked documents contain some historical "current v0.9.20" wording: this **handoff date and verified v0.9.21 branch** supersede those status labels; their design specifications remain useful.

## Open acceptance / decisions

- Owner's v0.9.21 real-phone feedback: on-foot silhouette at wider zoom, menu showroom quality, synth sound level, controls.
- Two separate Android phones: nearby discovery/join, shared map, hits/respawns, pause/background, and future next-match handoff.
- Validate final release title/package identity: repo still `Ricochet-Rumble`; Android package `com.playereden.ricochetrumble`. Changing the package after publishing creates a different app.
- Future CTF flag carrier, Forward Bay name, final scoring limits, monetization model and Google Play account ownership are **not decided**; avoid inventing approvals.
- GitHub Actions costs should be respected: avoid wasteful full Android builds for documentation-only changes; artifact retention is temporary, GitHub Releases and Git history are longer-lived.

## Update log

- **2026-10-27 (evidence archive):** Archived authentic v0.9.21 integration screenshots, seeded reports and checksums to GitHub Release assets before temporary Actions retention expiry. Closed issue #21; no APK replacement or gameplay changes.

- **2026-10-27 (integration accepted):** [PR #23](https://github.com/PlayerEden/Ricochet-Rumble/pull/23) merged `main` at `4372ad95` after [passing full QA](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40590979779). Preserved legacy `main` as `archive/legacy-main-v063-before-sector-rebound`; closed all 17 historical chained PRs with explanatory comments. Production release signing, immutable preview workflow smoke launch, physical audio and two-device LAN remain unverified.

- **2026-10-27 (integration preparation):** Created separate candidate from the v0.9.21 source, incorporated main-only audit/status/issue templates, archived the 31K-character historical README, replaced version-specific QA/release workflow config and added lightweight PR smoke checks. Candidate is **not** yet declared tested or merged. Physical device testing remains pending.


- **2026-10-27:** Verified draft PR #17, head `dev/sector-rebound-polish-v0921`, v0.9.21 release and successful run; documented pending owner/device acceptance. Established default-branch handoff and next Gate 2 plan. No v0.9.22 gameplay implemented in this documentation pass.

## Resume prompt for any new ChatGPT conversation

"Continue Sector Rebound development from the tested `main` branch at GitHub `PlayerEden/Ricochet-Rumble`. First read `docs/PROJECT_STATUS.md`, `docs/DEVELOPMENT_PROTOCOL.md`, `docs/BRANCH_REGISTER.md` and the linked QA/roadmap/design documents. PR #23 consolidated v0.9.21 on 2026-10-27; historical PRs #1–#17 are closed, not deleted. Distinguish implemented game features from design drafts; preserve rollbacks, document tests/manual gaps, and develop the next v0.9.22 Quick Play slice in a new PR based on `main`."

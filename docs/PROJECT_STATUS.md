# Sector Rebound — Project Status & Chat Handoff

**Last checked:** 2026-10-27 (integration candidate prepared)  
**Project:** Sector Rebound (repository retains the historical name Ricochet-Rumble)  
**Purpose:** The first file to read when resuming development, switching chats, or handing work to another contributor.  
**Maintenance rule:** Update this file **in the same work session** as any new milestone, major decision, release, or changed blocker. Always distinguish tested code from proposed designs.

**Candidate verification:** Original [fast PR smoke](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40590455874) and [design validation](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40590455818) passed on `cbf56753`. The source diff against v0.9.21 modifies only docs and workflows; no gameplay assets. This documentation/merge follow-up must re-run PR checks. **Full Android QA on the exact candidate and physical two-phone testing are not complete.**

**Repository health audit (2026-10-27):** [Verified audit & priority tracker](GITHUB_AUDIT_2026-10-27.md). All 28 historical branches and 17 chained draft PRs remain intact; the integration candidate adds a 29th branch and PR #23. Follow [mainline integration #18](https://github.com/PlayerEden/Ricochet-Rumble/issues/18), [CI/release process #19](https://github.com/PlayerEden/Ricochet-Rumble/issues/19), [signing custody #20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20), [durable QA evidence #21](https://github.com/PlayerEden/Ricochet-Rumble/issues/21), and [real-phone/LAN testing #22](https://github.com/PlayerEden/Ricochet-Rumble/issues/22). These are **open tasks**, not completed feature changes.

**Mainline integration candidate:** [integration/sector-rebound-mainline-v0921](https://github.com/PlayerEden/Ricochet-Rumble/tree/integration/sector-rebound-mainline-v0921) has the v0.9.21 game plus the default branch's GitHub audit/handoff documents, readable README and workflow cleanup. [Draft PR #23](https://github.com/PlayerEden/Ricochet-Rumble/pull/23) into `main` is **open and pending review**; no production merge is implied. The old main was v0.6.3 before this candidate. A new `README` and `docs/BRANCH_REGISTER.md` are part of the candidate. See [#18](https://github.com/PlayerEden/Ricochet-Rumble/issues/18) and [#19](https://github.com/PlayerEden/Ricochet-Rumble/issues/19).

## Start here — exact state

| Item | Status |
| --- | --- |
| Repository/default branch | [PlayerEden/Ricochet-Rumble](https://github.com/PlayerEden/Ricochet-Rumble); historical `main` was v0.6.3 before the v0.9.21 integration candidate; inspect the live PR/branch before assuming merged status |
| Latest tested development preview | **v0.9.21 game-feel preview**, [GitHub Release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.21-polish-preview) (debug APK, not Play-ready) |
| Latest source branch | [`dev/sector-rebound-polish-v0921`](https://github.com/PlayerEden/Ricochet-Rumble/tree/dev/sector-rebound-polish-v0921), [draft PR #17](https://github.com/PlayerEden/Ricochet-Rumble/pull/17), **not merged** |
| Preserved pre-polish development checkpoint | `dev/sector-rebound-integrated-v0920`, from [integration notes](https://github.com/PlayerEden/Ricochet-Rumble/blob/dev/sector-rebound-integrated-v0920/docs/INTEGRATION_CHECKPOINT_v0920.md) |
| Automation status | v0.9.21 smoke, seeded combat diagnostics, Chromium phone-size visual checks, Android debug APK and unsigned AAB: **passed**, [run 40587475575](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40587475575) |
| Human acceptance status | **Pending**: real Android pilot visibility, camera/controls, music level; long play session and **two physical phones on the same Wi-Fi** |
| Next implementation | **v0.9.22 — mode/Quick Play architecture, verified result snapshots, NEXT MATCH flow and a new generated sector every round** |

**Do not infer that GitHub `main` contains v0.9.21 gameplay before integration PR approval/merge.** The development branches and chained draft PRs preserve that history. A reviewed integration into `main` remains a separate task; never bulk-merge old PRs merely to make the default branch appear current.

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
| 0 | Preserve and integrate known-good code | **Development checkpoint created** at v0.9.20. Default `main` consolidation still pending careful review. |
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

- **2026-10-27 (integration preparation):** Created separate candidate from the v0.9.21 source, incorporated main-only audit/status/issue templates, archived the 31K-character historical README, replaced version-specific QA/release workflow config and added lightweight PR smoke checks. Candidate is **not** yet declared tested or merged. Physical device testing remains pending.


- **2026-10-27:** Verified draft PR #17, head `dev/sector-rebound-polish-v0921`, v0.9.21 release and successful run; documented pending owner/device acceptance. Established default-branch handoff and next Gate 2 plan. No v0.9.22 gameplay implemented in this documentation pass.

## Resume prompt for any new ChatGPT conversation

"Continue Sector Rebound development. Read `docs/PROJECT_STATUS.md` and `docs/DEVELOPMENT_PROTOCOL.md` on GitHub `PlayerEden/Ricochet-Rumble`, then inspect the linked latest development branch, open PR, design Bibles, and latest CI evidence. Report exact implemented versus proposed status. Preserve rollback branches and releases, update this handoff as work lands, and tackle the next small gated development slice with tests/screenshots and a GitHub release. Do not assume `main` has the latest game."

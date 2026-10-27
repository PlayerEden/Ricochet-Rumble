# Sector Rebound — Development Plan Coverage Audit
**Date:** 2026-10-27  
**Scope:** GitHub `main`, draft [PR #24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24), existing FIELDGRID design Bibles, open issues, Android packaging and verified full QA.  
**Status:** Planning/coverage audit — **not** a code release, user approval for new scope, production-ready declaration, or a physical test.

## Executive conclusion
**The major product pillars are represented.** The primary risk is *execution and missing contracts between phases*, not an absent core concept. Existing Bibles include visual system, pilot icons and roster, cosmetics, match modes, music, UI/game feel, After Action/playlist and procedural arenas. GitHub also has the roadmap, handoff, development protocol, branch/rollback register, signing notes and actual phone-test checklists.

The plan now has three new explicit follow-up issues: [#28 procedural map invariants](https://github.com/PlayerEden/Ricochet-Rumble/issues/28), [#29 offline save/migration/upgrade contract](https://github.com/PlayerEden/Ricochet-Rumble/issues/29), and [#30 v1 scope/QA/Play gate](https://github.com/PlayerEden/Ricochet-Rumble/issues/30). These fill cross-cutting gaps but are **not claims of implementation**.

## State verification — do not conflate documents with running code

| Subject | Current evidence / truth | Work left |
|---|---|---|
| Sector Rebound game and FIELDGRID identity | Game source on tested v0.9.21 `main`; master visual Bible and lore/identity docs | Final title/trademark check prior to marketing |
| Tank, mech and ejectable on-foot pilot | In-game and QA-backed | Original believable pilot art [#26](https://github.com/PlayerEden/Ricochet-Rumble/issues/26) and further feel polish [#27](https://github.com/PlayerEden/Ricochet-Rumble/issues/27) |
| Camera and handheld HUD | Physical Android feedback accepted *current camera direction*: pilot 1.07, tank 0.82, mech 0.77; dev5 full QA passed | Formal phone sign-off on remaining match functions, not further routine zoom |
| Playlist and continuous Quick Play | v0.9.22 dev branch: two existing survival variants, saved enabled mode set, shuffle bag, NEXT MATCH and new seeds | Confirm 0/1/2 selection/persistence/three rounds on phone and integrate draft PR #24 |
| After Action statistics | v0.9.22 dev branch: frozen solo final result, operator KOs, real deaths/respawns, active simulated duration, lives/win-loss | Physical acceptance; multiplayer host-authoritative result packets and optional session ledger later |
| Procedural maze identity | Fresh seeded generation exists; fairness/connectedness vision documented | **New seed does not guarantee different geometry**; define topology fingerprint, bounded dedup retry/fallback, seeded stress validation [#28](https://github.com/PlayerEden/Ricochet-Rumble/issues/28) |
| CQC, scored FFA, TDM | Defined in Match Modes Bible | **Not implemented**: mode-specific equipment/spawns, scoring, respawn, timeouts/ties, HUD and bots |
| CTF, Elimination, Forward Bays / XL | Clearly proposed in design drafts | Do not add to launch scope by implication. Design later after core modes and generator fairness |
| Pilot Dossier, unlocks and cosmetics | Design Bibles, stable concept catalog exists | Art masters, offline save schema, idempotency, migration, entitlement validation [#29](https://github.com/PlayerEden/Ricochet-Rumble/issues/29) |
| Music/SFX | Design Bible and partial runtime controls | Produce original/licensed tracks and mobile focus/volume verification later as owner requested |
| Local Wi-Fi multiplayer | Host/guest technical foundation exists | Two physical devices, host authority/score/seed agreement, disconnect/rejoin [#22](https://github.com/PlayerEden/Ricochet-Rumble/issues/22); owner deferred |
| Remote multiplayer / ranked | Future concept | Architecture, hosting/security/moderation/service cost; **post-v1 candidate**, do not promise |
| Android packaging | Successful debug APK, unsigned AAB, Chromium/screenshots, source parity | Stable update signing, versionCode/versionName, migration, package identity and Play-signed AAB |
| Production/Google Play | Roadmap, security issue and signing document | Explicit release scope [#30](https://github.com/PlayerEden/Ricochet-Rumble/issues/30), signing custody [#20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20), Play Console account/test/policy gating |

**Last verified source:** full Android+Chromium run [40601021890 passed](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40601021890), source `55e69a828f5f791bc7f4244b01b7efddd36ebe3f`; [dev5 test release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev5-final-camera-test). This source is still **draft PR #24**, not merged to `main`.

## What we have sorted into phases

### A — Establish the release-quality foundation (NOW; v0.9.22 closeout)
1. Preserve approved camera values and avoid further casual pullbacks.
2. Physically spot-check **actual** Quick Play and results: 0/1/2 selected modes, app-restart persistence, at least three NEXT MATCH rounds, result accuracy, no confusing stale bots/bullets, screen readability.
3. Verify mode labeling says *survival variants* rather than misleading scored FFA/TDM.
4. Validate PR #24 source parity, passing smoke/full QA and screenshot evidence; make any necessary acceptance fixes without introducing unrelated features. Then review and integrate as a single known-good, versioned milestone. Keep prior releases/tags as rollback.
5. Record signed/unsigned distinction and Android internal versionCode/versionName discrepancy; do not promise stable in-place update from CI debug keys.

### B — Character and moment-to-moment combat (NEXT; small independent slices)
1. [#26](https://github.com/PlayerEden/Ricochet-Rumble/issues/26): two to three **original**, readable human pilot silhouette concepts tested at **actual 1.07 camera** on supported Android landscape sizes, including idle/walk/aim/eject. Preserve hitboxes and combat rules.
2. [#27](https://github.com/PlayerEden/Ricochet-Rumble/issues/27): measured ricochet impact, armor break/eject, real KO feedback and modest menu-showcase oomph; judge against real 5–10 minute sessions. Maintain performance and avoid visual noise.
3. Polish touch/aim ergonomics, ejection/reboarding clarity, camera transition/indicators and meaningful controls/help/onboarding. Tie changes to testable complaints, not indiscriminate feature creep.

### C — Distinct playable modes and fair procedural maps
1. **Pilot-only CQC**: no vehicles or boarding, correct short-range spawn geometry, independent scored KO/time target/finite draw handling, safe timed respawns and bots able to use pilot mode. Do not expose it in playlist early.
2. **Scored FFA**: tanks/mechs/on-foot pilot recovery, operator-only KO attribution, real scoring, reachable resource spawns and time/score victory end state.
3. **TDM**: actual team assignments, safe spawns, balancing, shared score, bot roles and clear victory/draw. Forward Bays after basic TDM is fun and validated.
4. [#28](https://github.com/PlayerEden/Ricochet-Rumble/issues/28): deterministic generator version, topology fingerprints, bounded different-layout retry, 300+ seeds per implemented mode/size, stored failure seeds, pilot/vehicle connectivity and fair objectives. Random seed ≠ guaranteed new geometry.
5. Only then investigate Elimination, CTF, XL sectors and procedural Forward Bays as later features.

### D — Account-free identity, persistence and optional cosmetics
1. [#29](https://github.com/PlayerEden/Ricochet-Rumble/issues/29): explicit versioned offline save and migration/backup policy, stable identifier, atomic writes and no duplicate match awards; test upgrade/reinstall before introducing lifetime achievements.
2. Dossier callsign/identity, genuine stats and a small **polished free** cosmetic set, then earned cosmetics. Catalog Bibles are concepts; no fake UI/shop.
3. Optional paid cosmetics only after actual entitlement ledger/Play Billing restore/refunds/tested purchases and user approval. Keep all purchases gameplay-neutral; no paid randomized gacha by default.

### E — Multiplayer, audio and post-launch extensions
1. Physical local Wi-Fi two-phone host/guest checks when owner has hardware: same seed/map/rules, actual authority, outcome replication, background/leave/disconnect and ready/rematch behavior. Do not block solo visual/gameplay progress on unavailable second phone.
2. Audio scene quality, original music/SFX and Android audio focus when owner ready; audio controls must remain independent and offline-safe. Record any third-party/generated music source and commercial usage rights.
3. Online PvP/ranked/clans/leaderboards only after networking architecture, operations cost, anti-cheat/abuse mitigation and privacy; plan as post-v1 unless explicitly re-scoped.

### F — Public release / QA gate
1. [#30](https://github.com/PlayerEden/Ricochet-Rumble/issues/30): owner chooses explicit *v1 offline solo vs mandatory LAN*, exact mode roster, whether monetization is deferred, Android device/performance coverage and support channel.
2. Complete signing-key custody & final package identity [#20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20), corrected internal versioning, Play App Signing, signed AAB/update/migration tests. Repository's historical encrypted signing backup is a **review item**, not evidence of compromise; never paste keys/secrets.
3. Confirm title/trademark and app name availability. Establish asset/music provenance and a release license decision for the currently public source repository (no OSS license identified in current root tree).
4. Check current Play target API, account eligibility/closed-test requirements, privacy policy & Data safety even for an offline app, age/content rating, store assets based on real screenshots, and billing/ads disclosures only if used. Verify each requirement at actual publication, not a permanent fixed assumption.
5. Test on varied real Android phones and OS versions: landscape/cutouts, back/home, low GPU/frame pacing, heat/battery, save/update/restore, errors, touch controls, crash/disconnect and offline startup. Record real results and known limitations. Release only after an explicit **go/no-go**.
6. Preserve release/test-build source SHA, checksums, visual QA evidence, changelog, a safe rollback path and a full project-status handoff.

## Important missing decisions, not blockers for current pilot art
- **v1 scope:** is a great **offline-solo** CQC+FFA+TDM release acceptable with LAN delayed, or must two-device LAN be validated before launch? Recommend first option but **owner has not chosen**. This is a product decision, not a technical implementation claim.
- **Monetization timing:** excellent free pilot/cosmetics first vs real paid shop at v1; recommend defer payments until game quality, save migrations and Play Billing are genuinely ready. Owner confirmation pending.
- **Match pacing:** precise score/time/respawn targets in Mode Bible are **playtest hypotheses**, not balanced confirmed rules. Need recorded session metrics and human fun/retention feedback.
- **Map variety guarantee:** freshness of seed vs unique traversable geometry. Cannot honestly claim every field is truly different without topological comparison and bounded retry.
- **Uninstall/update safety:** manifest `allowBackup=false`, debug signing changes, and `versionName '0.9.21-game-feel'` with `versionCode 38` even for dev5. Prevent irreversible saved progress surprises before profile/unlocks launch.
- **Privacy and analytics:** no mandatory account or surveillance implied; diagnostic telemetry is optional future work and needs privacy review. Plan a manual bug form (device/Android version, mode/seed/generator version, reproduction steps) even if analytics are never added.
- **Project identity/legal:** `Sector Rebound` search is not an enforceable trademark clearance. Review before publishing, not every art pass.
- **Source licensing:** public GitHub does not automatically imply open-source rights; decide whether to keep source publicly viewable without a license, add a license, or change policy.

## Documents and link discipline
- Master handoff: [PROJECT_STATUS.md](PROJECT_STATUS.md)
- Development process: [DEVELOPMENT_PROTOCOL.md](DEVELOPMENT_PROTOCOL.md)
- Phase roadmap: [ROADMAP_TO_GOOGLE_PLAY_V1.md](ROADMAP_TO_GOOGLE_PLAY_V1.md)
- Design authority/index: [FIELDGRID Design Archive](design/README.md)
- Major Bibles: [Modes](design/20_MATCH_MODES_BIBLE_DRAFT.md), [After Action](design/23_QUICK_PLAY_AFTER_ACTION_BIBLE_DRAFT.md), [Procedural](design/24_PROCEDURAL_ARENAS_IDENTITY_DRAFT.md), [Pilot](design/10_PILOT_ICON_BIBLE.md), [Cosmetics](design/12_COSMETIC_EXTENSION_BIBLE.md), [Audio](design/21_MUSIC_AND_SOUND_BIBLE_DRAFT.md)
- Current user acceptance: [dev5 phone list](PLAYTEST_v0922_DEV5_FINAL_CAMERA.md), full test [run 40601021890](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40601021890)
- Open work: [#19 CI/release](https://github.com/PlayerEden/Ricochet-Rumble/issues/19), [#20 signing](https://github.com/PlayerEden/Ricochet-Rumble/issues/20), [#22 LAN hardware](https://github.com/PlayerEden/Ricochet-Rumble/issues/22), [#25 result acceptance](https://github.com/PlayerEden/Ricochet-Rumble/issues/25), [#26 pilot](https://github.com/PlayerEden/Ricochet-Rumble/issues/26), [#27 feel](https://github.com/PlayerEden/Ricochet-Rumble/issues/27), [#28 procedural QA](https://github.com/PlayerEden/Ricochet-Rumble/issues/28), [#29 saves](https://github.com/PlayerEden/Ricochet-Rumble/issues/29), [#30 launch](https://github.com/PlayerEden/Ricochet-Rumble/issues/30).

## Working rule
**One main player-facing improvement → tests and deterministic evidence → screenshot review → Android test APK → owner notes → accepted PR merge → updated handoff.** Keep Bibles as forward-looking designs and use source/tests to establish what truly exists. Never let aspirations silently become release claims.

# Sector Rebound

**Android-first, top-down ricochet combat.** Control tanks, mechs and the on-foot operator in procedural FIELDGRID arenas. Deliberate bank shots, vehicle ejection/recovery, short rounds and clear local multiplayer are the game's focus.

## Source of truth — two different development states

| Lane | What it contains | Status |
| --- | --- | --- |
| `main` | Accepted **v0.9.21** runtime, history, checkpoints and baseline documents | Stable fallback; **not** the latest gameplay |
| [Draft integration PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85) | Later modes, refined controls/UI, LAN host lobby, local progression, backup and reliability work | **Unmerged**, awaiting explicit acceptance |
| [Exact-source full QA #41272300538](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41272300538) | 2026-11-01 full Chromium and Android CI at `b30bed1` | **Passed**; automated evidence, *not* owner phone acceptance |

**Important:** This README is updated on the *integration branch*. The default branch remains the older verified baseline until its owner authorizes integration. A later docs-only commit does not imply the exact gameplay runtime has been retested.

## Start here when resuming development

- [Godot 4.7.2 Ricochet Trials experimental project](https://github.com/PlayerEden/Ricochet-Rumble/tree/experiment/godot-ricochet-trials-spike/experiments/godot-ricochet-spike) — separate source-only engine feasibility trial; headless Godot smoke passed, no migration approved

- [Experimental Custom bot personalities](https://github.com/PlayerEden/Ricochet-Rumble/tree/experiment/custom-bot-personalities-v1) — opt-in Hunter, Sentinel, Scavenger; [300-seed + full browser QA passed](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41283423851) and [audit archived](https://github.com/PlayerEden/Ricochet-Rumble/blob/experiment/custom-bot-personalities-v1/docs/BOT_PERSONALITIES_EXPERIMENT_2026-11-01.md). Not merged or physically tested.

- [Offline Daily Sector experimental JS branch](https://github.com/PlayerEden/Ricochet-Rumble/tree/experiment/daily-sector-offline-v1) — UTC-seeded personal-best mode; **not merged into the app**. [Dedicated roadmap](https://github.com/PlayerEden/Ricochet-Rumble/blob/experiment/daily-sector-offline-v1/docs/DAILY_SECTOR_PROTOTYPE_2026-11-01.md). Quick's Godot spike is separate.

0. [Future game roadmap and ideas — discussion draft](docs/FUTURE_ROADMAP_2026-11-01_PROPOSAL.md) — proposed phases and tradeoffs; not implemented or approved
1. [Latest handoff / PROJECT_STATUS](docs/PROJECT_STATUS.md) — detailed chronology and blockers; recent entries at the top
2. [Integration rehearsal and rollback](docs/INTEGRATION_REHEARSAL_v0956.md) and [draft PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85) — current candidate, differences from `main`
3. [Android WebView save continuity (2026-11-01)](docs/ANDROID_WEBVIEW_PERSISTENCE_2026-11-01.md) — actual emulator restart + install-over persistence PASS; owner phone pending
4. [Latest release-candidate audit (2026-11-01)](docs/RELEASE_CANDIDATE_AUDIT_2026-11-01.md) — integration findings, exact QA, remaining P0 gates
5. [Owner Android acceptance checklist](docs/OWNER_ANDROID_ACCEPTANCE_2026-10-31.md) — real saved progress, controls, two-device Wi-Fi
6. [Competitive + measured performance audit](docs/COMPETITIVE_PERFORMANCE_DELTA_2026-11-01.md) — grounded optimization priorities and full QA verification
7. [Repository rename playbook](docs/REPOSITORY_RENAME_PLAN_2026-11-01.md) — proposed `PlayerEden/Sector-Rebound` rename; **not performed**
8. [Development protocol](docs/DEVELOPMENT_PROTOCOL.md), [Google Play roadmap](docs/ROADMAP_TO_GOOGLE_PLAY_V1.md) and [identity](docs/SECTOR_REBOUND_IDENTITY.md)

## What exists in the experimental integration candidate

- Offline Survival and Quick Play, scored vehicle FFA, pilot-only Close Quarters, Team Deathmatch and Custom Match with saved presets.
- Tank/mech/pilot play; centered vehicle turning, MOVE/FIRE touch controls, ricochets, procedural maps and vehicle recovery.
- Local same-Wi-Fi host/guest lobby: host rules, Ready/Start, initial two humans/zero bots, after-action results/rematches, host-authoritative state. **Two physical phones have not passed acceptance.** This is **not** internet matchmaking.
- Offline Dossier statistics, Hangar paints/insignia and earned cosmetic rewards; manual backup/export/import. No real-money or performance-enhancing purchases.
- Android package, browser/WebView source parity, responsive UI tests, CI build artifacts and Play candidate materials. Current Google Play release readiness remains **NO-GO**.

### Automated evidence and limits

[Full QA run 41272300538](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41272300538) completed successfully at `b30bed1`: 30-start mixed-mode soak (7,200 physics ticks), nine-case Canvas render checks, 810-frame JS stage profiling, LAN malformed packet tests and 102 UI geometry scenes without reported failures or warnings. These are **headless browser and CI/emulator checks**, not measured real-phone FPS, thermal/battery testing or two-device LAN proof.

**Never install the generic CI `debug-apk` artifact over an owner-held preview expecting it to update safely.** CI test APKs can use a different signing certificate and/or package ID. An installation update requires matching Android package identity, signing certificate, and increasing versionCode. Do not uninstall an app holding valuable Dossier data. Back up first. The separately pinned, signed `.preview` test lineage and its compatibility evidence must be checked before any install-over. See [Android acceptance](docs/OWNER_ANDROID_ACCEPTANCE_2026-10-31.md), [signing](docs/SIGNING.md) and [preview transfer report](docs/PREVIEW_TO_PLAY_MANUAL_TRANSFER_2026-10-31.md).

## Code, tests, provenance

- Web source: `web/`; Android embedded browser assets: `android/app/src/main/assets/`. CI requires byte-for-byte source parity.
- Android app ID: `com.playereden.ricochetrumble`; isolated preview suffix: `.preview`. These are **technical identifiers**, not the game's display title.
- Main fast regression: `.github/workflows/ci-smoke.yml`; full Chromium/Android: `.github/workflows/build-apk.yml`; preview workflows are separate and subject to signer safeguards.
- Published historical known-good baseline: [v0.9.21 development preview](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.21-polish-preview). Later QA artifacts are not automatically compatible or released builds.
- Historical branch/decision evidence: [branch register](docs/BRANCH_REGISTER.md), [archive](docs/history/README_DEVELOPMENT_THROUGH_V0921.md).

## Remaining release gates

Before a public Google Play beta: actual Android install-over and saved Dossier/Hangar retention, real touch/performance/interrupt testing, **two physical phones for advertised local LAN** (or explicitly defer LAN from launch), authentic approved store assets, hosted completed privacy policy and developer contact, accurate Play Console declarations, private release signing and the owner's explicit merge/release approval.

**Safety rule:** leave `main`, approved game feel/icon, known-good preview checkpoints and Android identifiers untouched until review. No automatic merge, public release or surprise APK reinstall.

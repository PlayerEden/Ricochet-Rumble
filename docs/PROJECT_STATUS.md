# Sector Rebound — Current Project Status

**Last reconciled:** 2026-11-02 Kentucky local / 2026-11-03 UTC after D3-B1 merge · **repository:** `PlayerEden/Ricochet-Rumble` · **game name:** Sector Rebound.

> **Current development `main`:** v0.9.75 gameplay consolidated by [PR #104](https://github.com/PlayerEden/Ricochet-Rumble/pull/104), SHA `b55e1ea1f59ca72663896d8f37d612547e253fbe`; true read-only spectator B1 merged by [PR #105](https://github.com/PlayerEden/Ricochet-Rumble/pull/105), SHA `20e8e9f0ab8f1b5ee57f7536df298b715a9198cb`. **Development CI only, not a new same-signer owner preview or a Google Play release. Physical two-phone LAN remains unverified.**

**Current canonical navigation:** [Master development plan](MASTER_DEVELOPMENT_PLAN.md) · [Archive index](ARCHIVE_INDEX.md) · [preconsolidation full project log](PROJECT_STATUS_HISTORY_THROUGH_2026-11-02.md).

## Current exact source and QA

| Milestone | Code / evidence | Acceptance |
| --- | --- | --- |
| **D3-B1 live spectator merged** | `main` merge SHA `20e8e9f0ab8f1b5ee57f7536df298b715a9198cb`; [PR #105](https://github.com/PlayerEden/Ricochet-Rumble/pull/105) | **Full exact-source CI passed, two physical phones pending** |
| D3-B1 source checkpoint | [protected branch](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-d3-b1-spectator-source-ci-2026-11-02), SHA `89bfe4bb7d57af90f9ec8267fef14ce5a48e96bf` | Source snapshot, **not signed owner APK** |
| D3-B1 browser regression | [45 spectator cases](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41588400421), [canonical full LAN](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41588400439) | **PASS** |
| D3-B1 Android source compile | [full Android/visual QA](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41588400422) | **PASS**, debug APK and unsigned AAB **not production or compatible owner preview** |


| Item | Source/evidence | Result |
| --- | --- | --- |
| Game baseline | `checkpoint/sector-rebound-v0975-rare-ai-openings-signed-ci-370001` · SHA `45e06297cf440a4d5f5606c8f282957dba602d4f` | Signed owner preview source preserved |
| v0.9.75 Android APK | [CI #41578089841](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41578089841), versionCode **370001**, `com.playereden.ricochetrumble.preview` | **PASS** Gradle + certificate + APK asset parity |
| Gameplay and LAN browser | [CI #41577565867](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41577565867) | **PASS** 6 quick-shot scenarios × 42 shots; 12 physical-aim, 18 old shot, 9 pilot, 27 cue, 47 D3-A2, 32 D3-A1, **101** two-browser-client LAN and 44 visual screens |
| Signed APK ZIP | [GitHub Actions artifact #13204632545](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41578089841/artifacts/13204632545), `sector-rebound-ai-quick-370001.apk` | Installable experimental test APK; **artifact expires**, not production |
| Owner feedback | v0.9.73 reported bot aim too quick; v0.9.74 turn-and-settle system described as **pretty good** | **Human feel partially accepted**; v0.9.75 rare fast openings **not yet physically reviewed** |

**Protected rollback:** [v0.9.74 signed fairness source](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-v0974-ai-shot-posture-signed-ci-360001) · original main [v0.9.21 archive](https://github.com/PlayerEden/Ricochet-Rumble/tree/archive/main-v0921-before-2026-11-02-integration). The source-only consolidation preserves these and earlier v0.9.71–73 checkpoints.

## Working game features

- Web/Android offline gameplay: pilot/tank/mech, bank shots and procedural arenas, FFA and Team Survival, scored FFA/TDM, pilot-only CQC, Quick Play, custom presets, Dossier/earned cosmetics, Hangar, backup/export.
- Local Wi-Fi beta: host/join/Ready and authoritative rounds/Best of 3; **host alone can start** FFA, balanced Team Survival, Co-op and scored TDM against real AI with one vacant guest seat.
- Fair AI: bounded trajectory plan, finite turn/speed/aim cues; rare v0.9.75 **shorter aim acquisition** under eligible direct vehicle shot conditions. Human controls, projectile physics and production Play status unaffected.
- **Merged development D3-B1:** genuine late-joining spectator camera, active host snapshots, read-only input gate and host rematch continuity, [CI passed](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41588400421). **Not built:** B2 Join Next/AI-to-human promotion, C native repeat-accept/reconnect, remote internet games, account/friends/ranked and purchases.

## Open gates and immediate next action

1. **M0 consolidation verified:** current v0.9.75 baseline merged to `main` with old main archived; post-merge smoke and full LAN regression PASS.
2. **Next D3-B2 JOIN NEXT:** after [merged D3-B1 #105](https://github.com/PlayerEden/Ricochet-Rumble/pull/105) passed [final 45-case dual-browser QA](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41588400421) and [full Android build QA](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41588400422), safely queue a late spectator for the next eligible round or match. **No mid-round bot seat takeover or inherited personal KOs**. D3-C native repeated accept/reconnect and **real two-phone tests** follow.
3. **Manual device:** compare v0.9.75 rare fast bot shots with accepted v0.9.74; verify save-preserving install-over, landscape/portrait, play duration/FPS/heat, Dossier, controls and one-phone match fun.
4. **Google Play is NO-GO:** production signer/AAB, authentic approved store assets, public privacy/support, Data safety, account testing, local data migration and release owner GO not complete.

## Engineering and publication rules

- Source of truth = tested `main` after integration plus [canonical master](MASTER_DEVELOPMENT_PLAN.md); old plans are history, not conflicting instructions.
- `web/game.js`, `web/index.html`, CSS and other shared WebView assets must match Android embedded copies byte-for-byte.
- **New work branches off `main`**, with focused PR + game tests + Android QA + owner acceptance where appropriate; the old deep PR stack is archived, not used as a new feature base.
- **No signing confusion:** development preview app ID `com.playereden.ricochetrumble.preview`, code 370001, public AOSP test certificate SHA256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`. Back up before installing any later preview over this; never uninstall to resolve identity mismatch. Plain CI debug APK is not necessarily upgrade-compatible.
- Preserve historical PRs/branches and test evidence. Close only explicitly verified superseded PRs after their work is retained or archived. No branch force-push, deletion of accepted work, surprise public launch or repo rename.

## Resume prompt for a new developer/assistant

“Open `docs/PROJECT_STATUS.md`, `docs/MASTER_DEVELOPMENT_PLAN.md` and `docs/ARCHIVE_INDEX.md` on the **current `main`**, verify the latest source SHA and active PRs. Continue **D3-B2 queued JOIN NEXT promotion** after merged B1, validating next-round/match state with two real browser runtimes; leave physical 2-phone LAN and Play GO still pending. Use protected v0.9.75 signed checkpoint and v0.9.74 fair AI rollback. Never copy an outdated older ‘next’ label or modify release credentials.”

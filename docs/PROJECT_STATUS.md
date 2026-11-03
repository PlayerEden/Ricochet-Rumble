# Sector Rebound — Current Project Status

**Last reconciled:** 2026-11-03 after [D3-C1 PR #110](https://github.com/PlayerEden/Ricochet-Rumble/pull/110) and [D3-C2A PR #111](https://github.com/PlayerEden/Ricochet-Rumble/pull/111) merged · **repository:** `PlayerEden/Ricochet-Rumble` · **game name:** Sector Rebound.

> **Current development `main`:** consolidated v0.9.75 [#104](https://github.com/PlayerEden/Ricochet-Rumble/pull/104), D3-B1 spectator [#105](https://github.com/PlayerEden/Ricochet-Rumble/pull/105), D3-B2 JOIN NEXT [#108](https://github.com/PlayerEden/Ricochet-Rumble/pull/108), native D3-C1 repeat accept/BUSY [#110](https://github.com/PlayerEden/Ricochet-Rumble/pull/110) and D3-C2A guest recovery [#111](https://github.com/PlayerEden/Ricochet-Rumble/pull/111) merged. Current code SHA **`b055623fc69b8dc38cd65ab470267193d5e2d9ee`**. C1 six checks and C2A seven exact-source checks **PASS**, including Android Gradle/visual and real dual-browser flows. **Neither two physical Android phones nor new same-signer owner upgrade APK has been accepted. Google Play NO-GO.**

**Current canonical navigation:** [Master development plan](MASTER_DEVELOPMENT_PLAN.md) · [Archive index](ARCHIVE_INDEX.md) · [preconsolidation full project log](PROJECT_STATUS_HISTORY_THROUGH_2026-11-02.md).

## Current exact source and QA

| Milestone | Code / evidence | Acceptance |
| --- | --- | --- |
| **D3-C2A recovery merged** | [PR #111](https://github.com/PlayerEden/Ricochet-Rumble/pull/111), merge SHA `b055623fc69b8dc38cd65ab470267193d5e2d9ee` | **7/7 exact-PR PASS**: [new recovery browser](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41670513016), [B1](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41670513352), [B2](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41670513293), [full Android/visual](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41670512826). Room retry and host re-open are source-tested, **not phone-tested**. |
| **D3-C1 native repeat accept merged** | [PR #110](https://github.com/PlayerEden/Ricochet-Rumble/pull/110), merge SHA `2d713ddc7374ada461af0afc27a3c2cc6f8e47aa` | **6/6 exact-PR PASS**: [1,000 JVM rejoins/100 races](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41668490844), [full Android/visual](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41668490839); no two-phone acceptance. |
| **D3-B2 JOIN NEXT merged** | [PR #108](https://github.com/PlayerEden/Ricochet-Rumble/pull/108), merge SHA `bd7162619daf16496e17fbb332d7a8aebdd7e75d` | **Full exact-PR CI PASS**: [B2 50-case test](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41654551525), [Android/visual](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41654551614), [canonical LAN](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41654551623); physical devices pending |
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
- **Merged D3-B1/B2/C1/C2A development source:** live late spectator, read-only guard, JOIN NEXT/cancel, boundary-only human promotion and AI fallback, Android repeat-accept/BUSY and explicit recovery/retry UI. [C1 JVM pass](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41668490844) · [C2A Chromium pass](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41670513016) · [full Android pass](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41670512826). **Still unverified:** physical two-phone Wi-Fi, compatible owner install-over APK, long-session/background input behavior; internet multiplayer/accounts/ranked/purchases remain deferred.

## Open gates and immediate next action

1. **M0 consolidation verified:** current v0.9.75 baseline merged to `main` with old main archived; post-merge smoke and full LAN regression PASS.
2. **D3-B2 JOIN NEXT complete as tested source:** merged [#108](https://github.com/PlayerEden/Ricochet-Rumble/pull/108) with queue/cancel and safe bot→human seat promotion; automated tests PASS. No mid-round actor takeover or inherited personal KOs. Separate pure contract [draft #107](https://github.com/PlayerEden/Ricochet-Rumble/pull/107) remains an independent unmerged experiment, not part of B2 runtime.
3. **D3-C1/C2A source complete:** merged [#110](https://github.com/PlayerEden/Ricochet-Rumble/pull/110) and [#111](https://github.com/PlayerEden/Ricochet-Rumble/pull/111); Android and live dual-browser QA passed. **Next mandatory step:** generate an exact-`main`, higher-version (>370001), same-package/same-public-AOSP-test-signer owner preview; reject ordinary debug APK or private-test-key builds as upgrade-compatible without comparing certificates.
4. **Manual device:** back up Dossier first, install the verified update in place without uninstalling, test 2-phone host/late join/JOIN NEXT/retry/disconnect/background over real Wi-Fi, score/input/side safety and heat/FPS. Compare v0.9.75 rare fast AI openings with accepted v0.9.74. Any observed bug becomes focused D3-C2B or M4 work.
5. **Google Play is NO-GO:** production signer/AAB, authentic approved store assets, public privacy/support, Data safety, account testing, local data migration and release owner GO not complete.

## Engineering and publication rules

- Source of truth = tested `main` after integration plus [canonical master](MASTER_DEVELOPMENT_PLAN.md); old plans are history, not conflicting instructions.
- `web/game.js`, `web/index.html`, CSS and other shared WebView assets must match Android embedded copies byte-for-byte.
- **New work branches off `main`**, with focused PR + game tests + Android QA + owner acceptance where appropriate; the old deep PR stack is archived, not used as a new feature base.
- **No signing confusion:** development preview app ID `com.playereden.ricochetrumble.preview`, code 370001, public AOSP test certificate SHA256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`. Back up before installing any later preview over this; never uninstall to resolve identity mismatch. Plain CI debug APK is not necessarily upgrade-compatible.
- Preserve historical PRs/branches and test evidence. Close only explicitly verified superseded PRs after their work is retained or archived. No branch force-push, deletion of accepted work, surprise public launch or repo rename.

## Resume prompt for a new developer/assistant

“Open `docs/PROJECT_STATUS.md`, `docs/MASTER_DEVELOPMENT_PLAN.md` and `docs/ARCHIVE_INDEX.md` on current `main`; verify latest SHA. D3-B1 [#105], B2 [#108], C1 [#110] and C2A [#111] are merged and CI passed. **Next: safe same-signer preview (>370001) from reviewed `main` and true two-Android-phone LAN acceptance.** Do not resume old role/inputs, silently uninstall installed preview, merge old divergent #107, infer Play readiness or alter production credentials.”
# Sector Rebound

**Android-first, offline-capable top-down ricochet arena shooter.** Fight as an overhead pilot, tank or mech in procedural mazes with controlled bank shots, vehicle ejection/recovery and short scored or survival matches. Original FIELDGRID tactical presentation, human-paced AI and cosmetic-only offline progression.

> **Development source, not a public Play Store release.** Consolidated v0.9.75 game, [D3-B1 spectator #105](https://github.com/PlayerEden/Ricochet-Rumble/pull/105), [D3-B2 JOIN NEXT #108](https://github.com/PlayerEden/Ricochet-Rumble/pull/108), [D3-C1 native reconnect #110](https://github.com/PlayerEden/Ricochet-Rumble/pull/110) and [D3-C2A recovery #111](https://github.com/PlayerEden/Ricochet-Rumble/pull/111) are merged into `main` (latest runtime merge `820f588474d5340b2e6e767c595b3e5b66401028` (M2 camera #115); docs-only commits may follow). All C1 **6/6** and C2A **7/7** source QA checks passed, including Android builds and true dual-browser LAN. **A higher-version same-signer internal APK has passed build QA, but on-phone install-over, physical two-phone Wi-Fi and production Play launch remain unapproved.**

**2026-11-03 camera update:** [PR #115](https://github.com/PlayerEden/Ricochet-Rumble/pull/115) camera zoom-out and [PR #116](https://github.com/PlayerEden/Ricochet-Rumble/pull/116) signed **v0.9.77** owner APK are merged; build/asset/certificate QA passed. User's actual phone acceptance is still pending. The earlier v0.9.76 details below remain as rollback history.

## Start here

1. [**Current PROJECT_STATUS**](docs/PROJECT_STATUS.md) — short factual handoff, precise QA/owner gates and next step.
2. [**Master development plan**](docs/MASTER_DEVELOPMENT_PLAN.md) — one prioritized roadmap, including D3 spectator/queue and the release path.
3. [**Archive index and important checkpoints**](docs/ARCHIVE_INDEX.md) — historical PRs, original v0.9.21 baseline, v0.9.71–0.9.75 previews, prior roadmap and full chronology.
4. [**Integration and mainline QA audit**](docs/MAINLINE_PROMOTION_AUDIT_2026-11-02.md) — exact SHA provenance, what changed, gate results and remaining caveats.
5. [Developer protocol](docs/DEVELOPMENT_PROTOCOL.md) · [Play release gates](docs/RELEASE_CANDIDATE_AUDIT_2026-11-01.md) · [Design reference](docs/SECTOR_REBOUND_IDENTITY.md).

## Current playable systems

- **Solo and Quick Play:** procedural maze match flow, Survival FFA/Team Survival, scored vehicle FFA and TDM, pilot-only Close Combat, Best of 3 and After Action, genuine scoring/respawn and human/operator controls.
- **Custom Match:** offline configurable maps, factions, bots and match rules with local saved presets; cosmetic Hangar, offline Dossier stats and explicit backup/export-import.
- **Android local LAN beta:** host/discover/join Wi-Fi transport, rules/Ready and host-authoritative match basics; **one-phone host-versus-bots** playable in FFA, Team Survival, Co-op and scored TDM at 1v1/2v2/3v3 scales where applicable. Real second-phone physical acceptance has not occurred.
- **Bot combat:** true projectile trajectory and bounded wall-bank planning; deliberate physical turn/settle aim; rare well-positioned faster **direct vehicle shots** in the optional v0.9.75 tuning. The previous **v0.9.74** aiming behavior is preserved as the positive-feeling rollback.
- **D3-B1/B2/C1/C2A LAN source merged:** late spectators watch host-versus-bots, queue/cancel **JOIN NEXT**, and receive control only at an eligible match boundary. Native Android supports repeated guest admission, correct room-full status and safe disconnect cleanup; guests have an explicit fresh-connection retry path and hosts can reopen after background Stop. Full Chromium/JVM/Android build QA passed, **but two physical Android phones remain untested**. No internet matchmaking, ranked, accounts or purchases.

## Latest owner test APK — v0.9.78 Camera Fine-Tune v2

Owner-playtested v0.9.77 felt good and made AI difficulty **almost ideally balanced**. This v2 release keeps gameplay and AI untouched and adjusts only three camera scales: **pilot 0.98→0.94**, **tank 0.75→0.73**, **mech 0.71→0.69**. [Camera PR #118](https://github.com/PlayerEden/Ricochet-Rumble/pull/118) merged with all applicable AI/visual/LAN Chromium/JVM QA PASS; [owner-preview PR #119](https://github.com/PlayerEden/Ricochet-Rumble/pull/119) shipped same-signature internal APK under [build #41709421916](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41709421916), which passed cert/package/version/embedded-asset verification.

| Item | Verified identity |
| --- | --- |
| **Installable preview** | `sector-rebound-camera-v2-400001.apk` · `0.9.78-camera2.1` · versionCode **400001** |
| **Package and signer** | `com.playereden.ricochetrumble.preview` · same pinned public AOSP test signer as owner-tested v0.9.77 code 390001 |
| **GitHub download** | [Artifact #13265922502](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41709421916/artifacts/13265922502), ZIP containing APK and `verification.txt`, expires 2026-11-17 |
| **SHA-256** | `6ab003ae8690d114677b5de30e143726bb90913f82af22b5b3dfe9b4e995adad` |
| **Protected source** | [`checkpoint/sector-rebound-m2-camera-v2-400001-signed-ci`](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-m2-camera-v2-400001-signed-ci), SHA `e548e3e27d53675fab372cccb8404b20ddff55e2` |

**Owner gate pending:** Back up Dossier, install over the current compatible preview **without uninstalling**, check profiles/presets/Hangar, evaluate pilot/tank/mech views in portrait and landscape, and tell us whether AI balance remains good. The build has not been verified on the owner's v0.9.78-installed device. Two-phone LAN and Google Play publication still need separate approval.

## Previous owner test APK — v0.9.77 camera (source/CI verified; Android feel pending)

**First camera pullback accepted as the next playtest, not yet accepted on device:** [M2 camera PR #115](https://github.com/PlayerEden/Ricochet-Rumble/pull/115) merged with all applicable CI passing; pilot **0.98** (was 1.07), tank **0.75** (was 0.82), mech **0.71** (was 0.77). AI, physics, controls and LAN behavior intentionally unchanged.

| Verified item | Exact result |
| --- | --- |
| **APK** | `sector-rebound-camera-390001.apk`, `0.9.77-camera.1`, versionCode **390001** |
| **Android package / signing** | `com.playereden.ricochetrumble.preview`, pinned public AOSP test signer **identical to code 380001** |
| **Signed build** | [PASS #41706608997](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41706608997), [artifact #13266060199](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41706608997/artifacts/13266060199), expires 2026-11-17 |
| **Reviewed source / signed workflow** | [PR #115](https://github.com/PlayerEden/Ricochet-Rumble/pull/115), [PR #116](https://github.com/PlayerEden/Ricochet-Rumble/pull/116), workflow source `e118a4303894551f03f610b46b800a8af18fb6b5` |
| **APK SHA-256** | `5a72a788e0986017b48cede1d6f00c3b4c4a107c26b0e0cb78379480e6b546ee` |

**Manual acceptance still open:** back up Dossier, install over previous same-signer preview **without uninstalling**, then play tanks/mechs/pilot on portrait and landscape, judge bullets/trace/UI and whether the wider view changes AI difficulty. Two-phone LAN and Play production remain separate gates. [Focused M2 camera test guide](docs/M2_CAMERA_WIDEN_2026-11-03.md).

## Previous test APK — v0.9.76 D3-C (owner previously played; update/save continuity still unverified)

| Item | Exact verified identity |
| --- | --- |
| **APK** | `sector-rebound-d3c-380001.apk`, versionCode **380001**, `0.9.76-d3c.1` |
| **App identity** | `com.playereden.ricochetrumble.preview`, same pinned public AOSP development signer as v0.9.75 |
| **Signed CI workflow** | [PASS #41672939440](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41672939440), signer/package/assets/hash verified; artifact ID `13248363044` (14-day expiry) |
| **Exact source backup** | [checkpoint `sector-rebound-d3c-380001-signed-ci`](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-d3c-380001-signed-ci), SHA `5adf7f035d1161ce5eb1cb1b2520455b7e25da20` |
| **APK SHA-256** | `dc1a93a4dbaa83992ff6efaf7d697d11052f527f0fb6793fe236bca6b7360bc6` |

[verified D3-C owner-preview report](D3_C_OWNER_PREVIEW_380001_2026-11-03.md). The APK is meant to update a matching v0.9.75 development preview **without uninstalling**, but **physical install-over/save continuity and two-phone gameplay have not been tested**. Back up Dossier first; never use the public test key for Google Play.

## Earlier signed owner preview — v0.9.75 (protected)

| Item | Exact tested identity |
| --- | --- |
| **Verified signed gameplay checkpoint** | [`checkpoint/sector-rebound-v0975-rare-ai-openings-signed-ci-370001`](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-v0975-rare-ai-openings-signed-ci-370001), commit `45e06297cf440a4d5f5606c8f282957dba602d4f` |
| **Android preview** | `com.playereden.ricochetrumble.preview` · versionCode **370001** · `0.9.75-aiquick.1` |
| **Build and asset/signature verification** | [GitHub Actions PASS #41578089841](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41578089841) |
| **Full game/visual/browser regression** | [GitHub Actions PASS #41577565867](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41577565867): new quick opportunities, AI physical aim, bot/pilot fairness, host-only modes, existing two-browser LAN and responsive visual scenes |
| **Experimental APK ZIP (expires)** | [GitHub artifact #13204632545](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41578089841/artifacts/13204632545); `sector-rebound-ai-quick-370001.apk` |

**Android install safety:** the owner preview uses a *public, disposable AOSP development key*, not production signing. Its certificate is SHA256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`. Only packages with the same app ID/certificate and increasing versionCode can update in place. **Back up Dossier/progress first. Do not uninstall the installed preview to cure an update mismatch.** Ordinary `app-debug.apk` artifacts should not be assumed compatible with these test builds. Do not use the public test key for Google Play.

## Source layout and working rules

- `web/` — web/Canvas gameplay; `android/app/src/main/assets/` — bundled Android WebView copy. For shared runtime assets, **byte-for-byte parity is mandatory**.
- `tests/` — automated game, Android upgrade, combat fairness, LAN and UI checks. `.github/workflows/ci-smoke.yml`, `build-apk.yml` and `current-main-regression.yml` are the main development gates.
- `docs/` — current status and master plan; `docs/design/` — long-term creative/technical research; `docs/ARCHIVE_INDEX.md` — former branches/plans/research, kept for provenance.
- **Branch new features from verified `main`** after consolidation. Keep code changes in focused PRs with automated validation, documented owner-phone acceptance, rollback SHA and explicit release scope. Never force-update `main` or old checkpoint branches.

## What is still not approved

**Next: D3-C physical Android acceptance.** C1 native repeat accept and C2A explicit room retry are implemented and CI verified, **not** real-phone accepted. Use the CI-verified **380001** test preview (same public development signer), back up progress before install-over, then test two phones on local Wi-Fi with host/join/spectate/JOIN NEXT/reconnect/background. Separately: save retention, heat/FPS, original/licensed music/assets, privacy policy, Play Console, **private production signing and AAB**, explicit owner GO/NO-GO. Public release remains **NO-GO**.

GitHub repo name `PlayerEden/Ricochet-Rumble` remains unchanged; the game display name is **Sector Rebound**. Repository rename, if desired, is a separate owner-controlled operation, not an Android ID or Java namespace migration.
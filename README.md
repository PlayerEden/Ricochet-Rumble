# Sector Rebound

**Android-first, offline-capable top-down ricochet arena shooter.** Fight as an overhead pilot, tank or mech in procedural mazes with controlled bank shots, vehicle ejection/recovery and short scored or survival matches. Original FIELDGRID tactical presentation, human-paced AI and cosmetic-only offline progression.

> **Development source, not a public Play Store release.** Consolidated v0.9.75 game, [D3-B1 spectator #105](https://github.com/PlayerEden/Ricochet-Rumble/pull/105), [D3-B2 JOIN NEXT #108](https://github.com/PlayerEden/Ricochet-Rumble/pull/108), [D3-C1 native reconnect #110](https://github.com/PlayerEden/Ricochet-Rumble/pull/110) and [D3-C2A recovery #111](https://github.com/PlayerEden/Ricochet-Rumble/pull/111) are merged into `main` (latest gameplay/runtime merge `b055623fc69b8dc38cd65ab470267193d5e2d9ee`; docs-only commits may follow). All C1 **6/6** and C2A **7/7** source QA checks passed, including Android builds and true dual-browser LAN. **Physical two-phone Wi-Fi, a higher-version same-signer owner APK and production Play launch remain unapproved.**

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

## Latest owner preview — v0.9.75 (experimental)

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

**Next: D3-C physical Android acceptance.** C1 native repeat accept and C2A explicit room retry are implemented and CI verified, **not** real-phone accepted. Prepare a reviewed `main` preview with versionCode **above 370001** and the **same public development test signer**, back up progress before install-over, then test two phones on local Wi-Fi with host/join/spectate/JOIN NEXT/reconnect/background. Separately: save retention, heat/FPS, original/licensed music/assets, privacy policy, Play Console, **private production signing and AAB**, explicit owner GO/NO-GO. Public release remains **NO-GO**.

GitHub repo name `PlayerEden/Ricochet-Rumble` remains unchanged; the game display name is **Sector Rebound**. Repository rename, if desired, is a separate owner-controlled operation, not an Android ID or Java namespace migration.
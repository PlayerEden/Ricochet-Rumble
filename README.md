# Sector Rebound

**Android-first, offline-capable top-down ricochet arena shooter.** Fight as an overhead pilot, tank or mech in procedural mazes with controlled bank shots, vehicle ejection/recovery and short scored or survival matches. Original FIELDGRID tactical presentation, human-paced AI and cosmetic-only offline progression.

> **Development repository, not a public Play Store release.** `main` is the integrated **v0.9.75 gameplay source baseline** after the [2026-11-02 mainline consolidation](docs/MAINLINE_PROMOTION_AUDIT_2026-11-02.md). The separately signed v0.9.75 **experimental owner APK** passed CI, but real two-phone LAN, final Android acceptance and Google Play publication have **not** passed. An owner APK is not a signed production AAB.

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
- **Experimental only, not working multiplayer promises:** actual mid-game spectator camera, join-next queue, bot↔human safe seat takeover and Android repeated accept/reconnect are the next D3 stages. No online internet matchmaking, ranked, accounts, purchases or real ads.

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

**Next: D3-B1 live spectator and room-status feed**, then B2 safe queued promotion and C repeat native Wi-Fi accept/reconnect, with honest two-device testing. Separately: on-phone save-preserving install/update, 20–30-minute heat/FPS and interruption review, original/licensed music/assets, public HTTPS privacy policy and Play Console submissions, **private production signing and signed AAB**, owner GO/NO-GO. A public game release is currently **NO-GO**.

GitHub repo name `PlayerEden/Ricochet-Rumble` remains unchanged; the game display name is **Sector Rebound**. Repository rename, if desired, is a separate owner-controlled operation, not an Android ID or Java namespace migration.

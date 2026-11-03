# Sector Rebound

**Android-first, offline-capable tactical arcade ricochet shooter.** Pilot, tank and mech combat in procedural mazes, solo survival, scored matches, Custom Match and experimental same-Wi-Fi multiplayer. Original FIELDGRID interface, physical bank shots and cosmetic-only offline progress.

> **One active game: [`main`](https://github.com/PlayerEden/Ricochet-Rumble/tree/main).** Earlier branches, experimental PRs, APKs and checkpoints are historical recovery/research, **not separate games to maintain**. Work moves from a small tested feature branch into `main` through CI, not into a parallel permanent build. Git history and the [archive index](docs/ARCHIVE_INDEX.md) retain older verified source without cluttering this page.

## Current state

| Area | Status |
| --- | --- |
| **Accepted one-phone gameplay** | Owner likes current vehicle/pilot controls and fair bot challenge. **Protect the camera**: pilot `0.94`, tank `0.73`, mech `0.69`. No tuning unless new phone feedback warrants it |
| **Solo play** | Quick Play, Solo/Teams survival, scored FFA/TDM, Close Quarters, Custom Match/presets, Training/PRACTICE without bots, procedural arenas and After Action |
| **Progress** | Offline Dossier and Hangar paints/emblems; user-initiated validated copy, share and restore; safety snapshot before restore. No accounts, paid unlocks or cloud storage |
| **Multiplayer** | Local Wi-Fi host/join, host-versus-bots, spectators/JOIN NEXT/reconnect are implemented and CI-tested; **two actual Android phones are not yet tested**—deferred by owner |
| **Distribution** | Developer previews only. Google Play signing, privacy/store declarations and real-device acceptance are **NOT complete** |

### One current phone preview

The most recent **owner-compatible and signed** Android test build is **v0.9.79 / versionCode 410001**, package `com.playereden.ricochetrumble.preview`, from [verified GitHub workflow #41715192220](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41715192220) ([artifact](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41715192220/artifacts/13270206832), temporary). It has the owner-approved camera/AI baseline and Solo Practice. **Newer source features, including Backup Share, are merged on `main` but not in that older compatible APK.** A subsequent consolidated owner preview must be verified against the same preview package, pinned test certificate and a higher version code. Do not install a differently signed debug build over this app, or uninstall it just to force a test; back up Dossier first.

**No new APK for each tiny edit.** Group tested one-phone improvements and distribute one clearly identified consolidated preview after the relevant source and Android QA gates pass. An occasional side-by-side CI debug artifact is testing evidence, **not** the current player build. Historical APK hashes and prior preview links live in the [archive index](docs/ARCHIVE_INDEX.md).

## Development and status

- [**Current project status**](docs/PROJECT_STATUS.md) — what is accepted, merged, tested, and still blocked.
- [**Master development plan**](docs/MASTER_DEVELOPMENT_PLAN.md) — ordered roadmap, one-phone polishing and release requirements.
- [**Developer/handoff protocol**](docs/DEVELOPMENT_PROTOCOL.md) — use `main`, focused PRs and exact source/Android asset parity.
- [**Archive and rollback index**](docs/ARCHIVE_INDEX.md) — old PRs, experimental branches, hashes and historical context.
- [**Game identity**](docs/SECTOR_REBOUND_IDENTITY.md) · [Play release requirements](docs/RELEASE_CANDIDATE_AUDIT_2026-11-01.md).

## Working rules

The `web/` game sources and `android/app/src/main/assets/` bundled equivalents must be **byte-identical** for every shared runtime file. Test the new behavior and preserve accepted camera, controls, AI and LAN code unless the change explicitly targets them. Review PR CI before merging; report browser QA, Android build QA and owner-phone results separately.

The game remains **Sector Rebound** in the app. The public GitHub repository currently remains `PlayerEden/Ricochet-Rumble`; a future repository rename does not require changing Android package IDs or app data.

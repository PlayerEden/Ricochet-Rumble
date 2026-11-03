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

### One current phone preview — v0.9.80

**Only current recommended installable preview:** [Sector Rebound v0.9.80-main.1](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41721309696), versionCode **420001**, app ID `com.playereden.ricochetrumble.preview`. The APK includes all current `main` gameplay, Solo Practice, Backup Share, and [M5 restore-safety changes #127](https://github.com/PlayerEden/Ricochet-Rumble/pull/127). [Consolidated build workflow #128](https://github.com/PlayerEden/Ricochet-Rumble/pull/128) **PASS**: source `50401f71a63a8375f1b7a7230617acb1167682af`, reviewed runtime `1062ea3bc3c85dfa42999ed1988fe0ea7ec8c083`, package/version/asset/signature verified; APK SHA-256 `1bc0aaed1b7557ff2b894b6e25441a4181e7f6a7440d9fcad7b14c5ceed35f36`. [Current GitHub APK artifact](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41721309696/artifacts/13272356875) expires **2026-11-17**.

**In-place upgrade only:** same public disposable AOSP **test certificate** and app ID as preview code 410001, higher version code 420001. Back up Dossier first and **never uninstall to bypass a mismatch**. The user has not yet confirmed physical upgrade/save continuity on v0.9.80; this is **not** a Google Play production signing or published build. Old APKs remain *rollback records* in [archive](docs/ARCHIVE_INDEX.md), not a menu of games to maintain.

**Build policy:** `main` is the one game and the one installed preview line. The existing signed preview workflow was **reused**, not multiplied by one workflow per feature. Group tested improvements before a new owner APK, and identify exactly one current preview. CI debug apps with a different package are test evidence, not user upgrades.

## Development and status

- [**Current project status**](docs/PROJECT_STATUS.md) — what is accepted, merged, tested, and still blocked.
- [**Master development plan**](docs/MASTER_DEVELOPMENT_PLAN.md) — ordered roadmap, one-phone polishing and release requirements.
- [**Developer/handoff protocol**](docs/DEVELOPMENT_PROTOCOL.md) — use `main`, focused PRs and exact source/Android asset parity.
- [**Archive and rollback index**](docs/ARCHIVE_INDEX.md) — old PRs, experimental branches, hashes and historical context.
- [**Game identity**](docs/SECTOR_REBOUND_IDENTITY.md) · [Play release requirements](docs/RELEASE_CANDIDATE_AUDIT_2026-11-01.md).

## Working rules

The `web/` game sources and `android/app/src/main/assets/` bundled equivalents must be **byte-identical** for every shared runtime file. Test the new behavior and preserve accepted camera, controls, AI and LAN code unless the change explicitly targets them. Review PR CI before merging; report browser QA, Android build QA and owner-phone results separately.

The game remains **Sector Rebound** in the app. The public GitHub repository currently remains `PlayerEden/Ricochet-Rumble`; a future repository rename does not require changing Android package IDs or app data.

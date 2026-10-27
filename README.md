# Sector Rebound

**Android-first ricochet combat in a new procedurally generated sector each match.** Pilot a tank or mech, survive on foot, and adapt to unfamiliar maze geometry. Set in the fictional FIELDGRID program.

**Current status: v0.9.21 development preview.** The APK is a working *debug test build*, not a Google Play production release. Solo combat has automated QA; the local two-phone Wi-Fi mode remains experimental and still needs physical-device acceptance. Continuous Quick Play, mode playlists, and new score-based game modes are planned for v0.9.22+, **not currently playable**.

## Start here

- [Current status / new-chat handoff](docs/PROJECT_STATUS.md) -- first read for every development session
- [Development protocol](docs/DEVELOPMENT_PROTOCOL.md) -- branching, PR, QA and release safeguards
- [GitHub health audit](docs/GITHUB_AUDIT_2026-10-27.md) and [branch register](docs/BRANCH_REGISTER.md)
- [Google Play v1.0 roadmap](docs/ROADMAP_TO_GOOGLE_PLAY_V1.md)
- [FIELDGRID design archive](docs/design/README.md) -- designs are not necessarily implemented

## Play the latest preview

[Sector Rebound v0.9.21 APK release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.21-polish-preview) -- Android debug-signed test APK. Keep existing save data backed up when switching between APKs from different signing certificates; uninstalling a previous app deletes its local data.

What exists: offline solo against bots; tanks/mechs and on-foot pilot; seeded small/standard/large procedural mazes; local same-Wi-Fi host/guest infrastructure; after-action display; separate music/SFX settings; game-first lobby and real-unit previews.

What is *not* shipped: internet matchmaking, ranked PvP, playlist rotation and Next Match flow, CQC/TDM score modes, profile/unlocks, payments, Google Play Games or a signed production bundle.

## Code and checks

- Web game source: `web/`; embedded Android assets: `android/app/src/main/assets/`
- Android Java wrapper: `android/`, app ID `com.playereden.ricochetrumble` (legacy technical identifier; decide before Play publishing)
- Local quick checks (Node.js 22 or a compatible modern Node): `node tests/smoke.mjs` and `node tools/validate-cosmetic-catalog.mjs`
- Automated PR checks: `.github/workflows/ci-smoke.yml` (cheap game/test/artifact-parity validation)
- Manual Android QA: `.github/workflows/build-apk.yml` (builds debug APK, unsigned AAB, visual QA)
- Manual *new-tag-only* preview publishing: `.github/workflows/publish-preview-apk.yml`

The repo intentionally keeps browser and Android game files duplicated for offline packaging; CI rejects mismatches. Visual comparisons use actual game scenes, not marketing mockups. The Android debug APK is **not release-signed**. Review [signing notes](docs/SIGNING.md) before handling any signing materials.

## Branching and history

The original repository name `Ricochet-Rumble` stays intact for GitHub links. `main` was on the older v0.6.3 game before the integration candidate; this proposed mainline update contains v0.9.21 runtime plus the repository handoff documentation. **Do not treat this branch as approved until [draft integration PR #23](https://github.com/PlayerEden/Ricochet-Rumble/pull/23) passes review and is merged.**

Original chronological development README: [preserved archive](docs/history/README_DEVELOPMENT_THROUGH_V0921.md). Historical branches, draft PRs, and preview APKs remain available for rollback.

## Release gate

Before considering Google Play v1.0: real phone audio/controls testing; two-phone same-Wi-Fi testing; correct match mode/end rules; controlled release key custody; final package identity; Play privacy/data safety; store assets; and a signed, tested app bundle. Planned cosmetics are strictly visual, never combat upgrades.

**Policy for this repository:** GitHub is the durable source of truth for game source, planning, decisions, QA evidence and chat handoffs. A future conversation should begin with [PROJECT_STATUS](docs/PROJECT_STATUS.md).

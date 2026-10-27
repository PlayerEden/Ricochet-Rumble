# v0.9.20 Consolidated development baseline — 2026-10-27

**Canonical working branch:** `dev/sector-rebound-integrated-v0920`

Created from `design/sector-rebound-match-modes-v1`: inherits the full v0.9.20 playable game and FIELDGRID art/mode/match/music/procedural/Play release planning archive. Prior branches and draft PRs remain untouched; **main has NOT been merged or declared current**.

## Verification at branch point
- Web and Android bundled `game.js`, `index.html`, and `style.css` fetched and compared byte-for-byte: **identical**.
- Last Android v0.9.20 tested preview: https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.20-lobby-preview
- Last successful build for v0.9.20: https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40548875351
- `docs/ROADMAP_TO_GOOGLE_PLAY_V1.md` and `docs/design/` record the agreed plan. The designs are NOT playable features.
- APK release remains v0.9.20 with the existing `com.playereden.ricochetrumble` app ID. No billing or cloud profile.
- Parent working visual branch: `dev/sector-rebound-lobby-pilot-v0920`.

## Integration caution
- This is a SAFE DEVELOPMENT CHECKPOINT, not a claim the GitHub default `main` branch was updated.
- Old draft PRs #1–#16 are chained; do not merge them blindly, squash their order without inspection, or delete branches prematurely.
- Subsequent release branches should fork from this checkpoint, with an explicit regression/visual/Android build and GitHub Releases link.
- The v0.9.21 test branch should be reversible back to this exact checkpoint.

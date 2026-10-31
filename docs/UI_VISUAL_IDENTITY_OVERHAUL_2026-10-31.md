# UI visual identity overhaul — Sector Rebound, 2026-10-31

## Owner decision
Following the successful menu/navigation audit, the owner explicitly approved a more substantial *overhaul where needed* to achieve the fit and feel of a real game. Current runtime baseline is the full Chromium-verified [Preview 100019 checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100019-menu-ui-qa-approved) at `0792fd17796f20638608887cc9b6c1006c9b8ba0`.

## Intentional design system
- **Neutral structure:** #151A1E, #222A2F, #2B343A, graphite/steel panel layering, non-blue secondary buttons. No more near-identical blue controls over blue backgrounds.
- **Amber action:** #F4B544 for Quick Play, Start Match, Next Match and explicit primary actions only. Disabled states retain muted contrast. Gold in logo and key title accent.
- **Cyan information:** #72C7D2 for selected cosmetics, focus/readout details, small mode accents; never use as an equal-brightness competitor to Play.
- **Live visual hero:** retain actual animated tank/mech preview and arena composition. Only neutral framing/gradient and clear caption added; the artwork itself is unchanged.
- **Game-like mode chooser:** preserve all 4 existing gameplay choices but supply legible monochrome mode pictograms and right-chevron affordances; do not add modes, services or commerce.
- **Secondary flow cohesion:** Settings/Custom/Hangar/Dossier/Backup/Pause/After Action use neutral surfaces, consistent borders, clear primary/secondary actions. Important win/loss outcome and team color semantics remain unchanged.

## Files and invariants
- Only `web/index.html`, `web/style.css`, Android mirrors, and design/test documentation may change for this phase. No `web/game.js`, stats, local schema, AI, physics, map generator, FPS controls, tank/pilot art, network code, Android manifest, production signing or payment features.
- `web/index.html` retains IDs, actions, all navigation and JS expectations; mode card text merely gains presentational glyph spans, aria-hidden to preserve accessibility semantics.
- Added scoped CSS near EOF rather than changing established HUD/team color tokens or removing prior responsive protection. No external fonts, images, URLs or runtime dependencies.
- Rollback: immutable `checkpoint/sector-rebound-preview-100019-menu-ui-qa-approved`. Development draft [PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85) remains isolated from stable main.

## Verification gate
1. Actual Android build, source/asset parity and signer match; Preview 100020+ builds automatically from draft branch.
2. Real Chromium suite (game flow, mode chooser, Hangar/Dossier saved stats, results and navigation), responsive geometry 568×320 / 640×360 / 740×360 / 915×412 / 1280×720; inspect Home and Mode previews rather than trust CSS.
3. Check primary amber CTA visually dominant, secondary cards neutral, mode glyphs legible, unlocked/selected cosmetics distinguishable, results contrast and scrolling no regression.
4. Owner install-over phone + comfort/accessibility, existing data and cosmetics persistence, and two-phone LAN explicitly pending. No stable main game merge without owner sign-off.

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

## Exact-source verified acceptance — 2026-10-31
- [PASS scoped real Chromium UI/UX run 41184234377](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41184234377): source/runtime parity, actual Quick Play/Mode navigation, Dossier/Hangar flows, 87 geometry scenes with **zero reported issues** at five phone/landscape sizes, all existing visual regression, and 25 new color/style screenshots. [Full exported QA evidence ZIP](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41184234377/artifacts/13036586655).
- Exact Chromium computed first-gradient/text WCAG-style ratio: primary amber Play **11.77:1**, secondary Mode action **8.46:1**, amber-vs-gunmetal **6.76:1**. Original HUD team blues/reds unchanged; all four mode pictograms available and readable; selected Hangar border cyan **rgb(114,199,210)**; Dossier tiles graphite **rgb(37,47,52)**. No page errors in five mobile-landscape viewport screenshot sequences.
- [PASS signed Preview 100022](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41184207080), source `91dff8d`, SHA256 `04c7e239637e6a64f6652f1b0da2ecdd28f59edf4d30de20eed5e61f67798241`, same public disposable test certificate as Preview 100019. ZIP extracted and verified in container. The runtime web/Android assets are unchanged between 100020 and 100022; test/workflow/docs commits only.
- The preceding [run 41184180310](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41184180310) failed solely because a newly authored RGB test helper used doubly escaped regex characters. Its already-complete combat/UI/87-scene geometry audit was green; corrected parser and rerun [41184234377](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41184234377) succeeded. **No game runtime repair required.**
- Only remaining gates: real Android phone install-over and save retention, actual look/feel feedback, two-phone LAN, private Play signing and stable game-branch integration.

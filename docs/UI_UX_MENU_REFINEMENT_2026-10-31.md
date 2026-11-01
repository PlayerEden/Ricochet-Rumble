# Sector Rebound — UI/UX audit and refinement 2026-10-31

## Scope and baseline
The owner requested **audit first, then refine** the existing game, particularly a professional, streamlined main menu, coherent screen flow, sensible labels and no unnecessary developer language. Baseline is [signed Preview 100016](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41181927198), exact source `cb9928c2e7c52a29fd44bd8deb942f56de7c20ae`, saved at [rollback checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100016-before-ui-streamline).

## Current-source UX audit findings and scope
| Level | Observation | Candidate refinement |
| --- | --- | --- |
| P1 | Home attempts to fit six match/setup choices plus Quick Play, three utilities, decorative headings and a footer into one short landscape viewport. Quick Play lacks a clear singular hierarchy. | Retain one-tap Quick Play; show three secondary entries: Choose Mode, Local Play, Settings. Keep the actual animated tank/mech preview and game identity; remove redundant footer wording. |
| P1 | CQC, scored FFA, scored TDM and Custom displayed on home with conspicuous TEST / SCORE TEST developer labels. | One dedicated **Choose Mode** panel containing all four working choices, with concise match descriptions and a visible Back control. No mode removed. |
| P1 | Dossier exposes future/conceptual eligibility that grants nothing, adjacent to real Hangar rewards. | Remove the unshipped "future milestones" *visible section*, keep every real record/statistic and all earned cosmetics; underlying Dossier and user storage schema unchanged. |
| P2 | Player-facing screens carry too much explanatory copy and repeat that basic offline features are not a store. | Shorten Settings/Custom/Hangar/Dossier language; keep necessary local-save and cosmetic-only disclosure. |
| P2 | Custom Match Back skips the mode selector; local LAN copy sounds more complete than tested. | Custom Back returns to Choose Mode; Local Play is visibly labeled Wi-Fi Beta; host/join implementation unchanged. |
| P2 | Overlay, HUD, menu CSS has years of layered overrides and includes rules for older home widgets. | Scope new menu layout selectors; retain all existing gameplay HUD/touch and small-device CSS for now. Separate cleanup phase after rendered measurements. |

## Navigation after refinement
Main menu: **Quick Play** (direct Solo match; current playlist) + **Choose Mode** (CQC / Scored FFA / Team Deathmatch / Custom Match) + **Local Play (Wi-Fi Beta)** + **Settings**. Header utilities remain Hangar, Dossier and Help. Custom Back → Choose Mode; Choose Mode Back → Main Menu. After Action / paused match / LAN lobby paths, controls and network messages remain unchanged.

## QA contract and evidence boundary
- Source changes include only HTML, menu routing and menu/panel CSS. Android `assets/game.js`, `index.html` and `style.css` mirror their web counterparts byte-for-byte in the candidate Git tree.
- Updated actual-browser tests follow the new Choose Mode path for all standalone specialist modes and Custom; add a real Home → Mode Select → Home check. Update layout geometry audits to visit the selector and verify the last Home entry can be reached.
- **Do not call screenshots/browser/mobile geometry or owner phone acceptance PASS unless the exact candidate has been run.** Local container browser navigation is blocked by administrator policy, so this audit's *visual* concerns are source-grounded until GitHub visual CI or owner device screenshots confirm. GitHub auto-preview runs smoke, parity and Android build; they do not replace visual/physical QA.
- Required screen gates: 568×320, 640×360, 740×360, 915×412, 1280×720; all Home/Mode buttons tappable and visible; no overlapping top navigation, menu stage or horizontal overflow; Settings playlist state and Custom presets survive.
- No gameplay movement, control sensitivity, hitboxes, pilot/tank/mech art, camera, shells, scores, AI, network protocol, purchase/identity save format or Android package/signing changes.
- Previous Preview 100016 remains safe rollback. Stable main runtime remains v0.9.21 and draft PR #85 must not be merged until full QA/owner decision. Two-device LAN and production Play signing remain unverified.

## Subsequent audit work (not yet implemented)
- Compare new Home/Mode screen real Chromium screenshots at each landscape size with old Preview 100016.
- Review pause/result dialogs, Settings expansion, Custom saved presets, Hangar unlock/grid, Dossier responsive rows, text hierarchy, focus/tab order and accessibility targets at 740×360.
- Consolidate dead/overridden CSS only after baseline measurements; do not rewrite the renderer or UI framework blindly.

## Verified automated outcome — 2026-10-31
- [Real Chromium UI review run 41183152328 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41183152328) on exact test-only QA head `0952d084c8d2d9c096fa7156224124f002d38735`, same actual game source as Preview 100018. Live match-flow tests, Home → Choose Mode → specialist match, Custom navigation, Dossier and Hangar acceptance passed.
- [87 real UI scenes, zero geometry issues](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41183152328/artifacts/13036100067) across 568×320, 640×360, 740×360, 915×412 and 1280×720. Screenshots inspected at 740×360 Home/Mode Select/Dossier and 568×320 Mode Select: former bottom-of-home truncation eliminated.
- [Signed Preview 100018 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41182919392); after test-only correction, [signed 100019 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41183152356) with unchanged game/WebView source. Owner physical comfort, Dossier retention across install, two-phone Wi-Fi and production Play paths remain pending.
- First browser attempt [41183031192](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41183031192) failed only on obsolete test expectation for removed future-only Dossier text; corrected and rerun successfully. No gameplay engine bugs implicated.

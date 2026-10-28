# FIELDGRID Design Archive — Decision Ledger

## 2026-10-27 — Owner review of actual Lab D operator gameplay screenshot

- Owner considers faceted strict-top-down Lab D pilot acceptable for now, **not the final cohesive art style**. It looks smoother/higher-detail than the vehicle art, which already resembles chunky old arcade-style tanks.
- Preserve reviewed pilot pose, two-handed pistol, rotated actual muzzle and approved camera; later make operator/vehicle shapes share a blocky industrial pixel-arcade visual language.
- Owner explicitly endorsed a **modular** approach for future team-safe color schemes and skins: reusable helmet, shoulder, armor and trim modules driven by stable role-based palettes rather than a separately redrawn sprite for every color.
- Published [25 — Gameplay Unit Art & Modular Skins](25_GAMEPLAY_UNIT_ART_AND_MODULAR_SKINS_DRAFT.md), design only. Lab D gameplay, [real APK/screenshots](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.23-pilot-lab-d-fieldgrid-test) and rollback unchanged; no cosmetics implementation or skin picker now.

## 2026-10-27 — 1.0-draft
- Created persistent GitHub archive and reusable bible template.
- Locked working direction: fictional FIELDGRID operator dossier portraits; coherent industrial graphic illustration; restricted shapes, upper-left light, clean silhouette; no random pseudo-text or pasted AI-looking art.
- Defined launch **concept** target: 5 free starter, 3 earned, 10 premium pilot icons; 18 total.
- Direct purchase intended for premium pilots; no paid randomized capsule at launch. Earned/unlocked items retain full polish and usable silhouettes.
- Cosmetics after portraits: vehicle palette changes, patterns, subtle trails and projectile finishes. All must remain gameplay-neutral.
- Defined stable concept IDs in a separate manifest. No source icon artwork exists yet and no product is available for purchase.
- Reserved final approval of palette, finished style master, art source, licensing, SKUs, purchase restoration and real-money pricing for future iterations.

## 2026-10-27 — v0.9.20 proposed lobby direction
- Shift home screen from full technical briefing to mobile-game lobby with featured actual tank rendering, dominant Quick Play, and secondary local multiplayer/settings/help.
- Simplify the actual overhead pilot to head, torso, two separate gaited boots, minimal arms and tiny pistol. No mechanics changes.
- Save design rationale and screenshot gates in `reviews/2026-10-27_GAME_LOBBY_PILOT_v0920.md`. Owner mobile review still needed before approval.

## 2026-10-27 — Game-mode and music discussion archive

- Propose a small game-mode playlist: Close Quarters pilot-only, vehicle FFA, TDM, then CTF and Elimination.
- Separate map size, respawn and match victory rules per mode. Existing 2-lives, small-map FFA is a baseline, not a finalized launch experience.
- Consider generated in-map Forward Bays for team modes, distinct from the menu cosmetic Hangar.
- Preserve requests for calmer original synth menu/battle loops, animated tank/mech hero, trimmed menu copy, simpler pilot and a moderate pullback.
- Decisions **not approved**: exact limits, score/time thresholds, flag carriers, team base naming, soundtrack selection, camera percentage.
- Files: 20_MATCH_MODES_BIBLE_DRAFT.md, 21_MUSIC_AND_SOUND_BIBLE_DRAFT.md, 22_GAME_FEEL_AND_UI_DRAFT.md. Existing runnable game untouched.

## 2026-10-27 — Quick Play continuation and match-summary direction

- User endorsed a continuous Quick Play session: complete a match, review outcome and real statistics, choose NEXT MATCH from selected modes or MAIN MENU.
- Proposed shuffle-bag randomization avoids repeats where multiple modes are enabled; no auto-start.
- Distinguish match-only scoreboard from running session totals; show mode-specific metrics, not fictional placeholders.
- Solo next-match selection is local; LAN host decides and guest sees matching results and waits/readies.
- Added [23_QUICK_PLAY_AFTER_ACTION_BIBLE_DRAFT.md](23_QUICK_PLAY_AFTER_ACTION_BIBLE_DRAFT.md) and linked it in Mode Bible; all remain design-only.

## 2026-10-27 — Procedural battlefield identity reaffirmed

- User highlighted that Sector Rebound's random maze generation can make every Quick Play match a different tactical problem, rewarding adaptable skills and some luck over route memorization.
- Codified the core direction: **No memorized battlefield. Adapt, fight, survive.** Not an originality claim that no other games have procedural maps.
- New [24_PROCEDURAL_ARENAS_IDENTITY_DRAFT.md](24_PROCEDURAL_ARENAS_IDENTITY_DRAFT.md) documents per-mode generator constraints, seed determinism, balanced spawns/objectives, same-map LAN authority, and test gates.
- Cross-linked mode/after-action bibles. No code changes in this discussion branch.

## 2026-10-27 — Consolidated v1.0 roadmap

- Established one staged build order in [Roadmap to Google Play](../ROADMAP_TO_GOOGLE_PLAY_V1.md): **integrate/test v0.9.20 baseline first**, then narrow home/camera/pilot polish, mode architecture and continuous Quick Play, three initial modes, persistent Pilot Dossier and simple cosmetics, and finally commercial/privacy/release QA.
- Capture the Flag, Elimination spectators, XL sectors and large cosmetic expansions remain post-launch candidates unless quality evidence and scope permit.
- Highlighted stacked unmerged draft PRs (#1–#16) as technical debt; keep them safe and avoid falsely representing design-only concepts as implemented.

## Decisions awaiting owner approval
1. Choose the **first three style-lock portrait prototypes**: Recruit, Relay and Cold Cell (recommended).
2. Confirm the launch target **5 free / 3 earned / 10 premium** or reduce the premium wave before release.
3. Decide how realistic exposed faces should be within the flat graphic style.
4. Finalize outfit accent palettes based on test results on actual phone screenshots.
5. Decide retail structure for premium singles/bundles after native Google Play Billing architecture is ready.

Never mistake this draft archive for completed visual assets, released items or working monetization.

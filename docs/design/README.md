# FIELDGRID Design Archive

**Project:** Sector Rebound (fictional FIELDGRID program)  
**Archive version:** 1.0-draft | **Created:** 2026-10-27  
**Scope:** Visual direction, cosmetic design and future asset-production standards.  
**Status:** DESIGN ONLY — no pilot art, purchasable products, save system or transactions have been implemented by these documents.

This is the permanent source of truth for **future art and interface decisions**. It is intentionally separate from release notes and gameplay implementation. The previous playable branch remains unchanged.

**Current implementation plan:** [Roadmap to Google Play v1.0](../ROADMAP_TO_GOOGLE_PLAY_V1.md). It documents the order of work, integration risks, and acceptance gates; it does not claim the proposed modes, music, cosmetics or purchases are shipping yet.

## Current discussion drafts (not implemented)

- [20 — Match Modes & Playlist Bible](20_MATCH_MODES_BIBLE_DRAFT.md): pilot-only close combat, FFA, team deathmatch, capture the flag, elimination, respawns, generated Forward Bays and safe Quick Play selection.
- [21 — Music & Sound Identity Bible](21_MUSIC_AND_SOUND_BIBLE_DRAFT.md): original synth soundtrack or curated generated loop, offline Android playback and independent music/SFX.
- [22 — Game Feel & UI Proposals](22_GAME_FEEL_AND_UI_DRAFT.md): remove home filler text, animated actual tank/mech preview, simplify on-foot pilot, slightly wider vehicle-aware camera.

These are **design discussions** with unresolved choices, not production promises or Play Store features. Do not convert estimates into live rules without tested implementation and owner review.

## Read in this order

1. [00 — Master Visual System](00_FIELDGRID_VISUAL_SYSTEM.md): identity, interface, color, typography, readability.
2. [10 — Pilot Icon Design Bible](10_PILOT_ICON_BIBLE.md): the fixed portrait grammar, production process and rejection criteria.
3. [11 — Launch Pilot Roster](11_PILOT_ROSTER_LAUNCH.md): every proposed starter, earned and premium icon, with distinct silhouettes.
4. [12 — Cosmetic Expansion Bible](12_COSMETIC_EXTENSION_BIBLE.md): vehicle colors, paint patterns, movement trails and projectile treatments.
5. [90 — Design Bible Template](90_DESIGN_BIBLE_TEMPLATE.md): copy this for any future cosmetic, HUD, environment or UI-design subsystem.
6. [CHANGELOG](CHANGELOG.md): decisions, versions and open questions.

Machine-readable **concept catalog**: [../../game-data/cosmetics/pilot_icons.v1.json](../../game-data/cosmetics/pilot_icons.v1.json).

### Latest UI & character review

- [Game Lobby & Minimal Pilot — v0.9.20 review](reviews/2026-10-27_GAME_LOBBY_PILOT_v0920.md): applies the visual system to the real mobile home screen and the small on-foot character. Builds directly on in-game assets, prioritizes primary-play hierarchy and simple silhouettes.

### Quick Play post-match flow

- [23 — Quick Play Session & After-Action Bible](23_QUICK_PLAY_AFTER_ACTION_BIBLE_DRAFT.md): after each completed match show mode-specific statistics, then **NEXT MATCH** from the player's selected playlist or **MAIN MENU**. Includes no-repeat shuffle, session stats and host/guest rules. **Proposal only, not implemented.**

### Procedural arena identity

- [24 — Procedural Arenas & Tactical Adaptation](24_PROCEDURAL_ARENAS_IDENTITY_DRAFT.md): no memorized battlefield; each new match generates a fresh mode-valid maze, but spawn fairness, connected routes and safe objectives must be tested. **Proposed design direction, not a new gameplay feature.**

## Authority / conflict rules

- **Production shipping behavior:** running game source and passed tests win.
- **Approved visual identity:** Master Visual System wins.
- **Cosmetic-specific production details:** the corresponding Bible wins unless explicitly superseded.
- **Item names, IDs and acquisition:** the reviewed manifest wins, and are revised together with its human-facing roster.
- **Unapproved concept ≠ owned asset ≠ shipping store item.** An item must pass review and have an actual licensed/rendered asset before any UI represents it as unlocked or for sale.
- **Commercial or policy decisions** live in launch documentation and must be verified again before publishing, not inferred from a design document.

## Small-team production loop

**Define → produce → compare contact sheet → reject/repair → test at 32/48/64px → approve → import → regression screenshots → release.**

Every asset enters with:
- stable ID; one-line subject and silhouette; approved palette; pack/set
- method (vector/procedural/generated then edited); provenance and commercial-rights log
- source/master path, final exports, checksum and review status
- thumbnail at true UI size; dark/light and common color-vision checks
- gameplay-neutrality check for projectiles, trails and competitive team colors

### Suggested path conventions

- `assets/source/pilots/<id>/` — editable layered source and documented references
- `web/assets/pilots/<id>.webp` — optimized production icon once approved
- `android/app/src/main/assets/assets/pilots/<id>.webp` — same approved export
- `docs/design/reviews/<date>-pilot-contact-sheet.md` — acceptance notes
- `game-data/cosmetics/pilot_icons.v1.json` — concept data only, not wired to gameplay

These paths are **future conventions**, not claims that files presently exist.

## Release philosophy

Cohesive, grounded military-industrial graphic design; modest amounts of polished art. A cosmetic is a personal expression, not a competitive advantage or an excuse for UI clutter. Keep a permanent, respectable free set. Build monetization only after profile persistence, restore flow, review and real Google Play Billing are implemented.

**Next design gate:** Create the five starter masters and one premium prototype **as a controlled style test**, not 18 unrelated generations. Choose and lock one finish before finishing the roster.

# 90 — Reusable FIELDGRID Design Bible Template

> Copy this into \`docs/design/XX_SUBSYSTEM_BIBLE.md\`. Give it a numbered prefix and cross-link the archive index. Replace every bracketed field; do not publish vague generative prompts as production specifications.

# [Subsystem] Design Bible
**Version:** [major.minor-draft/approved]  
**Owner:** [art/design owner] | **Date:** [YYYY-MM-DD]  
**Status:** [draft/style locked/assets pending/shipping/deprecated]  
**Applies to:** [game version/feature/asset IDs]  
**Dependencies:** [00 Master Visual System + related docs]

## 1. Purpose and player-facing role
What problem does the design solve? Where and at what physical pixel size will it appear? What is excluded?

## 2. Non-negotiables
List 5–8 rules that all assets share: perspective, proportions, stroke, palette, lighting, text, safe UI regions, accessibility and competitive clarity.

## 3. Anatomy / composition blueprint
Concrete measurements, spacing, layers, material logic, repeated motifs. Describe the subject or interface as if another person had to recreate it without this chat.

## 4. Palette and typography
Exact swatches, use restrictions, contrast expectations, and font/license provenance. Distinguish team/status semantics from cosmetic tints.

## 5. Variations and rarity
What can change, what stays fixed, starter vs earned vs premium, with no visual/power disadvantage for non-paying players.

## 6. Production and generation guide
Step-by-step asset pipeline, reference control, candidate count, prompt brief, human edit pass, master formats, export dimensions and naming.

## 7. Roster / component manifest
Table containing every ID, name, category, silhouette, render spec, source path, unlock/billing concept and status. Link matching machine-readable JSON; no hidden inventory state in prose only.

## 8. QA & rejection criteria
Real pixel-size matrix, device screenshots, performance cost, legal/provenance, competitive readability, reduced effects and long-session comfort.

## 9. Implementation & migration
Game code references, persistent save version, fallback, entitlement checks, Android-web sync, unknown/deprecated IDs, restore/refunds, multiplayer validation, and tests.

## 10. Decisions / changelog
What is locked; what is still a proposal; why rejected candidates failed; date and reviewer. Never overwrite past decisions without a dated entry.

## 11. Next approval gate
One tiny, testable slice. Define the exact evidence needed before implementation or publishing.

### Approval tags
- **CONCEPT**: named only.
- **STYLE REVIEW**: has a representative draft, not approved.
- **ART APPROVED**: exact exported art reviewed and licensed.
- **IMPLEMENTED**: in game code with smoke/visual tests.
- **RELEASED**: shipped through verified distribution channel.

### Reusable change request
\`[Date] [Subsystem] [IDs affected] [Why] [Visual risk] [Gameplay/readability risk] [Assets/tests affected] [Rollback path] [Approval]\`.

## Future bibles suggested
- Tank/Mech Paint & Material System
- Projectile & Trail Effects
- FIELDGRID HUD, Menus & Typography
- Arena Biomes and Tile Treatment
- Sound / UI Feedback Palette
- Google Play Store Asset Guide

**Rule:** All bibles inherit [Master Visual System](00_FIELDGRID_VISUAL_SYSTEM.md). Never fork a different style just because a new image generator or design tool becomes available.

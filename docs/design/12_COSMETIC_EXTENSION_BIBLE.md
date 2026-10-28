# 12 — FIELDGRID Cosmetic Extension Bible
**Version:** 1.0-draft | **Status:** Future art/system specification, not implemented

## 2026-10-27 owner gameplay-art direction update

The actual QA-passed [Lab D on-foot pilot](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.23-pilot-lab-d-fieldgrid-test) is **playable as a provisional art candidate**, but owner feedback identified a mismatch with the tank's chunky old-school arcade shapes: the pilot's finer faceted surfaces look like a different rendering family. The next *optional* visual pass should harmonize all three in-game units with block-built, flat three-value industrial modules and support simple palette/skin choices **through named material roles**, not hard-coded one-off sprite variants.

See [25 — Gameplay Unit Art & Modular Skins](25_GAMEPLAY_UNIT_ART_AND_MODULAR_SKINS_DRAFT.md) for the scoped silhouette/geometry recipe, modular armor/weapon/team-identity layers, implementation sequence and phone-sized approval tests. This is a design handoff, **not a claim that gameplay skins, a picker, entitlement logic or billing work today**. Playable top-down operators and dossier portrait icons are different assets.

## Principle
Sector Rebound's 2D hardware benefits from **parametric skins**, not hundreds of separate hand-drawn sprites. Keep one solid tank/mech/pilot geometry foundation and expose safe, deliberately designed visual layers. Premium effects must never alter combat stats, hitboxes, projectile collision, aim or readability.

**Planned slots:** pilot icon; tank paint; mech paint; on-foot uniform trim; optional movement trail; optional projectile visual; optional dossier frame/nameplate.

### Slot 1: unit base colors (highest priority after Pilot Dossier)
- Retain faction outline, friendly/enemy ring or independent identity marker outside the skin. Never allow paid paint to impersonate another team.
- Apply palette to hull armor or panels; keep tank treads, mech joints, muzzle and essential edge contrast standardized.
- Starter colors: slate, moss, dune, oxide, blue-grey, cream. Free unlocks should remain satisfying.
- Premium palettes: contrasting two-tone pairs, purposeful highlight seams, optional gloss only on believable metallic surfaces.
- Pure black and camouflage may not erase the unit against dark arena/walls; enforce contrast floor and external silhouette outline.

### Slot 2: paint patterns (second priority)
- Procedural overlays using aligned masks and fixed scale; never a random texture pasted onto every unit.
- Viable families: **hazard diagonal** (limited panel only), **range checker** (small subdivision), **split-tone service stripe**, **forest block camo**, **desert geometric**, **prototype segmented plating**.
- 2–3 shades per design, no animated texture as a default. Mirrored geometry should respect seams/treads and unit orientation.
- Small 32–48px unit view must still read as tank/mech, not a speckled blob.

### Slot 3: movement trails (later and strictly cosmetic)
- In-world exhaust/track particles, not paid movement-speed effects.
- Allowed: subdued dust, compact cold vapor, short metallic spark, light mechanical ion haze (rare/prototype).
- Keep under 0.35 seconds visible under normal speed; alpha cap and low particle density. Exact numbers are *test targets*, not locked engineering values.
- No full-screen streaks, RGB rainbow wakes, bright white occlusion, tactical false arrows, or particles that resemble incoming bullets.
- Accessibility: trail disabled by reduced-effects/low-performance settings; no purchase lost, only presentation switches off.
- Confirm remote players can see the selected approved trail without network packet explosion, or render local-only until proven.

### Slot 4: ammo / projectile visual finishes (last priority)
- **Gameplay projectile identity is sacred.** Maintain collision radius, shell path, hit effects and team-readable outline regardless of paid skin.
- Safer styles: small copper rim, ceramic sleeve, faceted tracer core, muted cyan tail. Avoid visually invisible, too-thin, misleadingly oversized or enemy-color camouflage shots.
- A cosmetic projectile never gains extra bullets, lifetime, bounce count, ricochet angle, damage, acceleration or explosive effects.
- Test in dense ricochet arenas on low-brightness Android screens, colorblind modes and both sides in local multiplayer.
- Provide "standard projectile visuals" toggle so every player can opt out of opponents' extra effects while preserving ownership.

## Recommended roadmap

1. **Pilot icons / dossier:** 5 free + 3 earned + 10 planned direct-purchase portraits (no art produced yet).
2. **Basic unit colors:** 4–6 free and 4–6 premium palettes, shared parameter library if visuals remain legible.
3. **Patterns:** 2 earned, 4 purchasable examples, rendered with existing vehicle geometry.
4. **Movement trails:** 2 earned, 3 optional purchasable; strict VFX budget.
5. **Projectile cosmetics:** only after combat readability and physical two-phone QA.

These are estimates, not final pricing or launch commitments. Release fewer approved assets rather than padding the store.

## Future technical interface (proposal)

Each cosmetic has durable `id`, `slot`, `sourcePalette` / `renderParams`, `acquisition` and `assetVersion`. A Pilot Dossier stores equipped slot IDs. An entitlement system independently validates ownership before allowing equip. On unknown or revoked ID: display **default free visual**, without deleting the historical profile record.

Network transport (when later designed) should pass compact approved IDs or a validated fixed palette ID, not untrusted hex colors, image URLs, shaders or user-authored payloads. Avoid allowing a player to load a skin from arbitrary internet URLs.

## Commercial safety and player trust

- No ads imposed during combat; if rewarded ads eventually exist, reward **cosmetic-only value** without win advantage.
- Direct cosmetics are permanent, non-consumable entitlements with restore/refund/repurchase behavior designed before sale.
- Launch plan **does not** include paid randomized gacha. Google Play requires odds disclosure near purchases for paid random virtual items, and additional jurisdictions may have special rules; review current policies if revisited.
- Price UI must reflect real Google Play Billing prices, not hard-coded currency text; no simulated paid purchase flow in production.
- Make free starter gear excellent enough that buying cosmetics feels optional.

References (policy, verify before shipping):
- https://support.google.com/googleplay/android-developer/answer/9858738
- https://support.google.com/googleplay/android-developer/answer/10281818
- https://developer.android.com/google/play/billing/one-time-products

## Future design bible trigger

If a slot develops more than three variants or dedicated animation, **create its own Bible from template 90**, cross-link this document, and stop scattering decisions through chat histories.

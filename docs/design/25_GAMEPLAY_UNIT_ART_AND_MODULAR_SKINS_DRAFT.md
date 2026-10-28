# 25 — FIELDGRID Gameplay Unit Art Cohesion and Modular Skin Architecture

**Decision recorded:** 2026-10-27 (owner's actual Android Lab D screenshot review)
**Status:** Owner-supported direction and NEXT ART PASS PROPOSAL — **not implemented or approved as final production sprites/skins**.
**Visual reference:** [Lab D real 915×412 Android-sized gameplay screenshot archive](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.23-pilot-lab-d-fieldgrid-test). Owner's separately supplied screenshot shows pilot amid a green tank and orange enemy tank.

## Owner feedback — preserve exact nuance

> Lab D is "not bad" and probably works for now. The pilot feels cleaner/more detailed than the vehicles, which resemble older pixel-like arcade tanks. The pilot should share that same vehicle feel. Designing this visually as modular parts should make different player color schemes and skins straightforward.

**Interpretation:** Do **not** throw out the QA-tested Lab D pilot or immediately replace its playability. The art still has an unresolved *style cohesion* issue: the operator's many small rounded/faceted plates and soft multi-tone center feel more intricate and polished than the tanks' broad rectangular chassis, tread blocks, centered square turret, bold outline, and limited bright panels. The mismatch is more about **shape/detail density** than perspective or size. Lab D's strict top-down two-hand pose, gun path and tactical brackets are advances to keep.

## Shared FIELDGRID gameplay rendering language

- **Chunky, crisp, pixel-arcade-adjacent industrial 2D.** Use intentional rectangular modules, coherent square stepping, short bevels/45° chamfers, strong dark outline, flat colored planes. Inspiration in *visual grammar* only; no copied third-party sprite, tanks, fonts or silhouette.
- Avoid forcing full literal 8-bit pixels, image upscaling or rough jagged edges; make all units feel as though drawn by the same arcade artist at normal phone zoom.
- **Limit detail density:** broad shapes readable at 32–48 game px. One primary armor mass, one functional dark cavity, one bright light-catching panel, maximum one or two tiny functional seam highlights per module. If a highlight disappears at normal phone scale, consider removing it.
- **Materials:** three value steps per module: dark shadow/outline, colored main face, controlled upper-left lit face. Weapon, black mechanical gaps, tracks, gloves and muzzle are shared neutral material families.
- **Geometry:** forward is +X in local coordinates for tank/mech/pilot. All mirrored modules derive from one function, with consistent attachment positions; no accidentally asymmetric tread or shoulder orientations.
- **Damage clarity/ID:** team marks, enemy bars, select brackets, actual ejection shields and muzzle flashes must remain clearly separate from cosmetic paint. No paint may visually erase units into dark walls or impersonate another team.
- Do **not** add cosmetic glow, noisy outlines, dense camouflage or more geometry just to make a higher-tier skin look "premium."

## Next operator art pass (optional Lab E; not started)

Keep the current readable footprint, two forearms/hands and strict overhead angle, but change the drawing recipe to match tank:
1. Helmet: fewer larger blocky faces/stepped-chamfer silhouette; one light-facing square/rectangle and a clear dark border rather than many small planes.
2. Shoulders: paired **block armor modules**, symmetric like the tank tracks; a bright trim strip and one dark joint per side.
3. Arms: two intentional stepped/bent rectangular forearms with one glove each, both reaching the existing compact pistol; avoid tiny facets and ambiguous additional limbs.
4. Vest/back: one visibly separable rectangular torso module, modest exposed collar and seam; no circular underbody.
5. Gun: preserve the single mechanical pistol, common shared muzzle at **(28,2)**, rotated bullet spawn, gun wall-trace and fire flash; no fake profile/2.5D weapon.
6. Compare actual idle/aim/move/fire/eject gameplay screenshots with the nearby tank/mech at normal screen size, **not** only zoomed-out isolated art diagrams.

## Modular skin layers: architectural design contract (future)

**Separate geometry from appearance** across *all three playable unit types*. Today the tank and mech accept one paint color, while most of the Lab D pilot colors are hard-coded. Merely swapping that one current color would not recolor the actual pilot armor. This should be fixed in a foundation pass, not by creating one completely separate sprite per color.

Proposed structural modules:
- **Common:** chassis/body, facing, paintable panels, dark outline, fixed equipment, team identifier.
- **Pilot:** vest/backplate, helmet, mirrored left/right shoulder plates, bent arms, gloves, pistol, optional narrow trim/pattern mask. Preserve anchor points and silhouette envelope when changing cosmetic modules.
- **Tank:** chassis/armor panels, paired tracks, center turret, gun/barrel, optional stripe/paint mask. Tracks must remain aligned and paired; rotating gun stays physically truthful.
- **Mech:** chassis/core, paired limbs/shoulders, mechanical joints, gun, optional paint mask. Mirror parts consistently through animation.

Proposed abstract palette fields (draft identifiers; **not an implemented JSON schema**):
```js
{
  id: "skin.fieldgrid.slate",       // stable, approved cosmetic identifier
  armorBase: "#526e79",            // paintable large planes
  armorShadow: "#294650",          // lower planes
  armorLight: "#91a8ab",           // upper-left bevel
  panelDark: "#1b3947",            // functional panel recess
  trim: "#78949b",                 // narrow optional stripe
  patternId: "none"                // aligned mask, never random screen noise
}
```

**Important:** Common **role names**, not necessarily identical colors across tank/pilot/mech: neutral mechanical materials and team markers are independent. The `paint` positional API can be adapted via an internal resolved material object while keeping legacy callers working as compatibility shims. Do not claim any skin or cosmetics selection is playable until implemented/tested.

Skin equip/save and network plan follows [Cosmetic Extension Bible](12_COSMETIC_EXTENSION_BIBLE.md). Use validated stable IDs, free defaults, and owned entitlement checks when implemented. New visual upgrades cannot alter speed, aim, gun origin, projectile radius, target hitbox, hit detection, camera, team color meaning or network fairness. Avoid sending free-form hex colors across network.

## Suggested safe order (separate review gates)

1. **Foundation:** extract palette/material roles for existing tank/mech/pilot without altering default screenshots; test exact default parity in browser and Android. Keep actual user-facing skin picker unimplemented.
2. **Style pass:** try a smaller, chunkier block-built pilot that visually belongs beside tank/mech; use identical zoom/camera for side-by-side screenshots. Preserve Lab D branch and APK as rollback.
3. **Variants:** only after base art acceptance, prove 3–4 free example palettes using the **same exact geometry**, screen-size and team readability. Later add 1 distinct helmet/shoulder variant as proof of modular attachment anchors.
4. **Persistence / cosmetics UI:** add stable skin IDs with default fallback and local save after design acceptance. Only later address LAN sync or owned products, with separate QA and Play Billing planning.

## Acceptance criteria before replacing Lab D

- Owner says a pilot and both vehicles look like a unified artistic family in the **actual** 915×412 landscape combat view.
- At 1.07 pilot zoom, small proportions still read as a soldier with two hands and aimed gun rather than a drone, crawling figure or turret.
- Default cosmetics, sample colors and future palette changes preserve bright/dark contrast and both team identities.
- 740×360, 915×412, 1280×720 real Chromium captures plus physical Android screenshots reviewed at **true phone size**.
- 4 rotated muzzle checks, wall cover, AI movements, ejection, shield, collision, tank/mech geometry, performance, controls, asset parity and debug APK QA still pass.
- No changes to accepted pilot/tank/mech camera targets (1.07 / 0.82 / 0.77) or apron (420).
- No merge of PR #31, PR #24 or a new art lab until the separate intended acceptance gates are resolved.

## Scope boundary

**Pilot dossier portraits** are intentionally a separate category: see [Pilot Icon Bible](10_PILOT_ICON_BIBLE.md). Portraits can depict faces at three-quarter view, while the *playable avatar* is always strict overhead. Shared FIELDGRID colors/identity are allowed, but the portrait rendering recipe is not the gameplay sprite recipe.

**As of this note:** Lab D gameplay renderer and exact tested Android APK **already exist** as an experiment; modular runtime skins, palette resolver, selectable cosmetics, paid products and a Lab E redesigned gameplay sprite **do not yet exist**.

# 10 — FIELDGRID Pilot Icon Design Bible
**Version:** 1.0-draft | **Status:** Production specification; no icons approved yet  
**Dependencies:** [Master Visual System](00_FIELDGRID_VISUAL_SYSTEM.md) and [Pilot Roster](11_PILOT_ROSTER_LAUNCH.md)

## 1. What these icons are

Each pilot icon is a **fictional operator dossier portrait**, not a playable character model. The icon represents the human player in a profile, matchmaking/lobby list, post-match panel and future cosmetics catalog. A good portrait still feels like it belongs to the angular tanks, mechs and institutional FIELDGRID interface.

Not everything is a masked anonymous soldier. A controlled mix of exposed faces, helmets, hair silhouettes, headset types, skin tones and age-appropriate adult looks keeps the free roster expressive without causing style drift.

## 2. Locked portrait recipe

- **Canvas:** square 512×512 px master; flat unlettered portrait artwork. Plan transparent foreground layer plus separate approved backplate/frame for flexible UI reuse.
- **Exports:** transparent or clean composited WebP/PNG at 256×256, 128×128 and 64×64. Test at actual 48×48 and 32×32 rendered sizes. Do not upscale an undersized generated image.
- **Framing:** head and upper shoulders; slight 3/4 turn (roughly 10–15°) toward image right. Eyes/visor live at ~39% of height; head approximately 55–62% of full height; shoulders reach ~80–88% width. The actual face/visor never touches frame edge.
- **Perspective:** chest-up, eye-level dossier drawing, not top-down gameplay camera.
- **Lighting:** shared upper-left cool key, understated lower-right shadow; three flat value groups, max one optional visor specular plane.
- **Outline:** solid coherent outer silhouette, medium-weight edge; internal seams half-weight. Do not fake hand-drawn line wobble per asset.
- **Backdrop:** two geometric steel-blue planes and one very faint identity accent. No war scene, explosions, detailed city or giant glowing halo.
- **Palette budget:** 2–3 core gear hues, 1 accent hue, skin/hair tones where applicable, consistent neutral shadow. Avoid random rainbow visor lighting.
- **Mechanical sanity:** straps attach, earpieces align with ears, helmet has plausible chin/retention, eyepieces track head perspective, symmetric components have consistent sizes.
- **Icon itself:** **no embedded labels, fake signatures, small lettering, fake rank insignia, watermark, QR or legible serial numbers**. Dossier UI adds name/rarity/frame separately in sharp native text.
- **Expression:** focused, approachable, distinctive but restrained. No violent injury, guns aimed at viewer or deliberately exaggerated facial features.

## 3. Consistency matrix

| Axis | Fixed across all | Allowed variation |
|---|---|---|
| Camera/crop | Same bust scale and 3/4 orientation | Tiny face/head shape adjustment |
| Value/light | Three-value upper-left illumination | Accent reflected from visor only |
| Line | Consistent silhouette weight | Equipment-specific seam detail |
| Backplate | Flat FIELDGRID steel panels | One muted faction/role tint |
| Anatomy | Plausible adult proportions | Face shapes, skin tones, hairstyles |
| Gear | Functionally believable | Helmet, cap, headset, safety visor, collar |
| Mood | Quiet tactical professionalism | Confident, curious, veteran, cautious |
| Costliness | Same drawing quality at every tier | Premium gains a stronger *design*, not higher render resolution |

## 4. Free / earned / premium difference

**Starter:** clear and friendly, no deliberately inferior quality. Simple but distinct everyday gear.  
**Earned:** service-specific silhouette tells a story about the relevant achievement; no power effects.  
**Premium:** highly differentiated equipment, shapes and palette relationships—NOT denser textures, brighter neon, more glow or impossible tech. Premium remains readable at 32px.

All categories ship at the exact same pixel quality. "Rarity" is inventory metadata, never a competitive stat.

## 5. Controlled production pipeline for generated-and-edited artwork

1. Pick a roster ID and a written **one-sentence silhouette** before creating art.
2. Construct a single approved **base template** (crop, head position, shoulder geometry, lighting and background planes).
3. Produce only **2–3 candidates** per ID using that same reference template and restricted palette. Never scattershot 50 random unrelated generations.
4. Reject anything that departs from the template. Choose one, then manually/structurally **repair helmet geometry, visor symmetry, straps, facial details, contour weights** and palette.
5. Remove all generated lettering and illegible pseudo-symbols. Add any legitimate dossier typography in code.
6. Compare the candidate beside the already-approved starters, not only on its own.
7. Show true-size crops at 128 / 64 / 48 / 32 px in both dark and light UI; inspect visor/eyes and outline.
8. Approve only after a source/license/provenance entry and artifact checksum are recorded. If consistency fails, regenerate or redraw, not "ship because it looks neat."

### Controlled-generation art brief (starter)

> FIELDGRID operator dossier portrait, 512-square chest-up stylized **flat graphic illustration**, three-quarter-front adult head facing slightly right, fixed head scale, upper-left cool key light and three coherent value planes. Plausible industrial tactical [SPECIFIC HEADGEAR], [SPECIFIC FACE SHAPE/HAIR], charcoal-blue uniform with [ONE ACCENT], geometric two-plane slate background. Confident restrained expression, consistent purposeful contour width, clean symmetrical hardware and realistic attachments. No readable text, no logo, no badge or real military insignia, no firearm, no photorealism, no cinematic bokeh, no glowing city, no random adornments, no watermark.

Use a real approved icon/template as the visual anchor once we have one; the wording alone is not adequate for production consistency. Generated output is a **candidate**, never an automatic finished asset.

## 6. Detailed QA/rejection checklist

- [ ] Head/visor aligned and facial anatomy intentional; no extra ear, malformed chin, uneven glasses.
- [ ] Two shoulder seams make physical sense; no floating microphone, missing headset band or impossible strap.
- [ ] Crop/pose/lighting/background identical in logic to starter master.
- [ ] One clear silhouette distinguishable from adjacent roster members in 32px contact sheet.
- [ ] No artificial scribbles, nonsense micro-labels, gibberish text, pseudo-flags or borrowed emblems.
- [ ] Starter and premium icons have comparable finish and effort.
- [ ] Contrasts with both selected and unselected UI frames; no role implied by color alone.
- [ ] Originality/provenance and commercial-use suitability recorded; no recognizable copied character or real person.
- [ ] Exact export sizes, layers and naming match manifest ID.
- [ ] Reviewed on a real phone and in-game menu **before shipping**.

## 7. Identity frames are independent

The game may add an optional externally-rendered rectangle, rarity tab, border, callsign, hover/focus cue or service grade. Never bake those into the portrait. A profile avatar purchase owns **the portrait SKU**, not gameplay stats or the profile's generated accomplishments.

## 8. Implementation contract (future)

- One manifest ID identifies the cosmetic permanently.
- Profile stores `equippedPilotIconId`, and entitlement ledger stores owned IDs.
- Unlock/purchase gates are checked independently of avatar renderer.
- Default/fallback always a free starter ID, never a broken image.
- Explicit handling for missing file, deprecated item, save migration, billing refund/revocation.
- Competitive networking shares only whitelisted cosmetic IDs when later integrated. Unknown IDs fall back safely.

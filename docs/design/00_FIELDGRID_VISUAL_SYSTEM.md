# 00 — FIELDGRID Master Visual System
**Version:** 1.0-draft | **Owner:** Sector Rebound art direction | **Updated:** 2026-10-27

## North star

**Fictional defense-contractor simulation software meets clear, modern top-down arcade action.** Functional, engineered and a little austere; recognizably playful rather than photoreal or sterile. FIELDGRID is an invented system, not a real agency or endorsed government program.

### Four pillars
1. **Utility first.** At 48px, a unit or item tells the viewer what it is. Combat legibility always wins.
2. **Industrial plausibility.** Visors, helmets, joints, antennae, tracks and panel seams are functional.
3. **Restricted visual grammar.** Repeated angles, shared rim lighting, limited palettes, stable framing and finite stroke widths.
4. **Quiet confidence.** No gratuitous neon, fake glitch noise, unreadable microtype, random floating symbols or excessive gradients.

## Rendering & geometry

- Gameplay: top-down 2D geometric hardware and crisp mechanical detail. Strong silhouettes; mirrored parts mechanically correct; animations explain motion.
- Dossier portraits: consistent 3/4-front bust, graphic—not anime, photoreal, painterly or 3D-rendered. Faces may appear, but illustration quality must remain coherent with helmeted portraits.
- Shapes: predominantly square/rectilinear modules, 45-degree chamfers, modest rounded mechanical corners where physically credible.
- Shading: **three-value construction** (base, one darker plane, one lit plane), optional 4th specular highlight; single upper-left lighting direction. No lens bloom or glossy plastic unless justified by glass/visor.
- Textures: at most one quiet industrial grain pass; never a random distressed overlay that changes between assets.
- Dossier interface: precise 1–2px dividers, deliberate blank space, uppercase micro-labels, compact system metadata. No large branded title during a match.

## Color tokens (design proposal; evaluate against current app styles)

| Token | Hex | Use |
|---|---|---|
| Canvas / abyss | \`#091822\` | Backplate and empty interface space |
| Panel / steel | \`#122C38\` | HUD panels and dossiers |
| Structural line | \`#496B76\` | Dividers and module frames |
| Primary text | \`#E0EEF1\` | Labels and gameplay readouts |
| Secondary text | \`#9FBAC2\` | Descriptions and metadata |
| Signal cyan | \`#6CC7D6\` | FIELDGRID system accents |
| Signal amber | \`#EDBE69\` | Warnings, earned highlights |
| Armor rust | \`#B66F5A\` | Mechanical accents |
| Supply green | \`#76D8A8\` | Confirmed/pickup states |

These are **art direction** colors. Existing gameplay blue/red team affiliation, projectile contrast, and accessible warning colors are authoritative. Custom cosmetics may change armor paint, **not** essential friendly/enemy identification.

## Type system

- Functional game headers: compact condensed sans (\`sans-serif-condensed\` / compatible locally bundled licensed face later).
- Body: clear sans, proper sentence case when prose; upper case for short command labels.
- Codes, IDs and terminal metadata: restrained monospace, never on paragraphs.
- No military stencil as the main typeface, novelty sci-fi glyphs, fake redactions or pseudo-classified wording that implies real government affiliation.

## Hierarchy

1. Live danger, unit position, projectile trajectories and hit zones.
2. Local health, shots ready/in flight and essential controls.
3. Match phase and contact indicators.
4. Decorative identity and cosmetic flourishes.

If a trail, outline, icon, border, nameplate or animation competes with 1–3, it is too strong.

## Quality gates

- Actual 32px icon recognizability and 48px normal display review; 64/128px inventory review.
- Test at landscape \`740×360\`, \`915×412\`, \`1280×720\`, plus at least one notched physical Android screen before release.
- Check monochrome, grayscale, low-brightness, and common color-vision deficiencies; shape must supplement color.
- Long-session comfort: no flashing/strobing, invasive screen shake or harsh bloom; reduced-effects mode when visual FX cosmetics are introduced.
- Original work: do not reproduce real unit insignia, recognizable third-party game assets, contemporary military trademarks or real people without proper permission.
- All exports have reviewed source files, consistent dimensions and documented commercial-use provenance.

## Art director rejection test

Reject when an asset looks like a disconnected genre, resembles a polished stock illustration pasted onto a geometric game, has nonsensical equipment, excessive texture, decorative unreadable text, asymmetric hardware without purpose, or no recognizable silhouette at phone size.

Do not ask "does this look AI-generated?" only. Ask **"could a single art team have drawn this with the same rules, and will it read in our actual UI?"**

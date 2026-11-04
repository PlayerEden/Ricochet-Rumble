# Sector Rebound — Premium UI v2 / FIELDGRID Presentation Overhaul
**Owner decision:** 2026-11-03 · **Implementation branch:** `feature/m11-hybrid-menu-foundation-2026-11-03` / Draft PR #140 · **Approval status:** not approved for main.

## Player-tested findings

Real Android screenshots from two consecutive `SR Hybrid Test` builds proved the **hybrid Pixi/CSS architecture functional**, including menu transitions, game simulation and WebGL activation. The player rejected the visual quality: gray box-heavy menus, overlapping/duplicated tank graphics, oversized forms, flat Hangar/Dossier. Owner explicitly authorizes broad presentation redesign and identifies the bottom-right `TANK / FIELD UNIT · ARMORED RESPONSE` caption and fake small tank hologram as visual defects.

**Diagnosis:** GPU integration does not create production-level art direction. Semantic HTML/CSS is appropriate for accessible menus and text; Pixi/WebGL is appropriate for optional animated GPU stage effects. Not everything needs to be rendered by Pixi, and a fully-Pixi menu would not automatically be higher quality.

## Visual identity and hierarchy

1. **Single vehicle hero:** one authentic in-game tank/mech drawn at device-aware resolution; no duplicated vehicle diagrams, secondary corner unit cards, fake stat panels, or giant decorative holo monitors.
2. **Dark FIELDGRID world:** rich charcoal/navy with warm gold primary actions and restrained cyan telemetry; avoid overlaying the art with saturated straight grid lines and giant boxes.
3. **One primary action per screen:** Quick Play (home), Start Match (setup), Host Game (LAN), Resume Match (pause), Apply/Equip (Hangar). Use neutral secondary and quiet tertiary actions.
4. **Purpose-built layouts:** home as vehicle showcase; modes as selectable operations; settings as deployment briefing; Hangar as owned vehicle customization; Dossier as operator record; overlays as small focused dialogs.
5. **Functional invariants:** HTML button actions, localStorage keys `rr-hangar-paint-v1` and all dossier/backup paths, LAN contracts, scoring, bot behavior, touch aiming/controls, approved camera, Android main/preview package ID/signing and game renderer do not change.
6. **Phone sizes:** actual Chromium at 568×320, 640×360, 740×360, 915×412, 1280×720; no clipped actions, unreachable dialog bottoms, or text collisions; check portrait rotation guard.

## Sequenced implementation and criteria

### UIV2-A — Main menu art and composition (started)
- [x] Remove corner `TANK / FIELD UNIT / ARMORED RESPONSE` HTML caption entirely.
- [x] Remove Pixi's second fake tank schematic and replace with subtle GPU-lit environmental atmosphere.
- [x] Replace bright repeat grid and floating hero with quiet hangar floor/ground shadow/controlled radial lighting.
- [x] Preserve source-authored tank/mech, active paint, 8s rotation and WebGL opt-in / Canvas fallback.
- [x] Make top navigation lightweight and different from primary amber Quick Play; make mode, local and settings secondary/tertiary rows rather than uniformly boxed cards.
- [ ] Capture real WebGL/Canvas screenshots and browser checks for menu/card removals, button clicks, lower GPU load and small-phone visibility.
- [ ] Owner phone approval before merging.

### UIV2-B — Mode selection (planned)
- Four differentiated core mode cards; compact Practice/Daily/Experimental utility rail; data labels and real modes unchanged; Back must never obscure choices.

### UIV2-C — Mission Setup (planned)
- Group field size, bot count, advanced rules and controls into purposeful setup modules; keep native select accessibility and exact current persistence and rules behavior; avoid new settings concepts.

### UIV2-D — LAN / social play (planned)
- Present Host / Find / Join with network hierarchy and clear two-phone Wi-Fi explanation; leave socket/LAN/spectator state machine untouched.

### UIV2-E — Hangar (maps to original M12) (planned)
- Primary owned-unit preview based on actual equipped paint/insignia data, selected vs locked distinction, readable unlock conditions and back navigation. Pixi visual module optional/isolated; no saved cosmetics format edits.

### UIV2-F — Dossier (maps to original M11/M13) (planned)
- Operator summary, key record tiles, mode history secondary, backup/restore utilities accessible and unchanged; preserve all record calculations and storage semantics.

### UIV2-G — Pause / Results / Help (planned)
- Compact dialog UI, consistent primary CTA, touch targets, no overlapping HUD or actions and owner acceptance on smallest phone.

## Technical approach

Keep one **menu-only, opt-in Pixi v8/WebGL layer** with CPU/GPU lifecycle teardown when leaving home or entering gameplay. HTML/CSS retains keyboard/assistive input, game state and actionable controls. The Canvas renderer continues drawing combat and the real tank/mech menu artwork. Do not credit Pixi for HTML/CSS refinements; evaluate GPU effects independently on device performance and visual benefit.

## Verification and rollout

Each step: targeted screen-specific real-browser screenshot QA plus existing fast, canonical gameplay/LAN, asset byte parity and Android debug build. If WebGL is unavailable, HTML/Canvas must remain navigable. Build a separate `com.playereden.ricochetrumble.hybridtest` APK for owner testing only after CI confirms exact bundled Pixi bytes, test label, debug signature and package separation. Do not merge PR #140 or alter the production/owner APK until phone acceptance.

**Current source of truth:** draft PR #140. This design plan complements, rather than supersedes, `docs/M11_HYBRID_PRESENTATION_ROADMAP_2026-11-03.md`; later visual stages map onto that plan's Hangar, Dossier and optional combat experiment milestones.

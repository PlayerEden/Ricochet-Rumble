# Sector Rebound — K: focused refinement + creative asset lab

**Decision status:** planning only; no gameplay/CSS/asset implementation authorized by this document.  
**Requested:** 2026-11-04, owner on-phone screenshot feedback after UIV3 J7/J8.  
**Starting point:** draft PR #140, `feature/m11-hybrid-menu-foundation-2026-11-03`, head `84aa56ad3cf93d55ef8d2aba6da47ec719f23f98` at the time of this plan; automated UIV3 checks were 9/9 green.  
**Release authority:** owner must explicitly approve the phone-tested result before merging to `main`. Two-phone LAN remains a separate release gate.

## North star
Polish **Sector Rebound's own** 2D tactical arcade identity, not imitate a 3D live-service tank game. Preserve what works: the existing title screen, actual pixel/flat geometric tank and mech renderer, clear primary amber CTA, dark blue/cyan/amber palette, readable touch-first landscape layout, current combat mechanics and the new focused modes and match-setup interface.

**Locked owner decision: Gameplay controls feel comfortable.** Do not change the joystick's or FIRE control's visible size, hitbox, location, gesture behavior, aim sensitivity or Exit Tank position during arc K. Separately backlog opt-in HUD customization (size/opacity/position with independently safe hit areas, reset defaults, protected save keys) as future work; never silently ship it in this arc.

## Findings grounded in current UI source + phone screenshots
1. **Hangar:** `drawHangarUnitPreview()` draws the genuine `drawTopMech`/`drawTopTank` sprites but scales with `Math.max(1.45, Math.min(4.5, Math.min(width/130,height/75)))`, leaving a relatively high minimum magnification for the top-down mech and cropping it visually. The preview toggle appears in the bottom of the stage and competes with the unit. Header language `ACTIVE PLATFORM / SOLO` implies unit selection even though `hangarPreviewUnit` only changes inspection art; actual starting unit is unchanged.
2. **Local Play:** three real Host/Find/Join actions are clear. Oversized panel/filler and detached full-width footer are the main composition issues. Copy `ONE ROOM. TWO PLAYERS.` is overly specific for modes with bots and future team seats; don't imply remote/online play. Existing dispatch IDs (`host`, `find`, `manual`) and AndroidBridge behavior remain untouched.
3. **Dossier:** real match records and an equipped emblem are present, but visual hierarchy still reads like a spreadsheet. The zero-match empty state is an opportunity to make the first action clearer without inventing a profile service or progression.
4. **Pause:** the actions are strong, but the `.overlay` uses a nearly opaque background and blur, hiding most of the frozen arena. Change only the overlay treatment on actual paused matches, not when opening Home/Settings or mission setup. Preserve existing paused/host authority and guest spectator semantics.
5. **Brand:** visible `FIELDGRID` is diegetic lore; `Sector Rebound` should remain the actual customer-facing game identity. Avoid replacing everything with generic military labels.
6. **Assets:** the current tank/mech and menu navigation are procedurally drawn/CSS-based and coherent; do not replace them with generative bitmaps.

## Sequence — finish one screen and run targeted QA before the next

### K0. Lock reference and acceptance
- Save current owner screenshots, baseline five-viewport Chromium comparisons and exact PR head; audit current asset and HUD render paths.
- Record screen-specific critical IDs, storage keys, native LAN actions and allowed scroll regions.
- No implementation in this step. Confirm the design language before asset generation.

### K1. Hangar composition — HIGH priority
- Preserve the real existing Canvas tank and mech and equipped paint renderer.
- Change stage framing so the complete mech and tank fit within the visible safe rectangle with comparable visual mass; favor intrinsic unit bounds + available area (and a small breathing margin) rather than the current large minimum scale.
- Place a compact Tank | Mech **preview selector** clearly above or beside the stage; avoid a huge CTA sitting over feet/treads. Label `PREVIEW UNIT`, and display `PAINT EQUIPPED: MOSS` separately. Explicitly say the toggle does not affect the starting vehicle.
- Keep Paint and Insignia tabs, 4 base paints, unlock requirements, equipped indicators, saved selections and aria labels. Do not invent a purchase/store, 3D carousel or vehicle unlock.
- QA: 568×320 through 1280×720; both models at each size; all paints; preview doesn't clip; swipe/tap never accidentally equip; unlocked/locked statuses remain legible.

### K2. Local Play — HIGH / quick win
- Compact the screen around three actions; move Back into the header with a 44px+ tap target.
- Keep same-Wi-Fi explanation in plain language: `Host or join a match on the same Wi-Fi network`. Explain direct IP only when manually joining. Do not make any claim that online matchmaking exists.
- Retain the true game vehicle canvas preview as secondary background art, not a competing panel with empty space.
- Preserve LAN host/find/manual and readiness flow; no network code/protocol change.
- QA: screen fits without scroll even at 568×320; all three routes exercise their original handlers; bridge/LAN recovery tests green.

### K3. Dossier — MEDIUM
- Make the existing equipped insignia/emblem a recognizable operator identity area; use authentic emblem states, not AI-created badges that imply false unlocked content.
- Emphasize wins, matches and KOs with accurate numeric data while retaining all six summary metrics, five mode records, combat time, Back, Hangar and Backup Data.
- For zero match records, add a short genuine empty-state sentence and perhaps a `PLAY SOLO` action only if it can reuse a current route safely. Do not hide real zero values.
- QA: empty and populated local records, locked/unlocked insignia, save/export/restore parity, mode records fit at all device sizes.

### K4. Pause visual context — MEDIUM
- Show a dimmed, **actually frozen live battlefield** behind the pause surface; preserve text contrast and interactive buttons. Prefer existing canvas + CSS overlay, not screenshots copied to RAM or a duplicate renderer.
- Treat Solo, local Host, Guest and Spectator differently as the current gameplay rules require. No action permissions or restart confirmation changes.
- Check dark/bright arena variations, tiny landscape screens, reduced-motion preference, low-end device rendering, battery/blur effects.
- QA: no unpaused ticking, no accidental play input through overlay, all pause buttons and audio toggles usable.

### K5. Branding and language consistency — MEDIUM / small changes
- Keep `Sector Rebound` primary on the title screen; make `FIELDGRID` a subtle fictional system label, not another title.
- Replace unnecessary `operator/platform/deployment` technical labels where everyday `Player`, `Preview`, `Play`, `Rules` are clearer. Preserve core tactical voice in rewards, mission briefs and lore.
- Do not silently rename app package, repo, save keys, score mode IDs or native actions. Maintain English/localization-ready string inventory for eventual translation.

### K6. Creative Asset Lab — EXPERIMENTAL / optional A-B approval
**No generated assets get merged automatically.** Generate a small number of concepts, compare against the existing visual language, and handcraft/clean/convert only approved pieces.

Candidate A — **Hangar environment**: one subdued blueprint/industrial dock backdrop or floor framing that stays behind the genuine animated sprite. Prefer procedural patterns first; use a generated texture only if it clearly adds quality without clutter, obvious artifacts, or increased power cost.

Candidate B — **Insignia collection**: a consistent family of vector-like simple marks, with one shape grammar, controlled color palette, stroke weight, silhouette, 32–96px readability. Start with the existing FIELD/VECTOR/ACE/COMMAND identity; generated candidates are concepts only, and do not create unearned rewards or replace their unlock semantics. Human-authored SVG/Canvas paths preferred for shipped final art.

Candidate C — **Supplementary atmosphere**: very subtle menu decals, world-panel motifs, or a profile-card background. No typography embedded in bitmaps. Preserve high contrast and scalable real UI text.

**Avoid:** generating the active tank, mech, pilot, joystick, HUD, maps that require accurate collision geometry, screenshots of fake game features, or full raster menu mockups as production assets. Keep the actual coded 2D art distinctive and deterministic.

**Creative tool choices available in ChatGPT:** Figma for editable layouts/component exploration; Adobe/Firefly for decorative concept images and Photoshop/Illustrator-style cleanup/vectorization; OpenArt for controlled 2D concept/collection studies. ChatGPT image generation is also suitable for isolated experiments. These are optional paths, not dependencies for shipping.

**Shipping pipeline:** written asset brief → 2–3 controlled variants → screenshot comparison with current live game → select/reject → hand-clean SVG/transparent PNG as needed → verify commercial-use terms/provenance per selected model/tool → optimize asset bytes and offline bundle → add Web/Android parity tests → test mobile performance → owner approval. Use only assets with established rights, no copied logos/game franchises, no external runtime network fetches.

### K7. Targeted audits + overall owner acceptance
- After each stage: exact-head smoke, 5-size Chromium captures, real click hit-test geometry, zero clipping/no-scroll on primary screens, Web/Android asset parity.
- Final: full canonical gameplay/scoring, Custom/Daily/Practice, Dossier save/restore, generated rewards unchanged, 1-phone Android navigation and orientation test, native LAN/guest/spectator/recovery CI all green; 2-phone physical LAN acceptance later.
- Compare **before/after side by side** with the seven provided owner screenshots, not just green tests.
- Only after phone feedback and owner approval: decide whether this stays on existing draft PR #140 or is separated into a small final polish PR, then merge.

## Owner decision log
- **Accepted:** title screen's direction, new Hangar paint/insignia presentation, compact Pause action model, Local Play Host/Find/Join clarity, current tank/mech geometry, current gameplay control comfort.
- **Deferred:** adjustable HUD control sizing/opacity/position, wholesale new art style, 3D models, online services, big currency/progression systems.
- **Proposed, not yet implemented:** K1–K6 targeted visual fixes and two small A/B creative-asset experiments.

## Non-negotiable deployment rule
This document does **not** authorize a production merge or assume an on-phone feature has been validated simply because Chromium passed. The owner-approved installed app, Android signatures, save data, and current gameplay must be preserved.

# Sector Rebound — M5.1 HUD Truth & Mobile Clarity (2026-11-04)

**Status:** scoped follow-up to M5; started in draft PR #140, do not merge or treat as owner-approved. Baseline `7faf662` was green 9/9, and owner-provided physical-Android screenshots establish the visual issues. Not all hypotheses are confirmed bugs.

## Direction: make on-screen information tell the truth

Keep the established premium FIELDGRID look and genuine Canvas tank/mech/pilot artwork. Reduce contradictions, not polish for its own sake. Retain every saved-data field, mode/scoring rule, joystick/FIRE/EXIT control behavior, LAN packet type and hosting authority. No fake ranks, app accounts, currencies, or online matchmaking.

### M5.1-A — In-game match mode identifier (user-requested, implementation first)

- Put a small persistent **non-interactive mode chip in the existing top scorestrip**, adjacent to lives/armor/enemy information; no additional battlefield HUD card.
- Read the **current actual runtime state** every HUD refresh so solo Quick Play playlist rotation, custom matches, host/guest launch, and LAN result/restart cannot leave a stale label. Never infer mode from menu text or a user-facing selection that was later overridden by match rules.
- **Codes:** scored Free-for-All `FFA`; Team Deathmatch `TDM`; Close Quarters `CQC`; Capture the Flag `CTF` (not CTR); Forward Bays `BAYS`; Daily Sector `DAILY`; practice `PRACTICE`; Survival FFA `S-FFA`; Team Survival `S-TEAM`. Custom gets `C:` and LAN `LAN:` prefixes, preserving actual underlying type (`C:FFA`, `LAN:TDM`, etc.). Dual Ops `DUEL`.
- Long descriptive meaning in `aria-label`/title; keep chip pointer-inert, offline and inexpensive. Touch hit geometry and menu, score, radar and other HUD elements must remain readable at **568×320, 640×360, 740×360, 915×412, 1280×720**.
- Automated assertions for all codes, real Solo match, small-screen non-overlap, and Web/Android asset parity. Match screenshots should now self-identify.
  
### M5.1-B — Screenshot review backlog (not included in first mode-chip change)

| Priority | Evidence | Scope / acceptance |
|---|---|---|
| P1 | Coral player unit versus cyan “YOU” HUD | Derive actual HUD identity/accent from `combatColor(localSeat)` in FFA; correct team ownership in team modes and LAN spectator cases. Verify contrast; do **not** change team scoring or palette. |
| P1 | Standard swatch cyan, default mech gold | Existing `fieldgrid.standard` deliberately preserves the vehicle's native base color (tank cyan, mech gold). Decide whether to show a two-unit “factory finish” swatch/label instead of silently changing their authentic unit colors. Preserve real existing cosmetic definitions. |
| P1 verification | Host setup says 1 AI while separate screenshot says 2 enemies | Reproduce **same match** using actual configured slots, bot-seat conversion (`lanHostSolo`), scoreboard opposingCount and bot ordinal labels. No claim of bug without common-match evidence. |
| P2 | Bot ejection toast says “FIND COVER!” | Make player-versus-bot event messaging honest, without changing combat outcomes. |
| P2 | Radar hostile-fire rings overlap markers | Keep enemy-nearby audio cue, lower visual noise, clamp and merge rings; test radar clarity at compact widths. |
| P2 | EXIT TANK button partly covers enemy | Verify against screenshots and minimum touch target before any reposition. Owner-approved control locations/feel are protected; propose separately rather than silently changing them. |
| P2 | LAN lobby first/second player row visually reads as one sentence; lower controls meet sticky footer | Separate two role cells and improve affordance for scrolling. Preserve all nine host rules, host/guest statuses, Start/Leave buttons and connections. |
| P3 | Insignia “EQUIPPED” duplicated and “NEXT UNLOCK” suggests a fixed order | Single truthful equipped label and `UNLOCK PROGRESS` for one real unearned threshold; no invented progression. |
| P3 | Coral diamond near AI2 | Diagnose screenshot effect source and lifetime; do not remove gameplay warning before validating. |

### Gate / rollout

1. **A (HUD badge)** -> full nine-workflow current-head CI, Android package/visual tests, LAN and save/parity checks, real screenshot checks.
2. **B1 (identity & cosmetic truth)** -> targeted Chromium screenshots plus actual phone review.
3. **B2 (combat/UI interference and host clarity)** -> isolated functional QA, one and two-phone LAN checks when possible. Do not change touch-zone geometry without explicit approval.
4. **M6** -> complete pass across screenshots, Android performance/fallback, save/restore, unchanged physics, both LAN devices, release signing/version safety. Preserve draft PR and release rollback paths until accepted.

This is a plan and a testable first increment, not a claim that all screenshot-review findings have already been fixed.


## B1 / B2 narrow correction checkpoint — 2026-11-04
- Live FFA/survival `YOU` HUD text accent now follows the actual local actor color; aggregate FFA enemy count is neutral amber, **not a false coral team**. Team Survival tracks the local team; TDM/CTF **CYAN/CORAL score columns remain fixed**, so the player side is never silently swapped. Guest spectator uses neutral host-view accents where appropriate.
- The default STANDARD swatch is now split cyan/gold with **FACTORY COLORS** copy and an accessible description. The real tank/mech preview and stored `fieldgrid.standard` ID remain untouched; no unit palette or combat rendering changes.
- Pause and LAN player menus identify the same live mode code as the top HUD. Non-daily restart CTA now says **NEW MATCH** with the existing confirmation and reset behavior unchanged. Daily **RETRY SECTOR** remains as-is.
- Radar hostile-shot pulses are limited to two coarse non-duplicate rings, reduced in stroke and opacity, and rendered behind actor markers. They remain bound to actual nearby hostile shot events and clipped to the map; no tracking gameplay mechanic changes.
- Ejection toast now says **YOU EJECTED · FIND COVER!** only for the local actor; opponent/AI ejections indicate their exposed pilot without ordering the player to hide.
- Existing completed-match Dossier browser test already validates exactly-once finalize, persistence, earned VECTOR, and positive match counts. Full QA is still required before approving this follow-up; owner physical Android screenshots and separate two-device LAN validation remain gates.

# Sector Rebound — UIV3 J7/J8 feedback and release audit
**Work branch:** `feature/m11-hybrid-menu-foundation-2026-11-03`; **PR:** #140 (draft, no merge to `main`). **Owner direction:** continue the staged game-native overhaul, protect gameplay, saved data and LAN. **Date:** 2026-11-04.

## J7 — Menu feel: implemented on draft
- Existing synthesized `ui-select`, `ui-back`, `deploy` audio cues remain the only menu sound system; **SOUND FX OFF always disables** these cues via `audioCue()`. No downloaded samples, new AudioContext, extra music or internet requirement.
- Add discreet selection cues for changes to real checkboxes, select fields and sliders; add one selection cue for an explicitly opened/closed details disclosure (advanced rules, presets, Help, experimental modes).
- Keep host/guest, Quick Play, results and Hangar action meanings unchanged. LAN host/guest authority, game scoring, saved draft/preset JSON and reward logic never changed by the sound work.
- Touch feedback uses color, filter, inset highlight and focus-visible outlines, **never moving/scaling an active button**. Mode selection entrance translation was removed; short fade-ins change opacity only, not geometry.
- `prefers-reduced-motion: reduce` disables fade/transition; small 320px-tall screens avoid fade. Controls preserve at least 44 CSS px in primary flow.
- No haptics or vibrating notifications were added.

## J8 — Audit / risk reduction accomplished
- Removed redundant earlier `sr-operation-enter` transform animation and the superseded Dossier 120px workspace override (later tested 140px rule stays).
- Introduced `tests/uiv3-ui-contract.mjs` and wired it into `tests/smoke.mjs` so the **existing fast CI** rejects Web/Android HTML/CSS/game-JS divergence and missing genuine Mode, Custom, Results, Help/privacy, SFX and reduced-motion contracts.
- Fixed the stale full Android/visual QA runner assumption in `tests/quick-play-live-flow-qa.mjs`: the automated player opens **Advanced Rules** before selecting Pilot Lives and Tank Shells, then collapses it, proving the real player UI path instead of accessing hidden selects.
- No build-system, Android package identity, signers, LAN wire format, persistence key/schema, game balancing or ownership release settings changed.

## Acceptance matrix / proof required **at exact latest commit**
| Gate | Expected |
|---|---|
| Fast regression | All headless simulation tests + `UIV3_UI_CONTRACT_PASS` |
| M11 premium real browser | 568×320, 640×360, 740×360, 915×412, 1280×720; Core Modes no-scroll and actually hit-testable; Custom Advanced/Presets open; pinned Start remains tappable; Pause/audio controls at least 44px |
| Canonical gameplay & LAN | mode, score, save, reward, live Custom flow, native LAN unchanged |
| Native LAN | guest, host, spectator, recovery, queued spectator tests all green |
| Full Android + visual QA | all actual game browser scenes, screenshot artifacts and real Android/WebView APK validation |
| Hybrid debug package | signed **test package only**, installs separately; do not confuse with production APK |
| Physical device | owner confirms legibility, button feel, resume/restart, labels, SFX off, reduced-motion if available; two phones later for actual LAN |

## Known risks and scope boundaries
- The historical stylesheet has multiple layered revisions and remains large. This checkpoint removes **demonstrably superseded** rules, not all earlier design revisions. A wholesale CSS flattening should require visual snapshots at every size and gameplay/LAN nonregression; it is **not** necessary to sacrifice current stability just to reduce bytes.
- Static tests supplement, **never replace**, real Chromium interaction screenshots and physical Android phone acceptance. Do not infer real two-phone networking from isolated mocks.
- A workflow pass on an older commit **does not certify newer commits**. If the latest run is incomplete or fails, record it and keep the PR draft.
- Do not merge to `main` or imply the owner's installed game has changed until all final checks and owner's physical-device approval.

## Work log
- [x] J7 stable buttons, selected/focus/reduced-motion UI and preference-respecting audio.
- [x] J8 targeted dead-rule cleanup, WebView parity guard, real Custom drawer QA.
- [ ] Latest-head complete CI: record each workflow result when available.
- [ ] Inspect latest real browser screenshot artifacts and perform owner phone feedback.
- [ ] Final release audit and PR merge only with owner approval.

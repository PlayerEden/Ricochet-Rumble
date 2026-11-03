# M10 — Compact active-match HUD and safe-area audit (2026-11-03)

## Scope

The existing landscape HUD layout has 84 real-browser geometry fixtures but does not simulate a phone display cutout. The Capture the Flag objective was anchored at a viewport height instead of after the top safe-area inset, unlike the pause key and scoreboard. On narrow displays, score-side labels could shrink to 9px. M10 keeps the same HUD, actions, camera, AI, controls, firing and scoring values.

## Source-only refinements

- Expose CSS safe-area insets as four named variables, defaulting to real Android/WebView `env(safe-area-inset-*)` values. This preserves device semantics and lets browser QA simulate insets deterministically.
- Anchor the CTF objective below both the scoreboard and a top cutout; make its power-up, coach and toast follower placements reference the computed objective anchor.
- Keep compact scored team labels at least 10px, with long labels truncated before KO numbers are sacrificed. Add no extra HUD wording.
- Mirror CSS byte-for-byte between web and bundled Android. No change to saves, HTML, JS, networking, application ID, certificate or Android packaging.

## Validation and release gates

The expanded `tests/landscape-hud-safe-zones-qa.mjs` checks 6 landscape viewports × 7 HUD variants × 2 left/right control arrangements × **2 inset profiles** (**168 geometry cases**), including simulated top/side/bottom cutouts. It checks safe-zone thumb/score/menu bounds, KO visibility and font size, CTF countdown, readable shell state, coach/toast priority and non-overlapping HUD controls, plus captures Chromium screenshots at 568×320 and 915×412. Extra-long team names stress the score strip. Canonical gameplay/LAN/UI regression invokes it and checks exact Web/Android asset parity.

**Automated QA PASS and merged:** [PR #135](https://github.com/PlayerEden/Ricochet-Rumble/pull/135), merge `1f58eb933b3df803f70cad976fc42dfec00f0d98`; [M10 canonical QA #41740354110](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41740354110), 168/168 HUD geometry cases, 44 visual snapshots and 24 camera renders. Four applicable PR workflows PASSED; full Android packaging skipped by established source-only trigger. Simulated insets and browser tests do not prove physical Android notch, heat/FPS, install-over saves or two-phone LAN acceptance.

Keep one canonical `main`. No per-feature APK: `v0.9.80-main.1` (code `420001`) remains the only owner build and does not contain the M6–M10 source changes. Preserve approved zooms pilot 0.94 / tank 0.73 / mech 0.69 and current AI. Music/SFX stays priority #4 and physical two-phone testing remains deferred.

# M9 — Compact After Action readability and control hierarchy (2026-11-03)

## Problem and scope

The After Action layout was already built for phones, but the CSS explicitly hid the **VICTORY / DEFEAT / DRAW** outcome at widths up to 600px. Players were left to infer the result from the large heading. Additionally, Custom Match and LAN-host results can show **three** action buttons (Next Match, Edit/Change Rules, Main Menu), leaving **Main Menu** as an orphaned half-width second-row button. At less-than-380px display heights, touch targets could shrink to 39px.

This M9 pass changes **CSS only**, both in `web/style.css` and byte-identical Android WebView `android/app/src/main/assets/style.css`. No runtime or match-result logic, save format, AI, HUD scoring, camera, matchmaking, gameplay or audio files change.

## Improvements

- Preserve the real **outcome** in the results rail on every supported landscape width. Give the optional long mode label remaining flexible space; it truncates with an ellipsis rather than hiding the important outcome.
- Where Edit Rules or Change Rules is visible alongside rematch, place **MAIN MENU** across the complete second row. Normal two-button After Action retains its existing side-by-side layout; menu-only states remain full-width.
- Keep actual result actions at least **44px tall**, even on short landscapes. Do not add more labels or actions.
- Increase the responsive stat-label minimum from 8px to 9px on narrower screens. Long event text can wrap rather than forcing a horizontal page scroll.
- The existing report has a vertical scrollbar when needed; keep all actions reachable without shrinking their hit targets.

## Automated evidence / limitations

`tests/m9-results-layout-qa.mjs` uses the **actual HTML/CSS in real Chromium** and covers 568×320, 640×360, 740×360 and 915×412 across ordinary two-action, Custom three-action, LAN-host three-action and menu-only result fixtures (**16 cases**). Checks outcome display/bounds, action widths and heights, no result-card horizontal clipping, stat-label size, vertical scroll access to Main Menu, and Web/Android CSS parity. These are visual result fixtures only and do not create synthetic earned victories or alter real Dossier data.

Existing canonical AI/camera/LAN/save/After Action regression must stay green. **No new APK now**: v0.9.80 remains the one current compatible owner preview while M6–M9 source improvements are collected for a future signed consolidated build.

## Owner and release gates

Actual small Android phone display readability, safe-area insets, background/resume, result action comfort and install-over/save retention remain open until physical owner testing. This milestone is not a public Play release. Music/SFX are intentionally deferred to priority **#4**; two-phone hardware LAN verification waits until the owner has access. Preserve owner-accepted camera 0.94 pilot / 0.73 tank / 0.69 mech and current AI balance.

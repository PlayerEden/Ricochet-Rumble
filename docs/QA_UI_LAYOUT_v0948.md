## FINAL v0.9.48 UI layout verification — COMPLETE (2026-10-30)

**Layout-only fixes verified: 80 actual Chrome scenes, 0 overlap/clipping/accessibility-size warnings in the test harness.** [Final focused layout run 41019120337 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41019120337), test-only snapshot `dd4b37af31cb0f3d330ecba242e9a50fee927fb7`, artifact `ui-layout-v0948-41019120337`: five landscape sizes (568×320, 640×360, 740×360, 915×412, 1280×720) plus portrait rotation screens at 360×740 and 412×915. Now explicitly checks shortest-landscape **After Action / NEXT MATCH** layout, home scroll-to-last-mode access, timer vs MENU and narrow header navigation. **0 failures / 0 warnings.**

**Complete source-equivalent QA PASS** at preceding exact production-CSS snapshot `2567fc270888f572c785a582fd19d2687c14346d`: [fast regression + Web/Android CSS parity 41018471951 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41018471951); [full Chromium screenshots, Android debug APK + unsigned AAB 41018471894 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41018471894). The later `dd4b37a...` snapshot changes the **layout diagnostic tests only**, not either Web/Android CSS nor game/runtime assets. Verified CSS Git blob SHA is `61ae7c80a237423b5d627dc1924c71822a8b5e0b` for both sources. The original final debug APK sha256 is `93c54740a7baa2bbf3d19ee478d6fd65a7f964d44abba45e412ce6078f46005a`.

**Manual Android sign-off still PENDING** for actual device cutouts, font scaling, scroll gestures and subjective reachability; debug test APK uses a potentially different signing certificate and is **not** safe to update over a prior app with saved progress. Stable `main` game runtime remains unmodified; owner-approved P-03 and v0.9.46 appearance untouched, focused CSS repair stays on DRAFT [PR #74](https://github.com/PlayerEden/Ricochet-Rumble/pull/74).

---

# Sector Rebound v0.9.48 — Responsive UI spacing / overlap audit

**Date:** 2026-10-30. **Owner request:** polish UI usability/spacing/overlap, **NOT** change visual art direction. **Status:** final focused browser layout, full Chromium and Android debug packaging automated QA PASSED; real-device usability/signing continuity still pending. Focused [DRAFT PR #74](https://github.com/PlayerEden/Ricochet-Rumble/pull/74) is a **child of integration PR #71**, not stable `main`. No runtime code has been merged to main.

## Real defects verified in rendered phone-landscape screenshots

1. **Non-scrollable home mode list at 568×320:** TEAM DEATHMATCH and CUSTOM MATCH buttons extended outside the visible home menu; users could not reach them. Fixed by allowing internal scrolling on short landscape screens, preserving visible primary Quick Play and validating the last real mode button becomes fully visible after scrolling. Narrow 568px home headline and upper-right menu controls were also crowding each other; compact layout rules prevent text collision.
2. **Custom Match preset footer:** expanded presets overflowed horizontally by about 25–36px depending on viewport. Root cause: inherited 100%-width button in a non-shrinking flex footer. Fixed flex sizing and text wrapping; no removed controls or feature changes.
3. **HUD match clock:** on smaller landscape screens scored timer occupied the top-left under the absolute MENU button. Fixed using a safe-area-aware position *below* MENU, and explicitly hide the irrelevant score clock on Survival.

## Verification — actual browser, not visual assumptions

- [v0.9.48 focused source PR #74](https://github.com/PlayerEden/Ricochet-Rumble/pull/74): changed only the mirrored Web / Android `style.css`, plus a Playwright geometry test and CI instrumentation. No game logic, styling palette, pilot renderer, music, aim, controls, network, scoring or saves changed.
- [Final standalone actual Chromium geometry QA **SUCCESS**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41018466125) on exact source-equivalent QA snapshot `2567fc270888f572c785a582fd19d2687c14346d`, with GitHub artifact `ui-layout-v0948-41018466125`: **80 final rendered screen states; 0 layout failures; 0 warnings**.
- Five tested landscape viewports: **568×320, 640×360, 740×360, 915×412, 1280×720**.
- Actual screens tested: Home including scrolled-last-button reachability, collapsed and expanded Settings, Help, Custom Match and expanded Presets, Dossier, Backup/Restore, Nearby multiplayer menu, Survival HUD, pilot HUD, scored AIM HUD, pause overlays. Checks for interactive hit-area overlap, button clipping, horizontal scroll leakage, home brand/utility collisions, scored clock/menu collisions and scrollability of legitimately long pages.
- Existing [fast regression / asset-parity / gameplay smoke **SUCCESS**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41018471951) from the same QA snapshot. Existing integrated baseline earlier [Chromium + Android PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41014535504); a new final v0.9.48 Chromium/Android verification run was separately started at [41018471894](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41018471894).
- QA-only [PR #75](https://github.com/PlayerEden/Ricochet-Rumble/pull/75) intentionally retains current main documentation while containing byte-identical audited runtime CSS and UI geometry tests. **Close unmerged after verification**, never promote from a testing snapshot.

## Scope of PASS and still-open manual gates

**PASS** means the tested browser DOM and hit targets showed no collisions across those 73 states. It does *not* certify every Android display cutout/safe-area combination, user's actual font/accessibility scaling, device thermal performance, screen-reader support, multiplayer latency or app signing continuity. Real owner Android touch/scroll review is still welcome, especially the last Home row and Custom preset editor on a short landscape device.

**No merge to stable main.** Owner-accepted P-03 pilot/movement and v0.9.46 menu/audio remain frozen. The v0.9.47 P0 blockers (durable APK signer/save continuity, two-phone LAN if release-scoped, long-session physical controls and Google Play policy) are independent and remain open. Existing original [v0.9.46 test APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.46-ui-audio-test) remains available as a rollback; older debug APKs are not proven update compatible. **Do not uninstall older app with valuable local data to try a new debug APK.**

# Sector Rebound — Premium UI v2 cross-screen audit
**Reviewed:** 2026-11-04 · **Draft PR:** [#140](https://github.com/PlayerEden/Ricochet-Rumble/pull/140) · **Automated code checkpoint:** `0e7e20c` · **Production:** unchanged.

## Outcome
**Automated acceptance: PASS for checkpoint `0e7e20c` (9 of 9 PR workflows successful).** This is not a physical-phone visual approval or two-phone LAN certification. Do not merge to `main` or release a recommended owner APK without the owner's device review.

## Inspectable evidence
- [Premium real-browser screenshots and JSON — five landscape sizes](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41778310925/artifacts/13297573922): 568×320, 640×360, 740×360, 915×412, 1280×720. Actual WebGL menu, Canvas fallback, Home, Mode Select, Mission Setup, advanced settings, Local Play, Host, Find, IP Join, connection recovery, host-offline, Help, Hangar, Dossier and Pause.
- [Full Android/visual Chromium QA and layout artifacts](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41778310938/artifacts/13297244685): before/after screenshots, results fixture, HUD, Custom, backup, Hangar variants, Help details, 568×320 layout captures and 360×740/412×915 portrait rotation guard.
- [Five-size premium browser workflow](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41778310925), [full Android visual/packaging](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41778310938), [canonical gameplay and LAN](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41778310936), [native recovery](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41778310906), [live spectator](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41778310930), [spectator promotion](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41778310970), [isolated test APK build](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41778310896).
- [Separate Hybrid Test APK ZIP](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41778310896/artifacts/13297479496) contains `SR-Hybrid-Test.apk`, verification and signer checksum. Package `com.playereden.ricochetrumble.hybridtest`, disposable CI debug signer; coexists with main game but is not the owner's production-signed APK.

## Cross-screen findings
| Surface | Browser/visual evidence | Status |
| --- | --- | --- |
| Home | Single real tank/mech hero, warm Quick Play, nonblocking utilities, Pixi opt-in + Canvas fallback | PASS automated |
| Choose Mode | Four distinctive real game modes and secondary modes; bottom Back reachable | PASS automated |
| Mission Setup | Field, controls/audio, native options, expandable rules and pinned Start/Back | PASS premium touch tests; diagnostic method corrected below |
| Local Wi-Fi | Host, Find, IP Join and exact native join dispatch with test bridge | PASS browser routing, **not two-phone proof** |
| LAN lobby + recovery | Host/guest presence, settings, Ready/Start/Leave; lost/full/failure/retry/offline states | PASS automated |
| Hangar + Dossier | Paint/insignia, stats, tabs, local Backup, no changed saves | PASS automated |
| Pause / Results | Warm primary, same-width default Results actions, real score/reward UI, no HUD collisions | PASS automated |
| Help / privacy | Four instructions, expandable controls/privacy; fixed Practice footer and Back | PASS automated |
| Custom/Backup | Smaller-screen forms intentionally scroll, action reachability inspected | PASS automated; inspect text on device |
| Portrait | Full-screen ROTATE TO LANDSCAPE guard at 360×740 and 412×915 | PASS automated |

## Diagnostic issue found, classified, and repaired
The previously nonblocking `qa-layout/report.json` contained 14 `interactive-control-overlap` flags: Mission Setup checkboxes versus the fixed Back/Start buttons at 568×320, 640×360 and expanded 1280×720. Source review confirms the diagnostic used **raw bounding rectangles** for elements located outside a scroll container's visible area, causing false overlap positives. Dedicated premium Chromium tests already verify that the footer is topmost/tappable and that the options can be scrolled into view and changed.

The QA-only repair computes the *painted rectangles after ancestor overflow clipping*, retains checks for genuine visible overlap and makes nonzero reported failures fail CI. Do not silently omit these checks; a fresh full QA run is required after the diagnostic correction.

## Physical-device acceptance gate (required)
1. Install the isolated **SR Hybrid Test** APK, which uses a different package and disposable signer. Keep the existing owner app installed. Verify landscape launch and transitions.
2. At the shortest available landscape orientation, open Home, Modes, Mission Setup (including scroll and expanded rules), Local Play, Help with both disclosures expanded, Hangar, Dossier and Backup; look for low-contrast/tiny text or touch targets that feel difficult.
3. Run a Solo game, pause, resume and reach Results; confirm buttons remain visible and score labels make sense. Also verify sound/music toggles and no unusual frame drops or heavy heat.
4. Start a local Host room and test the address and match setup. For actual LAN confidence, test two **separate physical phones** on the same Wi-Fi: host, discover/join, Ready, change modes/rules, start and disconnect/retry. Browser mock-bridge QA cannot substitute.
5. Report any screenshots/notes for polish; re-run full CI after any player-facing change.

## Watch items / release conditions
- **Visual legibility:** 568×320 is dense, with some small captions; screenshots show reachable controls but cannot establish readability or comfort on a device. Prioritize physical phone review before visual approval.
- **Long forms:** Custom and Backup scroll on narrow screens by design. Confirm users can reach the bottom controls on a real phone.
- **Networking:** simulated native bridge validates UI wiring only. No claim of real two-phone interoperability.
- **Signer:** test APK is disposable-signed and is not the owner preview/Play-signed release.

**Gate:** No merge to main, no production-signed recommendation, no claim of physical acceptance until the owner explicitly approves.

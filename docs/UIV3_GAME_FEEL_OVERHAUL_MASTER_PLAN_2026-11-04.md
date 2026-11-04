# Sector Rebound — UIV3: game-feel menu overhaul
**Authorized by owner:** 2026-11-04 — "Let's plan it all out and get to it. If things need an overhaul that's ok."
**Status:** design contract + staged implementation, **unapproved draft PR #140** on `feature/m11-hybrid-menu-foundation-2026-11-03`.
**Not a new gameplay project.** Menu and presentation can be rebuilt. Gameplay mechanics, accepted pilot/tank/mech sprites and camera, controls, LAN protocol, save schemas, app IDs/signing, build integrity, and owner's production APK cannot be silently rewritten.

## North star
**A small, polished, premium-feeling arcade vehicle combat game.** Refer to World of Tanks Blitz and other touch-first combat menus for their *decision hierarchy, vehicle showcase, and consistent navigation*, not for their IP, copied graphics, 3D scope, monetization widgets, economies or premium-clutter. Sector Rebound stays a compact 2D arena fighter with authentic artwork drawn by the actual game renderers.

**The owner reported an "AI HTML game" feel.** Fix the *visual model*, not only the vertical height. Avoid:
- box inside box inside box, fake tech readouts, enormous back bars and generic admin-form layouts;
- overscaled text requiring scrolling on short landscape devices;
- iconography that misrepresents the game or unearned features;
- noisy cyan outlines, tiny all-caps monospace everywhere, repeated "FIELDGRID" jargon;
- duplicate fake tank/vehicle graphics or an unnecessary full-engine migration.

Build instead:
- real tank/mech imagery from the production Canvas drawing code;
- one dominant action and obvious Back per destination;
- clear layer hierarchy: background stage > game content > actions; matte dark navy + restrained cyan telemetry, warm amber for actionable confirmation only;
- a *different composition* for each task; game modes ≠ mission loadout ≠ lobby ≠ garage ≠ stats;
- ergonomic landscape touch targets >=44 CSS px, sensible control density, minimal tap count, and no scroll on primary screens;
- quiet 120–180 ms transitions, tactile pressed/selected feedback (respect reduce motion and audio prefs), no cosmetic tap interception.

## Screen contracts and staged implementation
| Stage | Screen/system | Treatment | No-regression requirements | Proof |
|---|---|---|---|---|
| J0 | Shared visual language | Semantic type hierarchy, button/stage tokens, focus/press/disabled states, restrained depth. Consolidate conflicting historical CSS after appearance is validated. | Native selects/checkboxes remain usable; no click interception | CSS QA + five-viewport images |
| J1 | Home + Choose Mode | Home keeps live rotating tank/mech. Modes has real vehicle artwork, 4 clearly distinct operations, restrained Practice/Daily, Experimental replacement view, header Back. | `data-action` IDs, scoring targets, Daily and experimental mode routes | Main and expanded views; 568x320 through 1280x720 |
| J2 | Mission Setup | *Pre-match briefing* composition: real unit preview with small match settings on main sheet; Controls and Advanced are focused subviews instead of giant boxes. Preserve sticky Start Match. | All `pref-*` keys, seven comfort choices, five playlist values, native selectors, accessibility, Start/Back | No-scroll core, open/close subviews, persistence and blocked 0-mode playlist |
| J3 | Local Play / room flow | "Host", "Find game", "Join by IP" as clear real multiplayer choices, same-Wi-Fi context as a small explanation not an admin manual. Real LAN lobby and recovery use concise status and pinned Ready/Start/Leave. | AndroidBridge host/find/join calls, real peer protocol, roles, spectator, reconnect and host authority | Mock bridge routing + JVM LAN + **two physical phones later** |
| J4 | Hangar | Large authentic tank preview and compact paint/insignia workbench with selected/equipped/locked clarity and low-friction return. | `rr-hangar-paint-v1`, equipped paint, earned eligibility, original renderer, no new purchase economy | Real paint changes in preview; unlock tests |
| J5 | Dossier | Actual combat record presented as a player card, not a spreadsheet: prioritize victories and KOs with scannable match history and equipment badge. Backup always visible. | 6 numeric stats, 5 mode records, emblem, save/restore format, last-visit navigation | Recorded fixture and empty-state screen; restore tests |
| J6 | Pause, Results, Help, Custom | Pause a fast interruption, After Action a real battle outcome with correct stats/rematch, Help a short onboarding guide with expandable reference, Custom a distinct rules editor. | Results equality and score/reward correctness, all action routes, privacy text available, Custom presets | Screenshot fixtures, hit target checks, gameplay/backup regression |
| J7 | Sound/motion polish | Short transitions, light selection/launch feedback routed through existing audio prefs; no new background music until tracks approved. | Reduced motion, no audio bypass, focus hidden and FPS/thermal safeguards | Sound toggle test, Android pause/resume and device observations |
| J8 | CSS/test cleanup + release gate | Remove superseded cascades after screen QA, consolidate shared styles, check layout invariants and dead controls. | web/native bytes identical; Pixi fallback; APK signing/version safety; saves and LAN protected | all Actions green + physical-device acceptance before merge |

## Definition of done
1. Primary Mode, Mission, Local intro and Dossier screens do not scroll at **568x320, 640x360, 740x360, 915x412, 1280x720**; exceptions only for detailed rules/Custom/Backup/Help and dynamic LAN room lists.
2. Every actual interactive action is visible, hit-tested and >=44 CSS px tall where space permits; no hidden behind sticky headers or Android cutout/safe areas. Test portrait rotation guard.
3. Use genuine game-authored Canvas vehicle imagery; no AI/stock art or feature fakes. Preserve WebGL optional/fallback, transparent non-interactive decoration; no duplicate 3D engine or simulation.
4. Same *functional IDs and handlers*. Prove actual app gameplay, native LAN, score/saves/restore, all five playlist entries and selected preference states.
5. Separate debug package `com.playereden.ricochetrumble.hybridtest` is for owner preview; it is **not** the same-signer owner build. Never install-over the owner's current app or ask to uninstall/save-wipe.
6. Code and QA checkpoints are real git commits. A passing older commit does not certify a newer one; inspect final-run screenshots, artifacts and checks.
7. Only mark ready/merge to `main` after current-head automated QA **and explicit owner phone approval**. Real two-phone LAN acceptance stays a separate release gate.

## Implement now
- [x] J1 first experiment — authentic live vehicle header, header Back, lighter cards, five-size browser checks.
- [ ] J2 foundation — purposeful pre-match briefing and visual identity, preserve native Controls/Advanced focused panes.
- [ ] J3 first pass — Host/Find/IP choice screen, not a giant network form.
- [ ] J4/J5 — selectively apply stronger visual hierarchy while preserving every real number, unlock and action.
- [ ] Revisit J1 once owner sees real-device screenshots; art/world should be *more visible*, not just one more small icon.

**Go/no-go:** Do not merge or present APK as certified until browser and native checks for the exact latest commit have completed and owner has physically evaluated the UI.

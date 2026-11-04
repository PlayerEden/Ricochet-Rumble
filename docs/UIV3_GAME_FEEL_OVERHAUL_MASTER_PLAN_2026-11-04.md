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


---

## M-Series — Premium Hybrid visual production pass (authorized 2026-11-04)

**Owner reference:** the generated Sector Rebound multi-screen concept featuring a lit industrial Hangar, polished navigation, mission cards, emblem collection, operator identity and dimmed-battlefield Pause. The picture is **art-direction reference, not a functioning feature specification or approved game screenshot**. The owner wants the *feel* of that image, not a literal recreation. Continue **draft PR #140** in small reversible stages. K1–K5 phone feedback and green 9/9 CI at checkpoint \`b58a3c5\` are our prior baseline; new commits require fresh tests.

### Production target
Deliver a **premium hybrid shell** around the existing 2D arcade game: atmospheric staged Hangar, coherent action icons, clean compact card typography, earned insignia, real player records, recognizable branding, predictable touch navigation. Do not turn Sector Rebound into a faux 3D live-service menu. Gameplay and interface art should read as one product, even if the Hangar backdrop is more detailed than the actual battle maze.

### Concept-image translation contract

| Borrow / adapt | Real-game implementation | Explicitly do not copy |
|---|---|---|
| Industrial Hangar lighting, deck stripes, docking platform | Procedural CSS/Canvas layer **behind** existing genuine tank/mech renderer; optional approved texture in a later branch | Fake 3D model, stock/model tank replacing in-game unit, fake physics |
| Compact branded top navigation | Existing actual Play/Choose Mode/Local/Hangar/Dossier/Help actions; clear selected/focus states, touch-first tap geometry | Non-functional buttons, fake currency/stars, reinterpreted Android Back |
| Cohesive simple emblems and icons | Defined shared geometric symbol grammar, hand-built SVG/Canvas icons, current four earned insignia states retained | Generated achievements, arbitrary locked tiers, copied franchise logos |
| More expressive Dossier / operator badge | Enlarge actual equipped local emblem and real six statistics/five records | Invented accounts, ranks, cloud sync, currencies or unsupported awards |
| Strong Local Play, Results and Pause cards | Existing LAN actions/status and actual scores/host control; frozen arena behind Pause | Online matchmaking, fake friend list, fake connected peers |
| Sharper CTA and understated accent lines | Real primary Play/Start/Resume, active-tab underline, selected cosmetic check, keyboard focus ring | Persistent double-gold borders around focus and selection |

### Stages and regression gates

- [x] **M0 / reference and scope lock.** Preserve the real unit renderers, mode and gameplay IDs, user-approved joystick/FIRE position/size/feel, save keys, LAN authority and packages. Name/repo migrations and physical two-phone test remain independent.
- [ ] **M1 / Hangar stage and cosmetic state clarity.** Add a *purely decorative*, lightweight industrial dock environment behind the **actual** Canvas tank/mech and a subtle ring/deck. Separate **equipped** status from **selected tab** from **keyboard focused** styling. No generated texture in production in M1. Validate at 568×320 and all five landscape sizes, two preview units, 4 base paints, locked paints and insignia.
- [ ] **M2 / visual navigation system.** Unify icons, title hierarchy, amber primary buttons, subtle cyan secondary actions; treat Play/Hangar/Dossier/Help as existing real routes. Remove gratuitous jargon where practical. No layout regressions or additional taps.
- [ ] **M3 / profile and earned cosmetics.** Explore four consistent, tiny high-contrast insignia silhouettes (FIELD/VECTOR/ACE/COMMAND) as *concepts* first; preserve original equip and unlock rules; improve actual Dossier emblem stage and genuine empty-state wording.
- [ ] **M4 / secondary-mode and LAN polish.** Give Forward Bays and Capture the Flag *accurate* small diagrams and an obvious return to core modes; Host lobby scroll hint, copy local address only when bridge supports it, clear Sides→Match Type wording, realistic "start with bots" explanation. Preserve the actual network behavior.
- [ ] **M5 / opt-in creative-asset lab.** Make two atmospheric Hangar **background-only** studies and one consistent emblem family concept using image generation / Adobe Firefly / OpenArt if helpful; optionally compare editable component layouts in Figma. Keep all experiments outside runtime until approved. Manually clean approved art, verify rights, minimize Android/WebView bytes, include offline assets in Web+Android with parity checks; A/B against procedural base.
- [ ] **M6 / final polish and release safety.** Current-head fast, five-size browser screenshot+hit tests, Pixi/WebGL fallback, Android/debug APK, all canonical gameplay/LAN/spectator/recovery/save tests, portrait and cutout checks, low-power observations. Owner approves actual-phone UI before merging. Physical two-phone LAN remains separate.

### Non-negotiable quality criteria
1. The existing game-authored tank, mech, pilot, shooting, joystick, FIRE and tank-exit controls are **unchanged**; optional HUD size/opacity/repositioning is a **future separate opt-in feature**, not part of M-Series.
2. One primary action per screen, no blank dead panels, no fake progression. Selected cosmetic = clear check + persistent indicator; focused button = transient accessible outline; active tab = restrained underline; locked item = genuine requirement shown.
3. No HUD/menu elements vanish under the header or fixed footer; 44px primary tap targets and no default-screen scrolling across **568×320, 640×360, 740×360, 915×412, 1280×720**. Advanced settings/Help/Backup/LAN roster can scroll within a bounded section.
4. All generated assets are **concept only until owner approval**; no text embedded into production background images; no external runtime fetch, no trademark/copyright copies, verify commercial terms and optimize size.
5. Keep web and Android assets identical. No \`main\` merge or "production-ready" claim on green CI alone. Explicit real-phone acceptance is required.

**M1 code checkpoint:** Implemented in draft PR #140 — procedural background-only dock, non-interactive decorative layers, clear equipped cosmetic check, active tab underline, cyan keyboard focus, and corrected “PREVIEW ONLY · COSMETIC” language. The real unit drawing, saves, controls and action IDs remain unchanged. Five-size screenshot, full Android and actual-phone approval remain mandatory before marking the stage fully accepted.

**Editable design reference:** [Sector Rebound — Premium Hybrid UI Art Lab (Figma)](https://www.figma.com/design/XB6lVNjfGPFr7xoiirm30j) contains an editable Hangar composition plus the palette/interaction-state reference. Its blocky vehicle is labeled as a *placeholder reference only*; production uses authentic Canvas artwork.

**Creative asset standards:** [Premium Hybrid Art Lab Brief](PREMIUM_HYBRID_ART_LAB_BRIEF_2026-11-04.md) describes two background-only Hangar concepts and the original FIELD/VECTOR/ACE/COMMAND insignia family. Generated assets remain out of the app until approved.

**Next implementation after M1 visual QA:** M2 (game-native navigation/icon consistency) and M4 (Host and Experimental Modes clarity). Do not conflate visual concept experiments with working Android features.


### 2026-11-04 / M2 + M4 code checkpoint — release status still draft

**M2 implemented (code):** exactly 11 original inline SVG symbols (play, hangar, dossier, help, modes, wifi, settings, cqc, ffa, tdm, custom), bundled identically in Web and Android. Home primary button, three utility routes, three secondary routes and the four scored/default Mode cards use those icons without changing their action IDs, labels, focus behavior or >=44px tap-target policy. Smaller landscape sizes hide nonessential Home icons for readability, not actions. Static and real-browser checks verify symbol resolution and that icons cannot intercept clicks.

**M4 implemented (code, scoped):** two additional original vector diagrams (depot and flag) on accurate Forward Bays and Capture the Flag buttons, presented as two compact cards; the experimental toggle explicitly reads **BACK TO CORE MODES** while open. Original mode IDs and loaded game modules remain unchanged. In Host Match, **SIDES → MATCH TYPE**, the header explains that a guest joining while the host is playing bots waits for the next match, and the existing scrollable rules area has a visible scrollbar treatment. Nine real LAN settings, fixed Start/Leave footer and host authority are untouched. No Copy IP feature yet—verify platform clipboard support before adding it.

**Proof/hold:** fast UI contract and five-viewport Chromium interaction/screenshot test were expanded. A green older commit (M1 9/9) does **not** certify M2/M4. Keep PR #140 draft until all workflows for this final head complete and owner validates on Android. No generated background/insignia has been shipped, and the approved joystick/FIRE controls are untouched.

**Next:** M3 insignia + actual Dossier identity concept evaluation (genuine four existing unlocks only), then M5 optional A/B artwork/optimization and M6 complete release audit.


### M3 earned insignias and Dossier identity — draft code checkpoint (2026-11-04)
- Four coherent original offline vector marks are now used by the existing FIELD, VECTOR, ACE and COMMAND Hangar buttons and by the equipped Dossier emblem. No generated or third-party art, fake identity, new progress system, ranks or currencies.
- The preexisting IDs and eligibility remain exactly FIELD (free), VECTOR (3 recorded Solo matches), ACE (10 recorded operator KOs), COMMAND (12 recorded Solo wins). The `rr-hangar-paint-v1` key and schema, equip logic, save and restore logic, all six actual stats and five mode records are unchanged.
- No-record Dossier wording now clearly prompts players to finish their first Solo match. A recorded fixture test verifies real unlock eligibility, COMMAND equip, matches/wins/KOs, and that the exact badge appears in Dossier.
- Web/Android copies remain byte-for-byte identical. All nine current-head workflows and actual phone approval remain required. Draft PR #140 must not be merged or distributed as a certified owner build. M5 artwork A/B studies remain concept-only.


### M5 owner screenshot refinement + procedural Hangar background A/B (draft, 2026-11-04)
- Owner screenshots approve the general Home and Choose Mode direction, but identify low-impact M5 needs: stronger industrial dock depth, visible locked insignias, a real unlocked-insignia identity panel, suppression of the lingering gold focus ring on touchscreen toggles, and removal of the old text-diamond status glyph.
- Implemented **two original CSS-only background studies**, warm industrial dock (default in draft) and blue technical blueprint (`?hangarStudy=blueprint` review-only alternative). There are **no AI-generated/third-party images and no new runtime downloads**. Both sit behind unchanged genuine Canvas tank/mech pixels and cannot accept touch.
- The expanded equipped-insignia panel uses the current `mark.*` record, and reports the next **real** locked requirement from existing matches/KOs/wins; all-four-earned uses a real completion message. No new account, rank, currency, achievement, cosmetic, or unlock logic. Short landscape sizes keep the original controls prioritized.
- Touch/mouse input suppresses only the keyboard-focus halo; actual keyboard events reactivate focus-visible. Preserve selected paint/emblem checkmarks and real unlocked/locked states.
- QA bug repair: `quick-play-live-flow-qa.mjs` previously expected literal `◇` / `△` `textContent` after M3 converted Dossier artwork to SVG. Assert the actual `<use href="#sr-mark-*">` identity instead; this was the sole M3 full-visual workflow failure, while eight other workflows passed.
- Fresh current-head 9-workflow CI, screenshot artifacts and Android review must pass before merging this draft. Do not touch signing, owner APK, saved records, joystick/FIRE, game physics, camera, LAN protocol or player rewards. Physical two-phone test remains separate.


### 2026-11-04 — M5.1 owner screenshot follow-up: mode HUD and visual truth

[Detailed M5.1 plan](M5_1_HUD_TRUTH_AND_MOBILE_CLARITY_2026-11-04.md) establishes an incremental correction stage **before M6**. First draft commit exposes the actual live mode in a compact top scorestrip chip, including accurate competitive FFA/TDM/CQC, experimental CTF/BAYS, Survival variants, Practice, Daily, custom and LAN modes. It derives from live match state rather than navigation, follows Quick Play rotation and LAN joins, and requires five-viewport non-overlap QA. Later increments assess observed color-identity contradictions, factory Standard paint, bot ejection toast, radar audio rings, host scroll/status clarity and control coverage; do not alter approved joystick/FIRE/EXIT control geometry during this change. Original M5 visual and multiplayer safeguards remain in force.


**M5.1 B1/B2 checkpoint (2026-11-04):** M5.1 plan expands from the live HUD code to honest actor/team score accent colors, two-tone Standard factory swatch, precise mode text on Pause, de-duplicated radar sound rings behind player markers, and correct ejection messages. Save schema, existing cosmetics IDs, touchscreen geometry and LAN authority are unchanged. Review completed-match Dossier coverage and all current-head CI before green-lighting M6 or merging PR #140.

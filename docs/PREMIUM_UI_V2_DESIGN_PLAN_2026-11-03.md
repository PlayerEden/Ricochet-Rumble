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

### UIV2-B — Mode selection (implemented, automated QA passed)
- Four differentiated core mode cards; compact Practice/Daily/Experimental utility rail; data labels and real modes unchanged; Back must never obscure choices. Automated hybrid/browser, game/LAN, Android and visual workflows passed at the UIV2-B checkpoint.

### UIV2-C — Mission Setup (all automated QA passed; phone approval pending)
- Group field size, bot count, advanced rules and controls into purposeful setup modules; keep native select accessibility and exact current persistence and rules behavior; avoid new settings concepts.
- [x] Recast Match Settings as MISSION SETUP with Field Parameters, Controls & Feedback (input plus audio/display), and expandable Quick Play Playlist & Advanced Rules.
- [x] Keep every original field/select/checkbox ID, all five playlist mode values, native `<select>` elements, settings-back / settings-play routing and saved preferences unchanged. No modifications to combat logic, Android bridge, AI or LAN.
- [x] Keep Back and Start Match in an always-visible footer; scroll content separately on landscape phones without hiding controls or the advanced playlist.
- [x] Mirror HTML and CSS exactly between `web/` and `android/app/src/main/assets/`.
- [ ] Pass dedicated real Chromium browser QA at 568×320, 640×360, 740×360, 915×412 and 1280×720, including touch hit tests, scrolling, playlist invalid/valid toggles, rule changes and persistence after Back/Reopen.
- [ ] Pass full regression/Android bundling and receive physical phone approval before making this production.

### UIV2-D — LAN / social play (main screens automated QA passed; recovery UI QA pending)
- [x] Replace the original flat Local Play panel with a single-primary-action host briefing and clear Find Game / Join by IP alternatives. No cloud matchmaking is implied.
- [x] Present native-discovered rooms, manual IP:port input and a readable local-network explanation in consistent FIELDGRID screens; preserve the original handlers, room ID and socket arguments.
- [x] Preserve the nine host match rule selectors, host/guest presence, host address, guest Ready, Start, leave actions, and rule summary. Give the live lobby its own scrollable middle area and always-visible status/action footer.
- [x] Keep every LAN network transport call, authority validation, spectator flow, reconnect protocol and match setup rule unchanged.
- [x] Keep web and Android game/CSS assets byte-identical.
- [x] All nine workflows passed at commit `239e461`, including five-size LAN browser testing, full Android, gameplay and spectator tests.
- [x] Matching recovery presentation for connection failed/lost, room full, reconnecting and host-offline while preserving native actions.
- [ ] New recovery browser QA and full Android/LAN checks must pass.
- [ ] Owner on-device visual review before merging or recommending an APK.

### UIV2-E — Hangar (maps to original M12) (implementation / QA in progress)
- [x] Split Hangar into a purposeful vehicle bay and customization workbench, sharing FIELDGRID typography/colors with Home.
- [x] Use the **actual Canvas tank renderer and real equipped paint**, repainting immediately after equip; keep selected/locked states, insignia, rewards and storage keys unchanged.
- [x] Retain functional Paint/Insignia tabs, Dossier-return navigation and Solo-only scope.
- [x] Capture browser screenshots and verify paint switching at 568×320, 640×360, 740×360, 915×412, and 1280×720.
- [ ] Physical phone visual acceptance, especially small-label legibility. Do not merge until approved.

### UIV2-F — Dossier (maps to original M11/M13) (implementation / QA in progress)
- [x] Replace long vertically stacked stat/table layout with a two-column **Operator Summary + Mode Record** screen.
- [x] Preserve all six stats, five mode records, equipped insignia, status, Hangar, Back and Backup paths; keep data calculations and backup/restore formats unchanged.
- [x] Pin the footer actions inside visible panel bounds and prevent Dossier content from overlapping them; verify actions by actual Chromium hit-test at phone sizes.
- [ ] Owner phone acceptance for 568×320 and 740×360, including backup flow.

### UIV2-G — Pause / Results / Help (visual implementation in draft; QA pending)
- [x] Refine compact Pause dialogs, warm Resume hierarchy and existing audio toggles without altering any Solo, Host or Guest handlers.
- [x] Refine actual After Action score/result presentation, preserving all values, dynamic rewards, Next Match, rules and Menu actions.
- [x] Keep the four Help instructions and both details sections, while pinning Try Practice and Back outside a scrollable guide.
- [x] Add five-size browser tests for the Help footer and LAN recovery actions without claiming that simulated native bridge tests prove two-phone network behavior.
- [ ] Full visual/Android/LAN regression and physical phone acceptance before merge.

## Technical approach

Keep one **menu-only, opt-in Pixi v8/WebGL layer** with CPU/GPU lifecycle teardown when leaving home or entering gameplay. HTML/CSS retains keyboard/assistive input, game state and actionable controls. The Canvas renderer continues drawing combat and the real tank/mech menu artwork. Do not credit Pixi for HTML/CSS refinements; evaluate GPU effects independently on device performance and visual benefit.

## Verification and rollout

Each step: targeted screen-specific real-browser screenshot QA plus existing fast, canonical gameplay/LAN, asset byte parity and Android debug build. If WebGL is unavailable, HTML/Canvas must remain navigable. Build a separate `com.playereden.ricochetrumble.hybridtest` APK for owner testing only after CI confirms exact bundled Pixi bytes, test label, debug signature and package separation. Do not merge PR #140 or alter the production/owner APK until phone acceptance.

**Current source of truth:** draft PR #140. This design plan complements, rather than supersedes, `docs/M11_HYBRID_PRESENTATION_ROADMAP_2026-11-03.md`; later visual stages map onto that plan's Hangar, Dossier and optional combat experiment milestones.

## UI-wide cohesion matrix and staged order

| Screen | Identity / treatment | Data/behavior to preserve | Status |
| --- | --- | --- | --- |
| Home | Full-screen hangar showcase, warm single Quick Play CTA, quiet nav | Original Canvas vehicle, real button routing, optional Pixi | UIV2-A browser checked, owner reviewed |
| Mode Select | Four distinctive mission cards + restrained practice/daily/experimental rail | Existing score targets, modes, daily seed and rules | UIV2-B implemented; automated QA passed |
| Match Settings | Deployment briefing: field/bots, grouped controls/audio, expandable playlist/rules and persistent launch footer | Every existing checkbox, playlist, preferences and Start Match | UIV2-C implemented in draft; full QA/phone review pending |
| Local Wi-Fi | Host / Discover / Join with clear same-network guidance, cohesive lobby and sticky Ready/Start footer | Existing LAN discovery, native join, team rules, spectator and retry flows | UIV2-D implemented on draft; QA/phone gate pending |
| Hangar | Real vehicle bay + paint/insignia workbench | `rr-hangar-paint-v1`, selected/locked states, unlock thresholds | UIV2-E implemented, phone acceptance pending |
| Dossier | Readable operator summary + mode history with always-visible utility footer | `rr-dossier-v1`, backup/restore, record integrity | UIV2-F implemented, phone acceptance pending |
| Pause & Results | Compact operational overlays with one primary action | Resume/New Field/Return, match stats, share paths where supported | UIV2-G pending |
| Help, backup, profile utilities | Consistent compact content and safe navigation | All game help, restore safety and accessibility | UIV2-G pending |
| In-match HUD | Functional control-first, no added GPU layer without proof | Controls, camera, lives, TDM/FFA, minimap, AI | Keep approved layout; later dedicated audit |

**Shared style contract:** warm gold = primary commitment and key outcome; pale cyan = telemetry, selection or informational accents; subdued navy = surfaces; light text = essential content; tiny monospace = optional metadata only. Reduce generic full-width rectangles and avoid making every screen look like a dashboard. Respect reduced motion, WebGL failure, accessible focus and meaningful labels.

**Release rules:** only draft PR #140 until targeted real-browser visual QA + existing fast/native/LAN regressions and a **separate test APK** pass. Actual Android owner acceptance is required to promote; no change to production `main`, owner signing, saves, or recommended APK.

## UIV2-C implementation checkpoint (draft PR #140)

Changes are intentionally limited to the original Settings template, its CSS presentation, browser-level QA and this design log. Web and Android package assets are edited in lockstep. The new `mission-setup-screen` makes a distinctly designed deployment briefing while keeping `map-size`, `bot-count`, `lives-choice`, `bullet-cap`, `bot-skill`, all original `pref-*` IDs and `data-playlist-mode` IDs intact. Native storage and match rules remain handled by the untouched game logic. The previous test gate was fully green before UIV2-C changes; the new test gate must be evaluated independently. Do not merge or issue a recommended APK until it passes and the owner reviews a physical phone preview.

## UIV2-D checkpoint and test boundary

Local Wi-Fi remains native-Android only: Chromium QA uses a small stub bridge for *presentation and original click dispatch verification*, not as evidence of real two-phone connectivity. Network packet formats, host authority, spectator queue, match-rule sanitization and Android socket code are unchanged. Changes are limited to markup returned by existing LAN screens, one presentation helper, CSS and the browser regression script. A successful visual test does not replace an actual two-phone Wi-Fi playtest before release.

## UIV2-D recovery + UIV2-G checkpoint

This pass changes presentation-only HTML/CSS and the rendered markup of existing native connection recovery screens. Network and scoring data, save format, native bridge APIs, host/guest authority and game state transitions remain unchanged. Both real web and packaged Android assets are mirrored. The browser QA uses stub bridge actions to verify screen and action routing, not as a two-phone network acceptance test. Physical phone review remains outstanding.

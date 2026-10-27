# Sector Rebound — v0.9.12 Camera & Reliability Audit

**Current experimental branch:** `dev/sector-rebound-qa-v0912` · **Android versionCode:** 28

The v0.9.11 FIELDGRID government-terminal menu and fullscreen game remain intact. All unit camera targets are a little closer: pilot **1.32**, tank **1.22**, mech **1.16**, fallback **1.24**, keeping eased transitions and scenic boundary coverage.

**Audit fixes:** bot recovery no longer targets unusable vehicle bays occupied by other live actors; recoil/tread animation resets when entering a new vehicle or respawning; guest camera coordinates reset only when a genuinely new host map arrives. Deterministic screenshot seeds and mandatory UI screenshot checks improve test quality.

**Verified October 26, 2026:** [successful smoke + visual QA + Android APK build](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40426950894). The full smoke suite, 36 before/after Chromium snapshots, full-bleed canvas checks and all three phone-landscape menus passed. The APK archive integrity was separately verified and contains the bundled offline game assets.

**Not yet verified:** physical two-phone Wi-Fi gameplay, device-specific notches, real Android frame pacing, and extended hands-on playtesting. See [audit and open risks](docs/AUDIT_v0.9.12.md). Previous `dev/sector-rebound-fieldgrid-v0911` remains available for rollback.

---

# Sector Rebound — v0.9.11 FIELDGRID Console + Context Camera

**Current experimental branch:** `dev/sector-rebound-fieldgrid-v0911` · **Android versionCode:** 27

The main menu has a distinct, fictional FIELDGRID tactical-simulation terminal style: condensed offline native headings, monospace system metadata, command-module buttons, angled details, and a restrained military/government-institution aesthetic. The game title remains inside the menu and is still removed from live combat. The camera now blends smoothly between on-foot pilot (1.28), tank (1.18) and mech (1.12), with a viewport-dependent minimum and perimeter scenery to avoid empty gutters.

**Verified October 26, 2026:** [Successful Android + Chromium QA run](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40424926749) passed the full gameplay smoke suite, the three tested landscape layouts, Chromium screenshots (36 before/after images), the Android debug APK build and artifact uploads. No home/settings/help overflow at 740×360, 915×412 or 1280×720 in the snapshot report. The previous `dev/sector-rebound-motion-polish-v0910b` remains intact.

**Outstanding release gate:** Android hardware font rendering, camera feel during entering/exiting tanks/mechs, frame pacing, touch safe-areas and two-phone Wi-Fi multiplayer. See [v0.9.11 implementation handoff](docs/FIELDGRID_CONTEXT_CAMERA_v0.9.11.md).

---

# Sector Rebound — v0.9.10b Camera & Motion Polish

**Current experimental branch:** `dev/sector-rebound-motion-polish-v0910b` · **Android versionCode:** 26

Based on the user's Android screenshot and playtest of v0.9.10, this pass slightly pulls back the camera without reintroducing blank bars, softens tank suspension/recoil, gives mechs and on-foot pilots their own subtle movement/recoil reactions, and lightens the floating HUD/control borders. All occupied vehicles, enemies, bots and networked players share the existing rendering paths. No changes to movement speeds, combat rules, procedural maze generation or LAN packet structure.

**Verified October 26, 2026:** [Successful smoke + Chromium QA + APK workflow](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40423057451). Gameplay tests PASS; Android APK build PASS; 36 before/after live Chromium screenshots captured at 740×360, 915×412 and 1280×720, including held-input moving tank states. `layout-report.json` confirms fullscreen canvas bounds for every after viewport and no menu scrolling in these snapshots.

**Awaiting physical phone playtest:** precise tank/mech/pilot feel, touch reach/safe areas, frame pacing, and a two-phone LAN multiplayer match. The earlier `dev/sector-rebound-fullscreen-v0910` remains unchanged for rollback. See [v0.9.10b tuning handoff](docs/CAMERA_MOTION_v0.9.10b.md).

---

# Sector Rebound — v0.9.10 Fullscreen Combat & Tank Motion

**Active experimental branch:** `dev/sector-rebound-fullscreen-v0910` · **Android versionCode:** 25

The battle now occupies the phone's full landscape viewport. In-match branding and the old fixed header/control gutters are gone; score/armor, pause, minimap, joystick, FIRE and ENTER/EXIT live as lightweight overlays. The canvas resizes to the actual window aspect ratio and tracks display independent animated left/right belt movement, subtle speed-gated suspension and firing recoil. **Gameplay and LAN mechanics are unchanged.**

**Verification on October 26, 2026:** [GitHub Actions v0.9.10 run](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40420470005) passed gameplay smoke tests, Chromium before/after capture, Android debug APK build and both artifact uploads. 30 browser screenshots at 740×360, 915×412, 1280×720 show the new fullscreen field and retained main-menu branding. The unmerged parent branch `dev/sector-rebound-ui-v099` remains the rollback point.

**Still needs real-device QA:** notch/system-bar padding, tank movement feel, joystick occlusion near edges, Android frame rate, and actual two-phone Wi-Fi multiplayer. See [fullscreen and motion quality handoff](docs/FULLSCREEN_MOTION_v0.9.10.md).

---

# Sector Rebound — FIELDGRID v0.9.9 (UI Instrument Pass)

**Active UI exploration branch:** `dev/sector-rebound-ui-v099` · **Android versionCode 24**. This branch preserves the previously verified `dev/sector-rebound-ui` v0.9.8.1 build for rollback.

## Current checkpoint — October 26, 2026

- **Implemented:** purpose-built FIELDGRID main-menu hierarchy, action metadata, concise vehicle/pilot status chips, visible occupied-bay feedback, radar corner detailing and landscape spacing guardrails. Arena, gameplay systems, multiplayer protocol and collision rules remain unchanged.
- **Verified:** all gameplay smoke tests PASS; Android debug APK builds and uploads successfully; real Chromium produced 30 before/after images (home/settings/help/arena/pause at 740×360, 915×412 and 1280×720). Home and collapsed-settings menus required no scrolling at those test sizes.
- **Artifacts:** [successful v0.9.9 APK + 30-screen screenshot run](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40416502522) under **Artifacts**: `sector-rebound-v0.9.9-debug-apk` and `sector-rebound-v0.9.9-visual-before-after` (download ZIP). Screenshot archive includes `layout-report.json`.
- **Not yet verified:** visually reviewing each screenshot, real Android touch feel/safe areas/frame pacing, or host/guest LAN on two phones. Do not treat this as a commercial release.

See [v0.9.9 interface audit and follow-up checklist](docs/UI_HIERARCHY_v0.9.9.md). Prior release history follows.

---

# Sector Rebound — FIELDGRID v0.9.8.1 (UI / Flow QA)

**Current playable development branch:** `dev/sector-rebound-ui` · **Android versionCode:** 23

The v0.9.8 UI & Flow Pass is built and tested. It reorganizes the menus and pause/help screens, refines the HUD/typography for small landscapes, and makes unoccupied tanks/mechs pass-through for pilots, drivers and projectiles. This v0.9.8.1 follow-up fixes unsafe boarding when another living actor occupies an otherwise intangible vehicle bay, ensures compact offline Android type, and checks browser/Android asset parity. Arena art, weapon balance, network rules, and physical occupied-player collision are unchanged.

**Verified:** GitHub Actions gameplay smoke suite, Android debug APK assembly and artifact upload all passed on October 26, 2026: [v0.9.8.1 build](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40414962370). The debug APK is packaged in a GitHub artifact ZIP (14-day retention). Unzip it before installation; uninstall an older debug APK first if Android reports a signing-key conflict. Phone-specific visuals, thumb reach and real two-phone Wi-Fi syncing still require manual QA.

See [UI QA and open checks](docs/UI_FLOW_v0.9.8.md). Historical release notes follow.

---

# Sector Rebound — FIELDGRID v0.9.7

**Animation and combat-feedback refinement** on `dev/sector-rebound-motion` following v0.9.6. Adds mirrored mech gait and pilot footfalls, compact hit/ejection visuals and an after-action result panel with disabled inactive controls. Gameplay balance and the approved arena remain unchanged. See [motion QA](docs/MOTION_QA_v0.9.7.md).

---

# Sector Rebound — FIELDGRID v0.9.6

**Visual construction / mobile UI quality pass** (`dev/sector-rebound-visual-qa`). Corrected the tank's tread axis so both tracks run parallel with the barrel along vehicle-local +X. Both sides are mirrored from the same geometry, preventing accidental mismatches. Flattened the menu/button styling and standardized the pause vocabulary without changing the approved arena art or gameplay mechanics. Added tank/mech construction regression checks. See [`docs/VISUAL_CONSTRUCTION_v0.9.6.md`](docs/VISUAL_CONSTRUCTION_v0.9.6.md).

# Sector Rebound — FIELDGRID

**v0.9.5 naming / continuity pass** on `dev/sector-rebound`. Public-facing game name is **Sector Rebound**. The former working title **Ricochet Rumble** remains in historical release notes; this is the same game and not a separate franchise or mode.

- **What you play:** top-down, quick-session tactical arcade combat. Start inside a tank, eject when disabled, and fight on foot or find another tank or mech. Generated arenas change every match.
- **Fiction:** a later-generation combat simulator whose fictional lineage follows Project CATHODE and Operation PHOSPHOR. FIELDGRID is the matured simulation platform; Sector Rebound is the tactical deployment exercise, emphasizing human pilots operating physical vehicle proxies rather than drawing light trails.
- **Design choice:** lore is optional and subtle. Instant play and clarity take precedence over briefing screens. The separate Operation PHOSPHOR repository and its open mystery are not retconned or modified.
- **Android:** the displayed name, mDNS host name and launcher icon say Sector Rebound; `com.playereden.ricochetrumble` and the underlying `window.RR` bridge remain unchanged for technical compatibility. The game and its data are not moved to another Android package. Debug builds may still require uninstall/reinstall when signing keys differ.
- **Name diligence:** online exact-title search found no obvious indexed same-name game as of Oct 26, 2026. This is preliminary screening, **not legal clearance**; a full trademark search and legal review should precede any commercial release.

See [`docs/SECTOR_REBOUND_IDENTITY.md`](docs/SECTOR_REBOUND_IDENTITY.md) for narrative and naming principles. Gameplay is inherited from v0.9.4; no combat balance changes in this rename pass.

---

## Historical project notes

**v0.9.4 FIELDGRID visual clarity (experimental):** cleaned up combat alerts, clipped minimap effects, clarified distinct mech/pilot/projectile visuals and kept pilot-vs-tank tactics. See [visual QA report](docs/VISUAL_CLARITY_v0.9.4.md).

# Ricochet Rumble — FIELDGRID v0.9.3 Visual System

Actual in-engine art and launcher-icon update on `dev/fieldgrid-visual`. See [visual QA record](docs/VISUAL_AUDIT_v0.9.3.md). Previous v0.9.2 text is preserved below for background.

---

# Ricochet Rumble

**v0.9.2 — FIELDGRID comfort refinement** (`dev/procedural-deployments`). A free, offline-first Android arcade game about pilots, tanks, mechs and ricochet combat. Gameplay and assets are bundled in one APK.

## One game, fresh battlefield every match

Press **Quick Play** to enter the arena immediately in a tank. The game creates a connected, randomly generated maze each match; **Match Settings** offers Small, Standard and Large map sizes, bot count, and team rules. Pilot lives, tank shell limits and bot difficulty live under an optional **More Match Options** section on the same screen. No map picker or overlapping game modes.

A tank has **3 armor**. A **mech** has **4 armor**, moves more slowly, fires heavier, slower shells, and holds up to two active shots. Both use the same contextual Enter/Exit control. Losing a vehicle ejects its pilot without losing a pilot life. Pilots can walk through empty parked vehicles to avoid getting stuck in maze corridors.

At the start of a match, extra vehicles are distributed across the map, with one reasonably close to the player. Every ~30–42 seconds the game *attempts* another vehicle deployment while capacity and spawn safety allow. A temporary message and minimap marker identify the drop; the world does not pause. This is a first gameplay-balance pass, not a final drop economy.

**Play Together** remains same-Wi-Fi host/join with guest state from the authoritative host. No extra apps, servers, accounts, or room codes required for LAN. Physical two-phone end-to-end testing is **still pending**; remote P2P and friends are future work.

## Build

- Browser: open `web/index.html`, or use the self-contained HTML build delivered in chat.
- Tests: `node tests/smoke.mjs`.
- APK: GitHub Actions can build `assembleDebug` using the workflow on this branch, at no charge on standard runners for the public repository.
- Android API 26+; source resides in `android/`. JavaScript and HTML/CSS Android assets mirror `web/`.
- Debug build certificate may change; Android may require uninstalling previous debug APK, clearing local settings.

## Design context

[`docs/FIELDGRID_v0.9.md`](docs/FIELDGRID_v0.9.md) records the mechanic decisions, QA, and the **tentative** connection to the separate `Operation-Phosphor` project. Nothing in this update changes PHOSPHOR's canon, files, or UI.

## Limitations

Browser and scripted tests are not a human playtest. The new mech's handling, timed drops, phone frame rate and two-phone synchronization need validation on Android devices. The stable `main` and prior development branches remain unchanged.

## v0.9.1 quality review

See [multi-pass design, accessibility, pacing and systems audit](docs/QA_ROUNDS_v0.9.1.md) for verified changes, research references, and unresolved on-phone acceptance checks.

## v0.9.2 comfort & recovery pass

The compact settings screen now uses larger selectors: 44 CSS pixels at 740×360, and 48 CSS pixels at 915×412 and wider. Tests show its expanded options fit without page scrolling. When an ejected pilot's nearest available vehicle is outside the camera, a modest on-screen arrow points toward it. This is a direction cue, not automatic maze navigation. Host/guest menus and phone backgrounding now force neutral guest movement and firing rather than leaving controls held. One rule set; no new modes or account setup. See `docs/COMFORT_QA_v0.9.2.md` for evidence and limits.


## v0.9.8 UI & Flow Pass

- Unoccupied tank and mech projections are non-solid for both pilots and driven vehicles, and do not intercept projectiles. Occupied vehicles and maze walls retain collision/damage.
- Consistent compact FIELDGRID instrument design across main, settings, pause, and help menus; improved hierarchy and shorter labels.
- Offline-safe font stack: condensed system face for tactical headings, normal Roboto for reading. No font downloads needed.
- Regression tests specifically cover vacant vehicle traversal and active vehicle collision.

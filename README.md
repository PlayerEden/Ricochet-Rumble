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

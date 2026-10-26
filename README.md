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
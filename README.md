# Ricochet Rumble

**v0.9.1 — FIELDGRID experimental build** (`dev/procedural-deployments`). A free, offline-first Android arcade game about pilots, tanks, mechs and ricochet combat. Gameplay and assets are bundled in one APK.

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
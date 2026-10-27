# Sector Rebound v0.9.12 — Camera + Reliability Audit

## Intent
The owner likes the v0.9.11 FIELDGRID menu and gameplay, but wants every unit's camera a touch closer while identifying defects before new features. This branch builds on `dev/sector-rebound-fieldgrid-v0911` without changing balance or the visual identity.

## Camera adjustment
| Controlled unit | v0.9.11 | v0.9.12 |
|---|---:|---:|
| On-foot pilot | 1.28 | **1.32** |
| Tank | 1.18 | **1.22** |
| Mech | 1.12 | **1.16** |
| Fallback | 1.20 | **1.24** |

A +0.04 zoom increase for each. This is roughly 3–4% larger screen appearance where viewport boundary constraints allow. Preserves eased vehicle transitions and the responsive minimum `Math.max(width/(worldW+224),height/(worldH+224))` to prevent letterboxing.

## Code-audit findings and repairs
### FIXED — bot recovery targets blocked by live players
The on-foot bot objective previously selected a vacant vehicle based only on occupant and armor, even if another living actor was physically occupying the bay. Player boarding already correctly required `vehicleEntryClear`. Bot's vehicle candidate selection now uses that same clearance rule to avoid repeatedly approaching unusable bays. No collision changes.

### FIXED — stale visual motion after respawn or boarding
A pilot's stored `recoil` and tread phases survived vehicle re-entry; a respawn could also carry recoil/eject animation from a previous life. Reset those strictly visual fields on respawn and boarding. The actual track animation physics remains unchanged.

### FIXED — remote camera carryover on LAN arena changes
The guest receives host state snapshots and calls `setArena` to catch new maze seed/size. The original code cached unchanged maps but did not reset camera coordinates when a genuinely different maze arrived. A previous wide map could leave the camera off the smaller replacement field for several frames. `setArena` now resets x/y/zoom only if the map changes. Repeated snapshots of the same maze do not reset smooth camera movement.

### IMPROVED — stronger QA repeatability and blocking visual checks
- Chromium before/after screenshots use a shared deterministic random seed so different random maps do not obscure geometry and layout comparisons.
- Screenshots capture home, settings, help, gameplay, moving tank, and pause at 740×360, 915×412, and 1280×720 (36 comparisons total).
- CI now fails when Chromium is missing, screenshot generation fails, gameplay canvas ceases to be full bleed, or primary home/settings screens unexpectedly need scrolling.
- Smoke tests cover prior mechanics, 180 deterministic seeds, 1,500 simulation frames, Android/web asset parity, contextual camera zoom and smoothing, animation recovery, and unchanged-vs-changed arena camera behavior.

## Remaining release risks (not claimed tested)
- Physical two-Android-device LAN discovery, reconnects, packet timing and match rematches need real hardware testing.
- Actual Android cutouts/gesture-navigation touch reach and device-specific font rendition cannot be fully inferred from Chromium landscape screenshots.
- Long-term thermals/60 FPS on varied phones, extended sessions and audio mixing need hands-on QA.
- UI aesthetic and real movement feel require the owner's playtest. Avoid asserting there are zero remaining bugs.

## Rollback / GitHub
- Current: `dev/sector-rebound-qa-v0912`
- Rollback: `dev/sector-rebound-fieldgrid-v0911`
- Android `versionCode`: 28.
- Keep draft PR until real-phone feedback.

## Verified CI / artifact checkpoint
- [GitHub Actions run 40426950894](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40426950894): **SUCCESS**. Node gameplay suite, mandatory deterministic Chromium screenshots, full-bleed arena checks, menu-scroll checks, APK build and uploads passed.
- Screenshot archive `sector-rebound-v0.9.12-visual-before-after`: 36 shots (18 before + 18 after), no reported panel scrolling, and every new arena canvas filled its viewport.
- APK archive `sector-rebound-v0.9.12-debug-apk`: ZIP integrity and Android APK internal ZIP integrity checked locally, build size 73,537 bytes, SHA-256 `a9de09c42b3294a995b5b590b8b6e2890074770d3fc902f8dbdfaaf789d3f3d9`.
- Browser emulation is not a replacement for actual Android device QA or real LAN reconnect tests.

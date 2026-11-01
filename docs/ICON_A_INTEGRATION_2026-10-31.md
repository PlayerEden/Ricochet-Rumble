# Approved Sector Rebound launcher — Version A integration
2026-10-31 — icon-only development candidate, **not production-released**

The owner selected the grounded top-down tank with amber ricochet (Version A). No change to the game rendering, combat mechanics, AI, menus, saved progression, LAN, packages, or signing.

## Android integration
- AndroidManifest now uses adaptive `@mipmap/ic_launcher` plus `@mipmap/ic_launcher_round`.
- Both API 26+ adaptive icon resources share charcoal background, transparent Version A foreground, and a simplified monochrome tank+ricochet glyph for themed launchers.
- The foreground WebP is an optimized 224 px artifact derived from the approved Version A PNG icon pack (SHA-256: `3467962178347f9043a5c1983485f4962f041aa49962cf0970ee14767491d1f7`). The original high-resolution master and 432px adaptive PNG remain in the separately prepared owner image pack; **before public store release, commit and recheck the highest-resolution PNG**. This optimized resource is intended to validate installation and visual placement first.
- Legacy `android/app/src/main/res/drawable-nodpi/ic_launcher.png` is deliberately retained for rollback.
- Target SDK 36, minimum SDK 26, existing `.preview` package and test-signing workflow remain untouched.

## QA gate
1. `node tests/launcher-icon-a.mjs` validates icon binary identity, adaptive mappings and rollback.
2. Run Android resource packaging/build, debug signing and UI/game regressions.
3. On phone, install over existing owner-signed `.preview` only (same cert and higher version code), inspect masked rounded/circle/squircle launchers and themed icon, verify saves and Dossier.
4. Preserve [Preview 100039 checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100039-ingame-ui-lan-results). Do **not** merge draft PR #85 into main or publish without owner approval.
5. Real two-device LAN, phone QA, and private Play signing remain pending.

# v0.9.44 P-02 FINAL AUTOMATED QA PASS

- **Exactly tested commit SHA:** 8fd0f48dfcd43f13dc6e487cd61bd4b7a77b6c85.
- **Fast full gameplay and art tests:** https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40999661362 SUCCESS. Geometry tests verify two overhead boots and shoulders, centered gait, helmet +X visor, two hands on single sidearm and muzzle tip (28,2), FFA vs team body paint, zero pilot geometry arcs, unchanged vehicle/camera/movement systems.
- **Actual Chromium screenshot and Android QA:** https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40999661261 SUCCESS. 740x360, 915x412, 1280x720; real pilot on-foot idle, walking, aiming west/east and firing; tank/mech lobby and reduced motion; Android debug APK and unsigned AAB built on same source.
- **First attempt failed on stale geometry test:** https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40999585488 incorrectly expected pilot to have NO visible boots. Corrected legacy assertion and ran all tests again successfully.
- **Immutable QA evidence and original APK** (not rebuilt/resigned): https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.44-pilot-visual-test . Source release contains actual original APK, QA screenshot ZIP and SHA256. One-use publisher passed https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41000180244 and was then removed.
- **OWNER handset visual verdict STILL PENDING**: sprite legibility vs tank/mech and subjective character feel, UI audio/performance. **DEBUG APK CLEAN-INSTALL ONLY** due to varying archived signing certificates; never uninstall older installed data worth keeping. No actual phone update, production signing or Google Play acceptance claimed.

---
# v0.9.44 — FIELDGRID P-02 top-down pilot visual-refinement QA

**Scope:** Pilot-only visual presentation change, not movement/weapon balance. Experimental branch `feature/pilot-visual-refinement-v0944` directly based on dependent unapproved v0.9.43 private-test-signing infrastructure. Stable `main` remains untouched. **Android code 44** and visible internal version `0.9.44-pilot-visual-test`; original app ID unchanged. Normal CI debug APK will use a new ephemeral signer unless owner-private credentials are configured—**clean-install testing only if signatures differ**, no safe-data-update claim.

## Design requirements implemented

- **Strict top-down:** modular arcade body with flat overhead helmet, dark visor band facing actor's local +X, armored torso/backpack, two mirrored shoulder plates and feet, two bent arms converging on **one** shared pistol. No head/arm/turret circles, crawling profile, 2.5D shading, multi-barrel artifacts or AI-style ornamental facets.
- **Visual family:** same `resolveUnitMaterials('pilot',...)` armor/shadow/light/team role convention as tank and mech. Steel standard pilot material remains steel in free-for-all. In teams, full armor sections are blue/red, not merely a faint outline; unapproved optional palettes still resolve independently.
- **Physical invariants:** `PILOT_MUZZLE_X=28` and `PILOT_MUZZLE_Y=2` remain shared by real shot source and drawn pistol, no ballistic change. Camera pilot 1.07, tank .82, mech .77 remain untouched. Existing wall collision, aim controls, rotation and speed unchanged. Fixed world-space corner locator remains independent from rotating sprite. Gait is an extremely small mirrored foot/arm translation, not walking-on-all-fours.
- **Vehicles:** audited but deliberately **no edits** to `drawTopTank` or `drawTopMech`; their exact reused game renderers remain in the animated lobby showcase. No unauthorized player-pace/camera regression.

## Test evidence and acceptance

- [ ] Fast simulation + geometry tests: exact cross-source Web/Android byte mirror, no pilot circles, two mirrored feet/shoulders/hands, one shared actual muzzle and firing flash, correct blue/red/team/free-for-all armor, no vehicle/movement changes and old scored/AI/save/backup/LAN regressions.
- [ ] Full real Chromium screenshot comparison against parent visual baseline at **740×360, 915×412, 1280×720**, including real on-foot idle, walking, west/east directional aim, firing flash, tank, mech lobby and reduced motion. Check silhouette and readability at actual zoom—not just source coordinates.
- [ ] Android debug APK + unsigned AAB from **same verified commit SHA**; preserve source/test/QA screenshots. Physical owner feedback pending.
- [ ] Exact original passing debug APK can be archived as *experimental clean-install/throwaway-data test* if automated QA passes. It is **not** a compatible upgrade over past differently signed APKs and is **not** the owner-private pinned signing track.
- [ ] Owner mobile pilot-scale readability/aiming verdict and vehicle presentation comparison; no claims of final visual approval before playtest.
- [ ] Audio, menu, game-feel passes v0.9.45–46 stay separate; existing network and signing/Play gates remain open.

Use this milestone to validate one clearly bounded visual improvement and preserve a rollback path. Do not silently merge stable `main`, alter gameplay balancing, or issue a production Store build.

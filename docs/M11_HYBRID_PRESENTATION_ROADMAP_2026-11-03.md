# Sector Rebound — M11–M14 Hybrid Presentation Roadmap
**Owner direction:** 2026-11-03 · **Source:** main after M10 · **Status:** planned with M11-A started on feature branch

## Decision
Adopt a **gradual, reversible hybrid UI path**. Keep the real game engine, Canvas combat renderer, map camera and physics, scores, LAN, saves and app identity. Use **HTML/CSS for semantic controls** and **PixiJS only for visual experiences whose benefits can be demonstrated on an actual Android phone**. A full Pixi game renderer is an optional future outcome, **not** a committed migration. The premium standalone Pixi PR #139 is an art/reference experiment, not production code to cherry-pick wholesale.

### M11-A — Real menu hybrid foundation (FIRST, current work)
- Root from current `main` after M10; keep all functional destinations: Quick Play, Choose Mode, Local Play, Hangar, Dossier, Help, Settings, and their real paths.
- Add one **menu-only, transparent Pixi overlay** to the existing Canvas tank/mech showcase, supplying GPU-lit holo decor/scan treatment without replacing the approved production unit paths. Keep the existing Canvas drawing and amber primary CTA/neutral menu choices in place.
- Scope production JS to a self-contained optional module. The full game runs if Pixi cannot initialize, WebGL is unavailable, or the compiled optional bundle is missing. Zero interaction interception. No localStorage changes, network, accounts, new game mechanics or altered audio.
- Suspend and tear down the Pixi renderer when home is not showing, including Dossier/Hangar, match, pause, document hidden or WebView background. Never leave a second GPU render loop active during combat. Reduced-motion renders a static image.
- One packaging contract for source WebView and Android assets: pinned Pixi dependency bundled locally (no CDN), byte-identical generated bundle, and dedicated CI verification. **DO NOT MERGE OR SHIP** a placeholder-only bundle as if it were hybrid; the production build must reliably produce/copy its actual bundle.
- Browser QA in actual Chrome at 568×320, 640×360, 740×360 and 915×412: menu art + shader visible, the five original menu paths, back-to-menu reactivation, game-only Canvas, graphics fallback, Android source parity, focus pause, layout overflow, hit targets and save stability. Do not manufacture proof from a prototype.
- This initial branch is a **draft PR** until live WebGL screenshot QA and build packaging checks pass.

### M11-B — Menu polish and accessible UI components (after M11-A)
- Extract design tokens for brand typography, cyan/amber roles, focus, disabled states, safe-area behavior and reduced motion; preserve existing real menu action wiring.
- Adapt the premium PR #139's title, hierarchy, background mood and hero alignment only where they measurably improve 568×320 and 740×360. Avoid blueprint/transparent vehicles and excessive glow. Let HTML/CSS do buttons, labels, announcements and focus.
- Address existing compact Hangar/Dossier layouts as originally planned by M11, not instead of them; independently audit text clipping and one-thumb navigation.

### M12 — Animated Hangar / cosmetic preview
- Preserve `rr-hangar-paint-v1`, earned locks, category tabs, equipped paint, insignia, reward focus and real Dossier back navigation. Add **optional GPU hero scene** using authentic production art/skin data, not disconnected fake stats/assets.
- Dispose GPU scene when leaving; offline and low-memory fallback stays active. Benchmark Android heat/startup/size. Do not disturb save format, match team colors or entitlements.

### M13 — Dossier presentation and navigation
- Use shared CSS/HTML UI primitives for stats, profiles, unlocks, backup/restore and after-action links. Pixi should be **opt-in decorative artwork only**, never a requirement for readable text, copying, assistive technology, or restore flows.
- Prove backup/restore byte safety and no progression regression across app update.

### M14 — Optional combat GPU experiment
- Separate draft PR: one transparent Pixi particle/shader effect above Canvas (if justified), driven by **read-only visual event/state snapshots**. Do not double-simulate projectiles or change hitboxes.
- Measure 60–120 s actual phone frame-time lows, memory, thermal and device input latency. Camera targets pilot 0.94, tank 0.73, mech 0.69 remain approved. One renderer remains active for gameplay unless hardware results justify an overlay.
- Possible later full Pixi renderer is evaluated independently via state/render separation, migration/rollback tests and owner acceptance; never automatic.

## Release and QA gates
1. Each stage is a focused PR from current `main`; feature branches are disposable, not alternative maintained app versions. Existing Canvas is the rollback.
2. Run targeted real-browser visual/layout QA, game/LAN/scores/save regressions, and Android WebView asset parity for every integration step.
3. For a **grouped** owner preview only: same `com.playereden.ricochetrumble.preview` ID and pinned signing certificate, higher versionCode than **420001**, byte-verified assets, one current recommended APK. Never silently install a differently signed build or require uninstalling a save-bearing preview.
4. Owner phone gates: install-over, Dossier/Hangar/custom options, menu smoothness, low-RAM and WebGL failure, rotation/cutout, background/foreground, FPS/heat and UX feel. **Two-phone Wi-Fi remains deferred**; Play release remains NO-GO until independent gates.
5. Music/sound remains priority #4. M6–M10 source passes but is **not** in the existing v0.9.80-main.1/code 420001 owner APK.

## Decision record
The Pixi visual experiments #136–#139 reproduced the FIELDGRID style and produced a more premium prototype menu, but did **not** show a convincing FPS advantage or prove Pixi essential for UI typography/buttons. The most valuable discovery is the **hybrid composition**: accessible DOM/CSS UI plus an optional GPU stage behind it. M11 starts there. No game engine migration has been approved.

## Start state / evidence
M11-A begins on `feature/m11-hybrid-menu-foundation-2026-11-03`, current `main` base `c198780293cae57f0387134f8ca074bea5b9e476`. Source, CI, browser/Android build proof and owner hardware evidence are tracked separately; do not mark them complete without verifiable runs.

# Sector Rebound — Phase B2 allied aim trajectory readability
**Date:** 2026-11-02. **Review branch:** `experiment/allied-aim-traces-b2` based on B1 authoritative Friendly Fire policy; no merge to stable `main`, no replacement of owner v0.9.68 APK.

## Owner intent
See nearby friendly bots lining up deliberate actual shots, without exposing enemy bot trajectory solutions, decorating the whole maze with lasers, or making friendly-fire protection automatic. Keep the existing short player-dotted preview and three amber enemy charge ticks.

## Implemented visual-only feature
- **SHOW ALLIED AIM TRACES (TEAM MODES)** is a per-device optional preference (default ON) saved through the existing `comfort` settings structure and shown under **Match Settings → Playlist & Advanced Rules**. OFF restores the previous on-screen UI. It does not change match authority, game difficulty, fire permissions or trajectories.
- `alliedAimActive(i,me)` allows a cue only for a living **bot** on the observer's actual team while truly acquiring a shot with a finite locked heading, not in recovery/flash, at most **330 game units** away, with valid line-of-sight between local observer and bot. Never when FFA, dead, match ended, paused or enemy.
- `visibleAlliedAimIndices` additionally requires the bot in the actual screen safe area (28px inset), respects the on-device preference, and draws at most **two** nearest eligible allies.
- The visual uses the *current actual physical muzzle heading*, not an unreached target angle: `traceProjectile()` bounded to pilot 150 / vehicle 225 world units, at most one bounce with 85 after-bounce, with small **1.45px dots** and low opacity (38% first section, 20% continuation). No persistent beam, colored target marker or enemy target location. The visual is render-only and never creates physical bullets or effects.
- **LAN guest privacy:** The host adds an optional `allyAim` array of at most 2 **friendly bot indexes** to its existing authoritative state snapshot, filtered for the guest's team, real aim state, distance and LOS. The packet contains **no bot target id, desired aim angle, or remembered enemy position**; the already-synced physical bot heading is sufficient to draw the guide. Guest rechecks proximity/LOS and its preference and never synthesizes hidden bot decisions locally. `validRemoteSnapshot` rejects enemy/human/duplicate/malformed indexes. Older snapshots without `allyAim` remain valid, showing no guest ally guides.
- No change to A1 pilot turn parity, A2 projectile physics, A3 bot shot selection/lock, B1 FF OFF/ON collision and team-kill score policy, CTF scoring, Hangar or Dossier.

## Test matrix and acceptance
- Real-engine `tests/smoke.mjs` checks live AI aim positive; enemy/FFA/far/no aim/recover/pref OFF hidden; LAN guest-only filtered indexes; malformed/host-side/human/duplicate intent rejection and local display with explicit host approval.
- Real Chromium `tests/allied-aim-visual-qa.mjs` renders the actual game and checks visible vs hidden cases across 740×360 and 960×540 viewports: acquiring ally produces exactly one trace; off / recovery / idle / FFA / distance / wall-occluded produces none. Saves two screenshots as GitHub workflow artifacts for visual review.
- [Fast B2 Chromium and privacy workflow](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41531531135) **SUCCESS** at identical gameplay code; initial failure was **test-only**: actual autonomous AI advanced between setup and screenshot; fixture now freezes simulation ticks while allowing normal rendering.
- Full CTF/combat/300 Forward Bay/Quick Play/saves/44-screen regression required to pass **on exact mirrored HTML and JS**. A compact landscape UI check initially caught extra settings-height overflow at 915×412; resolved by moving the toggle into the collapsed Advanced Rules subsection without reducing touch target sizes. Check latest full CI result before release.
- Actual Android performance/frame rate and two-phone LAN peer behavior remain owner-hardware checks. No offline browser test establishes real LAN sync quality.

## Rollback and release safety
Discard draft B2 branch and return to audited B1 branch, or leave installed v0.9.68 untouched. Do NOT merge to stable main before owner acceptance. An Android preview may be built with same public AOSP development signing identity `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc` and version code **above 300001**, only after verified full CI. Do not recommend uninstall or downgrade over saved progress.

## Next phases
- C: proper match-team identity and one-match FFA color shuffle, rotating solo Quick Play faction sides. Color owner data and HUD should not depend on actor seat.
- D: proper LAN squad rosters with host and guest separate real teams and bots, scored TDM, side assignment and two-phone physical verification.

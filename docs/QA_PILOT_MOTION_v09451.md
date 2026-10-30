## OWNER DESIGN ACCEPTANCE — LOCKED (2026-10-30)

**Owner decision:** After reviewing the v0.9.45.1 P-03 movement test, the user said **"I think that's good. Lock it in."** The P-03 top-down pilot **silhouette, team/FFA colors, small speed-based vest sway, and opposing shoulder animation are APPROVED as the locked visual/motion baseline.** This supersedes the earlier owner-motion-verdict PENDING markers below, which document the pre-acceptance workflow. This is owner approval of **pilot presentation only**, not approval of all Android handset performance, competitive balance, signing, LAN, or Google Play readiness.

**Approved source:** exact original tested gameplay SHA `ab12c6b2e4ce2bcb3b2ebe694494d8e7dd5b45ed`, [archived v0.9.45.1 APK + QA evidence](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.45.1-pilot-motion-test), APK SHA-256 `c41ade4009551845b5668bfecb5ed67c80af1f077b471607a7f8b3228f15096f`.

**Frozen art contract:** no visible crawling boots/knees, no dangling lower limbs, same helmet/visor/centered pistol and projectile muzzle (28,2); unified torso with subtle velocity-gated sway; paired shoulders with mirrored phase; cyan/red team readability and neutral FFA materials remain. Pilot hitboxes, aim/speed, tank/mech, score, procedural arena, LAN, camera, audio, saves and other gameplay are not authorized to change under this art approval.

**Change-control policy:** do not redesign or automatically retune pilot appearance in subsequent milestones. Preserve exact source and APK for rollback. Reopen pilot visuals only for a reproducible defect or explicit new owner request. Continue separately with v0.9.46 UI/audio polish and manual control/Android reliability gates. **No implicit merge of experimental PR #66 or its ancestor PR chain to stable main.**

---
# v0.9.45.1 — P-03 Operator Movement Readability (experimental)

**Owner feedback (2026-10-30):** The real phone v0.9.45 P-03 overhead pilot SILHOUETTE is accepted: "I like it." User explicitly requests visible movement animation. Keep the accepted shape; do NOT bring back visible feet, legs, knees or crawling poses.

## Exact automated results — PASS (2026-10-30)
- **Exact gameplay+test commit:** `ab12c6b2e4ce2bcb3b2ebe694494d8e7dd5b45ed`.
- [Fast CI 41005017654 **SUCCESS**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41005017654) with motion/no-boots/muzzle and prior gameplay/maze/score regression.
- [Full actual Chromium+Android 41005017792 **SUCCESS**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41005017792) with on-foot walking/idle/aim/firing screenshots at 740×360, 915×412, 1280×720; debug APK and unsigned AAB from exact source.
- **Permanent original APK/QA screenshot evidence and SHA256 manifest:** [v0.9.45.1 experimental GitHub release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.45.1-pilot-motion-test); original APK digest `c41ade4009551845b5668bfecb5ed67c80af1f077b471607a7f8b3228f15096f`. Copied **byte-for-byte** from successful CI using [one-use archive run 41005557974 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41005557974), workflow then deleted.
- **Manual owner physical Android motion acceptance PENDING.** QA green is not evidence user likes its feel. Prior v0.9.45 original APK preserved for selective rollback.

## Changes from approved P-03
- Reuse the existing per-actor speed-dependent `stride` sine phase from `render()`. At rest stride=0 and the character pose is completely still.
- Add subtle **vest/torso lateral sway** (`gait*.32`) and gentle backward compression (`-|gait|*.18`) only to the continuous rear torso block.
- The two mirrored **shoulder plates and their team-color ID marks counter-shift** by `±gait*.5` on the forward axis. This creates motion without independent dangling limbs. The forearms, helmet, pistol, and actual bullet muzzle stay fixed to the canonical local coordinates.
- No new particles, glow rings, boots, extra barrels, screen shake or player movement speed.
- Match neutral steel and Blue/Red color treatment preserved. All gameplay mechanics/handling/AI/score/zoom/arena/LAN/backups remain untouched.
- Web/Android game.js source mirrored. Android `versionCode 46`, `versionName '0.9.45.1-pilot-motion-test'`; same app ID and existing disabled private-test signer workflow updated only for version assertion.

## QA and acceptance
- [x] Fast Node syntax and gameplay regression, 300 seeded procedural maps, same Web/Android content, score and save backward compatibility, + targeted P-03 geometry checks:
  - torso shifts, opposing shoulders move and reverse across gait phases, and ID paint stays.
  - stationary frame stays stationary; no original detached boots/crawling geometry.
  - drawn muzzle at same local (28,2) at rest and both movement phases; shot physics unchanged.
- [x] Full actual Chromium idle / on-foot walking / aiming / shooting at 740×360, 915×412, 1280×720, tank and mech unchanged; Android debug APK + unsigned AAB from tested commit.
- [x] Owner visually accepted P-03 walking animation and silhouette on 2026-10-30. (Separate input-feel, frame pacing and extended Android reliability remain unverified.)
- [x] Maintain prior [v0.9.45 owner-approved pilot shape and QA original APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.45-pilot-silhouette-test) and source [PR #65](https://github.com/PlayerEden/Ricochet-Rumble/pull/65) as rollback.
- [ ] No stable main merge or Play production distribution. Debug test APK still clean-install-only because ephemeral signing certificates differ across builds; do not uninstall prior saved data.

**Milestone interpretation:** a tiny P-03 motion addendum; the planned v0.9.46 UI/audio step remains distinct.

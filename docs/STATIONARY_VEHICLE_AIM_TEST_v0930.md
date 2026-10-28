# Sector Rebound v0.9.30 — deliberate hull & stationary aiming experiment

**Purpose:** Respond to owner's Tank Trouble-style feedback: stop chasing the shells. Position, choose the wall angle, release shots with intent, let ricochets work while you reposition. **This is an A/B prototype, not a global replacement of existing Survival or owner's well-liked v0.9.28 CQC controls.**

**Dependency:** Draft vehicle pacing [PR #47](https://github.com/PlayerEden/Ricochet-Rumble/pull/47) built over QA-tested playable scored vehicle [PR #46](https://github.com/PlayerEden/Ricochet-Rumble/pull/46). Known rollback [v0.9.29 scored vehicle FFA](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.29-scored-vehicle-ffa-test), CQC fallback [v0.9.28](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.28-cqc-aim-feel-test).

## Actual prototype

- Scored vehicle Free-for-All **only**: player tank movement target 222→**185 units/s**, AI target 178→**152**, both vehicle-turn cap 12→**5.5 radians/s** (~315°/s), mech remains 0.76x move speed. Human on-foot CQC unchanged.
- New **AIM** touch pad in right control zone whenever the player is driving a tank or mech in scored FFA. Hold and drag 14+ pixels in the desired facing direction to pivot the entire hull **with no movement stick input, no shooting, no shell consumption**. The position remains steady except for residual inertia when stopping. When angle is right, release AIM to retain heading; press **FIRE** separately for deliberate shot. Holding FIRE continues the prior firing behavior, and FIRE-drag for on-foot pilots remains available.
- Same right-thumb vector can still aim a vehicle using a FIRE drag while shooting, for urgent action. AIM only is expressly useful for planning a ricochet *before* spending scarce in-flight shell slots. Right-thumb gestures are pointer captured and cleared on up/cancel/lost capture/blur/pausing.
- No changed shell speed (tank 415, mech 355), lifetime (tank 2.55s), ricochet physics (tank up to 5 wall bounces), return-self-hit, projectile cap (default 4) or firing cooldown (tank .36s), KO scoring, armor, ejection, respawns, map generation, or match clock.
- Existing finite-life Survival/Team Survival have original fast vehicle speed/turn and no new AIM button; CQC retains user-approved independent FIRE aiming and has no vehicles. LAN is not changed.

## Engineering acceptance

- [x] [Fast CI 40641076005 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40641076005), exact gameplay SHA `916b402e87395b1912fabcee94a36982093e1f36`. Actual tank/mech stationary aim, zero fired projectiles, unchanged shell speed and caps, 300 maze seeds and legacy CQC/Survival/FFA all verified.
- [x] [Full actual Chromium 40641075963 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40641075963), real button pointer capture/drag/release and no fire, all three mobile landscape screens. First run 40640602673 failed because new AIM pad inherited disabled pointer events from fullscreen control-zone; fixed specifically for AIM and verified by the second passing live browser run.
- [x] [Android debug APK and unsigned release AAB 40641075963 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40641075963), exact gameplay SHA `916b402e87395b1912fabcee94a36982093e1f36`, byte-identical web and Android game/HTML/CSS. Permanent APK release publication handled separately; note source binary SHA must not be confused with documentation-only follow-up commits.
- [ ] User physically tests whether slower movement and turn can still keep battles energetic, whether AIM+FIRE arrangement fits their hands, whether they can plan a bounce without automatically firing, and whether the 10-KO / 4min FFA score limit is now too hard.
- [ ] 50+ true bot matches, real opponent encounters and repeated self-ricochet hit fairness measurement before adopting these values across other modes.

## Critical product caveat

The player does **not** have an independent rotating turret: the entire hull rotates. We are deliberately trying a full hull bank-shot arcade control, not silently adding a turret mechanic or turning Sector Rebound into Tank Trouble. If the AIM button crowds the right side or creates thumb juggling, revisit right-stick/FIRE control ergonomics rather than simply making shots faster.

**No automatic merge; stable main game v0.9.21 remains safe.** 

## Automated release QA outcome (2026-10-28)

- Full tests are green: [fast run 40641076005](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40641076005) and [real Chromium+Android 40641075963](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40641075963) on **exact built code SHA `916b402e87395b1912fabcee94a36982093e1f36`**. Browser snapshots and original Android artifacts are preserved as Actions outputs (limited retention). Later documentation edits do not modify the proven game binary.
- An initial real browser run failed because `.battlefield .touch-zone` has `pointer-events:none` for its large non-interactive wrapper and the new AIM child lacked the explicit `pointer-events:auto` used by FIRE. Final matched CSS now grants proper pointer capture to AIM in both browser and Android, and the full Chromium test validates actual press/drag/release + no shell consumption. Do not roll back the CSS exemption.
- Manual owner Android control-feel and 10-KO / 4-minute scored FFA pacing remain unverified. **Stable main gameplay remains v0.9.21 and upstream gameplay drafts remain unmerged**; don't mistake test APK for a Play production bundle.

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

- [ ] New Node tests actually exercise stationary tank and mech rotation with AIM-only control, 14px dead zone, no unintended FIRE/projectile, unchanged shell velocity/cap/cooldown, 300 seeded mazes and full previous CQC/Survival/FFA regressions.
- [ ] Real Chromium pointerdown→pointermove→pointerup on actual AIM pad; confirm no bullets and correct aim vector in 915×412 view and screenshot checks at 740×360, 915×412, 1280×720.
- [ ] Full paired Android debug APK and unsigned AAB QA from **same exact tested commit**; only then publish immutable test APK without rebuilding.
- [ ] User physically tests whether slower movement and turn can still keep battles energetic, whether AIM+FIRE arrangement fits their hands, whether they can plan a bounce without automatically firing, and whether the 10-KO / 4min FFA score limit is now too hard.
- [ ] 50+ true bot matches, real opponent encounters and repeated self-ricochet hit fairness measurement before adopting these values across other modes.

## Critical product caveat

The player does **not** have an independent rotating turret: the entire hull rotates. We are deliberately trying a full hull bank-shot arcade control, not silently adding a turret mechanic or turning Sector Rebound into Tank Trouble. If the AIM button crowds the right side or creates thumb juggling, revisit right-stick/FIRE control ergonomics rather than simply making shots faster.

**No automatic merge; stable main game v0.9.21 remains safe.** 

# Sector Rebound v0.9.32 — precision hull aiming and pilot controls audit

**State:** experimental, user feedback-led draft based on [v0.9.31 vehicle thumb layout](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.31-vehicle-thumb-test), NOT merged to stable `main` and NOT yet accepted on a physical phone.

## User feedback now supported by source

Owner physically tried **v0.9.31**: "a lot better" overall but tank/mech movement could be slightly slower, and rotation still **too fast for precise bank-shot angles**. Owner also requested audit of pilot controls. Aiming ergonomics are a separate issue from firing rate and ricochet shell physics.

The source is **not unified across modes**:
- In pilot-only **CQC** and in scored FFA **on foot**, human pilot moves **268 units/s**, turns up to **6.5 rad/s ≈372°/s**, and FIRE-drag provides independent aim with a 14px threshold and modest scored sidearm collision **17.5** for all scored pilots; owner said v0.9.28 CQC was "WAY better" and approved deferring unspecific minor polish.
- In **regular Solo/Team Survival**, human pilot still moves **268** but turns at old **12 rad/s ≈688°/s**; independent FIRE-drag aiming is unavailable because `inputFrom` gates `fineAim` on `isScoredMatch()`. Thus ejection from Survival vehicle feels different from scored FFA/CQC ejection.
- Scored vehicle FFA human **tanks 178**, bot tanks **146**, mechs at **0.76×**, hull 3.6 rad/s ~206°/s. In original Survival tanks remain human **222**, bot **178**, 12 rad/s.
- Tank shells **415 units/s**, **2.55s** default, **four** active slots, **0.36s** cooldown and five bounces; returning own shot remains dangerous after 0.38s and a ricochet. The shell/human FFA tank speed ratio was ~2.33×.

## v0.9.32 first carefully scoped A/B

| Vehicle scored FFA only | v0.9.31 | Experimental v0.9.32 | Purpose |
|---|---:|---:|---|
| Human tank target speed | 178 | **166** (~7% slower) | More time to anticipate reflected shots |
| Bot tank target speed | 146 | **136** (~7% slower) | Keep AI/human pacing aligned |
| Mech multipler | 0.76× | 0.76× | Maintain class difference |
| Turn when following MOVE stick | 3.6 rad/s (~206°/s) | **2.6 rad/s (~149°/s)** | Less abrupt heading changes |
| Turn while independent AIM engaged | 3.6 rad/s (~206°/s) | **1.8 rad/s (~103°/s)** | Distinct precision adjustment, including stationary |
| FIRE pointer behavior | Can also claim aim pointer even while in vehicle | **FIRE never claims vehicle AIM pointer** | A user can touch FIRE then AIM, or AIM then FIRE, without stealing direction control |
| Tank shell speed/shot limit/range/bounces | 415 / 4 / 2.55s / 5 | **unchanged** | No accidental ammo/ricochet balance changes |
| CQC and scored on-foot pilots | owner-positive v0.9.28 controls | **unchanged** | Guard accepted pilot feel |
| Solo/Team Survival and LAN | original controls | **unchanged** | No untested global change |

**Important:** we intentionally kept the **v0.9.31 AIM and FIRE pad layout** (no new buttons). The player must be able to aim with one thumb and fire with the other. When aiming, an active right-hand vector controls heading without needing the MOVE stick; when released, the last world-facing angle is retained until the next steering input. Shell behavior, bot aim logic, shield/KO rules, scored limits, menu and Android identity remain unchanged. No new aim assist, homing or projectile guidance.

## Dedicated pilot consistency audit — do after owner precision vehicle trial

1. **CQC reference:** preserve human pilot 268 movement and 6.5rad/s turn, plus FIRE drag and sidearm collision improvement. Test on-foot shoulder/muzzle sprite alignment and return after ejection/respawn.
2. **FFA pilot transition:** after exiting/ejecting from a slow tank, the pilot should feel agile and responsive and the large vehicle AIM pad must hide; FIRE drag takes over without retaining an old vehicle AIM pointer.
3. **Survival pilot parity:** the discovered 12rad/s turn and lack of FIRE drag are probably why on-foot handling may feel inconsistent. Propose porting the accepted CQC pilot aiming to **local Survival** in a separate draft, with LAN dual-phone protocol, scoreboard and script parity tests before expanding multiplayer. Do not silently do it in this vehicle experiment.
4. **Touch cancel/error handling:** check thumb/pointer capture loss, pause, orientation, enter/exit and simultaneous FIRE plus MOVE. Prefer consistency and accessibility over additional UI elements.
5. **Visual audit:** ensure strict top-down shoulder/head/muzzle art remains aligned with hit physics, regardless of angle and camera zoom.

## Quality gates

- [x] [Fast Node smoke + 300 seeded maze/old-modes/regressions 40647176849 **SUCCESS**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40647176849), exact 166/136 movement, 2.6 steer, 1.8 AIM, FIRE pointer isolation, CQC/Survival pilot parity evidence.
- [x] [Full real Chromium/AIM+landscape layout & Android debug APK/unsigned AAB 40647176929 **SUCCESS**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40647176929) on exact gameplay+test SHA `dce596d16ac0eeefd847ba564a0fdfd49718f3f8`. This does **not** constitute owner physical device acceptance.
- [x] Archived [**original QA-tested v0.9.32 APK**](https://github.com/PlayerEden/Ricochet-Rumble/releases/download/v0.9.32-vehicle-precision-test/sector-rebound-v0.9.32-vehicle-precision-debug.apk) byte-for-byte in [immutable v0.9.32 test prerelease](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.32-vehicle-precision-test), including QA ZIP/SHA256, [single-use publisher 40647814414 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40647814414) cleaned up afterward. Stable game runtime `main` remains v0.9.21; v0.9.31 still an owner-positive comparison baseline.
- [ ] Owner Android comparison: v0.9.31 versus new candidate, small aim changes, half-circle turning, tank/robot navigation around 132-unit corridor cells, fire-then-aim and aim-then-fire, on-foot ejection/return, 10-KO/4-min match pacing.
- [ ] Future natural AI telemetry across at least 50 scored rounds to check contact and KO rates; no claim that speed changes improve match length yet.

Original [v0.9.31 APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.31-vehicle-thumb-test), [v0.9.30](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.30-tactical-vehicle-aim-test) and owner-positive [v0.9.28 CQC](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.28-cqc-aim-feel-test) are immutable fallbacks.

## Exact QA & release checkpoint — 2026-10-28

- **[APK v0.9.32 precision vehicle feel test](https://github.com/PlayerEden/Ricochet-Rumble/releases/download/v0.9.32-vehicle-precision-test/sector-rebound-v0.9.32-vehicle-precision-debug.apk)**, [full prerelease/screenshots/checksum manifest](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.32-vehicle-precision-test). Source, executable and screenshots were built/tested at exact code SHA `dce596d16ac0eeefd847ba564a0fdfd49718f3f8`; APK downloaded from successful CI run and reuploaded **without recompiling/resigning**. One-off publisher workflow deleted after verified success.
- [Fast 40647176849 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40647176849); [full Chromium & Android 40647176929 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40647176929), [archive publisher 40647814414 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40647814414).
- [Draft **PR #50**](https://github.com/PlayerEden/Ricochet-Rumble/pull/50) reviewed against its direct parent `polish/vehicle-twin-thumb-controls-v0931` **ahead 4 commits, 4 files only** (paired Web/Android JS, updated smoke regression, this document). It remains DRAFT, and no stable runtime has merged.
- [**Pilot controls follow-up issue #51**](https://github.com/PlayerEden/Ricochet-Rumble/issues/51) scoped separately. Do not conflate accepted CQC aiming with untested legacy Survival mobile pilot handling.
- **Owner v0.9.32 physical phone test STILL OPEN**. Target: ease of 5°–15° alignment, reasonable 180° turn, low-speed navigation, AIM+FIRE finger order, shooting while stationary, survival after ejection. 50+ natural bot matches for KO pacing remain unmeasured. Android debug build internally may use inherited version and debug signing, not production Play signature.

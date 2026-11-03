# Sector Rebound — B1 authoritative Friendly Fire and collision policy
**2026-11-02. Experiment only.** Base: audited A3 source / signed owner v0.9.68 APK at `f7a4f0859c9daec3d38548f8fef608eb38bc1a29`. New branch `experiment/friendly-fire-policy-b1`. Production `main`, v0.9.68 signed preview, cosmetics and local saves unchanged.

## Owner-approved two-rule matrix
| Match rule | Friendly actor collisions | Friendly projectiles | Enemy projectiles | Scoring |
| --- | --- | --- | --- | --- |
| Friendly Fire OFF **(default)** | Pilot/tank/mech allies pass through each other | Pass through harmlessly | Normal damage | Existing KO rules |
| Friendly Fire ON | Pilot/tank/mech allies become solid (including local LAN) | Can damage armor/pilots; self-ricochet remains valid | Normal damage | Friendly pilot death counts but **no teammate KO points**, including TDM/CTF |

**FFA:** no teammates, policy always OFF, no change to existing FFA physical collisions. Policy is frozen at match creation; lobby rule changes require a new match / invalidate LAN guest readiness. Existing saved Custom setups, Quick Play/default settings and old LAN packets without the field default to OFF.

## Implemented source
- `friendlyFireEnabled()`, `solidOpponent()`, `projectileCanHit()` are shared authoritative game rules. Collision, vehicle-entry/exit clearance, actual step projectile body collision and side-effect-free A2 ballistic preview all refer to the same team relationship. Shooter self-hit still requires .38-second age and at least one bounce.
- `registerHit()` accepts friendly impacts **only** if FF ON. Real tank armor decreases and ejection applies. For scored pilot deaths, the unmodified scored kernel's `attacker:null` path records the death and respawn **without awarding KOs**. Host still has sole authority for damage and score; CTF flag carrier can drop due to a friendly hit.
- When FF ON, `botFriendlyLaneClear()` traces the **full current physical projectile lifetime** only on a bot's ready-to-fire tick, and suppresses firing if the first damage-eligible intercept is a teammate. It never predicts future teammate movement and cannot cancel an already-fired projectile. Pilot sidearms remain non-bouncing; vehicles have their real bounce cap. The A3 target planner also observes FF ON friend intercepts while evaluating shot candidates.
- Custom Match adds explicit Friendly Fire ON/OFF, displays correct summary, persists version-1 Custom presets and disables the control for FFA. LAN host lobby provides the same field; host-sanitized bool is broadcast in rules + authoritative match state. Guests see the policy but cannot modify it. Changing rules drops guest READY.
- Web and Android gameplay code and HTML are byte-mirrored. No new third-party files, new signing identity, CTF scoring goals, moving speed or permanent faction ID migration.

## Automated acceptance
1. New real-engine `tests/smoke.mjs`: both allied pilot and allied tank movement OFF pass-through / ON solid; enemy and FFA always solid; original maze wall blocking; Custom and LAN sanitizer; FF ON team-projectile eligibility, real scored team pilot death + **zero KOs**, Survival friendly life decrease without KOs, FF OFF friendly immunity and FFA auto OFF.
2. Real seeded **open-lane** AI trace: same team actor blocks host-authoritative shot with FF ON; FF OFF or empty lane allows shot. Early/late owner ricochet cases verified by actual policy, not brittle source-string inspection.
3. `tests/ballistic-trace-a2.mjs` unchanged and still required to pass; pilot/tank/mech physics unaffected.
4. `ctf-contested-human.yml`: real CTF matches, 300 Forward Bay seeds, scoring, Quick Play, saves/backup, pilot shot commit, enemy fire cues, 44 visual snapshots and prior compatibility tests. **Do not claim the full suite GREEN until the final same-game-source CI concludes.**
5. Physical Android and 2-phone LAN must check save continuity, FF ON lane obstruction/body overlap, teammate hits and HUD attribution, host-guest consistency, AI ally-safe firing, visibility and actual player feel. No on-device claim from Chromium.

## Follow-on B2
After B1 exact-source QA, add **optional low-opacity allied shot traces** only during genuine acquisition (nearby, on-screen and not wall-obscured); keep enemy paths concealed and amber ticks unchanged, avoid HUD clutter and network hidden-state leakage. This is a separate feature branch + owner visual acceptance. Full team factions, FFA color shuffle, rotating solo sides, LAN scored squads are still later stages C/D.

## Rollback
Keep B1 draft and unmerged. Tested v0.9.68 `experiment/bot-trace-aim-a3-v1` remains as developer branch and installable owner APK. A different Android preview requires same public test signer, a higher versionCode, CI + device update approval; **do not uninstall** existing preview or assume downgrading preserves data.

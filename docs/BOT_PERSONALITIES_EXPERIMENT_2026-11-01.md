# Sector Rebound — Custom Bot Personalities: Targeted & Overall Audit (2026-11-01)

**Automated result: PASS (not owner-playtest accepted).** Exact tested gameplay source `32c85753f560619f5097ecd6b226daa4c148c3b6`. [GitHub Actions 41283423851 — SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41283423851). Earlier [run 41283203819](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41283203819) failed on a **test-only hidden Reset button**; [run 41283303083](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41283303083) fixed the test setup, passed real browser/gameplay and responsive QA. No gameplay source changes were made between those and the final 300-seed added stress gate.

## Targeted AI audit

- Real Custom Match selection with `botSkill=varied`, 3 deterministic AI roles (Hunter/Sentinel/Scavenger), genuine bounded `botInput` movement and standard fire Boolean. PASS.
- Concrete tactical difference: same actual pickup at 390 units is **ignored by classic** while **scavenger approaches**. PASS.
- Saved Custom behavior survives app reload; Reset restores existing normal skill; ordinary Quick Play remains classic. PASS.
- **300 reproducible map seeds**, three sizes rotated, six actual simulation physics steps per seed = **1,800 physics steps**; no non-finite positions, invalid bot outputs or role errors. PASS.
- No new damage, armor, bullet speed/caps, aim tolerance, visibility or LAN protocol. Roles act only when explicitly selected in offline Custom.

## Overall regression

- Existing main Quick Play real-match start/end/After Action and rotation, fresh first-match hint and Team-only selections. PASS.
- Daily UTC-seeded scored FFA, same-seed retries, saved best records/backup. PASS.
- Existing simulation smoke and backup roundtrip/upgrade safety; Web and Android mirrors for JS/HTML/CSS/backup/daily service. PASS.
- Existing mobile/landscape browser visual checks (including 740×360, 915×412, 1280×720) and screenshot artifact [from run 41283423851](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41283423851). PASS.

## Limitations and remaining acceptance gates

- **NOT a real Android build or physical-phone acceptance**. The user has deferred physical testing. No same-handset thermal/frame-pacing input feel data.
- **NOT a measured bot-balance or fun judgment**: 300-seed safety proves valid code/movement, not intelligent bank shots, perceptible personalities, competitive fairness, or an optimized difficulty curve.
- No cross-phone LAN smoke was run on this experimental feature; default LAN was not changed. The stable `main` v0.9.21, draft integration PR #85 and Preview 100061 remain unchanged.
- No public store publishing, paid cosmetics or online gameplay initiated.

**Next safe step:** owner acceptance of the current main preview when available; optionally refine these personalities on phone and decide whether to promote this experiment. For further desktop-only development, isolate one optional arena theme/topology change and repeat the targeted + overall QA cycle. Rollback source is `131b0293` before personalities and `c4b7333` before Daily experiment.

---

# Sector Rebound — Custom Bot Personalities Experiment

**2026-11-01. Draft gameplay, no owner device approval.**

Branch: experiment/custom-bot-personalities-v1. Base: separately QA-reviewed Daily Sector candidate 131b0293. Stable main, unmerged integration PR #85 and Preview 100061 are unchanged.

## Experiment

One extra option under existing Custom Match BOT AI dropdown: **TACTICAL ROLES · EXPERIMENT**, saved as botSkill='varied' through existing v1 Custom draft/preset (no new storage key or version). Only explicitly chosen Custom matches enable it.

- Hunter: closes distance more assertively; unchanged firing angle tolerance, armor, damage and projectile count.
- Sentinel: holds visible firing lanes at 145–310 units and repositions when too close, with lower movement pace.
- Scavenger: prioritizes useful real pickup at up to 470 units versus normal 325; unchanged health and shooting.
- Three bot identities assigned deterministically by bot index. Use existing pathfinding, team/ally safety, and vehicle recovery.
- Original Quick Play, Daily Sector, LAN and non-varied Custom AI remain the previous behavior.

## Tests and exit criteria

Real browser new-bot QA must verify Custom opt-in selection/persistence, deterministic 3 roles, bounded true botInput, scavenger supply difference under same state, reload/reset and Quick Play independence. Full simulation smoke, existing Quick Play, saved backup, UTC challenge and responsive visual QA also run. Source and Android JS/HTML mirrored.

Still required: sample seeded multi-mode behavioral QA for accuracy/performance/regression, actual Android APK and owner physical input evaluation. Do not claim balanced difficulty or a completed player-facing release based on CI alone.

This feature is an experiment until an independent targeted audit and overall regression pass finish. Rollback: remove the experimental branch / restore base 131b0293.

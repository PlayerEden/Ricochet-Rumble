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

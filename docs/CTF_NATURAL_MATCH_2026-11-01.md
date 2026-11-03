# Sector Rebound — CTF Natural-Match Navigation & Teammate Yielding Audit (2026-11-01)

**Automated browser + regression PASS. Human/Android acceptance PENDING.**
Tested gameplay commit: `242458e392cf36a59bfa4484d93bf64c5a06ba01`.
[Passing GitHub Actions run 41289269320](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41289269320) |
[Download exact source-tested natural-match telemetry + UI screenshots artifact 13076830813](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41289269320/artifacts/13076830813).
This checkpoint is **experimental** on `experiment/ctf-natural-match-qa-v1`; stable `main`, draft integration PR #85 and Android Preview 100061 have not been changed or released.

## Issue discovered by a stricter, genuinely unassisted simulation

The preceding CTF objective-bot audit correctly proved actual bot pickup/capture mechanics, but relocated actors to objective sites. We created a new real-engine Chromium fixture that never relocates any actor, shortens bay distances, boosts speed/damage, changes shooting accuracy, or bypasses normal collisions.

The first natural run revealed a large-map deadlock: Coral's runner repeatedly pushed against Coral's defender near their starting corridor instead of proceeding toward Cyan's flag. The graph route was valid, but two friendly physical vehicles faced head-on. The defender was close enough to its assigned bay to hold position; the runner could not pass. Diagnostic records identified runner cell 86 with next waypoint 85; positions stayed almost unchanged for 180 simulated seconds.

## CTF-only gameplay repair

`web/game.js` and `android/app/src/main/assets/game.js` were updated byte-identically.
For CTF objective bots only:
- If another live friendly bot is within 110 units, ahead of the bot and in approximately the same narrow travel lane, attempt a **normal, physical, right-hand pass** using the existing steering and wall/actor collision machinery.
- Retain the selected passing side while the obstruction lasts. This prevents earlier left-right oscillations near the corridor boundary.
- At the wall edge, continue forward rather than reversing lanes.
- Temporarily release the defender's normal hold-distance condition while yielding, so the two allies can actually move past one another.

No collision bypass, teleport, damage/health buff, bullet/accuracy change, LAN rule, unrelated game mode or pilot input change was introduced.

## Actual unassisted Chromium runs — 60Hz real physics

| Seed / maze | Observed period | First real flag pickup | Actual flag captures | Result |
| --- | ---: | ---: | ---: | --- |
| 101 / small | 95.93s | 18.77s | 3 | Coral victory, 3–0 |
| 202 / standard | 360s | 137.57s | 1 | Time limit, Coral leads 1–0 |
| 303 / large | 180s | 41.23s | 0 | Test observation ended before match clock |

Additional validated diagnostics:
- **Small:** runner physically traveled ~12,402 world units; max displacement from start ~822; minimum distance to Cyan flag improved by ~781.
- **Standard:** runner traveled ~34,566; max displacement ~1,721; minimum distance improved by ~1,517. CTF captured once through ordinary rules.
- **Large:** runner traveled ~22,731; max displacement ~2,058; minimum distance improved by ~1,816, reaching within ~23 world units of Cyan's flag. Its first pickup occurred at ~41s; subsequent picks/drops exposed survival and return-path opportunities. **Large-map traversal is now genuinely demonstrated, but a large-map capture is not yet proved.**
- Defender stayed within 180 units of Coral's Forward Bay throughout these three sampled periods; the escort remained within 170 units of Cyan's player for ~49% (small), 64% (standard), 43% (large) of frames. These are measurements, **not claims of optimized tactical positioning**.
- No invalid positions, non-respawn teleports, runtime exceptions or altered game data. Test explicitly requires >200 world units of distance-to-flag improvement on large maps to prevent the earlier near-stationary baseline passing.

All the same passing workflow also covered CTF flag/role contracts, Web/Android gameplay byte-parity, foundation smoke tests, saved-backup compatibility, previous objective-bot real capture, 300-seed Forward Bay generation, CTF player rules, Quick Play/browser entry, stale-backup regression and visual QA.

## Remaining acceptance gates / next roadmap

1. Run more seeds and full 360s matches in every map class; characterize completion rates, long-corridor deadlocks, pickup/drop/capture rates and intervention effects rather than making claims from only three seeds.
2. Observe enemy flag carrier interception and defensive combat decisions in natural live matches. The three sampled matches showed defensive holding, but not meaningful examples of the defender pursuing a stolen Coral flag.
3. Tune escort spacing and defender lane occupancy **only if repeatable gameplay evidence supports it**. Maintain real collisions and fair bot combat.
4. Owner physical Android touch/FPS/comfort evaluation and later two-phone LAN/CTF authority/flag replication remain **unimplemented or unverified**. No experimental APK or production release is authorized.

## Rollback and provenance

- Latest source-tested CTF navigation commit: `242458e392cf36a59bfa4484d93bf64c5a06ba01`.
- Prior accepted objective-bot baseline (before this experiment): `29fe21eea593f4850f300c8ad85316366831c114` on `experiment/ctf-objective-bots-v1`.
- Flag-only baseline: `4e922f95f0e7463b60cfe3eea002d5a55a4018c4`.
- Keep stable `main`, PR #85 and Preview 100061 untouched while this CTF branch is reviewed. Physical player acceptance is a distinct gate from automated CI.

Development protocol: **isolated gameplay change → targeted natural-match test → complete regression → archive exact-source evidence → expand seed coverage before LAN integration**.

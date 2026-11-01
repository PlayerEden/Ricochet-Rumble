# Sector Rebound — Daily Sector offline experiment (2026-11-01)

**Branch:** `experiment/daily-sector-offline-v1` based on draft integration commit `c4b7333`. **Status: FOUNDATION CONTRACT — NOT A PLAYABLE MODE YET.** Owner asked to continue productive JavaScript/Android development while Quick independently evaluates Godot.

## Decision
Daily Sector is a small opt-in **offline** addition, separate from Quick Play shuffle and the Dossier's normal earned cosmetics. Each UTC day has a deterministic **shared arena seed** (versioned FNV-1a salt), fixed 1 human vs 3 AI scored-FFA settings, 10 operator KOs / 4 minute target inherited from the already tested scored-FFA kernel, and at most 31 days of local personal-best records.

**Important:** Same seed means same procedural maze, not the same AI decisions, pickups, exact spawn outcomes, global ranking or synchronized score. Device UTC clock can be adjusted; this is *not* a secure or competitive daily leaderboard. Never claim global fairness. No login/server, ads or telemetry.

## Source foundation (current)
`web/daily-sector.js` + byte-identical `android/app/src/main/assets/daily-sector.js` provide:
- Strict UTC date handling including leap/year boundary, seeded map contract, fixed match options.
- Exactly-one local record per scored match attempt key; tie-break: outcome (win > draw > loss), KOs descending, deaths ascending, duration ascending.
- Strict bounded `rr-daily-sector-v1` schema: 31 UTC days and 32 recent attempt IDs. Reject corrupted/future versions, negative stats and quota errors.
- **Not yet referenced in HTML or gameplay**; existing game, Quick Play, saved Dossier and existing 5-key backup remain unchanged until an independently tested integration slice is approved.

## Next slice (separate, QA-gated)
1. Wire pure module without changing established match defaults.
2. Add one **DAILY SECTOR** opt-in button outside the existing four-mode grid (preserve tests and responsive UI), show UTC day and personal best.
3. Launch scored vehicle FFA with fixed daily seed and sensible results; DAILY rematch reruns **same** seed, unlike regular NEXT MATCH.
4. Keep Daily attempt storage separate; normal Dossier/earned cosmetic milestones must **not** increment from farming repeat attempts.
5. Extend backup export/import allowlist and validator for the optional daily record, retaining full compatibility with old five-key backups. Add real Chromium live-flow tests for rollover, finish, duplicate record, fresh launch and replay, result UI and responsive geometry.
6. Build isolated Android signed preview only after exact-source fast browser/simulation and user acceptance of the concept. No automatic merge or production release.

## Run tests without a device
`node tests/daily-sector.mjs`, plus standard fast smoke for unchanged existing gameplay. Do not rename repository, mutate stable main or mix this into Quick's Godot experiment.

**Owner acceptance still pending** on original Preview 100061 and two-phone LAN; experimental code must not override any owner-approved controls or visuals.

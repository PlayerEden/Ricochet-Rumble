## Daily Sector end-to-end browser milestone accepted for further experimentation — 2026-11-01

Source `131b02939a51e4f33c2b812df8dd85e473688c0a` passed [exact-commit scoped CI 41282942359](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41282942359): deterministic UTC contract, full preexisting simulation smoke, old/new backup compatibility, actual Chromium Daily launch/finish/retry/reload and truthful pause/restart, regular Quick Play live match regression, fresh first match, and UI comparison screenshots. Android/web service, gameplay, HTML/CSS and backup files were byte-compared. No reported uncaught page errors or test failures.

**Still pending:** actual phone controls, Android install-over save migration, release-signed Android package, owner approval, and broader offline usability tests. Daily stays experimental. Original Preview 100061, stable main and integrated PR #85 remain unchanged.

---

# Daily Sector — implementation audit and acceptance record (2026-11-01)

**Current status:** full scoped browser QA success at source `0a97879058e682d23da4b3c9f2c16b898e2e1f74` — [run 41282417257](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41282417257). The exact-script full run included:

- Deterministic UTC-day seed, leap/date validations, same-date fixed scored vehicle FFA, 31-day bounded and future-version-fail-closed personal best store. PASS.
- Live Chromium: choose mode at 740×360, original four specialist choices unchanged, proper Back, daily start, real 4-minute scored match termination, daily result and exactly-once record, same-seed rematch, no Dossier rewards, direct manual backup export/preview, reload. PASS.
- Existing fast gameplay/physics smoke, backup regression, Quick Play live flow, first-session mode, stale-export protection, responsive layout QA. PASS. HTML/JS/CSS Android mirror parity preserved for all changed assets. No owner physical Android evidence.

**Audit-driven correction now in progress:** Daily retries keep the *same* maze, so pausing/restarting/rematching should never say a “new field” or “today's sector” when an attempt can cross midnight UTC. Replace the relevant prompts with “RETRY SAME SECTOR / SAME DAILY SECTOR”; run the live Chromium checks including cancelled restart confirmation. Daily launch from the main menu always selects the new UTC day; retries of a session begun before midnight intentionally retain their original date to avoid reassigning completed attempts.

**Remaining gates:** run exact-head CI after wording changes, full Android build/API and physical phone install, touch comfort/save migration, owner approval of Daily as a new player-facing mode; then consider a separately signed preview. Stable `main`, existing Preview 100061 and draft integration PR #85 are not touched by this experimental branch. No global ranking or server-backed fairness claims.

---

## 2026-11-01 — Daily full gameplay and UI regression expansion

The experiment's dedicated CI now includes the existing *actual* Quick Play live combat flow, fresh first-match entry, backup-stale-export protection and three-landscape-size visual scenes in addition to its daily mode end-to-end. The new Daily Sector results note names the actual saved best outcome and uses a correct singular/plural attempt count. Remaining acceptance: full CI on exact source, Android test build (not yet created), physical owner input and phone save validation. This remains opt-in experimental and cannot affect stable main or PR #85.

---

## 2026-11-01 — PLAYABLE DAILY SECTOR EXPERIMENT WIRED (PENDING BROWSER QA)

Implemented on isolated experiment branch: an opt-in DAiLY SECTOR button below the unchanged four-mode grid. The JS engine lazily loads the already QA-passed offline daily module, launches fixed scored-FFA with the UTC date seed, and reuses that same seed on Retry. HUD and results call record exactly once per game; local best/attempts replace the footer. No daily entry in Quick Play shuffle, Dossier progress or earned cosmetics. Existing five-key manual backup is backwards compatible; new sixth optional daily key validated strictly. No main, integration PR #85, signer, Google Play, native LAN or normal game modes changed.

**Not ready for owner installation:** pending real browser flow, safe backup roundtrip and mobile viewport checks on exact branch SHA.

---

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

# v0.9.39 — PASS, with explicit manual restrictions

- **Exact verified gameplay/test SHA:** `77adb43e8c999fe37d50f8b940612af561d9845a`.
- **Fast regression PASS:** [GitHub Actions 40987749714](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40987749714) — syntax, byte-for-byte Android/Web dossier/scored/game/HTML/CSS mirrors, actual 300 seeded mazes, existing scored/Quick Play/LAN/Custom regressions, independent profile corruption/version/dedup/denied-storage and no-entitlement tests.
- **Full Chromium and Android QA PASS:** [40987749740](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40987749740) — real completed offline results update service record once, HUD refresh doesn't duplicate it, reload recovers data, per-mode display and locked future cosmetic preview, 740x360/915x412/1280x720 landscape touch target checks; debug APK and unsigned AAB built. The workflow passed.
- **Exact original passing QA APK archived:** [immutable v0.9.39 test prerelease](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.39-player-dossier-test) with byte-identical Android debug APK, QA ZIP and checksums. [One-use archival job 40988277030 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40988277030); workflow removed.
- **Nothing invented or granted:** local stats begin at zero unless pre-existing valid same-schema service record; only actual offline Solo-vs-bot completion contributes, never practice/abandoned/2-phone LAN; art/premium and earned future pilot icons remain unapproved and unselectable.
- **Manual gates OPEN:** physical phone navigation, localStorage survival across app upgrade and uninstall, debug signing mismatch, actual owner controls/audio/music/AI fun, two-phone LAN, art/rights and store catalog sign-off, production identity/signing/Play review. Green CI does not establish any of these.
- **Source status:** new dossier script + UI + CSS and corresponding byte mirrors. Stable `main` unmodified; PR #58 remains draft on parent experiment. Owner approval mandatory before integration.

---

# v0.9.39 — local Player Dossier and future cosmetic eligibility audit

**Experimental code milestone.** Branch `feature/player-dossier-local-v0939` depends on QA-only v0.9.38 PR #57 and all prior unmerged gameplay drafts. No production merge or Google Play claims.

## Actual implementation
- New accessible PLAYER DOSSIER screen directly from home header, including cumulative matches, victories/defeats/draws, genuine pilot KOs, deaths, play minutes, and breakdown by existing Solo/Team Survival, CQC, scored FFA and scored TDM.
- Stores only **completed offline one-human Solo matches with at least one bot**. Requires existing immutable combat-generated v1 `finalResult`; never counts zero-bot practice, abandoned/restarted matches, unconfirmed LAN guest/host, or local dual-player sessions. Each finished match has a unique per-session and matchID/seed key; HUD refresh cannot record twice. Counts use real solo result, **not simulations, test seeds or past invented history**.
- Self-contained versioned `rr-dossier-v1` localStorage key, separate from `rr-options-v06` and `rr-custom-v1` preferences/presets. Allowlist modes, safe bounded stats, and cap recent match IDs to 64. Schema version greater than 1 is **read-only** (never downgraded). Malformed/old JSON is copied to a recovery backup before being replaced, or treated read-only if backup fails. Writes are committed to UI state only after storage succeeds; a blocked/quota error remains explicit. No automatic fake credits or balances.
- Displays future pilot icon **eligibility preview only**, using the identifiers and *proposed* earned conditions from `game-data/cosmetics/pilot_icons.v1.json`. Existing art is unapproved and the catalog explicitly `authorizedForRuntime: false`; no equip buttons, inventory grants, purchases, checkout, Google Play entitlement, gacha, gameplay modifiers, or monetization. Recovery-dependent concept remains NOT TRACKED until real vehicle recovery metrics exist. Eligibility does not establish a cosmetic entitlement.
- No network/account/cloud sync. Data stays on device; uninstall may erase it and Android debug signature changes may require uninstall. No customer-data collection or analytics.

## Required quality gates
- [ ] Fast test: source syntax and byte mirror of new Web+Android JS, 300 procedural regression seeds, existing gameplay/scored/CQC/TDM/LAN regression, standalone v1 profile data corruption/unknown version/backup failure/quota/dedupe/integrity tests
- [ ] Real Chromium: a legitimate completed match records exactly once; repeated HUD does not multiply stats; page reload retains record; another match increments; no false cosmetics; dossier portrait/landscape responsive/touch controls (740x360, 915x412, 1280x720)
- [ ] No Quick Play, Custom Match, LAN, cosmetic manifest or older save key was changed/erased
- [ ] Full visual and mobile touch QA + debug Android APK and unsigned AAB from *exact same* passing gameplay/test SHA
- [ ] Exact QA-tested APK preserved as immutable prerelease, with QA ZIP and SHA256
- [ ] Owner Android physical acceptance and app-upgrade data persistence remain **pending**
- [ ] Subsequent independently audited cosmetic equip pipeline only AFTER art/license/product status approves runtime; future local profile migration/import/export and cloud accounts not yet developed

**No fake cosmetic grants. No pay-to-win. No assumed old stats.** This milestone is data foundation + real dossier, not a storefront or online account.

**CI dispatch note:** PR #58 temporarily targets main because the existing fast/full PR workflows listen only to main. Restore the draft to its direct parent QA branch when the automated gate completes. This is not merge approval.

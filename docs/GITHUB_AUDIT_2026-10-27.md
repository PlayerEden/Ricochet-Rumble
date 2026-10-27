# Sector Rebound — GitHub Structure & Readiness Audit

**Audited:** 2026-10-27. **Repository:** [PlayerEden/Ricochet-Rumble](https://github.com/PlayerEden/Ricochet-Rumble) (public). **Scope:** source layout, commit/PR graph, branch/tag/release references, workflows, Android config, smoke/visual QA, release evidence, documentation and secrets-handling signals. This is a repository/CI inspection, **not** a physical-device security penetration test or a claim that newly run builds passed.

## Overall result

**Work is recoverable; maintenance risk is meaningful.** The v0.9.21 gameplay is preserved in a separate development branch and a published Android debug preview, and the v0.9.21 full build/QA run succeeded. However, `main` still carries the older v0.6.3 runtime, 17 older/chained draft PRs remain open, preview build workflows depend on hard-coded version branches, and several release/security/QA handoff decisions are pending.

### Verified inventory

| Check | Result |
| --- | --- |
| Default branch | `main`, historical v0.6.3 game with current handoff docs |
| Latest development | `dev/sector-rebound-polish-v0921`; open draft [PR #17](https://github.com/PlayerEden/Ricochet-Rumble/pull/17), source SHA `29c10fd7165c263dd33e23e28c7762df55572e14` at audit time |
| Branches / PRs | 28 branches; 17 open draft PRs, most chained to predecessor branches; no standalone open issues before this audit |
| Branch divergence | `main...dev/sector-rebound-polish-v0921`: dev ahead 313 commits, behind 5 (main-only documentation commits). Do not equate commit counts with unique gameplay changes |
| Latest permanent APK | [v0.9.21 pre-release](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.21-polish-preview) contains `app-debug.apk`, 84,049 bytes; debug-signed, **not** a Play-ready AAB |
| Previous permanent APKs | v0.9.20 and v0.9.19 pre-releases also exist |
| Automated QA | [Run 40587475575](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40587475575) **passed**, source SHA `fe21cfd195afcc9aa73f8b69519adcb591ca8adc` |
| Latest code vs QA | Only the QA Markdown document changed after that CI SHA; game JS/HTML/CSS are unchanged |
| Android/web source parity | All three pairs (game.js, index.html, style.css) have identical Git blob hashes between `web/` and Android-bundled assets on the v0.9.21 branch |
| Tests and static QA | One `tests/smoke.mjs` file (~62 KB; 386 assertion calls), deterministic browser visual QA, cosmetic catalog validator. This counts test statements, **not** verified coverage percentage |
| Release build provenance | v0.9.21 release tag points to `1a2253e32210059b2d9d5e3480c625d0562782cf`, five commits before the latest dev head; later changes are README/workflow/tests/audit docs, **not gameplay assets** |
| Manual testing | Physical two-phone LAN, Android music mix, pilot readability/controls and long play sessions are **not** documented as accepted |
| GitHub protection | Repository rulesets collection returned empty; branch protection endpoint returned 403 to integration. **Branch protection cannot be verified from this access.** |

### Findings by priority

| Priority | Finding | Risk / next action |
| --- | --- | --- |
| **High** | Default main's runtime is older than development; 17 dependent draft PRs | Prepare a separate reviewed integration candidate; preserve previous commits, PRs and APKs. See [#18](https://github.com/PlayerEden/Ricochet-Rumble/issues/18). |
| **High** | Android build and publication workflows are hard-coded to v0.9.21; push filters match only their own workflow YAML file | Future gameplay changes could receive no full Android CI by default. Add lightweight source-change checks and explicit versioned release candidate builds without wasting Actions minutes. See [#19](https://github.com/PlayerEden/Ricochet-Rumble/issues/19). |
| **High** | Public repo contains an **encrypted** signing backup | No plaintext signing key or decryption password was established in this audit, so **do not claim a compromise**. Verify private recovery and credentials before deleting/changing any backup; decide whether replacement/rotation is appropriate. See [#20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20). |
| **Medium** | Existing release workflow uses a fixed tag and `--clobber` on a pre-existing release asset | Can replace bytes under the same publicly advertised tag. Use immutable per-build tags and build SHA/checksum provenance. See [#19](https://github.com/PlayerEden/Ricochet-Rumble/issues/19). |
| **Medium** | Run reports and visual screenshots are retained only for 14 days; current v0.9.21 screenshots/reports expire **2026-11-10** | Archive curated, actual in-game screenshots and reproducible seeds or attach to releases, without committing entire temporary test suites. See [#21](https://github.com/PlayerEden/Ricochet-Rumble/issues/21). |
| **Medium** | Android package is still `com.playereden.ricochetrumble` under new public name; signing is not a production Play setup | Settle identity and secure Play signing **before publication**. See [#20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20). |
| **Medium** | Wi-Fi implementation exists but is not physically accepted | Complete host/guest tests on two real devices and document known failures. See [#22](https://github.com/PlayerEden/Ricochet-Rumble/issues/22). |
| **Medium** | No `gradlew` wrapper or version-pinned Gradle distribution committed | CI explicitly provisions Gradle 8.13, but local reproducibility still depends on tooling installed outside the repo; decide on committing wrapper after reviewing wrapper provenance. |
| **Low** | No root LICENSE, CONTRIBUTING, standalone issue templates, or centralized branch retirement register | Public does **not** imply open-source. Decide intentional licensing. Keep README concise and point to status/protocol; use the PR template introduced with this audit. |
| **Low** | Source is a fairly monolithic `web/game.js` (~88 KB), mirrored into Android assets | Fine for a working prototype but grows change/conflict risk. A later modularization should preserve asset parity and deterministic tests, not interrupt v0.9.22. |

### What is **not** missing

- The [development status/handoff](PROJECT_STATUS.md) and [working protocol](DEVELOPMENT_PROTOCOL.md) on `main`.
- The [v1.0 plan](https://github.com/PlayerEden/Ricochet-Rumble/blob/dev/sector-rebound-polish-v0921/docs/ROADMAP_TO_GOOGLE_PLAY_V1.md), [match modes](https://github.com/PlayerEden/Ricochet-Rumble/blob/dev/sector-rebound-polish-v0921/docs/design/20_MATCH_MODES_BIBLE_DRAFT.md), [Quick Play flow](https://github.com/PlayerEden/Ricochet-Rumble/blob/dev/sector-rebound-polish-v0921/docs/design/23_QUICK_PLAY_AFTER_ACTION_BIBLE_DRAFT.md), [procedural arena identity](https://github.com/PlayerEden/Ricochet-Rumble/blob/dev/sector-rebound-polish-v0921/docs/design/24_PROCEDURAL_ARENAS_IDENTITY_DRAFT.md), and FIELDGRID design documents on the development branch.
- Previous version branches, three release APKs, saved source art prototypes, Android API 36 debug and unsigned-AAB build capability.
- Existing extensive headless gameplay regression suite. **Scope gaps still need tests**, especially real network/device conditions and new v0.9.22 flow.

### Next action order

1. **Preserve:** Keep v0.9.21 preview, v0.9.20 checkpoint, known-good releases/tags and source branches untouched. Keep GitHub status current.
2. **Make CI/release repeatable:** Create reliable low-cost change checks and an intentional signed/unsigned release artifact pipeline that does not overwrite old tags.
3. **Integrate deliberately:** Review full mainline candidate + reconcile default-branch handoff docs, test exact merge commit, then merge only after approval.
4. **Finish acceptance:** Real phone audio/pilot/camera and two-phone LAN; save results with source SHA and screenshots.
5. **Continue Gate 2:** Develop v0.9.22 mode IDs, verified end-of-round stats, shuffled Quick Play and an independently generated sector for every NEXT MATCH.
6. **Before Play:** Final app ID, secure production signing, privacy/Data safety, billing only if actually implemented, user testing and release/legal review.

## Keeping the next chat recoverable

The latest handoff remains [PROJECT_STATUS.md](PROJECT_STATUS.md); don't treat this audit as a replacement. The open issues above are the work queue. If a finding is fixed, close its issue with test evidence and update the handoff; don't erase historical audit observations to make them appear as if they never occurred.

**Scope limits:** GitHub reported past test results; this audit did not execute Android on physical hardware, compile code locally, test a two-device connection, or obtain admin-only branch-protection details.
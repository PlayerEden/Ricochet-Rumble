# Sector Rebound — Release-Candidate Integration Audit
**Audit date:** 2026-11-01  
**Scope:** source, PR delta, CI/Android package, local saves, LAN, preview signing and Play gates; **no physical phone or production signing exercised**  
**Reviewed integration branch:** `integration/v0956-main-rooted-rehearsal` at `19ebede4f66a32c021605dd31f56a38a7bd4a7c0`  
**Source PR:** [#85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85) — **DRAFT, OPEN, MERGEABLE; DO NOT MERGE WITHOUT OWNER RELEASE APPROVAL**

## Decision

- **Engineering integration check: PASS (automated scope).** No new runtime regression or critical source-level defect was identified in the reviewed evidence; these checks do **not** prove the absence of defects.
- **Physical Android player acceptance: PENDING.** Neither the owner's installed save state nor real-phone controls, sustained FPS, thermals and actual two-device Wi-Fi were inspected.
- **Public Google Play release: NO-GO.** The current fail-closed release preflight reports **9 PASS / 10 PENDING**; none may be silently waived.
- **Development decision:** preserve approved P-03 pilot, tank/pilot MOVE/FIRE handling, Version A icon, industrial interface, offline earned cosmetics, score rules and same-Wi-Fi architecture. Avoid a renderer rewrite or new major feature while acceptance is pending.

## PR integration delta and release hygiene

[Main → PR source comparison](https://github.com/PlayerEden/Ricochet-Rumble/compare/main...integration/v0956-main-rooted-rehearsal): **97 commits ahead, 0 behind, 119 changed files**, including Android, browser, tests, workflows and documentation. Reported change types in review are additions/modifications, not an intentional deletion pass. The branch is mergeable; being mergeable and green is **not** authorization to promote it. Stable `main` retains the accepted v0.9.21 fallback.

The last integration commit `19ebede` changed README, competitive/performance audit and repository rename playbook **only**. It did **not** change game/WebView/Java source. Exact source used by the automatic preview is the preceding runtime commit `b30bed1`. The repository remains named `PlayerEden/Ricochet-Rumble`; rename is deferred, and **no Android package / Java namespace / DNS-SD identity rename** is part of this work.

## Automated checks — 2026-11-01 verified

| Gate | Run / concrete proof | Verdict |
| --- | --- | --- |
| Fast source regression and source/Android parity | [41272978351](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41272978351), PR head `19ebede` | PASS |
| Full headless Chromium/Android build and visuals | [41272978493](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41272978493), PR head `19ebede` | PASS |
| Android API 35 emulator, 100041 → 100050 install-over | [41272978476](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41272978476): `ANDROID_EMULATOR_PACKAGE_UPGRADE_PASS`, app-private canary persists | PASS for **emulator file canary only** |
| Disposable same-certificate **test-only** preview | [41272296788](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41272296788), runtime `b30bed1`; `com.playereden.ricochetrumble.preview`, versionCode **100059**, pinned **PUBLIC AOSP test certificate** | PASS build/identity; **NOT official production or physical upgrade proof** |
| Match longevity and state integrity | Full QA `MIXED_MODE_SOAK_REAL_BROWSER_PASS`: 30 starts/rematches in five modes, 7,200 real JS physics steps | PASS synthetic environment |
| LAN malformed peer state and bounds | `LAN_FAULT_INJECTION_REAL_BROWSER_PASS`: 12 malformed states dropped; JVM bounded reader and input normalization tests pass | PASS automated; not genuine device LAN |
| Rendering / layout | 270 measured Canvas frames, 810 pipeline samples, 102 layout scenes, 0 layout failures/warnings | PASS **headless Chromium only**, no Android sustained FPS |
| Data backup | `BACKUP_STALE_EXPORT_REAL_BROWSER_PASS`; `PREVIEW_TO_PLAY_MANUAL_TRANSFER_BROWSER_PASS` across two separate browser profiles and five stored records | PASS browser storage; physical save migration not verified |
| Debug packaging | `ANDROID_PACKAGE_ATTESTATION_PASS`, six WebView asset mirrors; unsigned AAB builds | PASS QA artifact; NOT signed Play package |

The PR-triggered CI checkout can use a synthetic *merge commit* rather than the PR branch commit itself; do not confuse the build's internal `source` field with the public PR head. Reported green run is associated with PR head `19ebede`; the unchanged runtime was also tested at `b30bed1`.

## Open findings ranked by consequence

### RC-01 — P0 release blocker: signed Android distribution and *owner-phone* save continuity

Ordinary full QA debug APK uses package `com.playereden.ricochetrumble`, versionCode **50**, with a CI-generated debug signer; it **cannot be assumed** to update the owner's installed `.preview`. Automatic test preview **100059** uses `com.playereden.ricochetrumble.preview` and the fixed, **publicly known AOSP test signing certificate** SHA-256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`. Use only for disposable local experiments, not production or sensitive user data. Its ZIP artifact is [here](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41272296788/artifacts/13070315265) (14-day Actions retention). Do not tell the owner to install any newer/lower code without first identifying the installed package, versionCode and signer. **No uninstall to fix signing conflicts when unsaved progress matters.**

For stable future preview signing, the owner-private workflow is drafted but is **main-only and not yet active on default `main`**; no private key is present or verified. Do not merge the large game PR solely to enable that workflow or assume the private key exists. Owners should do a real version-N → version-N+1 install-over while checking actual WebView Dossier/Hangar/Custom data on their device; emulator's file canary is insufficient. Production Play signing is **separate**. [Preview architecture](ISOLATED_ANDROID_PREVIEW_v0958.md), [device test card](OWNER_ANDROID_ACCEPTANCE_2026-10-31.md).

### RC-02 — P0 before advertising LAN: genuine two-phone host/guest play

Two-browser LAN lobby tests cover 1v1 zero bots, Ready/Start, host revisions, no phantom bots, results and rules/rematch. But Android NSD discovery, real same-Wi-Fi input latency, disconnect/rejoin, NAT/guest-Wi-Fi isolation and two actual physical devices are **not** accepted. **Do not claim internet multiplayer or certified local LAN.** For a Solo-first Google Play beta, obtain an explicit scope decision and remove LAN from all public claims until two-phone acceptance; leave native LAN beta code only after reviewing the scope and policy. The current store draft already excludes advertising LAN.

### RC-03 — P0 before Play: ten recorded publication items

[Latest fast QA preflight](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41272978351) explicitly reports **RELEASE_NO_GO: 9 PASS / 10 PENDING**:
1. approved 512×512 Play icon as a final source artifact
2. approved 1024×500 feature image as a final source artifact
3. final authentic store screenshot assets
4. hosted accessible HTTPS privacy policy URL (draft currently has publisher/contact placeholders and `noindex`)
5. completed Data safety/actual app behavior review
6. private production signed AAB
7. actual device install-over / user-data retention
8. real two-phone LAN approval **or explicit scope reduction**
9. completed Play Console account/content/testing setup
10. explicit owner release sign-off.

The existing generated screenshots/graphic are **candidates**, not approved store assets; in-app Help privacy text alone is not a hosted public policy. Do not use old generic CI signing for the final Play AAB.

### RC-04 — P1 documentation drift between milestones

Long chronological `PROJECT_STATUS.md` and older approval documents mention preceding preview codes and historical branch divergence; read the **newest audit header first** and the active PR. Retain historical records rather than rewriting them as if they had never happened. The repository rename remains deferred with a prepared checklist in [REPOSITORY_RENAME_PLAN_2026-11-01.md](REPOSITORY_RENAME_PLAN_2026-11-01.md).

### RC-05 — P2 optimization decision needs real hardware evidence

Profiling establishes bounded state packets in tested nine scenes and no headless-browser fault. It does **not** establish phone FPS or 20–30 minute thermal stability. Do not optimize cached floor layers, change shot timing, or alter tank turning without genuine observed latency/jank and an isolated A/B + screenshot QA. [Performance audit](COMPETITIVE_PERFORMANCE_DELTA_2026-11-01.md).

## Execution sequence — next safe steps

1. **No-phone work:** preserve this audited checkpoint, confirm updated PR CI, reconcile current/live docs, store only approved nonsecret assets and leave exact rollback breadcrumbs. No runtime change justified by this audit.
2. **Owner one-phone acceptance:** establish installed package/certificate/code and backed-up local data first; select a *compatible* higher-code test APK, test install-over without uninstall, confirm Dossier/Hangar/Settings/Custom and Solo Quick Play across interrupt/resume. Record phone results in [acceptance card](OWNER_ANDROID_ACCEPTANCE_2026-10-31.md).
3. **Two-phone acceptance:** same-Wi-Fi discovery/host/join, precisely two humans/no bots, both fire/eject, win/loss, Ready/rematch/rule changes, disconnect/reconnect. If unavailable, deliberately choose Solo-first public scope.
4. **Play preflight:** final assets, real publisher/contact, privacy HTTPS URL, audience/Data safety and content declarations, private Play upload signer, exact-source signed AAB, Play test track as applicable.
5. Only **after owner approval and device evidence**, select audited PR merge strategy, run post-merge CI and install tests, tag a rollback-safe candidate and initiate closed testing. No automatic release, branch force-push or package rename.

**Audit limitation:** This is a GitHub-source and existing CI evidence review, not a personally executed Android hardware test, a new full manual gameplay playthrough, or a certification of app security. Nothing in this audit grants launch permission.

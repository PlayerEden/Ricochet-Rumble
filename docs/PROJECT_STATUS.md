# Sector Rebound — Current Project Status

**Updated:** November 3, 2026 (M6 focus-loss pause merged; local reload QA pending) · **Single active source of truth: [`main`](https://github.com/PlayerEden/Ricochet-Rumble/tree/main).** No alternate game branches to maintain. Historical drafts, source checkpoints, older APKs and PR discussions remain available in the [archive index](ARCHIVE_INDEX.md); they do **not** need to be merged or rebuilt again. [Previous longer status and its exact provenance](https://github.com/PlayerEden/Ricochet-Rumble/blob/2bdd4285b1e403da06cc8c1f89937de5529a1928/docs/PROJECT_STATUS.md).

## Locked / owner-approved for now

The owner reports Sector Rebound's **v0.9.78 camera and current AI feel good for now**. Preserve the established tank/mech/pilot movement, shot timing and controls. Camera targets: **pilot 0.94, tank 0.73, mech 0.69**. The wider view made AI feel almost ideally balanced between easy and challenging. Future adjustment is possible by explicit owner request or observed gameplay defect; do not retune casually.

**Two physical Android phones are not currently available.** Actual Wi-Fi host/guest, spectator, JOIN NEXT, recovery and disconnect phone validation remain **deferred**, not complete. Browser/JVM integration can continue without treating two-browser results as real hardware acceptance. Google Play public launch remains **NO-GO**.

## Current merged features and exact evidence

| Workstream | In main | What CI and owner verified |
| --- | --- | --- |
| Camera and AI fairness | [Camera fine-tune PR #118](https://github.com/PlayerEden/Ricochet-Rumble/pull/118), CI green | Owner tested and approved qualitative combat/camera feel; save retention and two-phone LAN are separate |
| Solo onboarding | [Practice PR #122](https://github.com/PlayerEden/Ricochet-Rumble/pull/122) | No-bot training from Help/Choose Mode; saved Quick Play settings unaffected in real Chromium QA |
| Offline backup and share | [Share PR #125](https://github.com/PlayerEden/Ricochet-Rumble/pull/125), merged SHA `32e69bd42cae41c7d81552e1813028873afca138` | **7/7 applicable CI PASS**, including [real Android/visual build #41717538094](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41717538094) and [browser regression #41717538124](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41717538124). User-initiated text share; physical share target/retention not independently verified |
| **Save/restore recovery safety** | [M5 PR #127](https://github.com/PlayerEden/Ricochet-Rumble/pull/127), runtime merged SHA `9e9d507ba1221dbfdffa6fc2195c67d1d750bb8a` | **All applicable PR CI green**, including [canonical browser/save #41720452902](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41720452902); denied storage reads and silent truncated recovery are now fail-closed with exact-byte snapshot verification and rollback. Web/Android assets identical |
| **Android focus-loss pause** | [M6 PR #129](https://github.com/PlayerEden/Ricochet-Rumble/pull/129), merged source `cc05dacb86d728199a6b25f1a4709184970f55e6` | All six applicable checks PASS, including [native Android/visual build #41723225149](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41723225149) and [real Chromium pause/input/data preservation #41723225213](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41723225213). Notification shade/focus loss now requests a pause and **never auto-resumes**; physical phone acceptance still pending. [Owner test guide](M6_ANDROID_FOCUS_LIFECYCLE_2026-11-03.md) |
| LAN host, bots, spectator/queue/recovery | [Spectator #105](https://github.com/PlayerEden/Ricochet-Rumble/pull/105), [queue #108](https://github.com/PlayerEden/Ricochet-Rumble/pull/108), [native reaccept #110](https://github.com/PlayerEden/Ricochet-Rumble/pull/110), [recovery #111](https://github.com/PlayerEden/Ricochet-Rumble/pull/111) | Browser/JVM/Android code tests PASS. Two real phones **not yet** |

## Android owner build — one current version

**Consolidated, owner-compatible, internal preview:** **`0.9.80-main.1`**, versionCode **420001**, app ID **`com.playereden.ricochetrumble.preview`**, same pinned public AOSP development **test** certificate SHA-256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc` as code 410001. [Build PASS #41721309696](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41721309696), [single current APK artifact #13272356875](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41721309696/artifacts/13272356875) (expires 2026-11-17), **APK SHA-256 `1bc0aaed1b7557ff2b894b6e25441a4181e7f6a7440d9fcad7b14c5ceed35f36`**. Exact source/build commit `50401f71a63a8375f1b7a7230617acb1167682af`; reviewed M4+M5 code `1062ea3bc3c85dfa42999ed1988fe0ea7ec8c083`; [build PR #128](https://github.com/PlayerEden/Ricochet-Rumble/pull/128) reused the prior signing workflow, **no additional per-feature workflow copy**. Actual extracted APK hash independently checked. Previous v0.9.79/code 410001 remains documented in the archive for recovery, **not** an alternate player version to maintain.

**Current source is newer than the current APK.** M6 focus-loss pause and the latest reload/reopen QA are merged into `main` **after** v0.9.80 was signed. Do not claim v0.9.80 contains these source changes. Keep v0.9.80 the only currently recommended APK; include M6 in the next **grouped, same-signer** preview once additional polish is accepted. No per-feature app copies.

**Owner phone gate remains:** back up Dossier, install v0.9.80 **over** the installed compatible preview (never uninstall to bypass an Android signer conflict), then confirm Dossier/Hangar/custom settings, Practice→Quick Play, backup Share, and background/resume on one phone. **CI ≠ real phone acceptance.** This build is not Google Play production-signed; two physical phone LAN remains deferred. Only one *current* owner APK should be presented.

## Next development / one-phone owner gates

1. **Save/restore hardening complete in source** — PR #127 merged; all applicable automated data/visual/LAN checks passed. Next is owner physical install-over, saved data and background/resume validation using v0.9.80, not another backup feature.
2. **Single-device QA — automated gates complete for this pass** — M6 focus-loss pause [PR #129](https://github.com/PlayerEden/Ricochet-Rumble/pull/129) and real UI reload/reopen [PR #130](https://github.com/PlayerEden/Ricochet-Rumble/pull/130) merged, **all applicable CI green**. [Canonical test run #41724607061](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41724607061) verified Settings, named Custom preset, 3 synthetic Dossier matches, DUNE paint, VECTOR insignia, exact five-record backup, and document reopen at 740×360 and 915×412. **Physical** install-over, notification shade, saved data, orientations, heat/FPS and crash behavior remain open.
3. **UI/audio/playability polish** — clear results and progression, distinct mechanical sounds and original menu/game music while protecting approved tactical presentation.
4. **Google Play beta preparation** — signing/identity migration plan, privacy/store assets, app size/SDK checks, internal/closed testing before any public GO.
5. **Real phone-to-phone LAN** — resume only when the owner has two actual Android phones available.

[Master development plan](MASTER_DEVELOPMENT_PLAN.md) · [Developer protocol](DEVELOPMENT_PROTOCOL.md) · [Full historical archive](ARCHIVE_INDEX.md) · [M4 save-sharing evidence](M4_OFFLINE_BACKUP_SHARE_2026-11-03.md)

# Sector Rebound — Current Project Status

**Date:** November 3, 2026 · **Single active source of truth: [`main`](https://github.com/PlayerEden/Ricochet-Rumble/tree/main).** No alternate game branches to maintain. Historical drafts, source checkpoints, older APKs and PR discussions remain available in the [archive index](ARCHIVE_INDEX.md); they do **not** need to be merged or rebuilt again. [Previous longer status and its exact provenance](https://github.com/PlayerEden/Ricochet-Rumble/blob/2bdd4285b1e403da06cc8c1f89937de5529a1928/docs/PROJECT_STATUS.md).

## Locked / owner-approved for now

The owner reports Sector Rebound's **v0.9.78 camera and current AI feel good for now**. Preserve the established tank/mech/pilot movement, shot timing and controls. Camera targets: **pilot 0.94, tank 0.73, mech 0.69**. The wider view made AI feel almost ideally balanced between easy and challenging. Future adjustment is possible by explicit owner request or observed gameplay defect; do not retune casually.

**Two physical Android phones are not currently available.** Actual Wi-Fi host/guest, spectator, JOIN NEXT, recovery and disconnect phone validation remain **deferred**, not complete. Browser/JVM integration can continue without treating two-browser results as real hardware acceptance. Google Play public launch remains **NO-GO**.

## Current merged features and exact evidence

| Workstream | In main | What CI and owner verified |
| --- | --- | --- |
| Camera and AI fairness | [Camera fine-tune PR #118](https://github.com/PlayerEden/Ricochet-Rumble/pull/118), CI green | Owner tested and approved qualitative combat/camera feel; save retention and two-phone LAN are separate |
| Solo onboarding | [Practice PR #122](https://github.com/PlayerEden/Ricochet-Rumble/pull/122) | No-bot training from Help/Choose Mode; saved Quick Play settings unaffected in real Chromium QA |
| Offline backup and share | [Share PR #125](https://github.com/PlayerEden/Ricochet-Rumble/pull/125), merged SHA `32e69bd42cae41c7d81552e1813028873afca138` | **7/7 applicable CI PASS**, including [real Android/visual build #41717538094](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41717538094) and [browser regression #41717538124](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41717538124). User-initiated text share; physical share target/retention not independently verified |
| LAN host, bots, spectator/queue/recovery | [Spectator #105](https://github.com/PlayerEden/Ricochet-Rumble/pull/105), [queue #108](https://github.com/PlayerEden/Ricochet-Rumble/pull/108), [native reaccept #110](https://github.com/PlayerEden/Ricochet-Rumble/pull/110), [recovery #111](https://github.com/PlayerEden/Ricochet-Rumble/pull/111) | Browser/JVM/Android code tests PASS. Two real phones **not yet** |

## Android owner build — one current version

**Current owner-compatible signed preview:** `0.9.79-practice.1`, versionCode **410001**, Android ID `com.playereden.ricochetrumble.preview`, pinned **public/disposable AOSP test signer**. [Signed build PASS #41715192220](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41715192220), [artifact #13270206832](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41715192220/artifacts/13270206832) (expires Nov. 17), SHA-256 `20c82083d92b80c49b2b4e0c0b3c4551bc6b6b430b47a2066492b759ce9f422a`; [protected source checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-v0979-solo-practice-signed-ci-410001).

The separate **CI debug app** from M4 is `com.playereden.ricochetrumble` (without `.preview`), **not an in-place upgrade** and contains no existing owner data. Source is newer on `main`. **Do not produce or present another owner APK for each small change**. When a consolidated preview is needed, verify the same preview package/certificate, monotonically increasing versionCode and exact bundled assets. Back up the Dossier before installing; do not uninstall to bypass signing differences.

## Next development / one-phone owner gates

1. **Save/restore hardening** — eliminate unguarded local storage reads and verify the exact recovery snapshot *before* modifying data. Test normal restores, denied reads, truncated snapshots and rollback.
2. **Single-device QA** — verify Dossier, Hangar and Custom presets survive an in-place update and Android background/resume. Test Practice→Quick Play, both orientations where supported, frame pacing, overheating and crash behavior.
3. **UI/audio/playability polish** — clear results and progression, distinct mechanical sounds and original menu/game music while protecting approved tactical presentation.
4. **Google Play beta preparation** — signing/identity migration plan, privacy/store assets, app size/SDK checks, internal/closed testing before any public GO.
5. **Real phone-to-phone LAN** — resume only when the owner has two actual Android phones available.

[Master development plan](MASTER_DEVELOPMENT_PLAN.md) · [Developer protocol](DEVELOPMENT_PROTOCOL.md) · [Full historical archive](ARCHIVE_INDEX.md) · [M4 save-sharing evidence](M4_OFFLINE_BACKUP_SHARE_2026-11-03.md)

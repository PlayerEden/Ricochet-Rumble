# Sector Rebound — Canonical Master Development Plan

**Consolidation checkpoint:** 2026-11-02 (America/Kentucky/Louisville), current **v0.9.75 game source integrated** into `main` by PR #104, merge SHA `b55e1ea1f59ca72663896d8f37d612547e253fbe`. **Status taxonomy:** `implemented` (source exists), `CI verified` (exact test/compile gates passed), `owner tested` (specific physical-device feedback), `blocked` (hardware/owner/policy), `designed` (not implemented). Never equate these.

**Canonical source of truth:** [Current project status](PROJECT_STATUS.md), this master plan, and [full archive register](ARCHIVE_INDEX.md). [Original long master plan (historical snapshot)](MASTER_DEVELOPMENT_PLAN_2026-11-02.md) and prior research are retained; superseded "next" advice must not override this document.

## Product and protected defaults

Sector Rebound is a compact, fun, deliberate **mobile ricochet arcade shooter**. Human-paced bank shots, tactical tank/mech/overhead P-03 pilot, ejection/recovery, correct team colors and pilots, fresh procedural maze, short matches, cosmetic-only offline identity and no mandatory login. Preserve approved FIELDGRID visual/pilot art, thumb-friendly controls and vehicle/pilot camera scales. Avoid a new physics renderer, unnecessary game modes, pay-to-win or a forced internet account.

**Baseline evidence:**
- v0.9.74 aiming was described by the owner as **“pretty good for now”**; deliberate physical bot braking/aim alignment is the protected feel reference.
- v0.9.75 rare occasional fast **direct, visible, vehicle-target** acquisition is **source and CI passed, owner phone feedback pending**. Baseline [signed source 45e06297](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-v0975-rare-ai-openings-signed-ci-370001), code 370001, [Android PASS #41578089841](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41578089841), [full game PASS #41577565867](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41577565867).
- Earlier [v0.9.74 signed rollback](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-v0974-ai-shot-posture-signed-ci-360001) is safe and must remain.
- Latest real phone information is **one-device playtests** of host-vs-bots/AI. No trustworthy *two Android phones connected to each other* acceptance is on record.

## Unified priority order

| Priority | Milestone | Actual status | Completion / exit requirement |
| --- | --- | --- | --- |
| **M0 / early M4** | **GitHub consolidation and verified default source** | **Merged and post-merge regression PASS** | Preserve v0.9.21 original `main` in archive; make tested v0.9.75 lineage the default `main` without force/squash or lost ancestry, reconcile docs, run main PR tests, archive only proven superseded PRs. This is *not* Play release approval. |
| **M1** | **Host-alone D3-A0/A1** | **Implemented + CI verified**, one-phone limited | Actual AI drives unoccupied guest slot, TDM 1v1/2v2/3v3, host chooses rules, multi-round scoring and same-room rematch. Confirm long owner sessions and install-over progress retention; no claims of spectator seat control. |
| **M2** | **Core combat feel and AI** | **Mostly implemented, human iterative** | Protect human-paced v0.9.74 aim. Review v0.9.75 occasional fast openings on actual phone, test friendly AI/vehicle-pilot parity, physical bank shots/controls/HUD/map spacing, compare concrete before/after on mobile. Do **not** start broad bot-archetype feature creep. |
| **M3-A2** | **Host-only FFA/Survival/Co-op** | **Implemented + CI verified**, one-phone limited | FFA host vs 1–5 AI; balanced Team Survival 1v1/2v2/3v3; Co-op host+AI ally vs enemy bots; honest HUD and no Solo reward exploits. Accepted as an *experimental* one-phone LAN-bot preview, not internet PvP. |
| **M3-B1 — CURRENT EXPERIMENT #105** | **Live spectating in active LAN rooms** | **Source implemented; real two-Chromium spectator QA passed on initial SHA; Android/physical two-phone pending** | One newly joined client **watches the ongoing host fight** via genuine synchronized match state/camera and room status, no movement/fire authority, one remote spectator max; prove with two real Chromium clients, native lifecycle limits documented. Keep host match uninterrupted. |
| **M3-B2** | **JOIN NEXT / queued bot→human promotion** | **Designed, not implemented** | Spectator requests next eligible round/match; host validates role/revision, reserves guest seat 1, promotes only at safe boundary, no mid-round team ID/score change; stale input rejection, disconnect reverts to real bot, no ghost controls. |
| **M3-C** | **Android native LAN lifecycle & physical Wi-Fi** | **Partly implemented older single-accept; improvements designed** | Repeat accepted guest/spectator sessions, busy/OPEN/PLAYING/QUEUED status, reconnection, background handling and packet/input freshness, no unauthorized players. **Real two-phone on-site tests remain the release gate** before advertising LAN. |
| **M4 (after M3 prototypes)** | **Release candidate QA/integration** | **Partial** | Source history/PR audit, 300+ map/seeds per changed mechanic, browser/combat/LAN, Android Java/WebView, real score/saves, full install-over test with same signer, rollback and human approval. One canonical branch and docs. |
| **M5** | **Player onboarding, sound and visual finish** | **Partially implemented** | Clear first-match controls, short optional ricochet practice, legible HUD and After Action, original licensed music/FX with independent mix, starter/earned free cosmetics, localization/readability as needed. Limit new content to observed pain points. |
| **M6** | **Google Play beta / v1 GO-NO-GO** | **NO-GO** | Final art (512px icon, 1024×500 banner, authentic screenshots), hosted HTTPS privacy policy/publisher/contact, Data safety/policy, Play Console testing, production private signing/AAB, package identity, user safe update/backup, performance/heat test, owner explicit GO. Choose Solo-first if two-phone LAN remains unverified. |
| **M7** | **After beta content** | **Curated backlog** | Based on feedback: Daily Sector or CTF/Forward Bays, map topology, one new vehicle/powerup, earned cosmetics. Do not ship all experiments at once. |
| **M8** | **Later internet service / social / purchases** | **Deferred** | Authoritative remote networking, friends/account recovery, fair ranked, anti-cheat, moderated leaderboards, cloud/transactions/optional ads only with viable infrastructure, security, privacy and owner-approved scope. |

## Exact next engineering sequence

1. **After integration promotion**: verify default `main` byte-for-byte shared Web/Android assets; preserve archive branches and current signed APK. Keep independent owner preview artifact link and checkpoint. Do not change installed package/signing identity just because `main` changed.
2. **Immediate B1 slice:** isolate a single spectator view and authoritative server-state feed. Design status contract `OPEN / PLAYING / SPECTATING / ROOM FULL` and native message validation. During active solo-host match, new client can read but not control the AI seat. Start with two Chromium clients, then Android lifecycle QA. **No fake live spectator based solely on a static lobby label.**
3. **B2** once B1 passes: a spectator may request queue; host decides next **round** only if a future Best-of-3 round actually exists, else next **match**. Guest inherits assigned faction score but **never previous personal KOs**. No input before promotion, direct reconnect AI fallback.
4. **C**: native reaccept loop, Wi-Fi NSD discovery, background/reconnect/guest rejection and source-protocol handshake. Then test **two real phones** with screen/video and seed logs, no CLI-only acceptance.
5. **Play readiness in parallel:** fix manual backup/install acceptance, heat/FPS, store legal assets/privacy/policy. Release choice remains open (Solo-first versus validated LAN advertised).

## Required invariants and testing rules

- `web/` game assets mirrored to `android/app/src/main/assets/` byte-for-byte, with changed versions and **exact signed APK source SHA** noted in release docs.
- All host game progression remains possible alone. A bot must actually move/aim/score in an unoccupied seat; don't merely display it as AI.
- Team colors and friendly-fire identities do not mutate mid-round. Host owns match time/KO ledger/round winner; a spectator cannot fire/interact.
- Maintain owner-approved pilot silhouette/animation, team readability, controls/camera and *physical* bot aiming behavior.
- Full source tests and Android build before preview; on-phone acceptance is distinct from automated QA. No untested claims of persistent background hosting or general internet matchmaking.
- Save/cosmetics continuity: always instruct backup before install-over, **never uninstall** to fix a signer mismatch. Public AOSP development signer is only for disposable owner beta; production Play signing requires private release custody.
- Every new feature starts from current `main` after consolidation and a **focused PR**, not another permanent 60-PR stack. Prefer one reviewable change and one durable master status update per milestone.

## Decisions still requiring actual owner or hardware evidence

**Owner test of v0.9.75 occasional bot quick shots:** whether surprising but fair. **Android upgrade:** exact package/version/signing and preserved Dossier/Hangar/Custom data across real update. **Two phones:** LAN host/join/reconnect and input latency. **Release scope:** Solo-first beta permitted without physically verified LAN? **Google Play:** storefront assets, privacy/contact, Play Console test track and private signing. The owner has **not** authorized public production deployment.

## Important source links

[Full historical master](MASTER_DEVELOPMENT_PLAN_2026-11-02.md) · [D3 native/room technical design](design/LAN_PERSISTENT_ROOMS_D3_SPEC_2026-11-02.md) · [November 2 signed owner handoff](AI_RARE_QUICK_OPENINGS_M2_A2_ANDROID_OWNER_v0975.md) · [Release P0 blockers](RELEASE_CANDIDATE_AUDIT_2026-11-01.md) · [Historical branches](BRANCH_REGISTER.md) · [Archive index](ARCHIVE_INDEX.md).

# Sector Rebound — Development Execution Plan After Open-Book Audit
**Created:** 2026-10-30  
**Decision:** owner requests a practical staged plan **and to start implementation**.  
**Status:** APPROVED TO PLAN AND BEGIN LOW-RISK BASELINE/QA IMPLEMENTATION. Gameplay balance changes, branch integration, production signing and release require later measured evidence and explicit review.

## Source of truth and scope discipline
- [Open-book comparison and source audit](OPEN_BOOK_COMPETITIVE_TECHNICAL_AUDIT_2026-10-30.md) and [latest cross-system targeted audit](QA_TARGETED_AND_OVERALL_v0947.md).
- **Stable** `main` currently holds v0.9.21 runtime plus newer handoff/research/docs. Never confuse a merged planning document with merged experimental gameplay.
- Latest *runtime experiment lineage*: [consolidated integration draft #71](https://github.com/PlayerEden/Ricochet-Rumble/pull/71) → [v0.9.48 scoped CSS layout draft #74](https://github.com/PlayerEden/Ricochet-Rumble/pull/74). Earlier source PRs #65–#67 (P-03 pilot/motion and UI/audio) are part of that lineage. The **P-03 pilot geometry/motion and v0.9.46 menu/audio are owner-approved and LOCKED**. The v0.9.48 80-scene responsive layout regression is automated PASS, but user physical Android review is pending.
- Preserve existing original APKs, code SHAs, QA artifacts, and [P-03 owner approval](APPROVED_PILOT_P03.md). Prior debug certificates differ: do not uninstall an existing app with valuable progress.
- **Every milestone:** small one-purpose draft branch from a *specific reviewed parent commit*; inspect diff; run fast regression + appropriate real browser/Android build; preserve exact source SHA and screenshots/metrics, log remaining manual tests, compare rollback. **No automated merge to stable main**, no unverified Android update compatibility, no shipping incomplete cosmetics/remote play.
- Do not open a new stacked feature branch until the previous phase's evidence is recorded and its integration/rollback path is clear. Prefer a single parent integration candidate for current runtime; isolate tests/reports from gameplay changes. Avoid temporary QA-only branches except when GitHub's `main` docs conflict prevents normal PR CI.

## Phase A progress — automation complete, human sign-off pending (2026-10-30)

**PASS:** [real-engine test-only PR #77](https://github.com/PlayerEden/Ricochet-Rumble/pull/77) / [successful run 41021741127](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41021741127), exact tested SHA `6196e0305ff668760fb30ac0a2b5289c7ad8c2e1`. Nine real-source `tankMove()`/`shoot()` measurements for Survival/Scored FFA/Scored TDM × tank/mech/pilot; regression suite and Android-Web game/CSS parity PASS. [Durable baseline table and measured values](CONTROL_FEEL_BASELINE_v0949.md). **Survival tank nominal 222 vs scored 166 units/s (1.337349×); joystick first-frame heading 0.2 vs 0.043333 radians; scored fine-AIM 0.03 rad.** No production code, speed/aim, art, UI or signing changed. **Physical owner control comfort and bank-shot accuracy PENDING**; do not advance to balance tuning based solely on source measurements.

---

## Phase C progress — 3,000 real map samples (2026-10-30)

[**v0.9.50 draft PR #78**](https://github.com/PlayerEden/Ricochet-Rumble/pull/78) audited actual generator + spares for 1,000 seeds each small/standard/large, saved all seeded JSON, with [full automated CI **SUCCESS** 41022666945](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41022666945), original test SHA `327501703c0eb68a6029ee7452886511ebac895b`. **All 3,000 uniquely replayable, connected graphs and accessible spare vehicles PASS.** [Detailed metrics and problem seed replays](MAP_FAIRNESS_BASELINE_v0950.md). **Potential P1 recovery-balance concern:** player-to-nearest spare path p95 10/14/15 cells (small/standard/large), but worst 22/32/35; recovery access across actor seats differs up to 44 steps in large seed 395; 11.1% of small maps have at least one exposed direct sightline between starting actors. Map geometry is not broken, but apparent Euclidean garage nearness can be very misleading through corridors. **Next:** graph-distance-aware spawn placement feasibility comparison, without altering live generator until quality and side bias are proven. Human phone controls A/B (Phase B) remains pending. No game runtime changes, no authorizing a merge, Android P0 still open.

---

## Phase C test-only recovery placement A/B — measured PASS (2026-10-30)

**Why this was tested:** 3,000-map structural audit discovered winding corridor routes to apparently nearby spare vehicles. [Draft test-only PR #79](https://github.com/PlayerEden/Ricochet-Rumble/pull/79), [GitHub CI 41023080678 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41023080678), exact tested source SHA `9cb83bcf199c50df4ec8f6874c0d0b42c9b9a004`. [Detailed permanent A/B evidence and tradeoffs](RECOVERY_PLACEMENT_AB_v09501.md). On the same **1,000 seeds per map size**, hypothetical bounded one-garage relocation for SOLO made player 0 spare consistently 2 path steps away (possibly too easy for pilot survival); three-garage seat-balancing reduced worst-seat path p95 **13→4 small, 20→8 standard, 28→11 large**. Baseline worst-seat maximum **22/32/46** decreased to **6/12/16** in the test-only balanced model. Important: balanced placement worsened player 0's personal distance in ~9–15% of seeds, and doesn't model actual combat/ejection. **Only test fixture positions were changed; `spawnVehicles()` and production game unaffected.** Next **decision gate**: if we want a gameplay change, separately prototype a modest/limited corridor-aware spare policy with a floor against immediate easy reboard, test actual spawn paths, all regressions, full Android and human feel. No silent mode balancing, stable main merging, or signed release claim.

---

## Phase C runtime prototype checkpoint — v0.9.51 (2026-10-30)

Implemented owner-requested next step: [actual game code PR #80](https://github.com/PlayerEden/Ricochet-Rumble/pull/80) — a **bounded graph corridor-aware spare-vehicle relocation**, retaining `recoveryPolicy:'legacy'` for exact old seeded placement/rollback. Solo relocates ≤1 spare only when nearest original corridor walk exceeds 8 cells; targets 4–8 steps without instant reboard; scored/2-human relocates ≤2 spares to reduce worst-seat path. No maze generator, vehicle count/type, P-03, controls, physics, combat, UI, sound, game save or LAN protocol changes. Android Web game source byte-for-byte mirrored, code 48 / v0.9.51 experimental metadata.

**Real source 3,600 comparisons + gameplay/saves/score smoke CI PASS:** [41024297470](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41024297470). Solo p95 original→new **10→8 small / 14→8 standard / 15→8 large** cell steps; scored 600-seed worst-seat p95 **13→6 / 19→8 / 29→12**. [Durable full report and rollback](CORRIDOR_RECOVERY_PROTOTYPE_v0951.md). **Full Chromium+Android run [41024682060](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41024682060) still needs final PASS verification; no Android device or user approval yet.** No automatic merge of draft PR #80 or ancestors to stable main.

---

## v0.9.51 Android test candidate available / manual gate outstanding (2026-10-30)

After actual 3,600-seed source QA PASS and complete [Chromium + Android run 41024682060 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41024682060), original experimental [APK and screenshots permanently archived](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.51-corridor-recovery-prototype) at SHA `22ba2237919c5a78255475d84638c4f5c769d8d3`. [Detailed release caveats](CORRIDOR_RECOVERY_PROTOTYPE_v0951.md). **No in-place update safety**; owner phone review of pilot vulnerability/recovery navigation pending. Keep PR #80 and ancestor drafts UNMERGED. Next after review: decide keep/retune/revert placement; independently continue Android durable signing & 2-device LAN validation before Play.

---

## Phase D — Read-only update preflight and actual archived signer mismatch verified (2026-10-30)

[Draft v0.9.52 PR #81](https://github.com/PlayerEden/Ricochet-Rumble/pull/81) adds Node-only read-only `tools/android-update-preflight.mjs` for signed APK metadata/certificate and Android installed-app comparison. [Final CI 41144134616 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41144134616), exact tool SHA `80c5321a040a45c1a5032093708ef1af91bd9fd6`. **Confirmed with real signed GitHub release APKs:** v0.9.46 code47 and v0.9.51 code48 certificates differ and are **not normal in-place upgrade compatible**, notwithstanding valid independent builds. [Detailed public digest and safe workflow](ANDROID_UPDATE_PREFLIGHT_v0952.md).

**Remaining P0:** owner supplies private durable TEST signing materials through controlled secrets (not chat), records installed app cert and verifies TWO same-signer in-place upgrades retaining actual dossier data, then separately finalizes Play signing/package/data policy. Static/pass-through preflight is **not physical installation success**. v0.9.51 vehicle placement owner's phone gameplay verdict also pending. No new APK or gameplay change from this step.

---

## Phase E v0.9.53 code-level LAN pilot parity complete / physical two-phone gate open (2026-10-30)

[Source PR #82](https://github.com/PlayerEden/Ricochet-Rumble/pull/82) fixes missing guest on-foot independent FIRE-drag direction, host authoritative finite input normalization, and equal on-foot pilot heading turn for the two human LAN seats. [Focused actual game-engine + score/save/smoke PASS 41148986844](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41148986844); [real Chromium visual + Android debug APK/unsigned AAB FULL PASS 41149116261](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41149116261), exact original tested source `746816a14e27d18edfed3daecdace5cf520d633f`. [Original archived debug APK and screenshots](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.53-lan-pilot-parity-test), APK SHA256 `c26a9cd759588df905631345bc605caa7a5a49d6c06607d984c5500ee16edeeb`. [Full technical and manual testing report](LAN_PILOT_INPUT_PARITY_v0953.md).

**Explicitly not done:** any physical Wi-Fi LAN two-phone acceptance, jitter/latency instrumentation and smoothing, reconnect across devices, durable same-signer APK upgrade/data preservation, Play production signing or stable main merge. Next separate LAN work should be measured actual Wi-Fi synchronization; no spontaneous network protocol rewrite. Owner-approved graphics, game-feel and test APK rollback protected. **CLEAN-INSTALL EXPERIMENTAL DEBUG ONLY** and never uninstall older game with valuable saves.

---

## Phase E v0.9.54 fallback correctness follow-up while real LAN testing deferred (2026-10-30)

Added small, reversible [LAN host stale-input safeguard draft #83](https://github.com/PlayerEden/Ricochet-Rumble/pull/83) based on accepted original v0.9.53 input-parity source. Host previously retained FIRE/movement/aim forever during an unclosed guest stream stall. **0.4-second host physics freshness timeout** and neutral resets on pause, lobby, rematch/reconnect guarantee the host stops ghost controls and accepts fresh inputs immediately. [Real source test/score/save/smoke CI PASS 41156162244](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41156162244); full Chrome+Android [41156274497](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41156274497) pending final conclusion. [Detailed source/limits](LAN_GUEST_INPUT_FRESHNESS_v0954.md).

**Release P0 STILL OPEN:** owner two-phone Wi-Fi checks, real measured jitter/lag, durable test-signing with progress-preserving upgrades. Do **NOT** start speculative client interpolation, engine rewrite or unrelated feature creep while owner has no second phone. Maintain stable `main` runtime and original v0.9.53 APK rollback.

---

## Phase E v0.9.54 final automated QA — no further LAN coding necessary until real phones (2026-10-30)

[Draft #83](https://github.com/PlayerEden/Ricochet-Rumble/pull/83) now fail-closes host guest movement/FIRE/aim after >0.4 simulated seconds without a received input, and resets around pause/reconnect/rematch; source-level tests cover valid packet recovery and no ghost FIRE. [Actual engine focused CI 41156162244 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41156162244), [full real Chromium and Android debug APK/unsigned AAB CI 41156274497 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41156274497), tested source `e4cb3e2e9351f1c2a354b35100f23bf0bd9e45a0`. [Permanent original v0.9.54 test APK and screenshots](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.54-lan-ghost-input-test) (SHA256 `c397677cc53466a1e07cf9d9e0d1494b8c82d2e6a8cf1ee4bf5e2b1dc611513b`) and [full technical QA handoff](LAN_GUEST_INPUT_FRESHNESS_v0954.md). **Keep all draft PRs unmerged, no durable signer or physical LAN proof**. Since owner cannot test two phones, **pause LAN networking work here**: no speculative interpolation, matchmaking or new modes. Next independent work optional: reviewed branch integration/rollback and release compliance checklist, not more feature creep. Debug APK signing may differ; don't uninstall a copy with important progress.

---

## Priority and order
| Phase | Work package | Purpose / real deliverable | Exit gate | Decision owner |
|---|---|---|---|---|
| **A — NOW** | **Measure control and combat baseline (v0.9.49)** | Run real-source, no-balance-change probes of Survival vs Scored tank movement/turn, shell behavior, player vs bot rules; record mode/vehicle matrix and reproducible numbers. Document physical phone test card for 5°, 15°, 180°, release/drag FIRE, ejection/reboard. | Automated baseline report + all old gameplay/regression PASS; input recordings/physical comfort explicitly PENDING until owner plays. | Small instrumentation approved; balancing **not** approved by measurement alone. |
| **B** | **Control feel A/B, not blind speed changes** | After Stage A, test one tunable difference at a time (e.g. Survival vs Scored 166/222 or turn rates), include mech and pilot parity. User can approve **no change**. | Two comparable runs, no input ghost/stuck fire, accurate intentional ricochets, human verdict on phone; no pilot/art redesign. | Owner selects feel, per-mode or unified. |
| **C** | **Procedural arena fairness (v0.9.50)** | 1,000 seeds **per supported size**, normalized topology fingerprints, seed replay, cover near starts, path length/dead ends, pickup distances/LOS and bounce opportunities; only consider bounded retries for true outliers. | All reachable, stable deterministic seeds, reported distribution/threshold justification, no starved spawns or major systematic side bias; existing procedural variety preserved. | Owner approves map-quality policy. |
| **D — P0** | **Durable Android test-signing and backup proof** | Owner-held private TEST key never entered chat/repo, two builds signed with same cert and incremented versionCode; demonstrate installed progress survives both in-place upgrades and manual backup/restore. Distinct later Play UPLOAD key. | Same signing cert fingerprint, in-place installs without uninstall, saved progress intact, no secrets in logs. Gate BLOCKED until actual owner-controlled key/device checks. | Owner handles key/device; no automatic key generation on GitHub/CI. |
| **E — P0 if LAN in first release** | **2-phone local multiplayer acceptance** | Real same-WiFi host/discover/manual-IP join, pilot and vehicle controls, concurrent move+aim+fire, ejection/respawn, rematch seed sync, pause, disconnect/reconnect. First log jitter/packet size and input parity; only then consider snapshot interpolation (~11 host snapshots/s today) in a separate tiny PR. | Real 2-device evidence with latency/jitter, visual stability and event/score parity; LAN is removed from launch promises if not ready and owner approves offline-only v1. | Owner two-phone test; engineering fixes after measurement. |
| **F** | **First-session teaching/controls accessibility** | Audit effective Android 48dp touch areas and real thumb occlusion, test Quick Play discoverability; if needed, optional 60-second bank-shot range using existing weapons/maze (no new economy). | 3–5 newcomer observations or small human sample, fewer accidental taps/misunderstood FIRE actions, unchanged battle balance. | Owner decides whether tutorial adds value. |
| **G** | **Device reliability & targeted architecture maintenance** | 20–30-minute Android profiling: p50/p95 frame time, hitching, memory, battery/heat, resume/rotation and interruptions. Refactor one **measured bottleneck** at a time (e.g. caching static arena, extraction of input or audio) and centralize Web→Android asset copying only with byte parity. | Performance evidence and tests before/after, no high-risk mass rewrite, unchanged feel and locked assets. | Owner approves necessary changes. |
| **H** | **Staged release candidate / store decision** | Resolve existing unmerged PR chain into reviewed, provenance-safe integration branch, confirm exact package ID and Play policy, app access, assets/music rights, privacy/Data safety, signing, AAB, crash/ANR; explicitly decide whether first Play build is solo-only or LAN. | QA matrix GO/NO-GO, owner phone signoff, controlled rollback and tagged tested source, production-specific Play checks. **No GO without P0 gates.** | Owner approves scope and promotion to main/Play. |
| **LATER** | Cosmetics, friends/remote online, ranked, monetization, additional vehicles/powerups | Only when core play, legal/policy and networking tests pass; cosmetic-only, no pay-to-win. | Independent design and economic/security review. | Separate approval. |

**Ordering note:** A→B→C is best near-term for finding game fun, while D and E are **release-critical** and may be prepared in parallel **without claiming device verification**. If the goal shifts to Google Play quickly, move D before B/C. Do not let signers or network work silently retune combat.

## Phase A — executable first slice (start now; no production changes)
- Parent: exact v0.9.48 scoped layout [draft #74](https://github.com/PlayerEden/Ricochet-Rumble/pull/74); source-only tests start from its latest commit. Work in `research/control-feel-baseline-v0949`, **not** stable `main`.
- Create a reproducible, Node-only headless test that exercises **actual `tankMove()` from current `web/game.js`**, not a reimplemented approximation; hold a fixed input over one 1/60-second simulation step for Survival and Scored vehicle modes, record initial forward velocity, heading delta, projectile parameters, and pilot speed response.
- Preserve exact source SHA and derived JSON report in QA artifact. Compare at least tank/mech and same local human input, and explicitly label untested finger ergonomics. **Do not change movement speed, 2.6/1.8 precision aim, shot behavior, pilot motion or collision rules.**
- Next, run existing source parity/smoke, scored kernel, natural-bot evidence and browser/Android checks if runtime changes are later proposed. For this tests-only slice run Node syntax/probe and fast regression.
- **Manual test card (future owner gate, no need to do this at work):** five 15° bank shots each on Survival and Scored, 180° pivot, continuous move+aim+FIRE, pilot eject/reboard, compare tank vs mech, look for opposite thumb obstruction. Record subjective 1–5 control precision and frustration notes. No invented phone results.
- Exit report states **SOURCE BASELINE PASS** or FAIL with reproduced seed/inputs; player acceptance remains PENDING.

## Required code-review/QA contract for every future phase
- P0: correctness/security/data loss/critical networking, block release.
- P1: confusing controls, unfair maps, material gameplay inconsistencies, visible clipping/poor accessibility, fix before release candidate if demonstrated.
- P2: polish and optional features, never hijack P0 work.
- Tests are **evidence, not subjective approval**. Count simulated bot matches as bot matches. Count real Chrome screenshots as browser evidence. Count signed Android device upgrades/two-phone LAN only after actual physical proof.
- Every PR body says what changed and what explicitly **didn't** change. Check same exact Git blobs for `web/` and `android/app/src/main/assets/`, restore older art/physics without reverting unrelated work, append milestone result to this plan and `PROJECT_STATUS.md`.
- Do not use a successful automated audit as reason to merge the entire 20+ draft-PR stack into `main`.

## Roadmap review log
- **2026-10-30:** Owner requested staged roadmap after competitor/code audit and authorized getting started. Phase A designated as first **non-invasive measurement**. No balance, signing, networking or core gameplay change authorized. Next check: Phase A actual CI + owner future feel verdict.

# Sector Rebound — Future Product Roadmap & Idea Bank (DRAFT)

**Canonical master plan update (2026-11-02):** [Sector Rebound Master Development Plan](MASTER_DEVELOPMENT_PLAN_2026-11-02.md) now owns the ordered roadmap, implemented-vs-designed inventory, D3 one-phone first milestone, open issue/PR reconciliation, Android/Google Play gates and owner decisions. This older plan is a **historical technical reference**, not the current next-task list. Follow the master and newest [Project Status](PROJECT_STATUS.md); do not interpret older "NOT IMPLEMENTED" design bullets as current runtime truth.



## 2026-11-02 owner-approved D3 LAN rooms supersession note — NOT IMPLEMENTED

The earlier broad roadmap is historical proposal. **New owner-approved planned arc:** [D3 persistent LAN room specification](design/LAN_PERSISTENT_ROOMS_D3_SPEC_2026-11-02.md), [prioritized execution/gates](DEVELOPMENT_EXECUTION_PLAN_POST_AUDIT_2026-10-30.md), and [one-phone owner test card](LAN_D3_ONE_PHONE_OWNER_QA_2026-11-02.md).

D3 is an **incremental extension of experimental LAN**, not a new remote/internet matchmaker and not a prerequisite to a Solo-first store beta. Put **one-phone host vs bots** first (A1), then one-guest late spectator/queue/bot backfill (B1–B2) and measured Android reconnect/two-phone validation (C). A local room stays visible while active only if its host remains in the foreground and Wi-Fi is available. This plan supersedes any older implication that the host must always wait for guest Ready; that is a current implementation limitation to remove, **not** already fixed in v0.9.71. The current verified signed preview is v0.9.71 code 330001, source `333fc9d9ffc5f5ff5e136121217240112def531e` and D2 draft PR #97; physical two-phone LAN remains pending.

---


**Planning date:** 2026-11-01  
**Status:** DISCUSSION DRAFT / NOT OWNER-APPROVED SCOPE / NOT IMPLEMENTED.  
**Current candidate:** [Draft PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85); stable `main` v0.9.21 retained.  
**Companion authoritative release work:** [Roadmap to Google Play v1](ROADMAP_TO_GOOGLE_PLAY_V1.md), [release-candidate audit](RELEASE_CANDIDATE_AUDIT_2026-11-01.md), [owner acceptance](OWNER_ANDROID_ACCEPTANCE_2026-10-31.md).

## Product North Star

**“A five-minute tactical arcade duel where every maze changes your angle, every shot matters, and losing your vehicle doesn't end the fight.”**

Protect these differentiators:
- Simple movement/fire and deliberate ricochet precision, not twitch-shooter speed or button overload.
- Tank/mech → vulnerable pilot → vehicle recovery, with a clear fair death/KO distinction.
- Original top-down geometry and graphite/amber tactical identity (no pseudo-3D rewrite).
- Fresh connected procedural mazes every ordinary match; seeded deterministic QA/replay.
- Short, understandable session loops: Quick Play → combat → result → next match.
- Free-to-play fairness: cosmetics/identity only, no paid damage, ammo, lives, speed, or competitive advantage.

## Current evidence vs ideas

**Built in integration (not yet in stable main):** Solo Survival, Team Survival, optional scored CQC/FFA/TDM, Custom + named presets, Quick Play and After Action, tank/mech/pilot/ejection/recovery, power-ups, Dossier, four free starter paints and earned insignia, brief contextual guidance, same-Wi-Fi LAN host/guest with host rules and 0-bot 1v1 logic, backup/import. Automated Chromium, JVM, Android and save-update checks are passing; owner real-phone play and true two-phone network acceptance are PENDING. Current test preview is **100061**, test-only public signing identity, not Play production.

**Proposals below are not promises**. No background deployment, server/account, game mode, IAP, or multiplayer service exists merely because a row appears here.

## Product phases, in dependency order (no arbitrary delivery dates)

| Phase | Player value | Candidate scope | Actual exit gate | Complexity |
| --- | --- | --- | --- | --- |
| **0 — Physical beta acceptance** | Trust that the game works on a real phone | Real 1-phone controls, match/restart/reward/interrupt, actual saved-state update; 2-phone LAN or choose Solo-first public scope | User-supplied real test evidence and no P0 failures; exact preview/signer lineage; preserve rollback | Small testing effort / external device dependency |
| **1 — V1 playable beta** | Anyone can enjoy a complete arcade game | Keep approved 5 modes and clear onboarding; device-specific fixes; honest Solo-first versus local-LAN labeling; Play listing/privacy/content declarations/private AAB | Real tester onboarding, store policy preflight, Play account testing as applicable, owner approval; no forced internet account | Medium, mostly distribution and QA |
| **2 — V1.1 Return-to-play** | “One more round” without needing a server | **One** signature extra replay loop: Daily Sector **offline seeded challenge** or short Ricochet Trials; clearer personal best/medal; limited new earned cosmetics | Tested gameplay and retention across reload/update, challenge fairness, <45-sec novice game entry target tested (target, not known result) | Small–medium |
| **3 — V1.2 Play together** | Two people can set up a fair game easily | Harden real Android LAN discovery, manual-IP fallback, 1v1 with **0 AI**, ready/restart/rules; add friendly 2v2 with bots only after 1v1 is solid | Two actual devices, repeatable 10-match session, network drops/reconnect and host pause/disconnect, no phantom players | Medium; 2-phone dependency |
| **4 — V1.3 More battlefield variety** | More replayability without new controls | Alternate generator *topologies* or 1 selectable field modifier; a small set of tactical map hazards as opt-in Custom-only experiments; 1 distinct AI personality | 300+ generator seeds per variant, map/path/visibility fairness and 20–30 minute owner playtest; keep classic mode unchanged | Medium |
| **5 — Online 1v1 experimental** | Play with a friend on another Wi-Fi/network | Independent authoritative WebSocket game server, remote room code/invite, isolated 1v1 casual first; protocol validation, latency simulation, reconnect, operational logs, rate limits | Dedicated internet-device tests, honest network latency, server host/uptime/budget, anti-cheat authoritative result, security/privacy controls | **Large, ongoing hosting** |
| **6 — Community & revenue (only if engagement justifies)** | Cross-device identity and sustainable development | Accounts, friends, cloud save, leaderboards, earned or **direct-purchase** cosmetic packs; ranked later | Identity/recovery, secure entitlement + server verification, anti-fraud and privacy/data safety, budget and policy reviews | **Large; recurring maintenance** |

**Branch point:** Version 1 can legitimately be **Solo-first** if LAN remains unverified; the public listing must not promise tested local play. Or deliberately wait for two-phone LAN acceptance and include it in the v1 promise. Do not hold the entire product forever for online multiplayer.

## Candidate gameplay additions — pick at most ONE per feature milestone

| Idea | Concrete player experience | Relative effort | Recommendation |
| --- | --- | --- | --- |
| **Ricochet Trials** | Tiny procedural tactical puzzles: bank a shell around cover, hit a dummy/target under a shot/time limit; earn 1–3 stars locally | **S–M** | **Best next content idea**: teaches signature mechanic; no account/server; requires target/dummy and aim QA |
| **Daily Sector** | Same deterministic seed and objective on the user's device each day; personal best only until server validation exists | **S–M** | Attractive repeat reason; clock spoofing okay for casual, not ranked |
| **Bot archetypes** | Cautious bank-shot specialist vs aggressive rusher vs vehicle-recovery hunter, with readable AI differences | **M** | Good combat depth; cap CPU and ensure skill fairness |
| **1v1 Duel preset** | One-tap LAN host 2 humans / **0 AI** with small-medium arena and transparent rules | **S–M** after LAN works | Prioritize discoverability over making another standalone mode |
| **Distinct maze biomes** | Original arena palettes/wall silhouettes, not gameplay-breaking visual clutter; optional topology variation | **S** cosmetic / **M** if topology changes | Great low-cost aesthetic expansion after readability testing |
| **Arena mutators** | Optional no-power-ups, armor-only, rapid recharge, fog/restricted radar for **unranked Custom** | **M** | One at a time; never let Custom mutators leak into fair Quick Play |
| **One new vehicle** | E.g., slow heavy shielded rig versus fast light scout, with unique combat identity but equal counterplay | **M–L** | Defer until current tank/mech are balanced; adds hitbox, AI, collision, art and QA |
| **Control-point / convoy objective** | Team holds a location or escorts a payload instead of only scoring KOs | **L** | Interesting but requires extensive objective AI/pathfinding, HUD and network changes |
| **Operator tiers and titles** | 1/5/25-match badges and purely cosmetic identity, all earned from real saved match data | **S–M** | Easy return-value, but avoid endless grind or misleading progress |
| **Match replay / kill cam** | Save and re-simulate authoritative past inputs, show final bank shot | **L** | Defer: determinism across clients/versions and memory/storage challenge |

S/M/L are **relative engineering complexity**, not delivery estimates or validated cost.

## Feature progression & cosmetics

**Near-term earned-only**: add 4–8 original patterns/emblems or reactive but cheap trail/projectile cosmetic variants; preview selection visibly in Hangar; consistent distinct teams/hitboxes; equip only if verified saved Dossier thresholds. Ship no cosmetic that obscures ammo, bullet path or enemy/team visibility.

**Later optional purchases**: direct, clearly priced cosmetic packs only after users demonstrate ongoing engagement and the Play publisher is ready. Use official Play Billing native Android integration and secure entitlement management; paid items cannot be granted by a localStorage flag alone. If a reward is paid/randomized, applicable probability disclosures, age/consumer policy and regional laws add complexity; **recommend avoiding paid random loot boxes**. Earned-only mystery capsules may be examined as a casual mechanic, but still guard expectations and child audience.

**Advertising**: prefer **no ads for v1**. If ever enabled, test opt-in rewarded offers with cosmetic-only rewards and visible choice; never interrupt MOVE/FIRE, matchmaking, round start or the user pressing Next Match. Play policy prohibits unexpected/disruptive full-screen ads.

## Remote play: realistic architecture options

- **Current LAN:** Android Java network/NSD bridge with browser/Canvas renderer and host authority. Works only within compatible local network; does **not** automatically permit across-home internet play. Real two-phone test is a prerequisite.
- **Proposed internet casual 1v1:** a tiny Node.js/TypeScript WebSocket server, host-authoritative or dedicated server authoritative. Use one trusted physics/state simulator. Clients send sanitized **inputs only**; server decides collision/hits/KOs/results, sends snapshots. Bound tick/state rates, protect against client spoof/DoS and handle disconnect, heartbeats, state interpolation and resume. Need paid or free-tier-hosted server **with always-on suitability evaluated**, a stable URL/domain, deployment/monitoring, and actual multi-network phones.
- **Alternative:** evaluate [Colyseus](https://docs.colyseus.io/) for state sync, rooms and matchmaking before reinventing a backend. A framework speeds scaffolding but does not remove game-specific authoritative simulation, deployment/operational costs or client adaptation.
- **Cross-device account/profile after remote beta:** Play Games Services for platform achievements/leaderboards; optional identity. A separate backend is still needed for trusted remote match results and social graph. Keep offline Solo playable with no mandatory login.
- **Ranked 1v1 + leaderboards + friends/platoons** come only **after** persistent trusted accounts, measurable server availability, fair scoring and a working report/abuse pathway. 2v2, cross-platform and clans multiply support/moderation cost; not v1.

## Technical constraints / commitments

| Constraint | Feasible response |
| --- | --- |
| HTML5/Canvas renderer inside Android WebView | Good for short top-down 2D encounters, procedural arenas, original sprite/pixel polish, offline unlocks; add budgets for memory, touch and browser/Android asset byte parity |
| 60-Hz fixed-step simulation | Continue bounded physics, projectile and snapshot budgets; measure actual frame pacing on low/mid Android before graphics-heavy effects |
| GitHub Actions / temporary preview signing | Continue source-linked QA and release artifacts; owner device install-over must match package/version/signer; private Play keys never live in public Git |
| App currently targets API 36 | Compliant with current new Android phone Play submission minimum; check target and policies at publication time, never assume future deadlines remain unchanged |
| Android 17 / API 37 future target | For NSD/direct LAN, review Google **ACCESS_LOCAL_NETWORK** runtime or privacy-preserving system-picker approach; do not add that permission to an API 36 build |
| Little/no hosting budget | Start offline and same-Wi-Fi; don't select remote multiplayer/cloud accounts unless monthly recurring cost and support responsibility are accepted |
| No telemetry/cloud initially | Use manual friend/family playtest logs and optional privacy-respecting analytics only with valid disclosure/consent as applicable; no fake retention metrics |
| Google Play release | Need final actual listing artwork/screen captures, public HTTPS privacy/support, accurate audience/Data safety, private upload signing and account-specific testing gates |

## Lean milestone decision gates (stop criteria)

1. **Before any new mode**: user has approved one current match loop on a phone; no red/unclear input; known return-to-menu and results; current preview progress can be backed up and updated safely.
2. **Before first store beta**: signed AAB, assets/privacy and audience declarations, test track eligibility; public claims match manual acceptance. On eligible newer personal Play developer accounts, 12 continuous opt-ins / 14 days may be required.
3. **Before LAN called ready**: real two-phone 1v1 with 0 bots, ready/start, 10 back-to-back matches, rule change/rematch and disconnect handling.
4. **Before remote PvP**: backend cost cap, simulated 50/100/200 ms latency and loss, secure input-authority design, at least two networks, staff/owner moderation route.
5. **Before monetization**: basic retention and play-time signals from consented tests, in-app purchase verification, restored entitlements, compliant support/refund path, clear cosmetic-only statement.
6. **Any regression:** prefer rollback, not a total visual redesign. Keep P-03 pilot, Version A icon, approved controls and core arenas unless empirical device testing identifies a material defect.

## Proposed tiny first prototypes (when no device is available)

- Design a **Ricochet Trial #1** on a deterministic small maze: one stationary target, two legitimate bounce routes, no time limit on the first attempt, “best shells used” and a **Restart Trial** action; all progress local. This is a **proposal only**.
- Write the **Daily Sector seed contract**: date + generator version + supported map/mode; ensure changing date never purports to be a globally ranked result; store just recent local best and avoid changing normal Quick Play's random seeds.
- Mock **Duel preset** as existing 0-bot LAN config, no more mode navigation; only implement once two phones are physically testable.
- Brainstorm 3 original bot behavior archetypes with hard caps; defer simulation until physical game feel is approved.

## Decisions requiring the owner's explicit selection (NOT YET LOCKED)

**A. Launch:** Solo-first Play v1 vs hold for LAN 1v1 verified.  
**B. Next content:** Ricochet Trials vs Daily Sector vs AI archetypes.  
**C. Online:** defer until working/accepted local play and an ongoing server budget.  
**D. Cosmetics:** earned-only for v1; optional later direct-sale packs and whether to omit ads entirely.

## External sources verified 2026-11-01

- Current phone target SDK: https://support.google.com/googleplay/android-developer/answer/11926878
- Account-dependent closed testing: https://support.google.com/googleplay/android-developer/answer/14151465
- Android 17 LAN behavior: https://developer.android.com/privacy-and-security/local-network-permission
- New Play Local Network Permission policy (announced October 29, 2026): https://support.google.com/googleplay/android-developer/answer/16935362
- Android NSD: https://developer.android.com/develop/connectivity/wifi
- Play Games Services: https://developer.android.com/games/pgs/console/enable-features
- Billing lifecycle: https://developer.android.com/google/play/billing/integrate
- Play ads policy: https://support.google.com/googleplay/android-developer/answer/9857753
- Colyseus: https://docs.colyseus.io/

**Change control:** This is a brainstorm/plan artifact, not approval to implement, rename app packages, merge PR #85, publish publicly, charge money or deploy a multiplayer server.

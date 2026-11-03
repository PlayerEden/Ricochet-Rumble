# SECTOR REBOUND — MASTER DEVELOPMENT PLAN

> **Implementation checkpoint 2026-11-02 (D3-A0 source):** The first new engineering branch `experiment/lan-room-state-d3-a0` introduces a **pure tested-in-CI room/actor-controller API** with two reserved seats, bot backfill, spectate/queue roles and replay-resistant command contract; see [A0 handoff](LAN_ROOM_KERNEL_D3_A0_2026-11-02.md). **Not yet wired into host gameplay**, so the real next user-playable milestone remains D3-A1. Version 0.9.71 and stable `main` remain unchanged. Do not mark A1 or two-device networking complete from the A0 code alone.


**Canonical cross-project roadmap / audit checkpoint: 2026-11-02 (America/Kentucky/Louisville)**  
**Status:** Master planning and issue-triage reference for the experimental game. **NOT** a release authorization, not a declaration that future features are built. This document supersedes older "next step" recommendations in the 2026-10-27 through 2026-11-01 roadmaps where they conflict with tested source or the owner's current D3 direction. Historical design Bibles and technical audits remain linked evidence, not deleted.

## 0. The shortest possible project brief
**Game:** Sector Rebound, a mobile-first tactical top-down ricochet arcade shooter; vehicle combat (tank/mech), vulnerable human pilot, ejection/recovery, short scored/survival matches, AI combatants, fresh procedural maze, honest team identities and optional offline cosmetics. The signature experience is **deliberate angled shots, interesting movement choices, quick rematches and unpredictable but fair maze routes**, not twitch-shooter speed, a live-service storefront or an account requirement.

**Development reality (not mainline reality):** A substantial playable experimental codebase and verified owner preview already exist. The main deficiency is **integration, subjective game feel, physical device/network acceptance and store preparedness**—not an absence of CQC/FFA/TDM/Custom code. Do not add an enormous feature list until the current game feels reliably fun on a phone.

**Current reference and rollback:**
- Stable `main` remains old accepted v0.9.21 source at `9f67b2bea83d552cdbae8af1964c30eecf49022c`; it intentionally does **not** contain the complete experimental game. Do not present `main` as the latest playable 0.9.71.
- Verified D2 experimental source: `333fc9d9ffc5f5ff5e136121217240112def531e` / `experiment/lan-series-d2`. D2 [draft PR #97](https://github.com/PlayerEden/Ricochet-Rumble/pull/97) stacks on [D1 #96](https://github.com/PlayerEden/Ricochet-Rumble/pull/96), [C1 #95](https://github.com/PlayerEden/Ricochet-Rumble/pull/95), B2/B1/A3/A2/A1, and older foundations; no mass merge.
- Latest owner experimental Android preview **v0.9.71**, app ID `com.playereden.ricochetrumble.preview`, versionCode **330001**, same fixed **public AOSP development** signer as v0.9.70. [Android exact-source signed QA PASS #41566002036](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41566002036). [D2 full source/browser QA PASS #41565384859](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41565384859): **101 two-browser-client LAN checks**, **102 UI geometry scenes with 0 errors/warnings**, **44 additional full-game visual screens**. Both are engineering evidence, not two physical phones.
- Immutable rollback: `checkpoint/sector-rebound-v0971-lan-series-signed-ci-330001`. The owner **played v0.9.71 on one phone**, but a comprehensive manual on-device QA log, production update test and two-phone LAN result are still pending.
- D3 **planning only** resides in [draft PR #98](https://github.com/PlayerEden/Ricochet-Rumble/pull/98) / `plan/d3-persistent-lan-rooms`; the room/spectator/queue features are not in v0.9.71. [Full D3 technical contract](design/LAN_PERSISTENT_ROOMS_D3_SPEC_2026-11-02.md).

**Audit inventory (this checkpoint):** GitHub has **56 open pull requests** (mostly stacked, experimental historical dependencies) and **18 standalone open issues**. These are *not* 74 independent unfinished features. Several old issue bodies and mode Bibles explicitly say "not implemented" about systems that the later experimental source **has implemented**. The verified source/tested APK wins over old prose. Preserve historical evidence while moving to one status index.

## 1. Status vocabulary (use these exact distinctions)
- **E — Experimental implemented:** real source in the v0.9.71 experimental branch and/or verified Android preview, **not** stable `main`.
- **A — Automated verified:** focused source/Chromium/Android CI passed exact commit, **not** proof of real two-phone networking or user enjoyment.
- **H — Human tested, limited:** owner has opened/played a recent Android preview, but specific acceptance cases remain undocumented.
- **D — Designed:** agreed design or working proposal; NO runtime/Android functionality yet.
- **B — Blocked/decision:** depends on human hardware evidence, explicit release scope, production secrets, policy or separate project budget.

Track each milestone with **Source SHA, branch/PR, automation result, on-phone result, known failures, rollback, release-scope consequence**. Never label "Done" from a design document, Chrome-only simulated socket, or CI artifact alone.

## 2. Feature-by-feature inventory — what is left?
| Area | Built and available in experimental lineage | Outstanding to call it accepted |
| --- | --- | --- |
| **Arcade combat** | Tank, mech, physical pilot, armor/ejection/recovery, bounce physics, projectile caps, powerups; deliberate steering/fire and procedural arenas. **E/A/H-limited** | Owner comparative feel, on-foot-versus-armor survivability, mobile thumb precision, believable impacts, shot feedback and combat pace **P1** |
| **AI / fair fire** | Bounded AI trajectories/committed shots A1–A3, human-vs-bot turning parity, team-aware targets, friend FF ON/OFF, optional allied trace with privacy constraints **E/A** | Natural human-paced bot matches across three skills, vehicle/pilot parity and AI strength tuning from real phone logs; optional archetypes only later |
| **Match loops** | Survival FFA & Team Survival, pilot-only scored Close Combat, scored vehicle FFA & Team Deathmatch, authentic KOs, respawn and clock/draw rules, Quick Play rotation, Next Match, After Action **E/A** | Focused player playtests of fun, match length, score labels, accidental wrong win/draw, discoverability, novice comprehension; do not claim all older issue text current |
| **Customization/modes** | Offline Custom Match, saved named presets, selectable small/standard/large maps, bot counts/skills, scored presets and local settings **E/A** | Owner phone acceptance and clear invalid option handling in room-host context; no XL/user code editor or guaranteed universal mode mutators |
| **Teams/LAN** | Same-Wi-Fi Android native host/discover/join-IP and Ready lobby with 2-human premise; D1 scored 1v1/2v2/3v3, side choice/bots; D2 opt-in Best of 3 and replicated scores **E/A** | **No genuine two-phone validation yet**; host-alone room, spectator, queue, role transfer and native multi-session accept **D**, with actual Wi-Fi tests **B** |
| **Identity/visuals** | Approved P-03 strict overhead pilot art and motion, tank/mech, industrial UI, v0.9.70 shuffled FFA colors/factions; Version A icon direction, limited animations **E/A** | Preserve approved defaults. Touch/contrast/micro-layout and exact small landscape/portrait real-device approval. Expanded portraits/skins not automatic deliverables |
| **Progression/cosmetics** | Versioned local Dossier, match stats/rewards, starter paints and earned insignia, Hangar, offline backup/export-import **E/A** | Physical install-over/save survival, backup restore/recovery, local state migration, correct account-free reward rules. More color/pattern/trail/portrait packs are separate optional work |
| **Maps/CTF/Daily** | Multi-size procedural maps plus seed/map/path audits; Forward Bays, CTF and Daily Sector exercise/prototype paths in the experimental source and QA **E/A where implemented** | Decide whether either becomes a public menu/launch promise. Real CTF AI objective fairness, base access and field readability, Daily time/clock rules; more topology themes optional |
| **Audio/UX** | Baseline UI/combat SFX, menu cues and separate music/SFX preferences, contextual help and first-match tips **E/A** | Distinct original soundtrack/menu/combat theme and mix, clear sound hierarchy, audio focus/reduced motion, actual newcomer usability tests. No unlicensed music |
| **Android/QA** | API 36, signed isolated development preview, web ↔ Android asset parity, engine/visual/Chrome tests, safety and source provenance **A** | Owner save-preserving update test, real performance/battery/frame pacing, Android background/home/notifications, crash logs, two physical network devices, secure production signing **B** |
| **Google Play release** | Draft privacy/listing materials and read-only fail-closed readiness checks, candidate art, Android build support **D/A** | Final approved store icon/graphic/screens, HTTPS privacy URL, real publisher & support, Data safety/audience/content disclosures, Play upload key, signed AAB, account-specific testing, owner GO decision |
| **Internet multiplayer/commerce** | No trusted dedicated internet server, public matchmaking, friend accounts, ranked, live store/Play Billing, ads, or cloud leaderboard promised **D only** | Scope, security, infrastructure/support cost, identity/privacy, fraud, remote tests; defer after successful core release |

**Scope caution:** An exercise/debug path is not a finished, accessible public game mode; a document catalog of 18 pilots or paid skins is not 18 implemented or purchasable assets. The game should be accurately described as an **offline-capable experimental Android shooter with a local LAN beta**, not as a proven online service.

## 3. Product decisions and protected defaults
**Locked/strongly protected unless owner requests an evidence-backed revision:** top-down P-03 operator silhouette/animation; established tank/mech geometry; clean government/industrial interface; Version A branding direction; camera intent (pilot closer, vehicles wider); deliberate precision/ricochet pace; free/no pay-to-win cosmetics; no forced login; fresh maze each ordinary match; no invasive tracking; exact local result/KO integrity and safe Android save migration. Preserve original combat identities and distinct Cyan/Coral teams regardless of local paint.

**Current planning decisions:**
1. **D3 persistent local LAN room approved as a direction.** Host should be able to enjoy real bot matches **alone on one phone** without a second Ready player. Only later add a late spectator/queued human takeover. **NOT YET IMPLEMENTED.**
2. D3 keeps **at most one remote guest/spectator** initially. Two permanent reserved seats; empty guest seat must be controlled by actual AI, not an idle dummy, and swaps to human only at safe boundary. Stay within six total combatants.
3. Local room runs **only while host Android app is active/foreground**; no cloud permanence or internet-wide discovery claim.
4. Existing free offline gameplay must remain playable throughout development, independently of LAN.
5. Public v1 monetization, full launch roster, whether LAN is promised at launch, and the exact original music scope are **open owner decisions**. **Default recommendation:** no paid shop, no ads, no mandatory account and Solo-first public beta unless real two-device LAN acceptance completes in time.

## 4. One master execution order — milestone gates, not invented calendar deadlines
The work is divided into several tracks but has **one approval path**. The first milestone is independent of access to a second phone. Each outcome is a testable state, not a date or aspirational release number.

| Order | Master milestone / dependency | Concrete deliverable and acceptance gate | Status |
| --- | --- | --- | --- |
| **M0 — NOW** | **Consolidate source of truth and protect builds** | This master document is the single roadmap; top of `PROJECT_STATUS.md` has current exact source. Preserve D2 0.9.71 checkpoint, v0.9.70 and `main`. No speculative merges or APK/signing changes. Triage legacy PRs by ancestor/superseded/actual missing functionality. | This planning PR; runtime untouched |
| **M1 — FIRST NEW PLAYABLE** | **D3-A0/A1: persistent host room and AI guest seat** | Pure room/role machine, host-alone `START VS BOTS`, real AI controls absent guest seat, TDM 1v1/2v2/3v3, host can finish 1 round/Best of 3, preserve team IDs, edit rules/rematch/close lobby without tearing down room; truthful roster. Automated real-engine+Android CI and **owner one-phone playable APK** with safe higher code and same preview signer. | **Designed; next code** |
| **M2 — CORE PLAY QUALITY** | **Make one match feel great** | A/B human phone control accuracy and 10–20-minute replay sessions; pilots vs tanks vulnerability/recoverability, AI believable bank shots and pacing, score/win/round HUD clarity, bot difficulty, procedural route/spawn parity, micro-size thumb-safe controls. Change one variable at a time; keep approved look. Gate is a human positive play report + regression+seeded combat evidence. | Partly engineered; human acceptance pending |
| **M3 — LAN ROOM DEPTH** | **D3-A2/B1/B2/C** | A2 safe host-alone FFA/Survival/Co-op; B1 active room discoverable, one spectator can watch while never controlling; B2 queue for next eligible round/match, bot⇄human transitions, no score/FF/team mutation mid-round; C busy/privacy/reconnect/native accept-loop, pause/stop, packet limits, real two-phone tests. D3 B/C release claim remains blocked until physical Wi-Fi. | **Designed** |
| **M4 — HARDEN & INTEGRATE** | **From experimental branches to an actual clean candidate** | Review exact `main`→0.9.71 lineage/diffs; choose main-rooted integration candidate; reconcile `PROJECT_STATUS.md` conflicts; prune/close only **verified superseded** PRs with links (never delete SHA/backup); pass source parity, 300+ map/AI scenarios, Chromium, Android debug/signed test and full save/upgrade tests. Owner approves merge independently. | Massive draft lineage / no final integration |
| **M5 — CONTENT/ONBOARDING FINISH** | **High-value launch polish without mode explosion** | Newcomer instruction/optional ricochet practice if evidence warrants; clear How to Play, sound mix and optionally 1 original menu + 1 combat loop; legible HUD, menu/After Action, UI/micro feedback; minimal complete starter/earned cosmetics, permissions/backup instructions. Freeze scope before store application. | Partial |
| **M6 — ANDROID & PLAY RELEASE GATE** | **Signed, tested, truthful installable production bundle** | Owner one-phone save-preserving upgrade; 20–30-min frame/memory/heat and pause/rotation; choose **Solo-first** vs **LAN-included**; final package ID, Play upload signing, signed AAB, original licensed store visuals, HTTPS privacy policy, real contact, account testing and console forms, Data safety, age and policy, read-only GO/NO-GO and owner release approval. Test-track rollout only after all mandatory gates. | **NO-GO**, 10-item inventory historically pending |
| **M7 — AFTER BETA** | **Measured return value** | Use actual player feedback to choose only one new content axis at a time: Daily Sector/Trials, Forward Bay/CTF polish, map topology, 1 new vehicle, bot archetypes or earned cosmetics. Avoid simultaneously building all. | Backlog |
| **M8 — SEPARATE LATER PRODUCT** | **Internet PvP/social/commercial** | Dedicated authoritative internet transport, remote casual 1v1/2v2, accounts/friends/reconnect, moderated leaderboard/ranked, secure cosmetic entitlements, optional ads/payments; only with user need, privacy and sustainable operations cost. | Deferred |

### Critical path / where work may overlap
- **One phone now:** M0 → D3-A0 → D3-A1 **owner phone check** → measured M2 combat/UI tweaks. Meanwhile documentation, test scaffolds, source/asset parity and Play listing drafts can progress without claiming acceptance.
- **No second phone:** D3 B1/B2 can be validated in *two independent browser processes* and native socket harness; do not call them physically accepted. Prioritize making the bot room fun, not rewriting transport before A1 passes.
- **When second phone becomes available:** complete the M3-C physical LAN gate in parallel with M4 integration and production-release audit.
- **Public launch branch choice:** an owner-approved **Solo-first** build may proceed after M4/M5/M6 even if D3 B/C remains experimental/hidden; a **LAN-advertised** build depends on M3-C passing real two-device tests. D3 is a development priority, not an automatic global v1 blocker.

## 5. Focused playable target: D3 one-phone owner loop
Required next demonstration: `PLAY TOGETHER → CREATE LAN ROOM → choose TDM/size/AI/side/FF/round count → START VS BOTS → fight → score/After Action → NEXT ROUND or NEW SERIES → CHANGE RULES → leave to still-open room → CLOSE ROOM`.

| Target | What proves it is real |
| --- | --- |
| **No connected phone** | Room created with correct LAN address/status; launch enabled despite `connected=false`, physical host player operates seat 0, other reserved seat is **an actual enemy AI**. No two-human cosmetic lie. |
| **1v1** | Exactly 2 actors: host + enemy AI; genuine AI movement/fire/KO and pilot/vehicle recovery; no opponent standing idle. |
| **2v2 and 3v3** | Exactly 4/6 actors; correct ally/enemy bot controllers by team side; fair targeting and respawn, FF ON/OFF, clear human/AI roster labels. |
| **Real rounds** | Match target/clock, 2–0 clinch, 1–1 decider, draw, maze/KO clock refresh, exactly-once series win and no false rewards across rematches. |
| **Room continuity** | Between matches returns to a live room; changes require next match rules; disconnect/background semantics honest; repeated play does not leak sockets/menus or corrupt settings. |
| **Owner evidence** | First actual D3 preview only after signed higher versionCode, same certificate and game+Android asset verification, with [D3 single-phone test card](LAN_D3_ONE_PHONE_OWNER_QA_2026-11-02.md) completed; keep v0.9.71 rollback. |

Do not treat this one-phone gate as proof of spectator joining, human seat promotion, native network discovery from a second phone or low-latency real multiplayer.

## 6. Gameplay polish backlog (prioritized and bounded)
### P1: experience before feature count
1. **Controls and camera:** preserve established pilot/vehicle zoom and rotation unless a specific measured mobile issue appears. Test stationary micro-angles, bank shots, MOVE+FIRE simultaneity, aiming without thumb occlusion and small landscape/portrait geometry. Follow [control baseline](CONTROL_FEEL_BASELINE_v0949.md), [mobile shooter audit](OPEN_BOOK_MOBILE_SHOOTER_AUDIT_2026-11-01.md), and [targeted HUD QA](LANDSCAPE_HUD_SAFE_ZONES_2026-11-02.md).
2. **Pilot vs armor:** evaluate post-ejection shield, nearby cover, time-to-reboard and comparable three-skill AI; correct unsafe routes before arbitrary damage buffs. Reference [issue #33](https://github.com/PlayerEden/Ricochet-Rumble/issues/33) and the [measured map recovery lab](RECOVERY_PLACEMENT_AB_v09501.md).
3. **AI fairness/variety:** verify direct/bank shots are deliberate and have physical turn caps; avoid magic accuracy or knowingly wasted spam, and assess bot skill differences. Only add bot archetypes if telemetry and owner feel show benefit. No hidden enemy-aim information in guest spectator feed.
4. **Map fairness:** graph connectivity, procedural fingerprints, spawn lines of sight, recovery vehicle reachability and CTF/FOB balanced routes. Compare 300+ seeds per changed mode/size and retain failing seeds, real bot completion behavior. Do not assert all seeds create distinct topology just because seed differs.
5. **Feedback and onboarding:** hits/armor break/ejection/KO/score clarity, concise match rules and help, a first-minute practice hint if user-observed confusion, no giant tutorial, no screen-blocking FX. Track time to first intentional bank shot and whether players choose Next Match.
6. **Sound and performance:** keep independently controlled sound/music, add only original/cleared music if it enhances moments without masking impacts, focus/pause safe; measure frame time on physical Android, optimize actual bottlenecks only. No forced raster/3D engine rewrite.

### P2: optional curated content after core quality
- **Short offline Daily Sector or Ricochet Trials:** choose one; Daily experiment exists but its public readiness must be audited. Reward personal best only until a trusted global server exists.
- **CTF / Forward Bays:** genuine experiment and objective bot work exist; launch only after player-facing mode-specific fairness and mobile-combat clarity.
- **More arenas and AI personality types:** at most one topology modifier or archetype per trial, with documented before/after.
- **Extra tank/mech/vehicle, special powerups:** use balanced role prototypes, model AI and player counterplay, then explicit owner acceptance, not filler quantity.
- **Cosmetics:** expand earned/free colors and patterns after clear team readability and save continuity; optional portrait roster. No paid loot crates, unsupported store buttons or in-combat ads.

### P3: internet and business only after shipped core
- Remote cross-Wi-Fi friend matches require a *new authoritative backend*, reliable networking/anti-cheat, uptime costs, privacy/reporting and many real devices. Local IP discovery does not become internet PvP just by displaying a room code.
- Accounts, friends/platoons/clans, ranked and global leaderboards require recoverable identity, server-side score integrity and moderation.
- Paid cosmetic entitlement/restore/refunds and Play Billing integration are independent release reviews; no purchase should improve stats. Ads (if ever used) never interrupt aiming or active rounds.

## 7. Engineering cleanup: 56 PRs are a dependency graph, not a to-do count
**Do not blindly merge all 56 PRs into `main`, close them wholesale, or rewrite historical branches to make GitHub appear tidier.** Older PRs form ancestry chains, some based on experimental ancestors with doc-only conflicts. The current **D3 design branch is based on exact signed v0.9.71**, while stable main remains v0.9.21. Audit each ancestry edge and exact code diff before consolidation. Existing [integration rehearsal #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85) is a **previous** candidate, not proof it contains D1/D2/D3.

| Backlog class | How to treat | Examples |
| --- | --- | --- |
| Implemented and code-proven in latest lineage | Mark issue "experimental implementation exists / manual acceptance pending"; link actual PR, test run and QA card. Close only after tested integration/owner approval, not on old issue wording. | [#36 TDM](https://github.com/PlayerEden/Ricochet-Rumble/issues/36), [#37 FFA](https://github.com/PlayerEden/Ricochet-Rumble/issues/37), [#38 Custom](https://github.com/PlayerEden/Ricochet-Rumble/issues/38), [#26 pilot](https://github.com/PlayerEden/Ricochet-Rumble/issues/26) |
| Current product / networking work | Keep current D3 scope and release/no-op guards in the master plan; open small code PRs only after A0 contract. | [D3 plan #98](https://github.com/PlayerEden/Ricochet-Rumble/pull/98), [D2 #97](https://github.com/PlayerEden/Ricochet-Rumble/pull/97), [LAN acceptance #22](https://github.com/PlayerEden/Ricochet-Rumble/issues/22) |
| Safety/release/tech debt | Keep open as hard gates until evidence is collected; update rather than duplicate them. | [#20 signing](https://github.com/PlayerEden/Ricochet-Rumble/issues/20), [#29 save continuity](https://github.com/PlayerEden/Ricochet-Rumble/issues/29), [#19 CI provenance](https://github.com/PlayerEden/Ricochet-Rumble/issues/19), [#30 Play scope](https://github.com/PlayerEden/Ricochet-Rumble/issues/30) |
| Research completed / historical prototype | Preserve proof, rename/status-note as superseded when clear; never convert a test-only audit into a released feature. | 3,000-map audit and recovery A/B, early art labs, preliminary layout studies |

**Low-risk integration sequence:** (a) select one exact source ancestor and freeze its SHA; (b) inventory every runtime/asset/workflow addition and doc divergence vs `main`; (c) choose a clean main-rooted integration branch with reviewed merges/cherry-picks, not force-push; (d) reconcile project status/history and provenance; (e) run focused tests then full game/Android/visual/signer QA; (f) perform owner one-phone upgrade/data acceptance; (g) only then seek explicit main merge decision. Store original sources and binaries; large PR counts are an organization issue, not evidence the game needs to be restarted.

## 8. Publication checklist (exactly which hard gates remain)
This retains the [2026-11-01 release audit](RELEASE_CANDIDATE_AUDIT_2026-11-01.md) (historically 9 engineering PASS / 10 publication PENDING); inspect latest Play policy at submission, not from stale screenshots.
1. **Select launch contents and truthful listing**: Solo-first vs LAN-certified; whether CTF/Daily are hidden tests or promised modes. Owner scope signoff.
2. **Product quality:** tested solo game loops, good on-phone steering, readable HUD/KO/respawn/modes, newcomer Help, 20–30-min sessions without recurring crash or unexplained frame/thermal issues.
3. **Data durability:** export/restore proof and saved presets, Dossier, Hangar and progression retained on **actual device** through correct-version compatible installs; no uninstall to hide signer mismatch.
4. **Android production identity:** final `applicationId`, target/manifest/permissions and privately retained **Play UPLOAD key**, signed production AAB. Public AOSP test signing certificate is **not** a release key. Do not publish encrypted key material, credentials or personal data.
5. **Correct store graphics:** approved 512px store icon, 1024×500 feature graphic, real-game screenshots, clear copy and correct title/permissions. Launcher icon and Play listing icon are different deliverables.
6. **Legal/privacy:** publisher/support details, accessible public HTTPS privacy policy reflecting LAN/local storage/backups, accurate Data safety, age/content rating, ads/IAP details **only if actually present**, commercial rights ledger for original/generated sound/art, title/brand review.
7. **Play Console testing:** check developer-account eligibility and actual current account-specific internal/closed/open track rules, submit verified package with test feedback and crash reports; no claim testing has happened before it has.
8. **LAN conditional gate:** two physical phones on same Wi-Fi (discovery + IP, no bots 1v1, scores/roles/FF/3-round changes, reconnect/host exit, actual latency/jitter); **mandatory only if LAN will be publicly advertised as ready**. If not passed, clearly mark or remove LAN public claim for first release.
9. **Integration and rollback:** tested exact source SHA, full smoke + screenshots + APK/AAB byte/source audit, signed checksums, original branches and known-good artifacts; staged migration and fail-safe rollback.
10. **Owner explicit GO** for selected feature scope, store text, ads/none, privacy, build identity and first release track. GitHub CI may propose but not substitute for this decision.

## 9. Success metrics and evidence (do not invent current values)
| Question | Practical evidence to collect |
| --- | --- |
| Is first gameplay clear? | 3–5 uncoached people: time to first match, first hit, first bank shot, first correct interpretation of armor/ejection, number of confused menu interactions. No user data collection without choice/permission. |
| Does the match loop feel replayable? | 10–20-min one-phone sessions: voluntarily chosen rematches, KOs/min, match-end cause, total downtime, vehicle recovery time, qualitative frustration. Treat initial targets as hypotheses. |
| Are bots fair, not simply weak/omniscient? | Human-vs-AI rotation timing, true LOS/bounce, 3 skill tiers, bot travel and stationary/blocked cases over reproducible seeds; request owner feel verdict. |
| Are maps fair and fresh? | 300+ seeded per changed mode/size, connected paths, shortest safe exits, line-of-sight/start fairness, vehicle access; topology fingerprints where feasible. |
| Does multiplayer work? | Two-client Chrome harness now, then Android Java lifecycle tests, finally **two physical phones** with both input streams, host authoritative score and role transitions. |
| Is mobile stable? | Physical FPS/framing percentiles, memory and heat after 20–30 min, orientation/interrupt/focus, cutout and touch targets at real scale. |
| Is a build safe to upgrade and publish? | App ID/SDK and versionCode match, real signer chain, embedded assets match SHA, save retention proved by owner, AAB production key private, Play test track accepted. |

## 10. Decisions deliberately left to the owner
| Decision | Default proposal pending explicit approval | Effect |
| --- | --- | --- |
| **First public Play scope** | **Solo-first core**, LAN marked experimental/hidden until two-phone acceptance; preserve owner-approved D3 development | Avoid an indefinite app-store block from missing second hardware; never falsely advertise LAN |
| **Near-term development emphasis** | D3-A0/A1 *first*, then game-feel/QA while advanced networking works in separate steps | Delivers immediate useful one-phone testing as requested |
| **Sound/music** | Keep existing cues, add an original low-key menu loop/combat cue only after comparison on phone | Distinctive identity without masking shots or risking rights |
| **Launch extra modes** | Ship core Survival/CQC/FFA/TDM/Custom; release CTF/Forward Bay and Daily as separate tested candidates unless separately accepted | Fewer unfinished interactions and mode-specific QA |
| **Money** | No IAP or ads in first beta; cosmetic-only business later | Simpler user trust/Play policy & save security |
| **Release identity/source** | Preserve game title Sector Rebound, review final Android app ID/publisher before public Play; GitHub repo rename is independent | Avoid irreversible package/data/name mistakes |
| **Feature expansion** | One focused replay mechanic or one arena/AI variant after release, not full roster + 3D + remote friends at once | Less scope creep and better quality |

## 11. Next three implementable tasks, in order
**TASK 1 (next code PR): D3-A0 testable room and actor-control model.** Branch from `333fc9d9ffc5f5ff5e136121217240112def531e` (or separately reviewed exact tested source). Build a pure `room-session` state machine, `actorController` per reserved seat, versioned room/guest role contract, and tests for host only, late spectator, queue accepted/rejected, AI controlling empty seat and return to lobby. Avoid menus/native packet rewrite in same slice. Preserve rollback, exact source parity.
 
**TASK 2 (first owner APK): D3-A1 complete no-guest TDM room.** One phone actually hosts, launches real 1v1/2v2/3v3 with opponent AI and balanced teams, completes series, edits rules, new match, close room, no fake human or accidental LAN rewards. Engine, Android, real browser scenes and signed-in-place preview QA before asking owner to use [10-case acceptance card](LAN_D3_ONE_PHONE_OWNER_QA_2026-11-02.md).

**TASK 3: owner feedback-directed polish and targeted device reliability.** Record thumb accuracy, perceived bot balance, time/ejections/vehicle recovery, round transitions, controls and performance before one-variable changes. Simultaneously, set up the separate Java native socket and Chrome two-client tests required for B1/B2 without claiming the second handset has joined.

**Definition of success:** The owner can have an honest, engaging complete game session **as a LAN host without anybody joining**, while a safe technical path to spectator and queued human joining exists and the Google Play release blockers remain visible and actionable.

## 12. Navigation — what the other plans are for now
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** — short newest-first factual handoff: current SHAs, verification, owner notes, next slice.
- **THIS MASTER PLAN** — **the one ordered roadmap** and decision register for game, networking, quality, integration and store.
- **[D3 persistent room design](design/LAN_PERSISTENT_ROOMS_D3_SPEC_2026-11-02.md)** — implementation contract for the next multiplayer work.
- **[One-phone D3 acceptance](LAN_D3_ONE_PHONE_OWNER_QA_2026-11-02.md)** — what the owner can physically confirm before second device.
- **[Development protocol](DEVELOPMENT_PROTOCOL.md)** — exact GitHub branch/test/rollback and handoff discipline.
- **[Execution plan 2026-10-30](DEVELOPMENT_EXECUTION_PLAN_POST_AUDIT_2026-10-30.md)** — historical detailed measurement/QA track; current D3 note appended. Older "NOW" labels are history.
- **[Roadmap to Google Play v1](ROADMAP_TO_GOOGLE_PLAY_V1.md)** — historic original gate plan; Play requirements and dependencies only where not superseded by this master.
- **[Future roadmap/idea bank](FUTURE_ROADMAP_2026-11-01_PROPOSAL.md)** and **[design Bibles](design/README.md)** — proposals and creative ideas, *not* implementation claims or release blockers.
- **[Release-candidate audit](RELEASE_CANDIDATE_AUDIT_2026-11-01.md)** and **[Play readiness check](GOOGLE_PLAY_RELEASE_READINESS_2026-10-31.md)** — source-backed compliance/testing record, reassess at release.
- **[Branch register](BRANCH_REGISTER.md)** — historical and current branch preservation; actual source/tested SHA always outranks age of a doc.

# Sector Rebound — Open-Book Competitive, Mechanics & Engineering Audit
**Research date:** 2026-10-30 · **Type:** read-only comparison and source review, **not** a new build or hands-on benchmark · **Decision:** retain the approved game's core; fix proof gaps before expanding features.

## 0. Evidence and exact scope

**Code examined:** [consolidated experimental integration PR #71](https://github.com/PlayerEden/Ricochet-Rumble/pull/71), branch `integration/v0947-consolidated-preview`; its actual `web/game.js`, `web/scored-match.js`, `web/dossier.js`, `web/save-backup.js`, `android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java`, `android/app/build.gradle`, `AndroidManifest.xml`, and regression suites. Latest [v0.9.48 CSS-only layout PR #74](https://github.com/PlayerEden/Ricochet-Rumble/pull/74) was inspected as an additional child revision; it has not altered game.js. Stable main still runs the older known-good game version and has newer *documentation*; **do not mistake the draft integrated candidate for merged main**.

**Internal QA:** [v0.9.47 targeted/overall audit](QA_TARGETED_AND_OVERALL_v0947.md): 24 complete simulated scored bot matches, 300 unique connected maze samples, no unsafe respawns observed; earlier real Chromium and Android build QA PASS but **not real two-phone LAN or user-installed APK migration**. [v0.9.48 UI audit](QA_UI_LAYOUT_v0948.md): 80 real browser-rendered menu/HUD/after-action states pass geometry tests, which do **not** prove compliance with Android 48dp accessibility targets or physical handset cutout behavior.

**External comparison method:** public primary developer/store descriptions and technical documentation, **not** claims that we physically tested every competitor, obtained their source code, surveyed players or measured their retention. No benchmark FPS, network latency, download conversion or superiority ranking is asserted without comparative device data. Recommendations below are hypotheses until measured.

## 1. Where Sector Rebound fits

**Potential strongest pitch:** *Deliberate top-down ricochet duels in a different navigable maze every round, with a vulnerable on-foot operator who can recover or change vehicles.* Three systems reinforce one another: shot patience and bank geometry; shifting cover/navigation; and armor loss → pilot ejection → recover another ride. The two-handed top-down P-03 pilot and subtle movement are **owner design-locked**. Avoid replacing this with a high-speed bullet-hell game or 2.5D visual style.

**Comparators and useful lessons**

| Game (primary link) | Mechanic / business-facing evidence | Applicable lesson | What **not** to copy |
|---|---|---|---|
| [TankTrouble community competition](https://ttoc.ca/gamemodes/) | Last-tank-standing Classic, aim-focused no-movement-on-fire 'Golf', and defined rounds and win conditions | Deliberate aiming, meaningful limited shots, optional precision challenge or training drill; ricochet mastery can be the content | Do not clone exact maze/art/mode identity or force the slowest possible steering into every mode |
| [Brawl Stars](https://play.google.com/store/apps/details?id=com.supercell.brawlstars) and [Supercell controls design](https://supercell.com/en/games/brawlstars/blog/news/new-power-brawl-pass-changes-and-a-new-starr-drop-2/) | Fast mobile modes and aimable gestures; Supercell explicitly adds depth **without new buttons**, leaving tap behavior available | Improve discoverability and control precision inside existing joystick/FIRE/AIM design; quick replay from results, optional training | Not an argument for auto-aim, abilities on every corner, pay-to-win, or hundreds of character kits |
| [Boomerang Fu](https://www.boomerangfu.com/) | Very few controls, short repeatable rounds, skillful bank/curve/deflection and user-configurable powerups | Focus on **seconds-to-first-action**, readable KO outcomes, rematch reliability; optional modifiers with clear defaults | Do not import its cute art, identity or 30 preset arenas; random mazes are our advantage |
| [Tiny Tanks](https://store.steampowered.com/app/836850/Tiny_Tanks/) | Modes + optional modifiers, destructible environments, weapon crates and modular tank cosmetics | Existing Custom Match + powerups can eventually expose simple optional rules; cosmetic vehicle variants are plausible | Destructible terrain and huge mode matrix would complicate maze fairness, performance and network sync |
| [Treadnauts](https://store.steampowered.com/app/695970/Treadnauts/) | Physics-expression, 2–4 player party fighting, three AI difficulties, target-test mode and powerups | A simple **bank-shot target range** could teach ricochet skill without changing match balance | No need for wall climbing/rocket jumps that break the grounded tank duel |
| [ShellShock Live](https://store.steampowered.com/app/326460/shellshock_live) | Artillery planning, many weapons and progression loops | Clear shot outcomes, long-term goals/cosmetic rewards are useful design patterns | 400+ weapons, stat upgrades, large economy and grind are inappropriate for a lean fair PvP launch |

**Product conclusion:** current differentiation is meaningful as a *combination*, not a claim that ricochets or random mazes are globally novel. The strongest identity is **skillful and fair ricochet combat**, not the number of modes, currencies, weapons or visual effects. Preserve accessible baseline modes; make the other features opt-in.

## 2. Core combat and movement — code-grounded review

**Implemented and good**
- `web/game.js`: physics `STEP=1/60` with an accumulator/capped fixed updates; render uses `requestAnimationFrame` and time-based deltas. Avoids the common bug in which faster phone refresh rates make gameplay run faster. [MDN rAF](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) / [fixed-step example](https://bevy.org/examples-webgpu/movement/physics-in-fixed-timestep/).
- Shells are substepped to bound tunneling, bounce on walls/bumpers, expire by lifetime/bounce count, and obey per-operator caps and cooldowns. Pilot sidearm doesn't ricochet. Vehicle armor precedes pilot elimination. Friendly fire and scored KO rules have a separate testable `web/scored-match.js` kernel.
- Scored vehicle movement uses explicit `SCORED_FFA_VEHICLE_PACE = { human:166, bot:136, turnRate:2.6, aimTurnRate:1.8 }`; tactical control is deliberate rather than hypersensitive. Tank shell speed 415 and base tank firing cooldown 0.36 sec, but **only up to the active shell cap** (default four). P-03 pilot on foot is faster at 268.
- Fairness protections: scored KO incident IDs avoid duplicate credit, scored respawn candidate restrictions, team-aware deaths and draw outcomes. Existing bot/maze CI samples passed.

**Key design discrepancy, to measure rather than blindly fix:** The slower 166 movement and 2.6/1.8 turn/precision rates apply to **scored vehicle matches**. Normal Survival vehicle speed uses `222` for a human (bots `178`), with hull turn rate up to `12` rad/s outside the tactical scored branch; mech multiplier .76 applies. These modes can feel like **two different tank handling systems**. Because owner previously sought Tank Trouble–style deliberate bank shots, compare **Survival vs Scored FFA**, controlling for fire rate, speed, turn sensitivity and objective, before selecting one unified feel.

**Another important difference:** `tankMove()` derives velocity components directly from joystick world-space X/Y and eases hull angle toward that direction; travel isn't constrained to the vehicle's current forward vector. This allows sideways motion while the hull catches up. That is a valid twin-stick arcade choice, but **not classical forward/reverse + rotate tank steering**. Offer an **optional training comparison** only if player feedback shows it matters; **do not silently replace approved controls**. A zero-new-buttons solution (hold/fine-aim behavior with clear dead zone and sensitivity testing) is more promising than adding another thumb pad.

**Focused experimental checklist (no code modification authorized here):** measure missed tap/fire transitions; 5°/15° bank-shot aiming errors; 180° turning time; player overtaking their own shell; angle preservation on wall impact; pilot dismount/reboard frustration; practice vs scored vehicle handling. Capture by mode and vehicle with 30/60/90/120Hz screens.

## 3. Procedural maze generator — genuine asset, also a fairness risk

`createMaze()` grows a seeded depth-first graph and creates optional extra corridors with `rng()<.16`, providing loops rather than dead-end-only mazes. Seeded maps can be reconstructed by host and guest, and the existing sample demonstrates connectivity and uniqueness.

**Limitation:** connected + unique does **not** prove balanced combat. Random spawns may create unequal cover, long straight-fire lanes, impossible-to-approach vehicle pickups or ricochet angles that disproportionately favor a spawn. The existing `chooseSafeScoreSpawn` checks proximity/line of sight at respawn, a positive protection, but we should analyze **map difficulty statistics**. Proposed nonvisual metrics per 1,000 seeds/size: dead-end ratio; 90th-percentile shortest-path distance; spawn-to-spawn shortest path and line-of-sight exposures; cover count within 2 tiles of each spawn; pickup travel costs; shot bounce opportunity distribution; search/rejection of extreme seeds. Use two or three **playstyle profiles** (open, corridor, twisted) rather than guaranteeing every random layout is equally fun.

**Do not replace procedural maps with a fixed rotation**: this would sacrifice Sector Rebound's clearest lasting differentiator.

## 4. Controls and accessibility

**Strengths:** left joystick, separate FIRE/hold-drag on-foot aiming, precision vehicle AIM in scored modes, accessible control swap, settings persistence, short onboarding coach and real responsive menu hitbox audits. Supercell's documented pattern of expanding joystick depth **without adding more buttons** is particularly relevant.

**Open issues:** Existing v0.9.48 geometry test flags only *very small* controls (30px height) and visible overlap; it does **not** certify Android's recommended minimum **48dp by 48dp effective touch target**. [Android accessibility guidance](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views). Specific small UI affordances (short-screen home utility, pause audio keys, compact preset controls) deserve an effective touch-zone review; layout pixels are not necessarily dp. A [May 2026 Brawl Stars competitive community post](https://www.reddit.com/r/BrawlStarsCompetitive/comments/1trkx25/improve_controlsaiming_experience/) complains about control obstruction/opacity; this is a **single anecdote**, not representative research.

**Suggested quality measures:** two-thumb left/right independent pointer hold, cancel on interruption, one-hand swap orientation, pause resume without ghost input, continuous drag while firing, 10-minute sessions on 2 screen sizes, accidental activation counts, screenshot of user finger occlusion. Do not force auto-aim or recoil gimmicks that remove ricochet decision-making.

## 5. UI, progression and replay value

- Recent **v0.9.48** layout checks found and repaired narrow landscape home/preset/HUD defects; the last audit covered **80 real rendered states** and passed. This is good engineering QA, but not human comprehension testing.
- Current menu displays Quick Play, nearby play, Settings, CQC, FFA, TDM, Custom. The richness is useful, but can be overwhelming to a brand-new player. Keep **Quick Play visually dominant** and treat scored trials/custom rules as secondary, as currently intended.
- Current local Dossier/backup is a sensible offline-first foundation; `web/dossier.js` and `web/save-backup.js` already separate these from game.js. Do not claim account sync, real cosmetic unlock fulfillment, friends, ranked or store purchases where none exist.
- Closest low-risk competitive enhancement: a **Ricochet Range / 3 short target trials** to learn angle, bouncing and shell cap, with clear retry. This helps mastery much more cheaply than immediately adding vehicles or modes. Test whether the existing coach already suffices before implementing.
- Cosmetic-only progression can help personalization without pay-to-win balance drift; implementation **and** billing are future phases. If paid random cosmetics are ever introduced, Google Play requires clear nearby **odds disclosure before purchasing randomized items**: [Play policy](https://support.google.com/googleplay/android-developer/answer/18265346). Prefer direct cosmetics early for simplicity.

## 6. Multiplayer — the biggest functional uncertainty

**Strong design:** local LAN via Android `NsdManager`, TCP sockets, discovery + manual IP; host controls combat `step()`, guest transmits inputs and receives state. Host-authoritative simulation is safer than letting each phone award its own kills. Native packet length/type checks and restrictive asset-only WebView are present. [Authoritative input/state rationale](https://www.gafferongames.com/post/networked_physics_2004/).

**Specific gap in actual code:**
- `loop()` sends host `serializeState()` on a timer `>.09` (**roughly 11 snapshots/s**) and guest controls on `>.05` (**roughly 20 input messages/s**). The guest case `'state'` assigns `state=upcoming` immediately before rendering; no snapshot ring buffer / timestamp-interpolation layer is apparent. That can create visible jitter under real Wi-Fi packet timing, despite fast local LAN. [Snapshot interpolation explanation](https://www.gafferongames.com/post/snapshot_interpolation/).
- The guest `input` packet is created from movement/FIRE; the host `guestInput` handler copies only `moveX`, `moveY`, `fire`. Separately, independent aiming in `tankMove` is primarily enabled for **local solo pilot/scored vehicle**. Thus guest parity with solo on-foot/precision aim is **not demonstrated by current LAN code**. Investigate via a two-phone input trace before deciding whether this is intended LAN mode scope or a defect.
- TCP is simple and reliable on LAN but can stall delayed state behind retransmissions (head-of-line blocking); no concrete packet size/jitter/backlog measurements exist yet. Don't port to UDP/WebRTC merely on theory; first record actual RTT/jitter and snapshot sizes on two devices, then add a small visual interpolation buffer if needed.
- No actual remote matchmaking/friends/rooms backend in current build. Do not promise public internet PvP/2v2 ranked as available now. Android's future **API 37 local-network permission** will affect direct LAN communication when target SDK is raised; current build targets 36, so **not an immediate defect**. [Android local-network policy](https://developer.android.com/privacy-and-security/local-network-permission).

**Recommended 2-phone test matrix:** same router / dual-band 2.4 and 5 GHz; host/join/discovery vs manual IP; 5-minute duel with ejection/reboard; simultaneous FIRE+move; rotate background/resume; host exit during shot; retry/guest reconnect; moderate induced Wi-Fi jitter; both phone versions/permissions; trace positional divergence and input-to-visual latency. Mark each PASS/FAIL with model/Android version/commit.

## 7. Code architecture, reliability, performance

**Positive:** for a small indie, plain Canvas + WebView, separate scored-match/dossier/save-backup modules, mirrored Android assets and many automated CI tests are practical. No engine migration is warranted. The real v0.9.47 integrated source passed Chromium and debug Android build tests, and source QA is not merely a screenshot mockup.

**Maintainability risk:** `web/game.js` is approximately **134k characters / 1,603 lines**, with simulation, controls, menu DOM, audio, rendering, AI and networking in one IIFE. `web/style.css` is approximately **75k characters / 737 lines** with many layered overrides. `tests/smoke.mjs` is approximately **140k characters / 2,173 lines**. Main Web and Android files are **duplicated** and parity-tested, so they can silently diverge if an edit bypasses those tests. These sizes do not automatically make code bad, but increase regression and context/handoff cost. **Extract by dependency over time**: `input-controls.js` / `renderers.js` / `audio.js` / `lan-protocol.js` with tests and checksummed asset copies. Avoid a giant rewrite immediately before release. In particular, make Web JS the one canonical source and copy into Android as a CI packaging step with hash/manifest verification.

**Frame loop:** physics fixed `1/60`, accumulator capped `.12`, up to 5 updates/frame. This limits the 'spiral of death' after stalls; however, heavy throttling can **discard simulation time** and make matches appear slower under long frame hitches. Keep limit; run background/foreground and 30/60/120Hz soak tests before changing it. Browser `requestAnimationFrame` callbacks often stop when backgrounded (MDN), and current code contains a visibility pause path.

**Canvas performance risk:** full canvas repaint, particles, dynamic FX and capped DPR (`min(1.6, devicePixelRatio)`) are reasonable for visual clarity but FPS, p95 frame time, allocation, network queue, battery and thermal evidence have **not been measured on actual long Android sessions**. Android advises frame pacing and thermal/power profiling, and Play visibility is affected by crash/ANR vitals: [power guidance](https://developer.android.com/games/optimize/power), [Android vitals](https://developer.android.com/games/optimize/vitals). Start with measurement: 30-minute session, low/mid-range handset, FPS p50/p95 and hitches, memory, battery/temperature, app lifecycle; only then introduce object pooling, cached static arena layer or adjustable render fidelity if profiling shows a bottleneck. Don't suggest native AGDK/Swappy plug-and-play for WebView Canvas without engine-specific validation.

**Android release:** `targetSdk 36` meets Google's stated post-August 31, 2026 new-app/update minimum ([Play target API policy](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)). Signing remains the actual P0: build variants have guarded externally provided private test/upload keystore variables, but old public debug builds have changed certs, so updating existing installations **cannot** be assumed safe. Android requires matching signer for updates and Google Play separates upload and distribution keys ([Android signing](https://developer.android.com/studio/publish/app-signing.html), [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en)). Keep owner-controlled keys private and simulate **two same-cert upgrades with data retained**, plus manual export recovery, before promising seamless updates. Production unsigned AAB ≠ Play-ready AAB. Existing `allowBackup=false` makes user-controlled offline backup especially important.

## 8. Honest competitive assessment (qualitative, not an invented numeric rating)

| Area | Sector Rebound against references | Confidence / status |
|---|---|---|
| Core hook / differentiation | **Promising**: slow tactical bank shots + armor/eject/recover + procedural maze | Code backed, player-market validation unmeasured |
| Bullet economy / ricochet physics | **Established engineering foundation**, limited ammo + bounces + tested rules | Automated regression PASS; competitive feel unmeasured |
| First-session controls | **Mixed**: clear buttons/coach, but classical tank vs world-space twin-stick behavior differs; different modes have notably different tank pacing | Code verified; real newcomer trials needed |
| Replay variety | **Strong procedural potential**; no fixed-map memorization; optional mode mix | 300 unique maps in test; fairness distribution not characterized |
| Solo AI and modes | Multiple modes, 3 AI difficulties, recoverable vehicles | Automated bot-match QA PASS; on-device balance not proven |
| Local multiplayer | Host-authoritative LAN exists, **not validated in real two-device sessions**, snapshots not smoothed | Source evidence; most important multiplayer test gap |
| UI layout | Substantially improved, 80 automated responsive screen states PASS | Browser geometry, not full accessibility/phone sign-off |
| Progression and social | Early local dossier and cosmetics concept; **no shipped account/remote friends/ranked economy** | Code/roadmap verified, not ready to promise |
| Maintainability | Adequate indie foundation, but oversized mixed-responsibility files and duplicated assets | High confidence source observation |
| Store readiness | API target okay; signer migration, real data safety, physical tests and Play declarations remain | **Release NO-GO** |

## 9. Prioritized recommendations — adopt / test / reject

### P0 — prove before promising LAN or publishing an update
1. Durable owner-held **test signer** with two in-place upgrades and unchanged real local save records; preserve export/restore before migration.
2. Real two-phone LAN matrix and player input parity (guest aim/firing), state smoothness, reconnect/error handling. Measure snapshot payload bytes, RTT and positional jitter.
3. Real Android 20–30 minute gameplay, interruption/resume, memory/frame pacing/heat, touch controls and smallest safe-area/cutout phones.
4. Release privacy/Play App Signing, upload AAB and full pre-release integration/rollback proof; avoid publishing an unsigned CI artifact.

### P1 — make the core competitively compelling after first human tests
5. Run controlled **Survival vs Scored vehicle handling** comparison before universal speed changes; preserve the owner-approved pilot and any winning control preset.
6. 1,000-seed procedural fairness audit with graph/topology/spawn/bank-shot opportunities; reject extreme maps while preserving unpredictability.
7. A 60-second *optional ricochet range* / tiny challenge mode only if novice tests reveal trouble learning bounce aiming.
8. Check **effective 48dp touch targets** and gesture occlusion (the successful 80-screen geometry test did not assert this).
9. Instrument minimal, **privacy-preserving, offline-only** debug counters (first-fire time, accidental taps, shots/KO, exit→reboard time and frame-time histograms). No mandatory analytics or login.

### P2 — after strong core and reliable networking
10. Modularize one subsystem per pass, keep exact tests and public known-good rollback; automate Web→Android asset sync.
11. Expand cosmetic selection (direct/unlocked cosmetic-only choices), device-local progress; defer paid random rewards, accounts and Play Games until end-to-end data ownership is clear.
12. Consider remote friend play / online 1v1 / ranked as a **separate backend product**, with security, identity, matchmaking, reconnect, account/report/moderation and cost budget. Online is not a room-code toggle on the LAN client.
13. Powerup/modifier experiments only where they increase **precision and mind-games** without undermining readability or introducing pay-to-win.

### Explicitly avoid for now
- Wholesale engine migration, rewrite in Godot/Unity, full networking protocol replacement without measurements.
- More weapons/vehicles/menus solely to match other games' feature counts.
- Fast twitch movement that outruns slow bank-shot decision-making.
- Destructible terrain or random competitive rewards before testing performance/fairness/compliance.
- Silently touching the owner-locked P-03 visual design, proven core menus/audio, or stable `main`.
- Treating automated screenshot/geometry/simulation pass as real Android Wi-Fi, player retention or Play production approval.

## 10. Proposed acceptance experiments and decision gate

**Cheap research week (no feature creep):**
- **Newcomers:** 3–5 testers try cold start without coaching. Capture confusion points, time to first shot, time to first intentional bank hit, whether Quick Play is discoverable, what they think FIRE/aim controls do; record per handset.
- **Competitive feel:** within same testers, A/B the *existing* Survival and Scored vehicle tuning. Record choice preference plus five deliberate 15° bank shots each and vehicle recovery. Do **not** compare two modes as equal skill trials without accounting for score/AI differences.
- **Multiplayer:** two physical phones on same Wi-Fi run 5–10 minutes, deliberately cause ejection, simultaneous input, loss and reconnect, capture control lag and role parity. No sign-off until it succeeds on both devices.
- **Technical baseline:** p50/p95 frame time, battery/temperature after 20–30 minutes, stall/resume, and saved progress after correctly same-signed update. Set thresholds using actual test-phone capabilities rather than inventing universal performance promises.

**Recommendation:** **Keep the game we built**. Prioritize proof of the play-feel and LAN experience over chasing feature parity with large studios. The current package is a promising playable indie prototype and successful automated engineering candidate, **not** a proven competitive-market winner or Play-ready release. This report is research and an execution backlog, **not authorization for code, balance, signing or production merges**.

---

### Primary external sources used
1. TankTrouble competition modes — https://ttoc.ca/gamemodes/
2. Brawl Stars publisher listing — https://play.google.com/store/apps/details?id=com.supercell.brawlstars
3. Supercell control design statement — https://supercell.com/en/games/brawlstars/blog/news/new-power-brawl-pass-changes-and-a-new-starr-drop-2/
4. Boomerang Fu official — https://www.boomerangfu.com/
5. Tiny Tanks Steam — https://store.steampowered.com/app/836850/Tiny_Tanks/
6. Treadnauts Steam — https://store.steampowered.com/app/695970/Treadnauts/
7. ShellShock Live Steam — https://store.steampowered.com/app/326460/shellshock_live
8. Gaffer fixed step/network/snapshots — https://www.gafferongames.com/post/snapshot_interpolation/ and https://www.gafferongames.com/post/networked_physics_2004/
9. Android accessibility — https://developer.android.com/guide/topics/ui/accessibility/views/apps-views
10. Android performance/vitals and Play signing — https://developer.android.com/games/optimize/vitals and https://support.google.com/googleplay/android-developer/answer/9842756?hl=en
11. Play target API / virtual goods policy — https://support.google.com/googleplay/android-developer/answer/11926878?hl=en and https://support.google.com/googleplay/android-developer/answer/18265346

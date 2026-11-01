# Sector Rebound — competitive design and performance delta, November 1, 2026

## 2026-11-01 — exact-source profiler and full Android/Chromium QA confirmed

**New verification after this report was initially drafted:** [full QA run 41272300538](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41272300538) and [fast QA 41272300451](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41272300451) both completed **SUCCESS**, exact source commit `b30bed1f7a9aa908769712895be7c37ee07adb0c`. The real-browser job log includes `FRAME_PIPELINE_REAL_BROWSER_PASS`: **9 combinations × 90 frames = 810 stage samples** with physics, Canvas, HUD and JSON packet histograms; assertions confirmed finite timings, bounded canvas area and serialized snapshots below 32,768 characters in the measured cases. The per-case numeric timings live in the attached `qa-results/frame-pipeline-profile.json` inside [QA artifact 13069114173](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41272300538/artifacts/13069114173); **do not invent stage-specific P95 values without reading it**.

The same exact-source log confirms **30-match / 7,200 physics-step soak PASS**, LAN malformed snapshot handling PASS, 102 UI geometry scenes with 0 fails/0 warnings, Android debug packaging/source attestation PASS, and unsigned AAB build. The generated generic CI debug APK is **not** the owner's signed, install-over-safe preview, and none of these results certify real-phone FPS, thermals, battery life, touch responsiveness or two-phone Wi-Fi. **Recommendation:** no renderer rewrite or live gameplay retune from headless timings; prioritize device measurement and only prototype offscreen-floor caching as an isolated A/B if hardware shows a material problem. No production code or published build changed by this documentation.

---


**Decision:** owner asked what worthwhile work remains without a phone, including comparisons with other games and performance. This updates the [October 30 open-book audit](OPEN_BOOK_COMPETITIVE_TECHNICAL_AUDIT_2026-10-30.md), **not** a replacement and not a claim of consumer playtest or comparative benchmark. Exact source reviewed: [draft PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85), starting 32a0f4fdb7e04015c1d22e3d9bd72c14c3e48f8a. Owner-approved vehicle movement/pilot appearance/menu and icon are locked absent new device feedback.

## Comparable games — translate principles, don't clone features

| Public comparator | Source-verified design principle | Sector Rebound state | Recommendation / limit |
|---|---|---|---|
| [Tank Trouble (official)](https://tanktrouble.com/game) | Immediate maze-based tactical tank duels; ricochet shots and quick repeat rounds are defining parts of the genre | Seeded procedural braids; deliberate fixed-pivot tank handling, limited shells and rounds. 30-start/rematch 7,200-step Chromium soak PASS [41271020848](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41271020848) | **Preserve slower movement, shot limits and fresh maze**; do not add auto-aim or turn every mode into fast projectile spam |
| [Brawl Stars (official)](https://supercell.com/en/games/brawlstars/) / [mode design](https://support.supercell.com/brawl-stars/en/articles/game-modes-13.html) | Fast entry to short clear-objective matches, readable choices and mode win conditions | Quick Play playlist and Next Match after-action results already implemented; 102 browser UI scenes pass without geometry warnings | **Improve quality of match feedback**, not menu density. A single bank-shot highlight in results is a possible isolated experiment, only after checking noise/clarity |
| [Tanks A Lot! (Google Play listing)](https://play.google.com/store/apps/details?id=com.idspe.tanks2) | Different tank roles, visual customisation, multiple team/survival modes | Tank/mech/pilot and cosmetic-only paint/insignia already offer roles; FFA/TDM/CQC/Custom/Survival | Make existing role tradeoffs legible with short *optional* descriptions, not grindable damage upgrades or a large weapons catalog |
| [Pocket Tanks (developer)](https://www.blitwise.com/pocket-tanks) | Skill at finding angles; target practice lowers the learning barrier | Shot angle matters; temporary field coach already teaches basic mechanics; solo and CQC exist | Prototype an **optional 45–60 second bank-shot range** only if novice sessions show players do not understand rebounds; don't make it a mandatory tutorial |

**Community caution:** recent [Brawl Stars menu debate](https://www.reddit.com/r/Brawlstars/comments/1vmqm3y/we_really_have_to_talk_about_how_horrible_this/) contains complaints about menu complexity; this is anecdotal, not population research. Sector Rebound already solved a real owner-reported Hangar/Dossier scrolling issue with compact tabs and immediate Back. Avoid adding multiple duplicate menu entries.

## Current measurable engineering baseline — not phone FPS

Full exact source [41271020848 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41271020848), artifact [13069760555](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41271020848/artifacts/13069760555):
- 9 headless Chromium render combinations, 30 drawn frames each; P95 render time from **0.3ms to 1.6ms**, depending on map and viewport. One sample had an outlier max 4.3ms. These are **not** a hardware FPS claim, battery measurement or thermal benchmark, and 30 frames is insufficient for strong tail-latency estimates.
- 30 match starts/rematches across five modes; 7,200 real JS physics ticks; no invalid state/uncaught errors.
- Real Android API35 preview install-over and bounded native socket reader tests PASS. 102 responsive UI scenes no geometry warnings.
- Engine is a Canvas2D/WebView IIFE, ~155kB game.js; Web and Android asset mirrors are byte-checked, plus scoring/save helpers. The 60Hz fixed physics loop caps at five catch-up steps and calls render on requestAnimationFrame. HUD refresh is about 6.7Hz, host full snapshots about 11Hz and guest inputs 20Hz. This is sensible pacing for an indie LAN prototype; actual latency on two phones is unmeasured.
- Rendering currently redraws visible static facility tiles, walls, and a minimap wall layer on every frame, while limiting DPR to 1.6 and culling world walls outside camera bounds. Canvas `shadowBlur` on live shells and per-tile text are potential hotspots. See [MDN Canvas optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) on offscreen prerender, layered canvases, state changes, integer placement and shadows. Their advice supports an **A/B experiment**, not an automatic rewrite.
- [Android optimization guidance](https://developer.android.com/games/optimize) stresses measuring stable frame pacing, touch latency, memory and sustained thermals rather than inferring device speed from a desktop browser. Native AGDK frame-pacing API guidance does not directly imply it can be dropped into our current WebView renderer.

## What we should actually build / test, in priority order

### P0 — measurement and existing quality, no owner phone required
1. **Frame pipeline profiler:** [new test](../tests/frame-pipeline-profile-browser-qa.mjs) measures 90 actual source frames in 9 map/viewport/actor configurations. Stage breakdown: physics `step()`, Canvas2D `render()`, DOM `refreshHUD()`, JSON `serializeState()`. Report median/P95/max per stage and snapshot-size versus Android's 32,768-character transport cap; retain `qa-results/frame-pipeline-profile.json` as a workflow artifact. This is *pending exact-source CI result*. Performance thresholds are not set from desktop alone.
2. **LAN payload budget:** check max snapshot bytes across modes and bot counts; keep state serialization below transport cap and verify after every new pickup/effect feature. Native packet guard is now enforced while reading, even for repeated CR characters.
3. **Test-only render A/B after pipeline evidence:** try pre-rendering floor tiles and perhaps radar walls into cached offscreen surfaces recreated on map/size change. Compare same-seed screenshots pixel differences and draw-time distributions, **no default code switch unless quality is identical and the gain is material**. A cached full 18×12 maze at 132px/cell can require substantial memory; avoid unbounded bitmaps and cache only if evidence supports it.

### P1 — player experience, require owner preference/real novice observations before shipping
4. **Shot feedback hypothesis:** use the existing `b.bounces` counter to measure bank-shot KOs versus direct hits, and optionally show a brief results summary without an extra mid-combat banner. Avoid retention/leaderboard claims; establish whether it actually clarifies skill.
5. **Ricochet Range hypothesis:** optional, not mandatory: one bounce-to-target, one two-wall bank, one short armor-loss pilot recovery. Reuse existing renderer/control scheme and choose short reset loops, no economy rewards needed. The existing contextual coach may already suffice.
6. **Modes / pacing:** previous audit found Survival vehicle pace differs from scored FFA by design. Owner approved controls after several touch iterations; do not unify speeds blindly or import Brawl-style auto-aim.
7. **Role readability:** tank vs mech vs pilot are meaningful already. Only add a terse role card or comparison if players cannot distinguish capabilities during first play; never gameplay-affecting paid cosmetics.

### P2 — after actual hardware benchmarks
8. Physical 20–30 minute Android FPS/thermal/battery and dropped-frame check; touch-to-display and interruptions; if stutter is observable, optimize the dominant measured stage or reduce rendering resolution conditionally.
9. Physical same-Wi-Fi two-phone LAN join/1v1 no bots/rematch/disconnect; collect packet jitter before deciding on snapshot interpolation.
10. Incrementally extract helpers from game.js as a maintenance improvement only with test and parity gates; no engine rewrite or game-design overhaul before shipping a robust first version.

## Decision and rollout criteria

The game's real distinguishing feature is **precision ricochet duels in fresh mazes, with armored vehicle -> ejection -> recoverable operator play**. Already implemented: responsive full-screen UI, Quick Play/next match, cosmetics and Dossier, several modes, 54 two-client browser LAN checks, real APK packaging and repeatable sources. Avoid adding modes/buttons/progression just to match games with different economics.

Choose the next runtime optimization **only** if (a) a measured stage dominates on device or worsens by map size, (b) a test-only A/B demonstrates repeatable improvement, (c) screenshot geometry/visual checks pass, and (d) user can review a signed in-place APK on the actual target phone. If not, leave the rendering engine unchanged.

**Source/change discipline:** this report and pipeline profiler are test/documentation-only. PR #85 DRAFT, stable `main` untouched, release NO-GO pending actual two-phone LAN, owner save retention, public contact/hosted policy and production private AAB signature.

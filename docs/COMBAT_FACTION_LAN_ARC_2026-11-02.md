# Sector Rebound — Combat, faction and LAN development arc
**Proposed arc:** 2026-11-02 onward. **Owner feedback:** v0.9.67 teammate pass-through felt good; AI often rotates/lines up too fast. Requested shared dotted-trace intelligence, optionally visible allied trajectories, Friendly Fire ON/OFF coupled with collision, LAN humans on opposing teams each with bots, real team/faction identity on both devices, and match-by-match varied FFA colors and solo team sides.

## Source of truth, baseline and release gates
- Experimental base: `experiment/friendly-unit-pass-through-v1`, approved **in feel** by owner but no full two-phone LAN acceptance. Last test APK v0.9.67 `290001`, exact game source from Android build `024635a3d0bac7494e975549fe3f9f6149551066`.
- **Stable `main` is NOT a destination for unfinished changes.** Stage separately; each branch and draft PR carries its exact source, observed QA and rollback. No automatic merge, Play upload or forced reinstall.
- Maintain byte-identical `web/game.js` and `android/app/src/main/assets/game.js` at each code checkpoint. Host remains authoritative for physics, hit registration, friendly-fire policy, bots, team scores, team ids and bot aiming. Guest receives immutable team assignments and only sends its own input. Network snapshots must be validated.
- New owner APK only after robust independent browser/gameplay/visual QA and signed Android verification; no claim of device or multi-phone pass without the device test.

## Stage A — believable/fair AI: first priority

### A1 — shared physical turn caps + observable baseline (STARTED)
Current engine has a real pilot asymmetry: **non-aiming bot pilots can turn at 12 rad/s while local human pilots are capped to 6.5 rad/s**. Pilot movement and aim must both respect a common **6.5 rad/s** maximum regardless of input origin. For vehicle pilots, preserve the approved vehicle-specific rates (scored vehicles 2.6 rad/s, aiming non-scored vehicles 4.2 rad/s) and audit movement vs aim behavior rather than silently rebalancing all vehicles.
- Build deterministic tank/pilot turn tests with large requested heading changes, comparing both same-dt human/bot; no changes to speed, damages, projectile limits, walls or teammate pass-through.
- Track reaction time and first-shot angle on real engine / Chromium fixtures, including zero visibility and target swapping.
- Pass: physical pilot turn parity, intact player steering and independent CTF/combat suite.

### A2 — shared physical shot-path evaluator
Current player dotted trace `previewTrajectory` approximates muzzle + x/y wall bounce and limits its display to **one bounce**. Real bullets use substeps, bounce limits, bumpers, hitboxes and lifetimes. **Do not assume the visual approximation is an exact ballistics oracle.**
- Extract/test a deterministic, bounded shot-path evaluator that follows the *actual* fired projectile physics and muzzle geometry, accounts for obstacles and hitboxes, and returns impact sequence & hit target. Reuse its safe path geometry for player's dots, AI candidate scoring and ally preview; carefully preserve established v0.9.65 feel (pilot sidearm does not ricochet yet).
- Cover wall corners, shallow angles, bounce edges, bumpers, occupied/pass-through vehicles, lifetimes, CQC hit radius, self-bounce, shields and stationary/moving targets.
- Avoid frame-by-frame omniscience: limited candidates per bot, bounded range, small fixed evaluation budget / intervals, deterministic per-match decisions, latency and JS-frame budget measurements on Android-like hardware.

### A3 — acquire → aim → commit → fire
- Bots select credible direct or simple bank angles using their own physical trace from last truly visible target location, without perfect through-wall knowledge.
- Bot target acquisition obeys viewport/visibility gates, exposes a real aiming interval and cannot exceed matching human/unit turn caps. A shot is not allowed unless the evaluated path intersects a currently believed enemy target; **commit locks the path**, and no correcting/canceling in-flight shots if someone dodges or crosses. Avoid predictive omniscience, fake guaranteed misses and perfect first-frame snaps.
- AI difficulty improves candidate quality, angle discipline and decision cadence; not privileged rotation, magic bullet damage or continuous target prediction.
- Tests: moving-target missed shots, stale information, wall bounce, no fire through barriers, turn parity, first-shot timing, idle/rest state, actual seeded natural CTF games.
- **Owner checkpoint:** separate APK: tell us whether AI aiming looks deliberate, threatening and fair.

## Stage B — friendly fire and readable allied lines
- Single **Friendly Fire** lobby/custom-match rule for team modes (FFA not applicable): **OFF (default)** friends don't hurt/physically block one another; **ON** teammates can collide and take real projectile damage. Never implicitly allow firing at allies from FF OFF or let friendlies absorb enemy shots as invulnerable cover. Enemy fire and barriers remain unchanged.
- When ON, AI checks friendly actors along its planned shot lane at *decision time*, including reflected parts, without using omniscient future motion. If someone steps in only *after commitment*, an accidental hit can happen. Allies shouldn't earn enemy KOs from team kills, nor Dossier rewards; support honest kill feed.
- During active acquisition, show **optional** low-intensity dotted friendly trajectory only for visible nearby teammates, respecting mode/LOS, HUD density and team/faction paint. Keep enemy tells as short amber ticks (no enemy laser/wallhack). Host transmits the minimal quantized intent needed for LAN guests; render must not infer hidden AI state.
- Lock FF during a live round; match UI explains collision change. Test boarding/ejecting, overlaps while lobby rule changes, damage/scoring, nearby two-phone parity.

## Stage C — real teams, sides and match identity
- Introduce **persistent for-one-match team ids** independent of actor index and color: `teamIds` in match rules/state and scored/CTF/bot/reward/respawn/FOB systems. Reuse `teamOf` everywhere and keep legacy matches compatible; no new saved-data migration without tests.
- Solo Quick Play: each new **team** match can play either CYAN or CORAL (random seeded/per-match selection); ensure correct FOB, scores, CTF carrier/flags, "our/their" cues and result labels. Custom allows lock side or RANDOM.
- FFA: use a fixed, carefully distinguished palette and *shuffle actor assignments each match*, including human, no permanent index-0 Cyan. Same unique identity is authoritative and stable throughout match/respawns and consistent on LAN host and guest. Never make color infer team membership; preserve operator/vehicle identification with skins.
- Optional lore/faction names/emblems after mechanics; do not couple cosmetics to gameplay hit rules. HUD and minimap labels reflect actual **local side** on each device (not hard-coded CYAN vs CORAL perspectives).

## Stage D — LAN squad TDM and configurable rosters
- Extend existing Wi-Fi private lobby host/join/ready/start into *actual scored* Team Deathmatch with per-side human and bot rosters: host vs guest, each with one or two AI; 1v1, 2v2, 3v3 under current six-actor budget. Manual side swap before ready; balanced automatic bots by default, advanced uneven custom option.
- Host assigns and freezes team ids + bot skill/role + FF policy + target KOs + rounds + map + palette before start; guest sees explicit preview of **its own team** and opposing team, can only Ready/Unready. Rules edits invalidate readiness. Match is host-authoritative with safe reconnect/host departure behavior.
- Test native two-phone device pair on same Wi-Fi for real input, host-authoritative damage/collision, team colors (identical for both devices), sync, scored win condition, rematch, fairness, and app rotation/orientation. Remote internet matchmaking remains separate future project.

## Integration order and non-negotiable audits
1. Baseline vs A1 controlled pilot rotation, actual shot cadence and overall deterministic combat/CTF.
2. A2 shot-path invariants and Android performance budget / visual parity.
3. A3 fair aiming, CTF/FFA/CQC/TDM natural fixtures; owner APK.
4. B FF matrix + allied tracers + networking truth & overlap safety.
5. C faction/team ids + FFA palette/Quick Play variation + owner visual review.
6. D LAN 1v1/2v2/3v3 and 2-phone validation; custom lobby.
7. Final holistic smoke + 300+ map seeds + real attack profiles + 44+ visual layouts + Android signer/API/preserved save tests + package archive checks. Publish only after owner release decision.

## Scope boundaries
**Do not** nerf AI via fake misses, aim magnetism, increased HP, different projectile speeds, or special walls. **Do not** solve a complex bounce with perfect full-maze future knowledge. **Do not** silently change portrait/landscape control feel, Hangar/Dossier unlock schema, existing version codes or current player's installed preview. Explain failed gates and roll back before piling on new features.

## 2026-11-02 D3 owner addendum — persistent LAN room / host without guests (NOT YET BUILT)
Owner approved planning a host-first LAN room in which the host can play existing modes versus bot backfill while discoverable on one phone. Later same-Wi-Fi joiners enter spectator mode during an active match, then queue for next round/match and replace the reserved guest AI seat on a safe boundary. This explicitly expands the old Stage D plan without rewriting/merging D1/D2 experiments. Implement in incremental D3-A0 (room/controller model), A1 (one-phone room playable), A2 (other mode compatibility), B1 (spectator), B2 (queue/bot takeover) and C (native connect/reconnect, true two-phone acceptance). **Source of truth:** [D3 full spec](design/LAN_PERSISTENT_ROOMS_D3_SPEC_2026-11-02.md), [owner one-phone QA](LAN_D3_ONE_PHONE_OWNER_QA_2026-11-02.md), [execution plan](DEVELOPMENT_EXECUTION_PLAN_POST_AUDIT_2026-10-30.md). D2 v0.9.71 is the rollback. No game code or apk is changed by this documentation addendum.

# 23 — Quick Play Session & After-Action Flow Bible

**Status: AGREED DIRECTION / DESIGN DRAFT; NOT IMPLEMENTED.**
**Date:** 2026-10-27
**Depends on:** [Match Modes & Playlists](20_MATCH_MODES_BIBLE_DRAFT.md), [Music](21_MUSIC_AND_SOUND_BIBLE_DRAFT.md), [Game Feel & UI](22_GAME_FEEL_AND_UI_DRAFT.md).
**Player request:** At the end of each match show its actual results/statistics, then let the player choose **NEXT MATCH** (another random mode from their selected Quick Play playlist) or **MAIN MENU**. Do not throw them out of the experience just because a single battle ends.

## Player journey / desired loop

Home → choose active modes once → QUICK PLAY → select a valid ruleset/map → 2-second mode briefing → fight → short outcome sting → AFTER ACTION screen → choose:
- **NEXT MATCH** (primary): queue only the next mode in the player's selected playlist; generate a new maze and load it, no main-menu detour.
- **MAIN MENU** (secondary): end current Quick Play session, retain preferences and completed-match stats, return to home.

**Never automatically begin another match from a result screen.** No countdown that forces another game, forced advertisement, intrusive upsell, or confirmation gate for the normal Next Match button. The game remains fun in short sessions. The player can pause/end their session at any match boundary.

## Example after-action layout / UI hierarchy

- Tiny context: FREE-FOR-ALL · STANDARD ARENA
- Large honest outcome: VICTORY / DEFEAT / DRAW
- Top 3 impactful actual stats (mode-dependent): e.g. OPERATOR KOs, ELIMINATIONS / DEATHS, MATCH TIME
- Collapsible SCOREBOARD / DETAILS showing all human/bot participant scores
- Short optional "SESSION SO FAR" strip: 3 completed matches · 2 wins · 1 defeat · 16 operator KOs (example data, NOT a live statistic)
- Primary CTA: NEXT MATCH → icon; below: "From your 3 selected modes" if context helps
- Secondary CTA: MAIN MENU
- On pressing Next Match, show NEXT UP: [mode + size] and its one-line objective, then enter the new procedural match.
- No build version, fake classified readouts, "no account required", inactive shop, or filler descriptions. One clear visual hierarchy.

The user should be able to return to results/details without accidentally starting another round. Android Back should not initiate a new match; it may prompt to return to Main Menu only when leaving mid-game would abandon a live round.

## Statistics / fairness

| Stat | Availability | When to credit |
|---|---|---|
| Mode / procedural arena / result | Essential from new match state | Final match status |
| Operator KOs | Existing baseline KO counter, with validation | Only when a pilot is eliminated, NOT when a tank loses armor |
| Deaths and respawns | New counters required | Once per actual operator elimination / respawn |
| Time played / time alive | New match clock required | Actual active simulation time |
| Scoreboard / team scores | Required for score modes | Mode-specific, host-authoritative |
| Vehicle destruction / recoveries | New tracked counters required | Actual vehicle event, not duplicated on rematch |
| Flag captures / returns | CTF only, future | Verified objective transition |
| Accuracy / shots landed | Future, not currently reliable | Count shot and valid hit events with stable ownership |

Do not show guessed fields or invented zeros for unimplemented metrics. In a Close Quarters match, **hide armor/vehicle stats**. CTF emphasizes captures; TDM emphasizes team score; Elimination emphasizes survival; FFA emphasizes KOs and placement. Short recap first; details for the interested player.

Never require the Pilot Dossier to exist before implementing post-match flow. If progression is added later, award earned credits/XP with a deduplicated match-completion identifier and clearly labeled offline status; avoid fake cloud sync and payment-derived combat power.

## Playlist algorithm (proposal)

A **shuffled bag** is preferable to naive independent randomness. Each enabled mode appears once per bag cycle in random order; exhausted bags refill from currently enabled modes. If 2+ enabled, avoid immediately repeating the last mode at the boundary between bags. If exactly one selected, repeat that mode with a new maze seed. If no valid mode is enabled, disable Quick Play and point to mode selection.

Persist the selected mode IDs locally in a versioned preference field. Ignore retired/unsupported mode IDs safely. Selecting Next Match after a playlist edit uses the current valid selection, not a stale queued mode. The entire match (map size, seed, mode, victory settings and team assignment) is generated at NEXT MATCH time, not while looking at the results.

Optionally show an unobtrusive MODE HISTORY summary (last 3) during testing, not a busy permanent widget.

## Solo vs. same-Wi-Fi behavior

- **Solo**: local player controls Next Match; bots fill configured sides; selection and new maze generated locally.
- **Local LAN host**: host controls the next ruleset/seed and sends the new match to guest; both see their own correct stats derived from the same host-authoritative results. Host may press Next Match, but a brief "Ready?" flow may be appropriate to prevent surprising the second player. Do not promise that ready flow is implemented.
- **Local LAN guest**: sees after-action results and "WAITING FOR HOST" or a ready toggle, not a working NEXT MATCH button it can't control. "LEAVE / MAIN MENU" disconnects explicitly.
- Preserve lobby party membership on host-initiated continuation; Main Menu may exit or disconnect based on the user action, not silently drop the partner.

## Robustness / tests

- No double submission of final score, stats, progression or unlock rewards when result panel re-renders, Android resumes, reconnects or rematch is selected.
- Next Match creates a fresh unique match/session reference, map seed, scoreboard and mode objectives. Session totals remain only for completed matches.
- Round outcome snapshots do not continue accumulating combat events after the match ends.
- Respect all selected-mode subsets, including single mode and zero modes; test shuffle-bag fairness and no accidental back-to-back repeats when possible.
- Test outcome screens in all requested phone landscape sizes with short/long text, no clipped primary/secondary actions.
- Android background/foreground and sound transitions; no background new-match launches, timers or music leaks.
- LAN host/guest same score and next match; no phantom reconnect, split-brain game mode or duplicate team awards.
- Preserve existing v0.9.20 app as rollback until implemented and proven.

## Implementation order

1. Immutable per-mode configuration IDs and playlist preference persistence.
2. Match-result snapshot with verified stat fields and one-time completion event.
3. After Action redesign with NEXT MATCH and MAIN MENU, functional for solo before LAN.
4. Mode shuffle bag and brief NEXT UP overlay.
5. Session totals and future Pilot Dossier integration.
6. Host-authoritative LAN continuation after same-Wi-Fi device QA.

**Important:** This file documents the intended player experience, not a new released feature. It must not be advertised as present in v0.9.20.

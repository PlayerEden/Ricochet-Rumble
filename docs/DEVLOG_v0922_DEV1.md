# v0.9.22-dev1 — Solo Mode Playlist Foundation
**Date:** 2026-10-27
**Status:** Development slice; draft PR, not a released APK or production milestone.

## Implemented in this slice
- Two **currently functioning survival-rule** variants based on existing combat (not proposed new scored modes): `survival_ffa` (everyone independent) and `survival_teams` (player vs allied bot team).
- Versioned local enabled-mode selection saved within existing `rr-options-v06` preferences; zero/one/two selected, invalid stored IDs ignored, legacy saves default to both.
- Fair shuffle bag: each enabled mode once per bag, no immediate repeat across bag boundaries when two modes are available; exactly one repeats.
- Quick Play chooses a mode at deployment and again when **NEXT MATCH** is selected in the existing results screen, generates a different procedural seed, resets match state, increments per-session match ID.
- Match Settings → expandable QUICK PLAY MODES + ADVANCED exposes real modes only; Nearby sides remain independent (LAN protocol unchanged). Zero selected disables Play, not fallback to a fake mode.
- Solo in-match label and after-action rail identify the real played variant. No invented new scoring, flags, matchmaking, ranked play, Dossier or purchases.

## Verified scope and limitations
- Existing pilot/tank/mech combat, last-side-standing win condition, lives and KO values remain exactly as in v0.9.21. No new score-target modes, respawn timers, objectives, upgraded spawn fairness or host-controlled playlists yet.
- Nearby host/guest logic, packet types and Android Java unchanged. New `matchId` increments locally for each initialized game, including host resets; do not assume globally unique account/session IDs.
- Rotation is **solo only** until host/guest verification and replication design are completed.
- Confirm real phone selection and compact landscape settings layout; Chromium visual regression and full APK packaging require an explicit QA gate.
- Next slice: final-match snapshots and accurate per-mode statistics, then LAN authority and mode-specific generation validators before new score modes.

## Review checks
- `node tests/smoke.mjs`: modes normalization and invalid IDs, no-repeat shuffle, zero selection, single-mode repeats, new match ID and guaranteed new seed, current combat behavior and Android/web byte parity.
- `node tools/validate-cosmetic-catalog.mjs` and existing CI checks.
- Short landscape viewport and results screen screenshot review before any preview release.

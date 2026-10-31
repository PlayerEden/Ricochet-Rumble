# 2026-10-31 — In-game usability/HUD and local match lifecycle polish

User-approved next step following Preview 100036. **Scope:** preserve reviewed full-screen controls, centered tank pivot, weapons/AI, existing menu theme; change communication/safety and LAN post-match convenience only. [Immutable pre-pass rollback](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100036-before-ingame-ui-flow) at `ce0969c6555b1dae94b5270bf286a6581ca9cabf`.

## Actual implementation
- **HUD:** Survival says `YOU · LIVES` rather than ambiguous `YOU`; 1v1 enemy is `RIVAL`, co-op shows bots' live opponent count (not the ally's lives). Scored KOs and existing team colors remain untouched. Numeric score and win rules are unchanged.
- **Projectile slots:** readonly low-noise row of filled vs empty indicators next to existing `3/3 READY`/in-flight text; drawn from existing `activeBulletCap` and owned bullets, no aiming, fire cadence or damage changes.
- **Pause safety:** PAUSE → NEW FIELD now opens confirmation with **START NEW FIELD** or **KEEP CURRENT MATCH**, keeping simulation paused while deciding; only confirmed reset changes maze. After Action NEXT MATCH remains immediate by design.
- **LAN results:** host-authoritative `deaths[]` and `elapsedSeconds` are included in existing state snapshots. The guest can show actual deaths/duration instead of dashes. Local result text names Free-for-All / Teams / Co-op. Co-op results credit the winning human team even if the local player ran out of lives before AI were defeated.
- **LAN match loop:** Host finished After Action offers **CHANGE RULES** as well as immediate rematch. The host returns to the connected LAN lobby with existing rules and a new monotonically increasing revision; guest sees the host's new lobby, Ready resets, and host starts via the same validated Ready→Start logic. No Internet, matchmaking, scored LAN modes, new network transport, account or save schema added. Host still owns state; guest never edits rules.

## Verification required
1. Source smoke and Android mirrored assets; real Chromium role-aware Survival/Scored HUD, bullet slot indicator count (including when all projectiles in flight), pause cancel/confirm, LAN host and guest results.
2. Two-client browser rehearsal: real initial Ready→Start, host finished → Change Rules → guest new waiting room, old readiness rejected, new Ready→Start, guest sees host's authoritative deaths and duration; ensure no state packets while lobby active.
3. Full responsive geometry five viewports and actual screenshots. Signed Preview same public test key and app ID; separate physical two-phone Wi-Fi acceptance still pending.
4. Don't merge draft PR #85 or change stable main gameplay without owner approval.

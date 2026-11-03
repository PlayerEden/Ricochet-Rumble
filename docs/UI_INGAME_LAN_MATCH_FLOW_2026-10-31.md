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

## QA verified — Preview 100039 exact runtime
- [Real signed Android build 41235809716 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41235809716), `com.playereden.ricochetrumble.preview`, versionCode 100039, runtime SHA `10e182acc75bc7d461c4f93221b7b846ccde277c`, SHA256 `e558ecfa01bf014d5b9d681875e95940f6d6e308a727f9880f1c9a0e649c715b`, same public AOSP test key as 100036; downloaded actual APK validated independently.
- [Scoped two-browser game/UI QA 41235809714 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41235809714): 54 LAN lifecycle checks; 102 layout scenes/0 issues/0 warnings; 44 screenshot scenes; 25 theme screenshots; entire Solo/Quick Play/Custom/CQC/FFA/TDM/Hangar/Dossier/backup suite green. [Full screenshots and JSON](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41235809714/artifacts/13055033747).
- Verified extracted APK's real post-match host results at **568×320, 740×360, 915×412**; CTA row aligned, no clipped controls. Independently checked local restart confirmation cancellation leaves the match's maze seed intact, and projectile indicator matches shell cap; no browser exceptions.
- Immutable [Preview 100039 verified checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100039-ingame-ui-lan-results); [Preview 100036 pre-work rollback](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100036-before-ingame-ui-flow).
- Physical two-phone Wi-Fi session, real user save upgrade and Play signing still unresolved. A two-browser rehearsal is not a real-device LAN test. Never merge draft to `main` without owner authorization.

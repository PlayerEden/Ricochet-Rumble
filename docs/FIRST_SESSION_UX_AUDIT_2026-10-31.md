# Sector Rebound — first-session journey audit, pass 1 (2026-10-31)

**Reviewed exact parent:** `37d854b2c3daeee327746dfdc4b04be02d51daf3`, signed owner-approved Preview 100040 icon + Preview 100039 game flow on draft PR #85. All work is on integration branch, no stable `main` promotion.

## Source-backed walkthrough
1. **Landing:** Home presents single primary Quick Play action, Choose Mode, Wi-Fi Local Play (beta), Settings and utility Hangar/Dossier/Help. Animated tank/mech preview retained. Quick Play chooses from saved selected playlist modes, generating a new maze every match.
2. **First controls:** nonblocking, per-scheme one-time HUD coach already covers Survival, scored vehicle and pilot-only CQC; contextual on-foot/ejection and supply hints already exist. Avoid another onboarding modal.
3. **Combat and HUD:** current 100039 has team-vs-rival lives labels, armor indicator, shell availability, pilot ENTER, score clock and tested pause reset confirmation. Do not change physics, steering or fire interaction.
4. **Result and next match:** score/deaths/time and real earned paint/insignia notices feed one-tap Next Match; Custom edit and LAN host Change Rules remain separate. Browser-based checks passed previously, but no fresh source-specific phone evidence yet.

## Verified friction in current source
- **P1 misleading Solo option:** `#team-choice` labeled **NEARBY SIDES** appears in Quick Play Settings, but `soloOptionsFor()` forces `teamMode` from the chosen Survival playlist ID, scored rules force their own mode, and LAN host settings have a separate authoritative room. The selector therefore doesn't control any Quick Play modes or LAN rooms.
- **P2 discoverability:** Home describes procedural mazes but not that **Quick Play rotates selected game modes**. After Action advancing to another mode may feel unexpected.
- **P2 guide precision:** How to Play says to **hold FIRE** without explaining tapping, even though scored vehicles support a tap interaction and Survival supports held shots. Non-blocking existing contextual hints are retained.

## Minimal implementation candidate
- Remove only the ineffective **NEARBY SIDES** HTML selector from Quick Play Settings. Keep `selectedRules.teamMode` and storage schema intact for backward compatibility; no game logic, LAN host rules, or saved data format changed.
- Home description becomes **Rotating modes. A new maze every match.**
- Help step 2 explicitly says **Tap or hold FIRE to shoot** with existing bank-shot explanation.
- Web and Android HTML mirrors are identical; scoped real Chromium QA is extended to assert these changes and existing functional controls.
- All art, controls, AI, scored modes, cosmetics, HUD, playlist contents, and sound are unchanged.

## Acceptance gates
1. Node/smoke, real Chromium menu Help→Settings→Quick Play→After Action→Next Match, responsive 568×320, 740×360, 915×412, 1280×720 and long landscape.
2. Android assets parity and signed same-public-test-key `.preview` APK, checksum, real package.
3. Physical owner review of Quick Play setup, on-foot control learning, in-place data retention; two-phone LAN remains untested.
4. Keep Preview 100040 as known-good rollback. Do **not** merge draft PR #85 or publish Google Play without explicit owner approval.

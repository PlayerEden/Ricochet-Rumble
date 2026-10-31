# Phase 3A — Context-aware first-match guidance (2026-10-31)

**User-approved baseline:** [preview 100005 checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100005-armor-accepted) exact `990968eea5c2d17503319b4fc043d739bcfc4a67`. Owner: "looks good lets continue" after the differentiated armor-impact preview. Fast, full Chromium+Android and signed APK 100005 CI PASS. Stable main runtime still v0.9.21 and draft PR #85 unmerged.

## Problem in real code
Original `firstMatchHint()` only ran when launch action was `solo` and said "MOVE TO AIM · HOLD FIRE TO SHOOT." This was accurate for Survival but not for scored vehicle FFA/TDM, where a separate AIM thumbstick rotates the hull without spending a shell, or for pilot-only CQC, where holding and dragging FIRE aims independently. The scored mode launch actions and Custom Match bypassed first-time coaching.

## Focused correction
The existing brief, **non-interactive, non-modal** HUD coach is now selected by the actual live match control scheme, not the menu button:
- Survival: `MOVE TO AIM · HOLD FIRE TO SHOOT`; retains existing `rr-coach-v0917` key so returning Survival players never see repeat clutter
- Scored vehicle FFA, TDM and Custom scored vehicle: `DRAG AIM TO TURN · TAP FIRE TO SHOOT`; one shared `rr-coach-scored-vehicle-v1` local-storage key
- Pilot-only scored CQC and Custom CQC: `DRAG FIRE TO AIM · PILOT KOs SCORE`; one `rr-coach-cqc-v1` local-storage key

The brief 4–4.6s hint appears only the FIRST time each control scheme is launched, then stays suppressed. A fresh new match, Next Match or a second visit does not nag; no persistent settings, screenshots, cloud sync, tutorial screen, purchase, extra control button, animation or additional overlay added. Existing contextual ejection/recovery and supply tips stay as they were. If localStorage isn't available, the game still starts.

**Unchanged:** all controls, movement, tank pivot/rates, pilot/mech/bot behavior, AIM pad layout, score rules, balance, cosmetics, Android package, native LAN and audio. Web and Android WebView assets are identical.

## QA contract
Real source regression tests assert first scored FFA hint, TDM deduplication, CQC first hint + repeat suppression and Custom scored sharing. Existing Survival first hint, contextual expiry, Quick Play/After Action, scores, Dossier and saved preferences continue under the fast & full suites. Exact SHA GitHub Actions required. User phone verdict pending. Rollback to the approved Preview 100005 checkpoint if anything obstructs combat.

**Not built in this slice:** optional bank-shot range, first-time guided exercise, cosmetics/Hangar, two-phone LAN, production Play signing. These remain later phase items.

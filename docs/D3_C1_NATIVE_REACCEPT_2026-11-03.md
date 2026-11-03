# D3-C1 — Persistent Android LAN Host and BUSY Signaling

**2026-11-03 — merged into development `main` via [PR #110](https://github.com/PlayerEden/Ricochet-Rumble/pull/110), merge `2d713ddc7374ada461af0afc27a3c2cc6f8e47aa`. Six exact-PR CI suites PASS. Not yet physically tested on two Android devices.**

## Delivered in this slice
- Foreground Android host calls accept repeatedly, while one active guest or spectator occupies the reserved seat. A second connection gets a compact `busy / room-full` reply without interfering with current gameplay; the host listener does not die after the first disconnect.
- A synchronized identity admission gate prevents stale network-reader cleanup from clearing a newer player's socket. Stop closes listener and active peer, invalidates generation, clears peer writer. Existing 32 KB bounded packet reader preserved.
- Guest sees an explicit ROOM FULL explanation instead of generic network error. A host keeps room alive when an active guest leaves and the reserved guest seat returns to real AI. Already queued JOIN NEXT requests are cleared on departure; no forced match reset or fabricated scores.
- Deliberately limited to one remote human. No background server guarantee, multiple spectators, cloud matchmaking, reconnect auth tokens or Play Store release.

## Evidence and gates
Dedicated [D3-C1 workflow](../.github/workflows/d3-c1-native-reaccept.yml) **PASS [#41668490844](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41668490844)**, true Java admission tests (1,000 rejoins and 100 simultaneous pairs) and parity. [Full Android/visual PASS #41668490839](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41668490839) plus inherited B1/B2 browser regressions passed before merge. **This cannot substitute for two actual Android phones on Wi-Fi.** The existing signed v0.9.75 owner APK is untouched and cannot display this new code.

## Follow-up D3-C2A and phone gate
[PR #111](https://github.com/PlayerEden/Ricochet-Rumble/pull/111) added explicit retry, recovery and host restart UI and merged after seven green source/Android/browser CI suites. **Next:** exact-`main`, >370001 same-signer preview and physical two-phone connect/leave/rejoin testing. Do not infer background hosting or cloud features.

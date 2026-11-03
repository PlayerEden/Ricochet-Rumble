# D3-C1 — Persistent Android LAN Host and BUSY Signaling

**2026-11-03 — source branch only. Not yet physically tested on two Android devices.**

## Delivered in this slice
- Foreground Android host calls accept repeatedly, while one active guest or spectator occupies the reserved seat. A second connection gets a compact `busy / room-full` reply without interfering with current gameplay; the host listener does not die after the first disconnect.
- A synchronized identity admission gate prevents stale network-reader cleanup from clearing a newer player's socket. Stop closes listener and active peer, invalidates generation, clears peer writer. Existing 32 KB bounded packet reader preserved.
- Guest sees an explicit ROOM FULL explanation instead of generic network error. A host keeps room alive when an active guest leaves and the reserved guest seat returns to real AI. Already queued JOIN NEXT requests are cleared on departure; no forced match reset or fabricated scores.
- Deliberately limited to one remote human. No background server guarantee, multiple spectators, cloud matchmaking, reconnect auth tokens or Play Store release.

## Evidence and gates
Dedicated [D3-C1 workflow](../.github/workflows/d3-c1-native-reaccept.yml) compiles/runs true Java admission tests (1,000 rejoins and 100 simultaneous pairs) and source/parity checks. [Full-qa] Android Java/Gradle compile + inherited B1/B2 real two-browser regression are necessary before merging this PR. **This gate cannot substitute for testing two actual Android phones on Wi-Fi.** The current v0.9.75 signed owner APK is untouched and cannot display this new code.

## Next D3-C2
Clarify host-offline status after Android background/Stop, improve automatic/manual retry and discovery/busy/playing UX, run actual two-device connect/leave/rejoin, then create same-signer higher-version owner test APK only from a green source checkpoint.

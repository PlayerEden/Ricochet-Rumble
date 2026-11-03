# D3-B2 — JOIN NEXT host authority, stage 1
**Status:** Pure, side-effect-free protocol adapter and executable tests. **NOT YET connected to the live WebView UI, native socket whitelist, or spectator buttons.** No player can join from this stage alone.

## Contract implemented
- `web/lan-join-next.js` and exact Android mirror wrap the existing `SectorLanRoom` state controller.
- A spectator may request or cancel a queued seat only with matching room revision, match ID, packet version, role and intent. Duplicate/stale packets cannot advance the room.
- Round queue allowed only when an authoritative three-round series has an actual future round. Otherwise queue for **next match**.
- `advance()` permits bot→human promotion only through the existing room kernel's **result→next round** or **lobby→next match** transitions; no mid-fight promotion.
- Seat status includes revision and match ID. `acceptSeatInput()` rejects input/fire/interact before promotion, mismatched identity or sequence replay. A disconnected human returns to bot control.
- Tests cover 1v1, 2v2, 3v3 and both faction assignments, plus stale/replayed commands, cancellation, disconnected control and both promotion boundaries.

## Next implementation stages
1. Integrate the controller into live host game state, not a parallel stale object. Decide how match IDs and existing `lanSeries` map to the room's monotonically increasing match ID.
2. Add `join-next` / `seat-status` to Android host/guest whitelists, with strict role validation on host, and an accessible spectator **JOIN NEXT / CANCEL** button and queue status.
3. Make next-round promotion start a real human-controlled seat 1 with correct faction, fresh personal KOs, and host-authoritative score, not just a UI label. Ensure full match-bound state snapshots and guest inputs carry revision and monotonically increasing seq. Existing legacy input without these fields must remain blocked in a promoted session.
4. Add two real Chromium client integration tests: late join, queue, boundary, real input, disconnect AI fallback, stale packet attacks, rematch and results. Android build and native protocol checks; physical two-phone testing remains D3-C.
5. Do not merge into `main` until real runtime integration and CI acceptance. Keep v0.9.75 owner preview and B1 baseline intact.

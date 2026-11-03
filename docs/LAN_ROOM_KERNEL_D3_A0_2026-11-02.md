# Sector Rebound — D3-A0 deterministic LAN room kernel
**Source:** `experiment/lan-room-state-d3-a0`, based *directly* on the verified signed D2 owner source `333fc9d9ffc5f5ff5e136121217240112def531e`, and reviewed alongside [D3 technical design](design/LAN_PERSISTENT_ROOMS_D3_SPEC_2026-11-02.md). **No new playable host-alone room yet.** No change to protected stable `main`, P-03, accepted controls, scoring, WebView/Android Java networking or signed preview.

## Feature slice completed in source
- Added `web/lan-room.js` with byte-identical embedded Android asset. Loaded in both runtime HTML entrypoints before the existing `game.js`.
- Pure immutable state machine with bounded `lobby → active → result → lobby/next round → closed` states; independent peer `none/spectator/queued/player` roles. Explicit allowed transitions `createRoom, connect, requestQueue, cancelQueue, startRound, finishRound, toLobby, disconnect, close`; invalid/duplicate requests fail closed.
- `roster` guarantees 2/4/6 actor capacity, host seat 0 real local, reserved guest seat 1 real **AI** when not yet human, stable Cyan/Coral team mapping, and an AI controller for every other seat. `startRound` promotes only at a safe next-round or next-match boundary; `disconnect` restores the seat to AI while retaining the match. The existing combat engine still uses the old D2 controller logic until A1 integrates it.
- `acceptGuestControl` forms a v2 host protocol **contract** (not yet used by Java or game): rejects spectator/queued/absent peer input, stale/wrong match IDs, stale room revision, duplicate/invalid sequence, and input attempting to forge host-authoritative state. Native v1 packet handling remains untouched; do **not** present this as applied network security yet.
- `status` yields bounded room phase, team size, human-vs-AI count and truthful public role/status data for the upcoming LAN browser. No names, accounts, background services or network traffic.
- Added `tests/lan-room-state-d3-a0.mjs`, source mirroring and compatibility QA workflow. The legacy D2 LAN series remains entirely unchanged; this is new module only and source/HTML wiring.

## Next reviewed implementation (D3-A1)
- **Carefully integrate real controller selection** in `game.js` so current frozen `humanCount=2` actor indexing doesn't prevent AI driving slot 1. AI target/role logic currently skips `i<humanCount` and expects `botInput(i,dt)` only for `i>=humanCount`; these assumptions must be reviewed **before** claiming guest AI is alive in an actual room.
- Host may deploy without guest Ready; match and series loop continues without stopping LAN advertisement. Update `lanCanStart`, roster count and labels, host After Action, pause/restart/return-to-room and Android host socket lifecycle separately.
- Test real full-scored TDM with bot slot 1, independent AI bank fire, correct host/ally/enemy team identities and sound/camera at 1v1/2v2/3v3, precise KO/round series. Every existing two-player D2 QA must remain green. Owner signs off on the **first new APK**, only after exact-source signed Android build and compatibility proof.

## QA / release gate
CI must verify `node tests/lan-room-state-d3-a0.mjs` and existing D2 series, smoke, score/save, 2-client Chromium LAN, UI geometry and full 44-view visuals. This checkpoint is not an actual Android APK, second-phone test or production change. Preserve [v0.9.71 rollback](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-v0971-lan-series-signed-ci-330001). Mark results only after verified CI conclusion.

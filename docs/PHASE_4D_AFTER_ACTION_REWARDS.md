# Phase 4D — After Action reward acknowledgement (2026-10-31)

## Implemented candidate
The existing After Action report now shows a small nonmodal **NEW IN HANGAR** acknowledgement when a *successfully saved, genuine offline Solo match* crosses an existing Hangar paint / pilot insignia unlock threshold. The owner may return to the main menu and choose the finish or insignia; it is not auto-equipped.

## Safe data and gameplay boundaries
- Preserved prior QA-passed Phase 4C [Preview 100014 rollback checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100014-insignia-qa-passed), source `674895eedc8c7a68276ca0942e5d9c953e0da277`.
- Before/after local Dossier snapshots are compared ONLY after `dossierStore.record` returns success; failed or duplicate writes do not award a notice. The existing once-per-match guard remains. New match and rematch reset the ephemeral banner.
- Eligible existing thresholds: VECTOR (3 completed Solo matches), VANGUARD (5 matches), ACE (10 operator KOs), VETERAN (12 Solo wins), COMMAND (12 wins). Multiple fresh unlocks from one result are listed together, old unlocks do not reappear.
- Practice without opponents, LAN, incomplete matches, storage failures and rematches before an actual newly completed result never show a fictitious reward. No additional stored entitlement or currency.
- No change to movement, tank center pivot, two-thumb MOVE+FIRE, pilot art, skins, gun/armor physics, AI, scoring, maps, remote play or Play signers. The 3 changed WebView assets are byte-identical between web and Android.

## QA / acceptance
- Live Chromium original combat path tests a first match without rewards, third-match CQC with ≥10 KOs (VECTOR + ACE), fifth match (VANGUARD), no-repeat draw and pure 11→12 win edge (VETERAN + COMMAND).
- **Exact candidate automated CI / visual QA / signed preview and owner phone acceptance pending**; the previous Phase 4C pass cannot be claimed for this new code.
- On device: update over existing test .preview without uninstalling, play to a threshold, check new line readability at landscape height, then verify item actually available in Hangar and Dossier data retained. This remains a draft PR; main game and production signing untouched. Physical two-phone LAN still deferred.

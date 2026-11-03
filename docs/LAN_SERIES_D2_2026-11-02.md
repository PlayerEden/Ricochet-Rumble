# Sector Rebound — D2 scored LAN best-of-three series

2026-11-02 / 2026-11-03 UTC. Draft branch `experiment/lan-series-d2` based on verified D1 `378a02e2cc1936f8b58b38761caea24e876987b5`.

## Design
- Existing LAN TDM defaults to one match. Host can select **BEST OF 3** before guest Ready; any change revokes Ready. Legacy LAN, solo and signed v0.9.70 unchanged.
- Best of three starts round 1/3 with host's real immutable team ID roster, faction side, bot count, FF, KO target and map size. Round win advances side wins; ties consume a round without awarding a win. Two wins clinch early; after round three the higher-win team wins, equal wins yields a series draw.
- Only the host's scored-round completion calls a pure, tested `SectorLanSeries.awardRound`. Duplicate result/render calls cannot re-award a round. `nextRound` works only after a completed un-clinched round.
- Host's NEXT ROUND regenerates the maze and the per-round KO ledger while preserving the exact same teams and series win tally; after a decided series NEW SERIES creates a clean series. A new lobby selection starts fresh.
- A host-authored, bounded `lanSeries` record accompanies snapshots; guests strictly validate rounds, wins, concluded state, current match ID and scoring completion before rendering. No guest-side scoring authority or new native packet type.
- The KO timer adds compact R1/3; results distinguish ROUND vs SERIES and display both faction win totals. A draw must not be presented as a loss.
- Web and Android gameplay, index and the new pure series module remain mirrored.

## Tests and release gate
- Deterministic series tests for double-award, 2-0 clinch, 1-1 decider, three draws, invalid records and winner consistency.
- Full game smoke, scored KO/ballistics/save tests, two independently running Chromium host/guest clients, responsive lobby/result layouts and screenshots.
- This is **not** a physically tested Wi-Fi build. Native Android, real networking, update/install-over, portrait/landscape device experience and signed APK require separate verification before owner acceptance.
- Do not merge to `main`. Roll back to D1 / draft PR #96 if needed.

# D3-C2A — Explicit LAN recovery, same-host retry and host-offline restart

**Development source merged 2026-11-03 via [PR #111](https://github.com/PlayerEden/Ricochet-Rumble/pull/111), merge `b055623fc69b8dc38cd65ab470267193d5e2d9ee`. All seven exact-PR QA workflows PASS (including [recovery Chromium](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41670513016) and [full Android/visual](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41670512826)). Physical two-phone Wi-Fi still unverified.**

## Scope
- Guest remembers one attempted IP and port only in memory for the current session. Manual IP and NSD room selection use the same safe join path; no passwords, persistence or automatic background reconnect.
- On failed join, dropped connection or native room-full reply, offer truthful distinct status and deliberate **RETRY LAST ROOM**; retry starts a fresh native socket generation through the existing `newMatch('guest')` reset. Never restore match IDs, seat authority, spectator promotion, cached input, KO stats or last result.
- Search for another nearby room / manually enter an address; a new search or manual join screen invalidates the previous retry endpoint. Leaving nearby play invalidates it too.
- After Android Stop, **ROOM OFFLINE** offers **OPEN NEW ROOM**, explicitly resetting match. Never imply persistent background hosting.
- Late stale disconnect callback after returning to main menu is ignored rather than overriding Solo/idle screens.
- Preserve full D3-B1 spectator and D3-B2 JOIN NEXT host-authority behavior, lane/game visuals, physical AI acquisition and exact Web/Android byte mirror.

## Verification and next gates
- Dedicated Playwright test `tests/d3-c2a-recovery-browser.mjs`: two phone-size viewport runs, manual connect/failure/retry, successful guest lobby, dropped session, explicit BUSY, fresh discovery, stale callback isolation, foreground host re-open. Native bridge mocked, real HTML/game/DOM.
- This PR must pass exact-source fast regression, D3-B1/B2 browser flows, Android Gradle+visual QA and dedicated C2A browser QA before merge. **None of these replaces physical two-Android-phone LAN acceptance.**
- Next: owner-compatible higher-version signed preview, backup and install-over check, real host/join/retry/late spectate/queue/foreground/background tests. No Play Store publication.

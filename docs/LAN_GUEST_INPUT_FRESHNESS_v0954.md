# Sector Rebound v0.9.54 — LAN Host Guest-Input Freshness Safety

**Date:** 2026-10-30. **Status:** focused actual-game source/input and full regression PASS; full Chromium/Android run awaits final verification. **Not merged into stable main.** [Draft PR #83](https://github.com/PlayerEden/Ricochet-Rumble/pull/83) branches from [v0.9.53 draft PR #82](https://github.com/PlayerEden/Ricochet-Rumble/pull/82). Original [v0.9.53 QA-tested APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.53-lan-pilot-parity-test) remains immutable and is the rollback checkpoint.

## Why this work was possible without a second phone

The actual `web/game.js` host retained the latest normalized guest `{moveX,moveY,aimX,aimY,fire}` input until another `input` packet arrived or a formal `disconnected` event reset it. With a stalled TCP/Wi-Fi stream that has not yet closed, the host-authoritative physics loop could keep moving, aiming and shooting on the last received input **indefinitely**. This is a provable state-machine correctness risk; no live Wi-Fi delay or throughput measurement is claimed.

**Existing map snapshot behavior inspected and preserved:** `setArena()` already caches seed and map size, and returns immediately for repeated same-sector snapshots. No maze generator rewrite or speculative interpolation was needed.

## The constrained runtime fix

- `LAN_GUEST_INPUT_TIMEOUT=.4` is an explicit **0.4 simulated gameplay-second** freshness threshold, versus the existing nominal ~0.05-second guest input transmission interval. On each host physics step, stale guest input is replaced with neutral **movement, independent aim and FIRE**. A new valid packet regains control immediately, without a reconnect.
- Host also neutralizes any previous session's guest input when creating a new match, redeploying, entering the host lobby, explicitly pausing, leaving the game, disconnecting or reconnecting. Network input is ignored while the host is paused or a match is finished.
- No change to local human controls, on-foot 6.5rad/s pilot turn, tank/mech vehicle pace, shots/bounces/projectiles, appearance, UI/audio, procedural generator, owner profiles, Android native TCP bridge, network snapshot cadence, remote matchmaking or signing.
- This is **not** client-side prediction, smoothing or packet-order correction. If the host is paused, the physics-step clock does not advance; control is reset on pause transitions instead.

## Actual engine QA

- [Focused original game-source + prior LAN input parity + scored/save/smoke regression **PASS**, run 41156162244](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41156162244) at source SHA `8db3ca8accb7ed35f36813e88a148f1510d11d89`.
- `tests/lan-guest-input-timeout-v0954.mjs` loads the **actual bundled game engine**, triggers the real `window.RR.nativeMessage` host input handler and `step()`, and verifies: 300 ms stale-window tolerance, neutral after ~467 ms, no ghost FIRE indefinitely, immediate valid packet recovery, no acceptance while paused, neutral host pause/new match/rejoin/disconnect. Web and Android game JS/CSS source parity PASS.
- Full Chromium/screenshots + Android APK and unsigned AAB [run 41156274497](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41156274497) **running at document creation**. Do not mark complete until verified. Debug preview metadata versionCode **50**, versionName `0.9.54-lan-timeout-test`.
- Physical Android two-phone same-Wi-Fi latency, ease of aiming, actual pause/recovery, guest snapshot jitter and correct update/signing remains **PENDING**. The 0.4-second timeout is conservative for a nominal 20Hz input stream but is not calibrated from a packet-loss study; validate with real humans before final release.

## Human checkpoint and release gate

This incremental safety fix is safe to hold as an isolated experimental draft without distracting from the required phone tests. When two phones become available, deliberately interrupt guest Wi-Fi/press Home while holding FIRE + moving, verify host stops command application quickly without ejecting a pilot incorrectly; test host/guest switch, rejoin, normal transient Wi-Fi jitter and both players' ability to resume.

Keep #83 and all experiment ancestors **DRAFT and UNMERGED**; stable `main` runtime is still v0.9.21. Durable same-signer in-place Android upgrades/save continuity and two-phone LAN acceptance are distinct release gates and remain open. **Never uninstall a prior experimental APK containing valuable saved progress merely to install a different CI-debug signed candidate.**

## Results/next step

Once the full automated run is confirmed, stop making speculative multiplayer adjustments. Do not add interpolation or different packet cadence without two-device results. Practical independent next work, if the owner wishes, is a clean integration audit or read-only Android performance/launch-readiness checklist—not another sweeping feature system.

# Sector Rebound — v0.9.53 LAN Host/Guest Pilot Input Parity

**Date:** 2026-10-30. **Status:** focused real-game input/regression QA PASS; full Chromium/Android QA run pending; **real two-phone LAN PENDING**. This is a **focused gameplay/network correctness change** on [draft PR #82](https://github.com/PlayerEden/Ricochet-Rumble/pull/82), based on the tested [v0.9.52 Android update-preflight PR #81](https://github.com/PlayerEden/Ricochet-Rumble/pull/81). **NOT merged to stable main.**

## Confirmed source-level defect and fix

Before v0.9.53 the LAN guest input packet contained `moveX`, `moveY`, `fire` only, even though offline Solo allows an ejected pilot to **hold/drag FIRE** for independent aiming. In LAN the host also limited pilot independent aiming to offline seat 0, so remote pilot seat 1 could not match that mechanic.

The actual Web and byte-for-byte mirrored Android gameplay source now:
- Permits the existing **on-foot** FIRE-drag gesture for Solo, LAN Host and LAN Guest using the correct local seat (`0` host/solo, `1` guest). No additional button, art change or new aim pad.
- LAN guest includes `aimX`/`aimY` in its existing `input` packet **only while** the existing FIRE drag is active; release, lost pointer or hidden menu clears the aim vector. Existing FIRE behavior is preserved.
- Host validates the incoming input: accepts only finite numeric axes, normalizes movement/aim length, requires BOTH aim axes and sufficient magnitude, and only accepts the boolean value `true` to fire. Partial, malformed, stale and disconnected packets cannot create unknown rotation values or independently activate FIRE.
- Applies exactly the previously approved **6.5 rad/s** on-foot pilot precision-turn to both human LAN seats inside the **host-authoritative** physics simulation, while preserving vehicle movement, shell limits, bounce physics, vehicle AIM mode and all Solo controls.
- Does **not** alter Native Android `MainActivity.java` packet transport or add a new packet type. Existing host sends full state snapshots and guest sends input through the same bridge.

## Evidence

- [Focused real-game input and complete smoke regression run 41148986844 — PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41148986844), original test SHA `9ee05fc298a806f4b5c82c81273ad76f1042539e`. Script `tests/lan-pilot-input-parity-v0953.mjs` loads **actual game.js** and executes actual `window.RR.nativeMessage`, `normalizeLanInput`, `tankMove`, `shoot`, local touch input. Checks host and guest pilot turn parity, guest sidearm trajectory, simultaneous FIRE+independent aim+move, pointer release, hidden menu, bad axes, and disconnect. Existing scored/backup/smoke regression and exact Web/Android game CSS/parity PASS.
- Original smoke suite initially failed because it intentionally asserted **LAN must lack aim**. That obsolete assertion was updated to verify the new required capability. No gameplay failure hidden.
- [Full new Chromium and Android pipeline 41149116261](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41149116261), Android preview metadata `versionCode 49`, `versionName '0.9.53-lan-pilot-test'`. **Final result must be verified before PASS is claimed**.
- Original v0.9.51 [APK and exact QA source rollback](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.51-corridor-recovery-prototype) remains unchanged. [Owner roadmap issue #76](https://github.com/PlayerEden/Ricochet-Rumble/issues/76) and [physical Android LAN issue #22](https://github.com/PlayerEden/Ricochet-Rumble/issues/22) remain open.

## What this does NOT prove or change

- **No real two-phone Wi-Fi testing.** The host may still show guest stutter over variable latency. Current source sends host state roughly every 0.09 seconds (~11 per second), guest input every 0.05 seconds (~20 per second), guest replaces authoritative state without a snapshot interpolator. Do NOT claim these rates are measured packet throughput or that gameplay is smooth, and do not change protocol/transport/interpolation without actual measured data.
- No remote matchmaking, account, friends, ranked, new scored LAN mode or cloud backend.
- On actual phone, independently verify guest and host ejection, thumb FIRE-drag aim, sidearm hit registration, re-entry, pause, reconnect, host exit and scene sync on one Wi-Fi router; retain screenshots/phone details and seek owner verdict. A source simulation is not phone acceptance.
- **Android APK signer still not durable.** Original v0.9.46 vs v0.9.51 debug certs differ ([real signed evidence](ANDROID_UPDATE_PREFLIGHT_v0952.md)); new debug builds may also have ephemeral certs. Do not uninstall any prior APK containing valuable player progress to try a new test build.
- Stable `main` runtime remains old release. Keep this and ancestor draft PRs unmerged, preserve P-03 pilot, v0.9.46 UI/audio, v0.9.48 layout and rollback. Store release GO/NO-GO remains blocked by private stable signing, save-safe update evidence, human controls and two-device LAN.

## Next validation after full QA

1. Obtain an immutable original QA-tested debug APK under an **experimental** prerelease tag, with public checksum and source SHA. Never re-sign/rebuild later and claim same QA binary.
2. When two phones are available, run a 5–10 minute manual matrix **both directions**: host and guest ejected on foot, FIRE drag aiming away from moving vector, stop/release FIRE, entering and exiting parked vehicle, recorded kill/damage/KO parity, host pause/return, disconnect/rejoin.
3. Record actual guest perceived jitter/packet delay. Only then consider a separate, small rendering-only snapshot buffer or input freshness timeout with measured acceptance thresholds.
4. If the owner approves on-device LAN feel, maintain independent release signing and Play readiness gates.

# Multiplayer LAN malformed peer-state acceptance — 2026-10-31

This is a release-hardening pass to reduce failure risk when two phones finally test together. Approved game modes, movement, colors and LAN rules are unchanged.

**Native packet framing:** Android previously called `BufferedReader.readLine()` before testing the 32768-character cap. A connected peer could therefore force unlimited line buffering. New `BoundedLanReader.readPacket` limits length **while reading**, supports LF/CRLF and EOF as before, and causes existing disconnect handling to close an overlength peer. Real JVM `BoundedLanReaderTest.java` verifies exact limit, oversized and missing-newline streams, plus normal frames. Fast CI source check and full Android compilation required. This is a concrete robustness fix, not a new feature.

**Browser snapshot validation:** Host's normal `serializeState()` snapshot continues to work; guest now checks essential arrays, actor positions, config and numeric fields before replacing live state. Invalid packets are ignored instead of later crashing render/HUD. Real Chromium `tests/lan-fault-injection-browser-qa.mjs` injects 12 damaged snapshots and verifies original guest state retained, normal host snapshot accepted, bad input axes ignored and valid movement clamped. Android native transport is mocked only in this specific test.

**Evidence limits:** A single Chromium process cannot demonstrate actual phone Wi-Fi routing, latency, two-phone disconnect/reconnect, or low-end device performance. A full Android/visual QA and native JVM test MUST pass at this exact source SHA before marking both changes verified. Keep 0-bot 1v1, host-authoritative rules, and prior 54 real-browser LAN checks intact.

**Rollback:** revert the bounded reader + validator commit independently if real Wi-Fi tests reveal an interoperability issue. Stable main unchanged, PR #85 remains DRAFT, no Play release.

**Additional framing guard:** Treat internal/carriage-return bytes as packet characters until a terminal CRLF; previously ignoring every `\r` could keep consuming a stream of repeated carriage returns without advancing the size counter. The native decoder now strips only the final CR of a CRLF line and tests an oversized all-CR stream. Re-run the native JVM and Android QA at the new source commit before claiming full LAN acceptance.

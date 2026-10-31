# Sector Rebound — Tank center-pivot feel correction, v0.9.59 candidate

**Owner phone report (2026-10-31):** tank turning feels irregular, less responsive than it should and seemingly not centered. **Preserve deliberate slow turns** for skill-based ricochet aiming.

## Diagnosis
The renderer draws the tank at `(t.x,t.y)` and rotates it about its local origin, with symmetric hull/tracks; it does **not** actually rotate its sprite around an offset point. However, `tankMove()` previously accelerated the tank directly along the joystick's world-space direction **while** its hull was still slowly turning to align. This lateral displacement makes the rotation look orbital or off-center.

## Targeted experiment
- **Human, offline Solo, tank, movement-stick steering only:** the hull turns toward a far-off joystick heading first; motor thrust is zero when >~73 degrees off-axis, then ramps with alignment. Actual speed and turn-rate maximum remain unchanged; existing carry momentum damps a little faster while pivoting.
- **Explicit exclusions:** pilot, mech, bots, host/guest LAN, local duel, and independent right-hand scored AIM are unchanged. Rendering art, camera zoom, shot ballistics, projectile cap, tanks' hitboxes and audio are unchanged.
- **Regression:** exercise actual `tankMove()` in `tests/smoke.mjs` to assert a 90-degree tank pivot with no off-axis displacement and responsive heading; aligned movement still accelerates; bot and mech control unchanged. Keep Web and Android assets exactly byte-identical.

## QA and next phone acceptance
Run fast and full Chromium/Android suites and check a new disposable AOSP-test-key-signed `.preview` APK build. Retain prior known-good preview 100002. Install next higher-code preview **over** it, without uninstalling. On phone: 90/180-degree tank pivots, gentle turns while driving, 5/15-degree bank-shot corrections, and a brief mech/pilot check. If it feels too rigid, tune only the alignment ramp from real feedback, not the previously approved turning rate.

**Source status:** Candidate only. No physical owner approval or live two-phone LAN acceptance yet. Stable `main` runtime is unchanged.

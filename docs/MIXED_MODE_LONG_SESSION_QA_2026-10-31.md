# Sector Rebound — low-risk long-session QA while phone unavailable

User cannot run phone acceptance now. This adds a real-source, automated mixed-mode stress test without modifying game rules, graphics, saved schemas, or controls.

`tests/mixed-mode-soak-browser-qa.mjs` runs genuine bundled game JS in Chromium, injecting only a test observer. Thirty consecutive starts/rematches across Quick Play, scored FFA, CQC pilot-only, scored TDM and Custom each simulate 240 actual 1/60-second physics steps (7,200 total). It checks increasing match IDs, new maze seed, cleared projectiles/pickups/effects/results, clean clock, matching actor/life array lengths, pilot-only CQC vehicle count, bounded live projectile/effect/DOM counts, finite actor/projectile physics values, and zero uncaught page/console errors. Per-round evidence `qa-results/mixed-mode-soak.json` is included in existing full Chromium/Android QA artifact.

This is *not* a device benchmark, online LAN/packet stress test, performance FPS measurement, thermal/battery measurement, real Android WebView interruption test, or real input usability verdict. Fast regression and full Chromium/Android QA must pass at this exact commit before the new test is accepted. Existing owner-approved stable preview, main branch, controls, pilot, game visuals and Version A icon remain unchanged.

**Still blocked:** physical two-phone LAN, physical install-over Dossier/Hangar save checks, device touch comfort and low-end performance, Play Console/contact/hosted privacy policy and production private signing.

## Initial QA harness correction
[First full run 41269879343](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41269879343) failed only the new harness clock assertion `elapsed<=4.01`: the live browser continues its requestAnimationFrame physics between the initial reset snapshot and the explicit 240 simulated ticks. That makes its elapsedSeconds slightly greater than the exact four-second ideal. The game runtime was not modified. Revised the test to assert a finite, bounded (0–6 seconds) in-game clock after the four seconds of forced physics. This is an approximate stability envelope, **not an assertion of exact deterministic wall-clock timing**. Re-run full QA at the new SHA before claiming the soak passed.

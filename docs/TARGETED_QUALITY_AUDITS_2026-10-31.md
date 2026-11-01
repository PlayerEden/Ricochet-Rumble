# Sector Rebound — targeted gameplay, LAN, UI, reliability audit
Date: 2026-10-31 | starting integration SHA 9a71b208768253f26f273c7b55f6f63559f64133

**Audit A: Gameplay and interruptions**
Actual web/game.js releases pressed keys, touch buttons, FIRE aim and joystick from RR.appPause; MainActivity.onPause invokes it. New live Chromium QA at 740x360 holds a key, FIRE and joystick while interrupting, then tests pause/resume and blur with a test-only state observer. No accepted input/balance changed. Phone-level background/resume still pending.

**Audit B: LAN multiplayer integrity**
Current host-authoritative Android bridge only sends state/lobby/start; guest sends input/interact/ready. JS guest input neutralizes after 0.4 seconds without a packet. Existing two-context real Chromium LAN lobby tests, timeout/aim parity tests, scored kernel and 0-bot 1v1 rules are source-backed; previous full run 41267532193 passed. Physical two-device Wi-Fi join, bot ownership, rematch and disconnect remain required. Do not call it full LAN approval.

**Audit C: UI and usability**
Last exact full Chromium run 41267532193 passed 102 responsive landscape scenes with 0 errors/warnings; compact Hangar tabs/Back, Dossier, Help/privacy, settings, Quick Play, After Action and backup covered. CSS safe-area and pointercancel cleanup present. Geometry PASS is not proof of real cutouts, OS fullscreen prompt, physical tap comfort or screen reader accessibility.

**Audit D: Save/update/release**
Real API35 emulator run 41267204053 passed Android Preview 100041 -> 100050 install-over using the same AOSP public test signer, preserved app-private canary and launched both. Full Chrome QA 41267532193 passed manual export/restore of all five records between isolated app profiles. Physical WebView save retention and actual production-package import still unverified. Hosted public privacy page, developer contact, Play statements, private production AAB signing and actual two-phone LAN remain release NO-GO.

**Release discipline:** this update adds only tests/docs/CI; original gameplay, controls, pilot art and icon stay locked. Stable main untouched; PR #85 draft. New lifecycle browser result must be confirmed from its own exact-head full workflow before claiming PASS.

## Finding Q-01 — oversized manual export could not be reimported (FIXED, new QA pending)
An actual source replay found that three individually valid storage records of about 23K characters each produced a 69,333-character backup, while the importer rejected text over 60,000. The export path did not previously compare the complete generated text with MAX_INPUT. Fixed with a fail-closed export check: user gets a clear error instead of deceptively unusable backup text; existing storage is never changed. Added regression for oversized refusal, unmodified originals and a moderately large valid roundtrip in tests/save-backup.mjs. Save format v1, storage keys, normal export text, restore, and gameplay remain identical. Recheck exact-head fast regression and Android/WebView source parity before calling green.

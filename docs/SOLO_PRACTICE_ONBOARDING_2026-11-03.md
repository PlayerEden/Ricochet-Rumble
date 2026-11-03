# Sector Rebound — Solo practice and one-phone focus (2026-11-03)

## Owner decision
The owner has accepted v0.9.78 camera and AI feel for now (pilot 0.94, tank 0.73, mech 0.69). Two actual Android phones are unavailable; physical LAN testing is DEFERRED rather than passed or abandoned. Focus meanwhile on solo polish, device stability, backup and store readiness without changing protected combat feel.

## Focused improvement
- PRACTICE appears within Choose Mode, and TRY PRACTICE appears in Help; Quick Play remains the main home action.
- The existing zero-bot Solo field starts immediately. It is a practice-only match: no Dossier match rewards or unlocks, no altered saved bot preferences, playlist or Custom presets.
- Help now accurately describes the default hold-and-drag FIRE, then release-to-shoot input, and notes optional settings for Auto Fire and hold-to-fire.
- Camera, AI, weapons, core movement, team rules, local-network code and real saved settings remain untouched.

## QA and user test
- Smoke regression checks the actual practice action, zero bots, one actor, unchanged Dossier/prefs, and normal Quick Play with bots afterward.
- Real Chromium onboarding test covers Help and Choose Mode on 740×360, 915×412 and 1280×720 viewports; asserts full-screen arena, return to home, unchanged persistent settings, zero script errors and no dummy UI controls.
- Web and Android game assets must remain byte-identical; canonical gameplay/AI/LAN/visual CI required.
- One-phone manual QA: Help > TRY PRACTICE; move tank, drag and release FIRE, exit and re-enter a vehicle, pause > Main Menu, then Quick Play to confirm bots returned. Check Dossier and Hangar. Physical device feedback separate from CI.
- The owner-tested v0.9.78 preview, signed with the public AOSP disposable test certificate and code 400001, is the rollback reference. New APK must use the identical preview app ID and signer, with code higher than 400001. Back up Dossier before installing over an existing build; never uninstall to bypass signature conflicts.

## Deferred tests
Actual two-phone LAN discovery, guest play, spectating, JOIN NEXT, disconnect and retry are pending device access. Do not claim Play Store readiness or physical LAN acceptance. Public release signing is separate.

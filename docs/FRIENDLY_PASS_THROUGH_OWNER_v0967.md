# Sector Rebound v0.9.67 — friendly pass-through Android owner preview

**Prepared:** 2026-11-02. **Test-only branch:** `experiment/friendly-unit-pass-through-v1`. **No stable main merge or Google Play publication.**
**Feature:** allied players/bots/vehicles are pass-through in team modes, while opposing actors, maze walls and the boundaries of occupied vehicles remain physically meaningful. Actual entering an already-occupied vehicle is forbidden. Removes the recent CTF-only human escort side/forward-yield workaround in favor of one shared collision rule.

## Immutable Android build information

- [GitHub Actions build #41513056527 — SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41513056527), original game/build source SHA `024635a3d0bac7494e975549fe3f9f6149551066`.
- [APK ZIP artifact #13173896887](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41513056527/artifacts/13173896887), `sector-rebound-friendly-ghost-1`. Archive contains the APK `sector-rebound-friendly-ghost-290001.apk` and `verification.txt` with its actual SHA-256 checksum.
- `applicationId=com.playereden.ricochetrumble.preview`; `versionName=0.9.67-team.1`; **versionCode 290001**, explicitly higher than compatible experimental v0.9.66 code 280001 and v0.9.65 code 270002.
- Same pinned public AOSP **development** signer SHA256 `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc` (NOT private Play signing). Android CI verified signature via apksigner, package/version via aapt, archive contents versus browser source, and Gradle build.
- Chromium pilot aiming, AI shot/telegraph, combat HUD, landscape HUD, match flow, exact new CTF seeded-contest cases, Android upgrade readiness, smoke collision tests, backup/save and source parity passed in APK workflow.
- Independent [full CTF, Forward Bay, saves and 44-screen visual workflow #41513056155](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41513056155) completed **SUCCESS** at the same exact APK source commit `024635a3d0bac7494e975549fe3f9f6149551066`. It passed actual 12 scripted input-driven CTF matches, seed-102 human progress, 300 Forward Bay seeds, CTF objectives, Quick Play, backup/saves, first-match and all 44 visual snapshots. The earlier [#41512683422](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41512683422) also passed the same gameplay implementation.

## On-device acceptance (NOT complete)

1. Note the installed preview package/version. Make a local offline backup of Dossier, Hangar, options and Custom presets if available; **do not uninstall** to apply this preview. Check it is an update for the same `.preview` app and signer. An incompatible existing installation may require a different process; never promise data preservation without checking.
2. Enter CTF or Team Survival and deliberately drive a tank straight through a teammate tank; then walk a pilot through friendly AI. Both should smoothly overlap without locking, shaking or shoving.
3. In CTF, navigate the tight Forward Bay approaches and escort corridors. The flag should still require an on-foot pilot; verify pickup/drop/return/capture and that friendly teammates do not block routes.
4. Face a RED enemy tank/pilot head-on. Enemies still **block** movement. FFA players also remain solid, and no vehicle should phase through a wall.
5. Fire past overlapping friends to an enemy; teammates are not supposed to intercept friendly shots. Check normal self-ricochet, incoming enemy shots, shield effects, damage feedback and ally/enemy team colors.
6. Check CQC, FFA, TDM and Quick Play scoring/controls, body overlap on narrow doorways, AI navigation, radar and HUD layout on landscape and in left-handed controls.
7. Verify previously saved Dossier, earned paints, insignia, Quick Play choices, Custom presets and sound/controls after install. Inspect match results, restart/redeploy and pause. Capture screenshots/reproduction steps for any regressions.
8. Test 2-phone LAN host/guest separately; current CI only verifies host-authoritative code paths and client source parity, not physical network behavior.

## Safety and rollback

This is **not** an approved production release; the test certificate is public. Keep stable `main`, the older v0.9.65/66 experimental source/CI and full installable APK artifacts (while retained) available. An Android downgrade of versionCode 290001 cannot normally be installed over a higher code; reinstall may delete saves. A rollback must use a newly versioned compatible preview and the same signer, not an unsafe forced uninstall. Physical Android owner acceptance pending.

## Automated decision

**PASS: isolated source/Android/Web regression and preview build.** **PENDING: owner hardware install/update, saved progression continuity, presentation clarity with overlapping allies and LAN two-phone behavior.** Draft PR only; not a production release. Do not infer player balance from scripted CTF capture totals.

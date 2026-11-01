# Sector Rebound — physical Android acceptance card (2026-10-31)

**NOT YET EXECUTED.** Browser automation, simulated LAN, APK signing continuity and Chromium upgrade all passed earlier; none prove what happens to this user's data across an actual on-phone update. Do not confuse this checklist with success evidence.

## A. One-phone install-over and privacy Help (can test now)

1. If an earlier `com.playereden.ricochetrumble.preview` installation is currently present, note its version and *do not uninstall*. Open **Dossier** and record match/KOs/wins; record chosen paint and insignia in **Hangar**, field size/bots/playlist choices in **Match Settings**, and any Custom presets. A manual Dossier backup is recommended.
2. Install a **higher versionCode** APK signed with the **same public-test certificate** over the installed preview. Version 100045 follows known-good Preview 100041; do not install an older APK over a newer one. Only use the verified GitHub Actions artifact.
3. Launch normally; verify saved stats, settings, cosmetics, presets, menu navigation and gameplay. If progress changed, document *which field*, version and the precise action; preserve a backup and avoid further reinstalls until reviewed.
4. Open **Help → PRIVACY POLICY · LOCAL DATA**. Expand, read, collapse, and use Back; verify this does not cover controls or clip at landscape 568×320 and common phone sizes.
5. Rotate/interrupt/resume; finish Solo Quick Play and Next Match without hang, loss of audio/controls or new save corruption. Record Android/device version, preview version, signing result and screenshot evidence.

**A passes only on owner confirmation; do not silently tick it because browser upgrade tests passed.**

## B. Two-phone nearby Wi-Fi acceptance (when second phone is available)

Precondition: both Android phones have the same tested preview version or documented compatible versions, with **Wi-Fi enabled on same local network**. Some guest/private Wi-Fi networks block device-to-device discovery.

1. Phone A **Local Play → Host**. Confirm nearby service appears. Phone B **Local Play → Join**. If discovery fails, test **Join by IP** with displayed host's local IP/port and record whether it worked.
2. Host selects **1v1, 0 bots**. Guest sees room rules and Ready. Confirm the guest cannot override host rules.
3. Start game only after guest Ready. Verify both phones show distinct player/tank IDs and correct score/life rules; no phantom AI opponents. Drive/fire/eject/enter and observe responsive replication.
4. Complete a round and verify **win/lose/elapsed time/deaths** are consistent. Test **Rematch** and **Change Rules → Ready → Start**, confirming there is no accidental stale Ready state and fresh maze/match ID.
5. Disconnect phone B mid-match, then reconnect and host again. Test Home/Back, app interruption, discovery failure and Wi-Fi toggle. Record errors, steps, both device models and OS versions.
6. Run at least one **FFA** or **TDM** non-default room with bot count and team settings selected by the host; confirm correct bot ownership and team colors.

**B remains pending until an actual physical dual-phone test.** The 54-browser-assertion LAN test is engineering evidence, not physical acceptance.

## C. Play scope and final production decisions

- Owner selects **Solo-first launch without advertising nearby LAN** or holds public release until LAN gate B passes.
- Complete source-backed Data safety/age/ads/ratings declarations, public privacy page with real publisher/contact and accessible URL, 512px approved store icon, 1024×500 feature graphic, authentic screenshots, private release-signed AAB, and account-specific testing requirements.
- Final release sign-off must compare exact AAB checksum with source commit, private signing identity, target API, manifest permissions, and copy on the Play listing. GitHub PR #85 remains DRAFT and stable `main` unchanged until specifically authorized.

## Record template

| Field | Value |
|---|---|
| Tested date and app version | PENDING |
| Phone A make/model/Android | PENDING |
| Phone B make/model/Android | PENDING |
| Install-over without uninstall | PENDING |
| Dossier/Hangar/Settings/Custom saved correctly | PENDING |
| Help privacy/Back/landscape | PENDING |
| Solo Quick Play and Next Match | PENDING |
| Discovery/Join IP | PENDING |
| Two-phone 1v1 no bots | PENDING |
| Results/rematch/rule change/disconnect | PENDING |
| Known issues/screenshots | PENDING |
| Owner acceptance | PENDING |

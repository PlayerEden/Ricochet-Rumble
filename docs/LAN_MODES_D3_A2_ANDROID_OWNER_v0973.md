# Sector Rebound D3-A2 — v0.9.73 signed Android owner preview (verified)
**Build date:** 2026-11-02 Kentucky local / 2026-11-03 UTC. **Physical Android acceptance and two-phone Wi-Fi remain pending.**

## Signed reproducible owner build
- **Exact APK source SHA:** `08580417bb43877b472f5b378d449f77e74bd4de`.
- **Immutable source checkpoint:** [`checkpoint/sector-rebound-v0973-lan-modes-signed-ci-350001`](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-v0973-lan-modes-signed-ci-350001). Older [v0.9.72 rollback](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-v0972-host-bots-signed-ci-340001) unchanged.
- **Source/browser regression CI SUCCESS:** [Run 41573556329](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41573556329) on gameplay SHA `d7efddfec93a2249c7e488555beb06c7b6856a37` — **47 D3-A2 real-engine browser checks**, **32 previous D3-A1 real-engine checks**, **101 D2 two-browser-client LAN checks** plus 14 dual-client screenshots; core smoke/scores/ballistics/saves, 102 responsive layout scenes, 44 visual QA screens. Only an intentional Android build workflow changed after gameplay SHA.
- **Signed Android CI SUCCESS:** [Run 41574012652](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41574012652), exact APK source SHA `08580417bb43877b472f5b378d449f77e74bd4de`, repeat A2/A1/D2 and expanded sound/AI/CTF/Android checks, Gradle Android assemble, Web/Android asset parity, signer, Android package, monotonically increasing version, embedded APK game assets.
- **APK ZIP:** [GitHub Actions artifact 13203185715](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41574012652/artifacts/13203185715), name `sector-rebound-lan-modes-1`, contains **`sector-rebound-lan-modes-350001.apk`** and `verification.txt`.
- **App ID:** `com.playereden.ricochetrumble.preview`. **versionCode:** `350001` (> v0.9.72 `340001`). **versionName:** `0.9.73-lanmodes.1`.
- **Signer SHA256:** `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`. This is the **same public, disposable AOSP development certificate** used by the prior owner preview, NOT a Play Store production upload key.
- Verified APK directly against source assets `game.js`, `index.html`, `style.css`, `scored-match.js`, `dossier.js`, `save-backup.js`, `ctf-rules.js`, `ctf-ai.js`, `forward-bays.js`, `lan-series.js`, and `lan-room.js`. Signed test artifact retention is finite; do not confuse it with a permanent distribution URL.

## Single-phone acceptance (complete on actual Android)
1. **Before installing**, open existing preview's Dossier/Backup and export local progress externally; note current Hangar paint/insignia, saved presets and options. **Install v0.9.73 APK OVER** the existing preview; do not uninstall to bypass an error. If Android refuses the update, keep local app/data and record exact error.
2. From main menu, go **PLAY TOGETHER → HOST GAME** with no second phone. The room should show an address when available, no guest Ready required, and START VS BOTS.
3. **FFA**: 0 additional bots means host against **one genuine AI**, not zero enemies. Try increasing extra bots to 4 for six participants total. All enemies move/shoot, have distinct FFA identity, and no fake P2 human label; survivor win, rematch and after-action should be truthful.
4. **Team Survival**: try 1v1 (host vs AI), 2v2 (host+ally bot versus 2 enemy bots) and 3v3 (host+2 ally AI versus 3 enemy AI), both Cyan and Coral host. Check friendly/pass-through with FF OFF and true score/HUD counts; odd additional bots should not create unfair mismatched squads.
5. **Co-op vs Bots**: zero extra enemy bots must block Start. With one extra bot, host and AI ally face a live opponent; with four extras, host+AI ally face four opponents. Teammates must not be mistaken for enemies; Co-op victory ends properly.
6. **Scored TDM**: recheck 1v1/2v2/3v3 and Best of 3 including 1-1 decider. No duplicate KO/round wins and no accidental solo Dossier rewards.
7. **Room continuity**: after a completed match choose CHANGE RULES; switch among the four modes and start again without returning to HOME or re-creating the native host socket. Pause/resume, turn phone portrait/landscape, and ensure menus and FIRE/MOVE remain thumb-safe.
8. Confirm saved Dossier/presets/Hangar progress did not disappear after the compatible APK update; note actual FPS, heat, errors or layout overlaps on device.

## Explicit NOT VERIFIED / not included
- No owner physical Android install or gameplay check submitted yet.
- No actual two-phone native Wi-Fi test, no spectator camera, no automatic join-next queue, no repeated Android native accept/reconnect, no internet play and no production Play Store signing.
- Host-room availability requires foreground Android hosting; the current native Android transport closes on background and only accepts one remote connection.
- Existing `main` remains unchanged; this is a draft experimental branch. Do not claim the D3-A0 room-role state machine is wired into Android networking merely because its standalone tests passed.

**Next master phase:** Owner accepts v0.9.73 one-phone experience; D3-B1 active room status and real spectator view is next development slice; D3-B2 queued guest takeover, then D3-C native accept/reconnect and two physical phones.

# Sector Rebound D3-A1 — v0.9.72 owner Android preview VERIFIED
**Build date:** 2026-11-02 Kentucky local (2026-11-03 UTC). **Owner installation and physical LAN testing still pending.**

## Permanent reproducible source and CI evidence
- [D3-A1 real-engine + browser + dual-client + UI CI — run 41571580793 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41571580793), gameplay/test source `860e15432cc32dfbf08f38f324f04a0937922289`. Explicit source log: **32 real-browser host-only checks**, **101 real two-browser-client LAN checks**, including 14 two-device viewport screenshots and original UI geometry and 44-view visual checks. A0 pure kernel [run 41570686213 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41570686213), source `35b7ed75b049a3b7e0fb9a16f88cf5c84a980a58`.
- **SIGNED APK CI SUCCESS:** [run 41572106373](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41572106373) on exact **APK source SHA** `848a14832d03486239b30d510f2fe5ae28fac7e6`; only intentional owner-build workflow differs from preceding fully tested game source. All runner steps reported SUCCESS, including Gradle compile, source/script parity, browser replay of A1/D2 and existing combat/AI/CTF/UX, public AOSP cert recovery, signing and final APK verification.
- [Download owner test artifact ZIP](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41572106373/artifacts/13201384029). Artifact ID `13201384029`, name `sector-rebound-host-bots-1`; **ZIP contains** `sector-rebound-host-bots-340001.apk` and `verification.txt`. GitHub Actions artifacts have finite retention; archive on an approved durable prerelease later if warranted, without overwriting a tag.
- **Android application ID:** `com.playereden.ricochetrumble.preview`.
- **Android versionCode:** `340001` (strictly greater than v0.9.71 code `330001`).
- **Android versionName:** `0.9.72-hostbots.1`.
- **SHA256 signer:** `a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc`, the same publicly known/disposable AOSP **development preview** signer as v0.9.71, not Google Play release signing.
- Workflow independently compared embedded APK `game.js`, `index.html`, `style.css`, `scored-match.js`, `dossier.js`, `save-backup.js`, `ctf-rules.js`, `ctf-ai.js`, `forward-bays.js`, `lan-series.js`, `lan-room.js` with exact source; code/name/signer/package passed.
- Immutable reference to exact verified source: [`checkpoint/sector-rebound-v0972-host-bots-signed-ci-340001`](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-v0972-host-bots-signed-ci-340001). Previous v0.9.71 rollback remains `checkpoint/sector-rebound-v0971-lan-series-signed-ci-330001`. Neither checkpoint is merged into old stable main.

## Single-phone owner acceptance (NOT YET VERIFIED)
1. In currently installed preview **before updating**, use the in-game Dossier/Backup action to export current records and safely save the backup externally. Record cosmetics, presets, play stats.
2. Get the verified ZIP from GitHub Actions and extract `sector-rebound-host-bots-340001.apk`. Install **over** the existing `com.playereden.ricochetrumble.preview`; do NOT uninstall the app as an automatic workaround. If Android says update incompatible, document exact app label, version and error; preserve data.
3. Launch; confirm Dossier/Hangar and saved Custom/Quick Play settings remain. **PLAY TOGETHER → HOST GAME → TEAM DEATHMATCH**. Default 0 additional bots equals one *real opponent AI*, not fake two humans. Select Cyan/Coral, FF ON/OFF, 15/30 KO and optional Best of 3; tap **START VS BOTS** with only one phone.
4. Check 1v1 (host vs AI), 2v2 (host + allied bot vs two opponents), 3v3 (host + two allies vs three enemies). Bots should actually move, fire and score. Scoreboard, team color, opponent counts and respawns must be true.
5. Finish a series: Round 1 → NEXT ROUND, 2–0 clinch or 1–1 decider, complete After Action and choose **CHANGE RULES** to go back to the existing room, without another host setup. Try new round with different settings and ensure old score/ready doesn't leak.
6. Pause/resume, landscape and portrait, short prolonged play. If a second phone becomes available later, run separate LAN host/guest tests.
7. Record real PASS/FAIL with screenshot/seed/version/observed behavior using [D3 owner one-phone card](LAN_D3_ONE_PHONE_OWNER_QA_2026-11-02.md).

## Explicit limitations of this preview
- **Only scored LAN TDM** host-without-guest implemented; FFA, Survival/Co-op host-alone follow in D3-A2. Solo and existing 2-human D2 LAN behavior should remain.
- New guest during live host-only match currently receives **waiting/host busy lobby**, not the actual spectator camera or automatic next-round queue; those are D3-B1/B2.
- Android Java networking still accepts the first remote connection once and is closed when the host goes to Android background; repeat joining, multiple guests, room-wide status and native reconnect await D3-C.
- The current D3-A0 pure room-role coordinator is a testable contract and is not yet the native active networking state machine; do not claim actual human seat promotion or spectator input security from its test alone.
- No physical two-phone test, owner update/save acceptance, real-device FPS/heat proof, production-signed bundle, Play Store launch or `main` merge.

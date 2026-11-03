# D3-A1 — Host-only TDM gameplay, Android owner-preview candidate
Source branch: experiment/lan-host-bots-d3-a1. Based on D3-A0 verified LAN room kernel; protected rollback is v0.9.71 signed preview, versionCode 330001. Main unchanged.

New source: Host can open a local Wi-Fi room, select scored Team Deathmatch, and press START VS BOTS with no connected guest. Slot 1 is a real AI controller, not a frozen second human. Team IDs and 2/4/6 arena actor limits remain unchanged. Bot skill, friendly fire, Cyan/Coral host choice and Best of 3 remain honest. After Action permits NEXT ROUND or CHANGE RULES even without any guest; room stays advertised on the original socket.

If a second device connects mid-bot-match in this preliminary A1, host keeps playing and the guest is held in a clearly marked waiting room. No late spectator camera or queue exists yet; B1/B2 will address that. Guest movement, fire and interact cannot hijack the bot. Android native service still supports only one accept, and onStop closes hosting (C-stage work).

Real browser test tests one phone with native Wi-Fi mocked at AndroidBridge only: successful actual pilot KO ledger for a 1-1 then Coral 2-1 Best-of-3, AI brain slot 1, 2v2 and 3v3 team rosters, missing/late guest, rematch, rules and room return. Separate existing D2 dual-client regression, scoring/saves/ballistics, geometry and visual tests remain required. This is not proof of physical two-phone Wi-Fi, production signing or real Android installation.

Next: verify exact-source CI, then create a higher versionCode same-development-certificate signed preview APK, verify source/mirrored assets and provide D3 one-phone owner test instructions. No surprise merge to main.


## Signed owner preview milestone
See [verified v0.9.72 Android owner preview and physical acceptance plan](LAN_HOST_BOTS_D3_A1_ANDROID_OWNER_v0972.md). SHA `848a14832d03486239b30d510f2fe5ae28fac7e6`, run [41572106373 SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41572106373); install-over/save acceptance still requires user.

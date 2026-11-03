# In-app privacy/local-data disclosure — Sector Rebound (2026-10-31)

**Intent:** a small player-facing release-preparation improvement on draft PR #85. Help contains a second opt-in expandable **PRIVACY POLICY · LOCAL DATA** section with on-device stats/settings/cosmetics, manual user-exported backup, two-phone Wi-Fi match-state and host IP visibility, and current absence of accounts, developer-hosted matchmaking, ads or analytics SDKs.

**Source evidence:** android MainActivity local TCP/NSD only, manifest and Gradle no analytics/ads SDK; web/game.js locally stores settings and Hangar; web/dossier.js saves stats; web/save-backup.js exports locally and restores only on user confirmation. No new permissions, user data type, network service or game code introduced.

**Boundary:** concise in-app text is NOT the final comprehensive publicly hosted Google Play privacy policy. External privacy URL, full Data safety declaration, signed production bundle and real physical Android/two-phone tests remain unresolved and must never auto-pass.

**Regression:** web+Android HTML/CSS mirrors must remain byte-identical; real Chromium Help must expand/collapse privacy and preserve 4-step manual/navigation and all prior match/LAN/geometry checks; Android signed preview and UI CI must pass before player update. Preserve owner-approved Preview 100041 as rollback; do not merge this draft to stable main automatically.

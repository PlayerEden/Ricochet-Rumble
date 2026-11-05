# M13-B — Battle pacing and in-match story, initial isolated implementation

**GitHub issue:** #142. **Draft PR:** #143, based on unchanged main `b114dfa37`. Independent from approved visual-art PR #141.

## Player feedback
Matches end before their battles can be enjoyed, including with a player not moving. There's little opening/middle/finale feedback or a way to watch ongoing fights. Baseline Solo Survival has a small map, 2 bots and 2 lives; last-side-standing ends the match. Solo scored CQC / FFA / TDM have genuine 10 / 10 / 15-KO targets and 180 / 240 / 300-second *maximum* clocks, not minimums.

## B1 / B2 changes (reversible)
- **Fresh profile only:** standard arena, 3 bots, 3 lives; existing saved preferences, Custom, Daily, LAN and CTF rules remain authoritative.
- **State-derived battle arc:** initial DEPLOY until a real engagement or 18 seconds, ENGAGE during fighting, FINAL STAND when only two sides remain after a casualty or player lives become critical; scored FINAL PUSH when real leader is at least 80% of the KO target or 45 seconds are left. Actual fast endings skip stages; no game-length gate or simulated kills.
- **Solo HUD** reuses the existing proven score-clock position. Survival shows elapsed time plus remaining living enemy combatants; scored shows time left plus *real leading score / target*. Amber final-phase cue, accessible descriptions, and one-time modest announcements. LAN host/guest, CTF, Daily, exercises and scored-match kernel are unchanged.
- **Natural AI observation:** new seeded engine test compares old/default Survival with candidate standard-map/3-bot/3-life profile using both idle and AI-proxy human seat, and samples existing scored modes. Report gives early-ending counts, duration percentiles, KO counts and end causes. Results are **synthetic** (not human/phone measurements).
- **Android test identity:** only `-PsrPacingLabPackage=true` builds `com.playereden.ricochetrumble.m13pacing` labeled **SR M13 Battle**, signed with disposable CI debug key. Standard `com.playereden.ricochetrumble` and installed progress are not touched. The test APK has original menus while art PR #141 stays separate.

## Pending decision gates
Measure actual natural match distributions and read the result before increasing 10/10/15 KO targets. Build the Solo after-elimination WATCH FIGHT camera only after stage and camera fairness QA. Five viewport/browser screenshots, safe thumb controls, regression LAN and physical Android long-play testing required. Do not merge gameplay or the unapproved private signer into main. No change to existing saved record schema.

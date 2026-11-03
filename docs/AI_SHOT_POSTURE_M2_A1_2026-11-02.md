# M2 AI1 — Physical aim posture and fair moving-shot discipline
**Owner feedback:** After playing experimental v0.9.73 on a physical phone, the owner reported that AI appears to shoot while moving without visibly having to aim or line up its shots. This is **subjective human-device evidence** that overrides the prior conclusion that existing reaction delays alone were sufficient.

**Source base:** signed experimental v0.9.73 code `08580417bb43877b472f5b378d449f77e74bd4de` / `checkpoint/sector-rebound-v0973-lan-modes-signed-ci-350001`. Separate experimental branch `experiment/ai-shot-posture-m2-a1`, draft PR. **No changes to player controls, bot speed constants, fire cooldown, projectile ballistics, damage, victory rules, teams, LAN room protocol, Dossier or stable main.**

## Root cause confirmed by source audit
- A3 had previously introduced bounded candidate trajectories, commit/turn/acquisition/recovery and held target angles. BUT `botFireCommit` incremented `fireTrack` for every visible target **while the muzzle was not aligned and while the bot was at full moving speed**. Only the last frame before shooting checked `Math.abs(error)<.095`.
- In `botInput`, the navigation `moveX/moveY` returned nearly full `pace` independently of `aimX/aimY`, so a bot could visually slide sideways, complete its acquisition timer during an unrelated turn, then fire immediately when its hull momentarily lined up. The appearance was a "perfect moving shot" without human-visible commitment.

## Narrow mechanics change (first A/B candidate)
- New `botAimPosture` evaluates actual physical hull/pilot orientation and real actor velocity. It requires the bot to face the locked firing angle within **0.16 rad** and to travel below a **difficulty- and actor-type-dependent cap** before shot acquisition accumulates. The final fire still requires the established **0.095-rad** real muzzle alignment.
- If the bot turns too far off-target or travels too quickly, aim progress decays instead of preserving a charged shot from the middle of a high-speed strafe.
- A bot with real current LOS, a valid trajectory and no firing recovery **brakes while turning/aiming** (its movement input is scaled according to angular error). On firing it returns to ordinary movement/recovery. It still uses the same physical `tankMove` angular ceiling and projectile trace, without auto-aim or wall hacks.
- Casual takes longer and has a stricter moving-speed gate; Spicy can settle faster and accepts slower mobile aim, but **all three difficulties require physical alignment and deliberate acquisition**.
- Current LIVE bot-vs-bot, Solo and LAN host-only bots share this mechanic, including the formerly reserved guest AI seat; new artificial accuracy handicap or damage reduction is intentionally **not** introduced.
- Existing bot cue progress remains tied to genuine shot-acquisition `fireTrack` and never displays a charging cue until actual alignment progress.

## Acceptance / stop conditions
- New real-Chromium `tests/ai-aim-posture-m2-a1.mjs`: stationary aligned pilot/tank shot still acquires, aligned high-speed strafe cannot charge/fire, off-heading bot cannot charge/fire, and natural movement must visibly slow and physically rotate to commit; compare all skill bands and two phone-sized viewports.
- Retain previous real-game bot projectile/bank-shot/cooldown tests, pilot fairness/aim cues, D3-A2 47 real matches, D3-A1 32 host-only tests, D2 101 two-client LAN, 102 mobile geometry scenes, and 44 visual screens. Any regression must be fixed before owner APK.
- After successful exact-source CI, build same-signer higher-version Android preview and ask owner to compare matched scenarios, ideally 1v1 tank and 2v2 team versus bots. **No assertion that a numeric test proves fun/fairness**; owner phone feedback is acceptance.
- Warning: overly defensive AI can become stationary target practice; if actual human play reports bots "never attack" or "stop and wait too long", adjust the posture limits in another small A/B pass, not by restoring instant-fire.
- Preserve `main`, signed v0.9.73 and all earlier checkpoint SHAs. No standalone network upgrade, spectator, queue, production Google Play work in this slice.

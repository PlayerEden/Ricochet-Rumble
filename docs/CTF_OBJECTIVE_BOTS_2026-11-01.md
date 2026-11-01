# Sector Rebound — Objective-Aware CTF Bots (2026-11-01)

**Status: implementation candidate; QA, physical phone, and owner gameplay acceptance are separate gates.** This branch derives from the fully automated-audited offline CTF base `4e922f95f0e7463b60cfe3eea002d5a55a4018c4`, and is **not** stable `main`, draft integration PR #85, or Android Preview 100061.

## First role assignment / real game behavior

In the current 1-human + 3-bot CTF exercise:
- **Coral BOT 1 — Runner**: use existing maze-graph navigation toward Cyan's flag; leave vehicle near target, grab on foot, return to Coral base to score. Pursue dropped own-team flag opportunistically when nearby.
- **Cyan BOT 2 — Escort**: follow/protect Cyan human pilot, or escort teammate carrying Coral flag; switch to intercepting an enemy carrier who steals Cyan's flag.
- **Coral BOT 3 — Defender**: protect Coral Forward Bay, hold nearby instead of wandering, intercept intruders and return a dropped Coral flag on foot.

`web/ctf-ai.js` is a **pure, deterministic objective chooser** (byte-identical Android counterpart), not a replacement for bot pathfinding, aim, physics, score, flag carrier rules, or a new LAN protocol. `web/game.js` integrates objectives only if `isCtfMatch()`; in all other modes, previous `chooseBotObjective` behavior, skill, movement, weapon strength, bullets and accuracy are unchanged. CTF bots now legitimately qualify for flag pickup/captures via `SectorFlags`, but vehicles cannot carry; losing their pilot drops flags. The existing safe respawn logic is retained.

**Fairness caveat:** 1 human + 3 bots inherently means Cyan human and escort versus Coral runner and defender. Defending/escorting is role differentiation, not proof of equal skill or a balanced multiplayer mode. The AI can read publicly visible flag/carrier positions; it gets no wall bypass, boosted damage or stealth information. No objective actions are in LAN, Custom, Quick Play or Daily Sector.

## Required QA audit after implementation

1. Pure deterministic objective-role contract: assign roles, opponent pickup, runner's own-base return, defender reactions, escort handoff, no invalid/teleport objectives.
2. Real Chromium: ordinary Quick Play/Custom unchanged; CTF three actual bot roles; valid bot movement and combat output; proof a bot can leave its tank near a flag, pick it up, and **score against the human in the actual combat/flag loop**; losing human result and timed draw; CTF match reset.
3. Seeded stress over multiple true CTF map states, collision safety, path validity, no NaNs or invalid steering.
4. Overall existing Daily, custom AI, Forward Bay 300-seed and 30 garage integration, original pilot-only CTF, Quick Play first-match and result, manual backups, visual QA, all Web/Android mirrored assets.
5. Physical Android controls and player experience **not validated** until the owner can test; multiplayer objective replication and two-phone testing not implemented. No new APK from experimental CI.

## Later revisions after acceptance

Extend role assignment to 2-human or full team-controlled CTF (with balanced attacker/defender bot counts), add score/minimap flag cues, improve approach pacing and AI escort cover, validate anti-camping and tactical balance via real play, test remote/LAN authority and synchronization, then review promotion. Retain rollback to the CTF flag-only source above.

Protocol: **major gameplay implementation → targeted QA → full existing regression → archived exact-source audit → next milestone**.

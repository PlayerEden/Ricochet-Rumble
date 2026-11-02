# Sector Rebound — Input-Driven Armed CTF Attacker Audit
**Date:** 2026-11-02
**Scope:** test-only QA of the existing gameplay; no tuning, Android binary, merge, or public release.
**Parent:** `test/phase2-combined-owner-2026-11-02` at `465086aab092381bfe13bc13b237525a7a588f68`.
**Branch:** `audit/ctf-armed-attacker-v1`.
**Rollback:** parent commit above. Stable `main` and owner Preview v0.9.65 remain unchanged.

## Gap identified
The earlier [input-driven human CTF audit](CTF_CONTESTED_HUMAN_ATTACK_2026-11-01.md) successfully stole four enemy flags and confirmed defender/escort objective decisions, but its scripted human set `fire:false` on every frame. Four observed attacks produced **zero human captures** and were unsuitable evidence about combat balance or successful armed escapes. A passing bot objective simulator does not establish that CTF feels winnable for a person.

## Implemented test-only changes
In `tests/ctf-contested-human-attack.mjs`:
- Keep the same four seeded real maze contests: small seeds 101/102/104 and standard seed 201, at most 180 simulated seconds each.
- Navigate using ordinary directional inputs and EXIT/ENTER interactions. Do not warp actors, shorten routes, extend lives, bypass collisions, or modify flag state.
- Use a cautious, narrow approximate phone-screen rectangle plus actual wall line-of-sight to select **only opposing live bots** (Coral seats 1 and 3, never Cyan escort seat 2). This deliberately isn't a perfect camera model or human perception.
- Supply ordinary independent aim vectors and intermittent one-frame FIRE pulses only when physically aligned and the real game cooldown permits. Actual engine `tankMove`/`shoot` handles bullets, damage, bounces, hitboxes, armor and score.
- Record actual `shot` events owned by the human, aim opportunities, human KOs/deaths, first pickup, defender interception decisions, physical travel while carrying, nearest defender range, scores and objective events.
- Preserve the old rules-based assertions, and additionally require at least one visible-line-of-sight aiming opportunity and one successful legal human shot across the four fixtures.
- Run existing CTF, Forward Bay, match loop, backup and responsive visual regression checks. Test source and Android embedded assets must match exactly.

## Acceptance interpretation
**Automated workflow:** [Contested CTF combat audit](https://github.com/PlayerEden/Ricochet-Rumble/actions/workflows/ctf-contested-human.yml). Check exact branch SHA and terminal run result before claiming a pass. The new run was observed in progress after code commit `8e4698f5c89e74f80ed5b7b23158c002c7dc3e58`.

A pass proves that a scripted attacker can move, legitimately fire, steal a flag, and provoke objective decisions without test-injected health/position/flag changes. **It does not prove a human can score a capture, that optional visual targeting matches real mobile perception, that bot strategy is balanced, or that two physical phones work.** Record actual attack/escort effectiveness; do not secretly improve player stats merely to make the test green.

## Next decision gate
1. Inspect the complete match JSON and compare old unarmed observations with the armed trial, identifying how often the attacker gets valid firing opportunities and whether these shots materially change survival or return routes.
2. If the attacker can't fire, distinguish a too-strict test planner from a genuine physical shooting defect before any gameplay change.
3. If the human can fight but cannot ever bring a flag home, investigate defensive lane positions, escort distance and time to escape; use matched-seed A/B evidence and targeted regression before tuning.
4. After a justified change, retain the old seeded fixtures as a control and seek a physical Android owner test. No merging to stable `main` or Play publication without approval.

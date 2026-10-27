# Ricochet Rumble — FIELDGRID v0.9.1 Quality & Design Review

**Scope:** follow-up to v0.9.0 procedural-deployments alpha. **Branch:** `dev/procedural-deployments`. **Date:** 2026-10-26. **Status:** automated QA completed; phone gameplay and LAN acceptance not completed.

## Goal and definition of fun

The core loop is one single mode: **Deploy → Maneuver → Fight → Lose vehicle / eject → Recover another ride → Finish match → One-tap rematch**. Procedural maps and tank/mech arrivals should create different stories through that same loop. The user should not need extra mode tabs, lore reading, accounts, or a complicated setup.

## Comparative research (principles, not copying)

- **Supercell / Brawl Stars:** short sessions mean friction at launch matters. In July 2026 Supercell described optimizing Android startup from ~35 seconds to roughly 5–6 seconds for a game with typical ~3-minute matches. FIELDGRID should be playable in one tap, with no mandatory setup screens. Source: https://supercell.com/en/news/titan-game-engine/
- **IGDA Game Accessibility SIG and Game Accessibility Guidelines:** quick-start menus, adjustable difficulty, a safe practice option, simplified controls, non-color-only status, and legible UI. https://igda-gasig.org/get-involved/sig-initiatives/resources-for-game-developers/sig-guidelines/ and https://gameaccessibilityguidelines.com/basic/
- **Google Android accessibility:** aim for at least **48×48 dp** touch areas separated by ~8dp. The compact 740×360 layout remains an engineering tradeoff; some *settings* targets currently measure 40px high, below the guideline, though core joystick/FIRE and interact areas are larger. Physical dp testing still required. https://support.google.com/accessibility/android/answer/7101858
- **Nielsen Norman Group / progressive disclosure:** expose Map Size, Bots, Sides first. Keep lives, shells, and bot skill behind a clearly labeled inline disclosure; avoid extra menu layers. https://www.nngroup.com/articles/progressive-disclosure/
- **Apple game control guidance:** frequently used controls near thumbs, legible text, consistent feedback; these are cross-platform human factors, not a requirement to mimic an iOS design. https://developer.apple.com/design/human-interface-guidelines/game-controls

## Pass 1 — friction, onboarding, learning

**Problems found:** (a) default 13×9 field can delay early encounters; (b) the original first-run hint stretched over the minimap; (c) selecting zero bots silently spawned one, contradicting the menu; (d) post-match rematch required opening a separate menu.

**Repairs:** Small map and 2 bots are now default for fresh settings, existing player choices persist. New players see a one-time *nonmodal* shortened hint. `0 · PRACTICE` creates a true free-roam field with no enemy and no separate game mode. Ended matches show a large **PLAY AGAIN** button that generates a new field; guests correctly wait for host control.

**Verification:** Node test added for 0-bot practice, rematch visibility, new seed, and preserved core gameplay. Desktop Chromium checked at 740×360, 915×412 and 1280×720.

## Pass 2 — play feel, combat readability, balance

**Problems found:** the existing mech had more armor but otherwise vague identity; the tank and mech had the same five allowed ricochets; camera shake was enabled by default.

**Repairs:** Tank retains its faster firing and five ricochets; mech has wider shots but now loses them after two wall ricochets. Both still deal one point of armor damage, avoiding accidental one-shot kills. Screen shake defaults off for fresh installs, with a toggle still available. Top HUD explicitly says **ON FOOT · FIND VEHICLE** when ejected.

**Verification:** Mech shot behavior is unit-asserted; old 180 generated-maze/vehicle integrity checks and 1,500-frame stress check pass. Mech **balance** is a design hypothesis; player-versus-player win rate is not measured.

## Pass 3 — accessibility, coherent UI and world theme

**Problems found:** 740×360 landscape panel text/controls could be small; long status banners obscured the field; menu text mixed game mechanics and lore jargon.

**Repairs:** Larger menu, setting, and interaction hit regions when space permits, shortened banners with wrapping bounds, clear descriptions like **FIELD SIZE** and **0 · PRACTICE**, plus `prefers-reduced-motion` support for UI transition animations. No extra modes or mandatory briefings were added.

**Verification:** Chromium screenshot and JavaScript-error checks on 740×360, 915×412, 1280×720. Advanced settings fit in the compact landscape panel without scrolling. Core buttons meet or approach the recommended minimum; *some settings hit areas still measure 40px on the smallest size* and remain an accessibility follow-up.

## PHOSPHOR-adjacent identity — draft, not canon

OPERATION PHOSPHOR's game bible makes Project CATHODE a fictional, classified network-simulation program with an unresolved operator roster and NEXUS mystery. FIELDGRID can *feel* like a more modern tactical field training interface: cyan/coral teams, fine grid lines, concise deployment messages, modest industrial UI, readable silhouettes, and minimal lore interruptions. This is **inspiration only**, not a canon decision that FIELDGRID is run by the same organization or that the NEXUS mystery is solved. Neither game needs an opening cutscene.

### Common vocabulary

- **Deployment:** a parked tank/mech becomes available; announce type and briefly beacon it on minimap.
- **Armor:** vehicle durability only, separate from pilot lives.
- **Ejection:** losing the vehicle keeps the pilot alive temporarily; find a new ride.
- **Sidearm:** weaker on-foot defense, not a full vehicle replacement.
- **Rematch:** regenerate and immediately resume the same rules.

Avoid extra competing terms for the same action. The game should explain actions through controls and concise feedback rather than expository dialogue.

## QA evidence and limits

| Check | Result |
|---|---|
| JavaScript syntax | Passed `node --check` |
| Existing smoke regression suite | Passed |
| 180 seeded procedural map cases | Passed (headless) |
| 1,500-frame four-bot simulation | Passed (headless) |
| New zero-bot practice/rematch tests | Passed |
| 3 landscape UI snapshots | Passed, no page overflow or JS errors |
| Expanded settings at 740×360 and 915×412 | Passed, no panel overflow |
| Android APK compile / packaged asset check | Verify with GitHub Actions before release |
| On-phone frame times/battery/thermal | **Not verified** |
| Two-phone real LAN gameplay, reconnect, host pause | **Not verified** |
| Actual encounter pacing / win rates / human onboarding | **Not measured** |

## Immediate next test plan

1. Three Quick Play runs on a phone; note seconds until first enemy contact, total match time, FPS feeling, and whether piloting after ejection stays fun.
2. One no-bot practice run; confirm vehicles and controls are self-explanatory.
3. Three mech-versus-tank fights and two Large map games; flag any unfair situations.
4. Two-phone same-Wi-Fi session: connect, move/shoot, eject, enter mech, pause, rematch, reconnect.
5. Physical Android accessibility check: thumb reach, controls at screen edge, readable on both phones, and system safe areas.

**Next iteration rule:** fix blockers first. Do not add another vehicle type, game mode, progression currency, or full lore campaign before two-phone networking and basic human balance are accepted.
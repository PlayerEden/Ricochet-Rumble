# Ricochet Rumble — v0.6 Gameplay & Mobile Quality Pass

Date: 2026-10-26. Scope: existing game code, Android WebView wrapper, local Wi-Fi networking, mobile landscape presentation. **No new major game mode.**

## Audit findings and disposition

| Area | v0.5 observation/risk | v0.6 action | Validation |
| --- | --- | --- | --- |
| Mobile first launch | Expanding settings on short landscape phones pushed primary game actions below the fold | Separate compact six-option settings screen; one-tap solo remains on main menu | Chromium 740×360, 915×412, 1280×720; screenshot/layout inspection |
| On-device preferences | Match rules and accessibility choices reset after leaving the game | Persist rules, selected arena and per-device sound, shake and auto-fire preferences locally; no account needed | Browser interactive settings/back test; source inspection |
| Combat pacing at reduced FPS | v0.5 clamped frame duration to 40 ms; a slow phone could run the simulation in slow-motion | Fixed 60 Hz simulation accumulator, max catch-up steps and clamped app-resume jumps | 30/60 FPS movement regression test; no hardware profiling yet |
| Maze floor rendering | Grid draw segments stopped at original fixed arena width/height | Draw complete world grid with visible-range culling and modest cell markers | Browser screenshot of Labyrinth |
| Performance | Whole maze wall set drawn even when offscreen | Cull off-camera wall geometry and limit floor detail work to visible cells | Source inspection/browser smoke; actual FPS still needs physical testing |
| Fairness | A shielded tank could fire while invulnerable | Successful shots remove spawn immunity; barrier pickup still absorbs one shot | Unit regression |
| Ricochet risk | Returning shells could not hurt their owner | Bounced shells can hurt their owner only after a short travel grace; self-KOs do not award points | Unit regression |
| Bot gameplay | Bots attempted shots through walls and had one skill level | Wall-aware shot check; relaxed/standard/challenge speed and aim settings | Unit regression |
| Controls | Opening menu could leave a captured thumb button held down | Clear joystick and fire pointers on menu open/blur; optional auto-fire for comfort | Browser + unit regression |
| Match fairness while hosting | Host game continued while the host navigated their pause menu | Host menu pauses simulation; host-pause state is visible to guest snapshots | Protocol test (physical two-phone test still needed) |
| Phone/back UX | Hardware Back could dismiss host menu without resuming the game | Restore host simulation when closing menu via Android Back | Code review; physical test pending |
| Local Wi-Fi reliability | Some Android phones choose cellular as default route even while connected to Wi-Fi | Prefer Wi-Fi transport for client socket; prefer WLAN address when displaying fallback host IP | Android compile needed + physical Wi-Fi/cellular test pending |
| Visual readability | Shell capacity only appeared in small HUD text; moving tanks lacked strong identity | Ready-shell counter near Fire and white locator over local tank; tank treads and floor features | Screenshots and browser layout check |

## Validation evidence

- `node tests/smoke.mjs` (no packages required): gameplay, respawns, shield cancellation, ricochet/self-hit rules, bot aiming, match configuration, deterministic seeded maps, camera motion, input release, fixed-step pacing and snapshot/pause transport.
- Chromium browser 740×360, 915×412, 1280×720, 393×852: tested layout, zero page-overflow, no JS runtime exceptions. Portrait shows rotation prompt.
- Browser settings selection/back round trip and immediate Play tested manually in automated Chromium navigation.
- Android and web game assets must remain byte-identical at build time; verify before commit.
- GitHub-hosted Android debug build and on-device install to be recorded separately. **Do not claim hardware playback or local Wi-Fi co-op is verified yet.**

## Deferred issues / acceptance checklist

- Physical phone touch comfort and 30–60 FPS performance on Maze XL with four bots and eight shells per tank.
- Two actual Android devices: host discovery, manual IP fallback, Wi-Fi preferred while cellular is enabled, pause/resume, connection loss, rematch, team damage and large-state replication.
- Debug APK signing is not persistent across ephemeral GitHub runners. A future private signing key/secret is needed for reliable in-place app updates. No private signing key belongs in this public repository.
- Reliable cross-network P2P and friends list are **not implemented**; this build is same-Wi-Fi only.
- Network error recovery, spectator experience, optional aim assistance, audio mix, and configurable on-screen button sizing remain potential later refinements.
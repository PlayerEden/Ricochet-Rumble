# Sector Rebound v0.9.13 — Combat Feel & Supply Balance Experiment

## Design goal
Improve the **voluntary replayability and readability of moment-to-moment combat** through meaningful tactical trade-offs, fast control response, and fair comeback opportunities. Avoid relying on grind, manipulative reward loops, high-pressure streaks or heavy new feature scope.

## Research direction
- **Brawl Stars**: unit choice is meaningful when health, attack cadence, ammo/reload constraints, and utility are tuned separately. Recent official balance notes specifically adjust these factors. Source: https://supercell.com/en/games/brawlstars/blog/release-notes/release-notes-june-2026/
- **War Robots**: different armored units are meaningful when their movement and weapons support distinct combat roles. Source: https://www.xbox.com/en-US/games/store/war-robots/9phvx7xtxcl8
- Neither game's numeric stats should be copied; FIELDGRID retains ricochets, deployable empty vehicles, and the vulnerable pilot as its distinctive loop.

## Audited current baseline and experimental changes
| Unit | Armor | Active projectiles (standard) | Fire interval | Projectile lifetime | Identity |
|---|---:|---:|---:|---:|---|
| Tank | 3 | **4** (was 3) | **0.36s** (was 0.41s) | **2.55s** (was 3.8s) | Mobile ricochet pressure; longer sustained threat |
| Mech | 4 | **3** (was 2) | **0.62s** (was 0.70s) | **2.05s** (was 3.8s) | Tougher, slower, wide-impact heavy volleys; fewer allowed bounces |
| On-foot | 1 pilot-life hit | **2** | **0.43s** (was 0.48s) | **0.82s** (was 0.9s) | Fast, small target; survival and recover an empty vehicle |

The advanced **TANK SHELL LIMIT** setting is still adjustable (1, 2, 3, **4 default**, 5, 8), including returning saved values. Mech capacity scales to about 75% of the tank limit, minimum 1; on-foot sidearm stays at 2. Number of active projectiles is not the same thing as ammunition remaining.

### Why shorter shell lifetimes?
Under the previous system three shells could be fired almost immediately with Rapid Fire, then fill the active cap until they bounced/died, making HOLD FIRE feel unresponsive. Shortening active time plus differentiating caps improves input responsiveness without infinite fire. Ricochet choices still matter.

## Supply module balance
- **Rapid Fire (7s)**: 34% faster shot interval; +1 concurrent shot; non-pilot rounds live 68% as long, trading long-range denial for fast bursts.
- **Turbo (6s)**: existing temporary speed boost, 1.48x; movement decisions remain under player control.
- **Barrier (4s)**: stops the next valid incoming hit. Does not stack; previous behavior preserved.
- **Capacitor (6s, NEW)**: +2 active projectiles, but does not also speed up their firing. A temporary battlefield-pressure choice.
- **Field Repair (NEW, instant)**: restores 1 armor plate to a damaged active vehicle, max existing vehicle armor. Does not remove an active timed ability. A full-health vehicle/on-foot pilot cannot consume it.

All modules are visually distinct, using restrained tactical colored bracketed crates, pulsing perimeter glow, a symbol and a tiny TYPE label rather than anonymous generic circles. An unobtrusive temporary power indicator displays type and seconds remaining in the live HUD.

Only one timed buff can be active per unit at once, and new timed buffs replace the previous timed buff. Field Repair is instantaneous. Picking up a supply is not a permanent upgrade.

## Supply cadence and fairness
- At most one pickup currently spawned at a time.
- An ignored supply rotates to a new location/type after about **13s**, rather than blocking the supply system forever.
- The next supply arrives roughly 9–13s after collection, preventing a screen full of buffs.
- Repair is only offered when at least one living equipped unit is missing armor when it spawns.
- Pilots may collect eligible timed supply modules, but cannot take a field repair when not in a damaged vehicle.

## Testing gates (must pass)
- Camera defaults and fullscreen Android layout unchanged.
- Prior 180 seeded maze and 1500 simulation frame checks, AI/navigation, collision, exit/re-enter, host-authoritative networking protocol and browser/Android parity.
- New test asserts tank/mech/pilot active limits, weapon cadence and projectile longevity, rapid short-lived shells, capacitor increased limit, repair at damaged and full armor, active HUD visibility, and ignored pickup rotation.
- Chromium screenshots before/after at landscape 740x360 / 915x412 / 1280x720; APK build.
- Real two-phone Wi-Fi host/guest remains **untested** and no results should be claimed yet.

## Next balance checks from player sessions
After each short 5–10-match test batch, write down approximate match length, how often firing feels unresponsive, percent time in each unit, pickups that feel useless, how many shots/armor-breaks typically win a duel, and what causes a restart. Favor tuning one variable per iteration.

Candidate targets to evaluate (not automatic telemetry or definitive industry benchmarks):
- Rapid fire should feel faster without pinning the user in a multi-second `0/4 READY` waiting state.
- Mech's additional armor and larger projectile should compensate for slower movement/fire in most maps; it should not be a guaranteed upgrade.
- The pilot should have viable 1–2-second escape windows rather than being instantly helpless.
- Power-up labels and effect duration should be readable without masking a firefight.
- Human vs bot tension should rise through decisions, not impossible reflex challenges.

Rollback: `dev/sector-rebound-camera-v0912a`. Current branch: `dev/sector-rebound-combat-feel-v0913`. No new monetization or online leaderboard requirements.

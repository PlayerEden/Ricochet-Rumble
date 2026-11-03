# Phase 4B — Earned Solo paint rewards (2026-10-31)

## Owner direction and rollback
Owner tested Phase 4A free Hangar preview 100010 and replied "Not bad, lets continue." Treat this as permission to progress, NOT final visual sign-off or permission to remove existing starter paints. Save a checkpoint at [preview-100010-free-hangar-reviewed](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100010-free-hangar-reviewed), exact source `086396e55fda51318be740ffa358bbcaf865f23e`.

## New earned-only cosmetic content
- **Four originally free paint finishes remain free:** Standard, Moss, Dune, Oxide, no grind or purchase imposed retroactively.
- **Vanguard** (cool blue-grey with subdued industrial bevels): **5 completed offline Solo matches**, counted through the existing validated Dossier's `matches` field. Wins/defeats/draws all count if genuinely finished. No credit for abandoned, practice or LAN matches.
- **Veteran** (muted graphite-gold): **12 completed offline Solo wins**, from the Dossier `wins` field.
- Rewards are automatically eligible when the local Dossier reaches the threshold; the Hangar shows both finishes and `current/target` progress even when locked. A disabled locked entry cannot be equipped; the equip operation also independently rechecks eligibility.
- No separate unlock ledger or purchase/entitlement claims. This avoids divergence between the player's recorded accomplishments and cosmetic unlocks. Existing fixed schema remains `rr-hangar-paint-v1`; the two new IDs are allowlisted in offline backup validation. Unknown IDs fail closed; if a backed-up earned paint lacks a validated local Dossier on restore, it displays Standard until the qualifying Dossier is available, without overwriting the saved ID.
- Default materials, existing approved top-down pilot/tank/mech geometry, projectile/collision/KO rules, aim, movement, team colors, local Wi-Fi protocol, and splash art remain unchanged. Only local offline Solo seat 0 receives the equipped material, never bots/remote teammates. Team identification rings/locators keep their distinct paints.

## 100010 visual audit bug fixed
The earlier full Chromium/Android job [41177266922](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41177266922) failed after successfully producing **68 visual snapshots**, on an outdated backup test expecting only 4 storage keys; the earlier Hangar legitimately added a 5th key. The Phase 4B real browser test now expects all five, explicitly including the Hangar's data. This is a test expectation fix, not a data-loss recovery or permission to skip the full suite.

## Acceptance gates
- Headless game-source tests load actual Dossier code, record 5 valid complete matches and then a total of 12 wins: check unlock gating, persisted equipped IDs, old free paints, reject bogus IDs, unchanged material default and no combat effects.
- Real Chromium verifies six paint choices, the two initially locked, disabled state and progress at first launch, ability to equip a free paint and save/reload, compact landscape UI and exact five-key backup roundtrip.
- Validate backup import/export with new rewarded IDs, unknown/future schemas protected, Web/Android asset parity, automatic signed test-only APK. Physical phone: verify locked progress, earn via normal completed Solo games, reach 5 matches, choose Vanguard, reopen application, then continue toward 12 wins for Veteran. Dossier history must carry over normal in-place update.
- This is **not** monetization, randomized unlocks, online identity, networked cosmetics, Google Play production signing, or a main-branch release. Continue using draft integration PR #85; stable main runtime untouched.

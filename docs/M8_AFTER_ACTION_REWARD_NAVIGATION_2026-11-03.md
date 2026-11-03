# M8 — After Action → Hangar reward presentation (2026-11-03)

## Problem found

The existing real Solo Dossier threshold crossing can create a verified **insignia-only** reward (e.g. VECTOR on the third completed match). After Action correctly shows `NEW IN HANGAR`, but its button unconditionally called `openHangar()`, always opening **PAINT**. An operator earned an insignia yet had to discover the hidden INSIGNIA tab. This is a genuine single-phone progression clarity issue, not a request for another screen or a new cosmetic system.

## Targeted changes

- After Action's existing **NEW IN HANGAR** button snapshots the **actual**, successfully persisted `roundUnlocks` before returning to the main menu, and opens the Hangar on the appropriate reward tab. Insignia-only unlocks open **INSIGNIA**; paint or mixed unlocks open **PAINT** and mark both tabs when relevant.
- A small **NEW UNLOCK** banner and subtle **NEW** marker identify the actual newly available cosmetic(s). The reward banner is visible **only for this After Action navigation**, never for ordinary main-menu/Dossier Hangar visits.
- The existing six paint/insignia reward definitions, exact Dossier thresholds, in-game eligibility, save format and unlock persistence remain unchanged. A tap on an unlocked cosmetic still requires the player to explicitly equip it. No cosmetic is auto-awarded or charged.
- No new navigation button, result modal or persistent “claimed” state. Returning to the main menu and reopening the Hangar restores the regular **PAINT** default with no stale message. `role=status` makes the brief reward announcement accessible.
- Web/Android HTML, CSS and game JS remain byte-identical. Camera pilot **0.94**, tank **0.73**, mech **0.69**; AI, controls, scoring, LAN and existing audio unchanged.

## QA

The new `tests/reward-hangar-navigation-qa.mjs` runs the *real game screen and event handlers* in Chromium with test-only completed Solo/Dossier fixtures. It checks three actual threshold scenarios: 3 matches → **VECTOR insignia** at 740×360; 5 matches → **VANGUARD paint** at 915×412; 12 wins → **VETERAN paint + COMMAND insignia** at 568×320. Valid Dossier records are created through the real store; no records are silently awarded in production. Tests verify:

- the After Action reward CTA advertises only the real threshold, once per completed match;
- the correct Hangar tab is opened, the unlocked item can be equipped through a real button, and a mixed unlock highlights both categories;
- the exact Dossier and settings records remain untouched by navigation and equipment changes, while the selected cosmetic persists after a reload;
- ordinary Hangar visits have **no reward banner or highlights**; the short landscape viewport doesn't gain horizontal overflow;
- canonical smoke, full visual/camera, AI/ballistic and LAN browser/JVM regressions stay green.

These are automated browser/device-layout checks, **not** owner physical handset acceptance or evidence of actual 2-device LAN.

## Release policy

One canonical game on GitHub `main`. Merge only after applicable CI passes. This is **source only** and will be grouped with M6 Android pause and M7 renderer improvements for **one** later compatible owner preview. Existing recommended internal APK **v0.9.80, Android versionCode 420001** remains current and does not yet contain M8. Preserve its package/signature and Dossier data when that next test APK is built. Soundtrack/SFX and Suno remain explicitly deferred to priority **#4**.

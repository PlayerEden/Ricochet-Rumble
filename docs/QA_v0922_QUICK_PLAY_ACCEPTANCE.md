# v0.9.22 Quick Play — acceptance evidence and remaining phone gate

**Date:** 2026-10-27  
**Source:** [draft PR #24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24) branch `dev/sector-rebound-quick-play-v0922`.  
**Status:** The complete headless Quick Play journey is automated and passing. **Do not conflate with owner Android gameplay acceptance or an accepted release**.

## Newly hardened checks (test-only; no game implementation altered)
- The test harness now simulates versioned `rr-options-v06` localStorage and actual checkbox/disabled state changes without influencing unrelated first-run coaching flags.
- Select **zero** modes: Quick Play actions disabled, a direct attempt to start solo mode is rejected without corrupting current state, and empty choice is persisted.
- Select **one** mode: app preference reload restores it, and three successive **real pilot KO → immutable After Action → NEXT MATCH** transitions complete with the same selected mode and a new procedural **seed** / unique match ID every round.
- Select **two** modes: preferences persist, four more completed real-bot battles/rematches alternate modes without adjacent repetition. Result snapshots and game state reset correctly, not just the results panel layout.
- Each real terminal match checks correct KOs/deaths/lives; after rematch, no frozen result/time carries into the next round.
- Additional historical test suite covers solo/team presets, vehicle ejection not counted as pilot death, pause duration and camera zoom at 740×360, 915×412, 1280×720, 1536×672.

## Exact automated evidence
- [Fast PR regression run 40603771574 — **PASS**](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40603771574) on test source `770143e0f3ce13bb6767ed745d910c274da22fc2`.
- First expanded suite run [40603694841](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40603694841) failed because the *new test fixture* began retaining the unrelated first-time coaching flag, which invalidated a prior isolation assumption. The harness was corrected to persist only the preferences key; subsequent regression **passed**. No evidence of a shipped game bug from this fixture failure.
- [Full Android/Chromium QA run 40601021890 — PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40601021890) on runtime SHA `55e69a828f5f791bc7f4244b01b7efddd36ebe3f`; **runtime game JS, HTML, CSS and Android assets are unchanged since this successful build**. This test-only hardening does **not** create a new gameplay APK.
- [Permanent, exactly matching dev5 owner APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev5-final-camera-test) is still the most recent full Android/visual-tested executable.

## Remaining manual acceptance before integrating PR #24
- [ ] On Android, in Match Settings select zero/one/two modes, check disabled Play for zero, and verify the chosen modes survive stopping/restarting the app.
- [ ] Play at least **three complete rounds** with NEXT MATCH (not just pause→restart): selected mode names are accurate and procedural **geometry visibly changes**. New seed is guaranteed; *unique topology* is **not**, and requires [#28](https://github.com/PlayerEden/Ricochet-Rumble/issues/28).
- [ ] Confirm actual win/defeat and final KOs, operator deaths, time and remaining lives on the **shipped** result panel. Vehicle armor hits and ejection should not count as operator deaths. Results shouldn't drift or duplicate.
- [ ] Check touch buttons/camera and performance over several rounds; owner already approved dev5 camera targets pilot 1.07, tank 0.82, mech 0.77.
- [ ] Preserve the existing [v0.9.21 accepted main](https://github.com/PlayerEden/Ricochet-Rumble/tree/main) and rollback APKs until this PR is reviewed and merged. Do not mark LAN host/guest score replication passed; second phone remains unavailable.
- [ ] Before **public** Google Play release, independently resolve Android versionName/versionCode, package/signing-key custody, stable in-place updates and save migration [#20](https://github.com/PlayerEden/Ricochet-Rumble/issues/20), [#29](https://github.com/PlayerEden/Ricochet-Rumble/issues/29), [#30](https://github.com/PlayerEden/Ricochet-Rumble/issues/30).

## Next clean development boundary
Once phone acceptance of the remaining match flow is recorded, review and merge PR #24, update main README/status/release evidence and set a stable rollback. The **next feature PR** is the original top-down human pilot silhouette + movement/aiming [#26](https://github.com/PlayerEden/Ricochet-Rumble/issues/26), then restrained combat impact [#27](https://github.com/PlayerEden/Ricochet-Rumble/issues/27). Do not pile either feature into this v0.9.22 acceptance PR.

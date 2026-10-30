# Sector Rebound — First Development Plan Cross-System Audit and Go/No-Go Register

**Audit date:** 2026-10-29 / 2026-10-30 UTC execution. **Disposition: AUTOMATED CONTRACTS PASS; FINAL RELEASE NO-GO.** This is the evidence-backed end-of-first-plan assessment, not a claim that real handset, LAN, production credentials or Play review have passed.

**Audited experimental chain:** Latest candidate v0.9.40 `feature/android-upgrade-readiness-v0940`; this QA-only branch `qa/first-plan-cross-system-audit-v0941` preserves the same game sources, Android assets and Android package. Stable `main` remains v0.9.21 and is not automatically merged. All experimental PRs depend on previous drafts; integration requires deliberate owner sign-off and an integration/rollback checkpoint.

## Verified automated evidence

| Area | Disposition | Source of evidence | Important limitation |
| --- | --- | --- | --- |
| Offline modes, scoring, pilot KO vs armor/ejection, Next Match, Custom and shuffle | **Automated PASS** | [full real Chromium and Android v0.9.40 workflow 40991176203](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40991176203), [fast 40991176243](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40991176243), [v0.9.37 scored playlist](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40837545844) | Owner's physical control/aiming and mode enjoyment pending |
| Procedural arena topology, simulated safe scored spawns and natural AI-only match pacing | **Automated PASS, limited scope** | [500 all-bot games across 30/60Hz, 900 map topologies, TDM 200 fresh-seed games 40840318936](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40840318936) | No real-human aim/latency tests; 30Hz CQC findings did not reproduce at 60Hz |
| Dossier, real match history, cosmetic eligibility only | **Automated PASS** | [v0.9.39 Chromium/Android 40987749740](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40987749740), [fast save integrity 40987749714](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40987749714) | No approved cosmetic art, equip flow, store, or cloud account exists |
| User-controlled settings/preset/profile export and restore | **Automated PASS** | [v0.9.40 real Chromium/Android 40991176203](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40991176203) and [specific recovery audit](QA_ANDROID_UPGRADE_READINESS_v0940.md) | Older installed APKs lack this export screen; no retroactive rescue from old installations |
| Android app ID, versionCode, offline permissions, release signing guard | **Source contract PASS** | [cross-system automated contract gate 40992468366](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40992468366); Gradle `com.playereden.ricochetrumble` versionName `0.9.40-upgrade-test`, code 40 | Upload credentials not supplied, AAB unsigned; certificate continuity not tested |
| Exact binary QA archive and rollback | **Automated PASS** | [immutable original v0.9.40 QA-passing APK/checksums](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.40-upgrade-readiness-test) | Debug APK not production-signed; only experimental testers should use it |
| Full source/asset/contract consolidated regression | **Automated PASS** | [audit script and JSON evidence run 40992468366](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40992468366); validates 6 mirrored assets, playable action IDs, Survival-only defaults, safety contracts, and reexecutes old suites | Structural/source tests and simulated tests are not equivalent to on-device security or performance verification |

## Priority-ordered remaining findings

| Priority | Finding | Acceptance / owner decision |
| --- | --- | --- |
| **P0** | **Unknown certificate match** between previously installed debug APKs and current CI-produced APK. Higher versionCode alone cannot solve signing mismatch. Uninstall can destroy older local history; earlier v0.9.39 cannot export through the newly created screen. | Identify signing certificates of exact old/new test APKs; on an actual phone verify a compatible same-certificate upgrade **without uninstall** or explicitly preserve local data before a clean install. Do not claim continuity otherwise. |
| **P0** | **Production keystore and Play signing absent.** Historical encrypted signing backup exists in public-repo history; encrypted presence alone is not proof of credential compromise. | Authorized owner must review custody, backups and potential exposure of historical key without posting secrets. Establish dedicated durable upload key and private secret management; sign and independently verify first AAB. |
| **P0** | **Physical owner control/feel and Android reliability not accepted.** v0.9.32–40 are experimental, even though automated builds passed. | Actual handset runs on several screen sizes; test precise tank/pilot aim, thumb comfort, kill attribution, menus, HUD, background/resume, device rotation, audio, longer-session battery/heat/crash behavior, saved data. |
| **P0 / scope decision** | **Two-phone LAN remains untested** after explicit deferral. LAN is visible in the app. | Decide whether LAN is a v1 launch promise. If included, test two physical phones on same Wi-Fi (NSD, IP join, multiplayer sync, death/ejection, disconnect/reconnect) before release. If excluded, accurately label/hide unverified features for production. |
| **P0** | **Google Play acceptance not established.** | Confirm Play Console package ownership, app privacy policy/Data safety, content/store policy, accurate metadata/screenshots, app signing and store review. No guarantee of approval. |
| **P1** | **Pilot sprite, audio and UI polish remain qualitative.** | Compare against owner-accepted camera direction and reference screenshots, review top-down pilot shape, color-independent team markers, no AI-ish menu filler, sound/music on handset. |
| **P1** | **Versioned local saves lack old-build migration verification.** | Test backup text export from v0.9.40 and restore after reinstall on a physical phone; verify exact Quick Play settings, custom presets, genuine match history and recovery behavior. Old v0.9.39 needs a separate safe plan. |
| **P1** | **Experimental stacked PR chain not integrated into an approved branch.** | Review every net diff against parent; create a fresh integration candidate from stable baseline, retain rollback tags, compare approved design decisions, test merged source as new candidate. **No automatic merge**. |
| **P1** | **Cosmetics catalog is concept-only.** | Before any runtime cosmetic slot or purchase: verify art rights, approved assets, free unlock economy, local inventory data contract and actual equip UI. No fake purchase buttons, no gameplay advantages. |
| **P2** | **Broader diversity of maze geometry and humans-vs-AI balance needs subjective playtesting.** | Repeat seeded regressions after future gameplay changes and gather actual feedback. Do not retune proven deliberate vehicle pacing merely to increase bot simulator kill speed. |

## Integration strategy and rollback chain

- **Stable baseline:** `main` v0.9.21, SHA `f72d9bda86bdfed8f87ee6cecf05c421c94f0bb2`; preserve unchanged unless owner explicitly authorizes integration.
- **Current experimental candidate:** `feature/android-upgrade-readiness-v0940` + QA-only audit here. The original v0.9.40 prerelease is the latest playable test binary.
- **Dependencies:** vehicle controls v0.9.32 → pilot parity v0.9.33 → true TDM v0.9.34 → Custom Match v0.9.35 → saved presets v0.9.36 → scored Quick Play opt-in v0.9.37 → natural all-bot QA v0.9.38 → Player Dossier v0.9.39 → Android backup/version readiness v0.9.40 → final audit v0.9.41.
- Prior versions' user-positive checkpoints and rollback tags are **not** superseded as owner-accepted by later automated QA. Old v0.9.39 and earlier archives remain important for developer comparison but are not guaranteed update-compatible.

## Overall verdict

**Engineering first-phase automated audit completed:** the enumerated source contracts and existing mode, persistence, procedural/AI simulation, Chromium visual, Android debug and unsigned-bundle checks have green evidence. **Comprehensive release acceptance remains incomplete** because physical Android testing, real two-device LAN, key custody/signing and final Play compliance cannot be verified from source or CI alone.

**Recommendation:** no new gameplay mechanics, no unapproved merge and no production launch at this checkpoint. Next gated work should target P0 on-device data/signing reliability and an approved integration candidate, then run a fresh full regression suite on the *integrated* commit.

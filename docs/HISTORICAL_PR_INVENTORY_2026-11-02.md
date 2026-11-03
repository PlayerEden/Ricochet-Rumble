# Historical Pull Request Inventory — Sector Rebound Mainline Consolidation

**Snapshot:** 2026-11-02 Kentucky local / 2026-11-03 UTC. PR metadata from the **61 open PRs** immediately after [integration PR #104](https://github.com/PlayerEden/Ricochet-Rumble/pull/104) was created: one active integration PR (#104), **60 older development/design PRs** inventoried below.

## Verified and conservative interpretation

GitHub's real commit comparison against consolidation candidate `a817e315bb12a9cd3446a7159fff2810a12a76d1` showed **13 older PR heads are actual ancestors** of the chosen modern source history (their exact commits and changes are included). **47 older PR heads diverge**; this DOES NOT mean their ideas are broken, or that their unique commits were integrated. It means `main` cannot be honestly described as containing their exact head commit. Some side-branch handoff docs have been copied into the integration candidate, but those PRs remain divergent in Git history.

The approved cleanup is **archival closure, not an unreviewed merge**. After the [audited mainline promotion](MAINLINE_PROMOTION_AUDIT_2026-11-02.md), each older PR may be **closed with a note specifying whether its head was included by ancestry or retained as an unmerged historical experiment**. Closure does **not** delete a branch, commits, issue thread, screenshots or original design review. The repository's historical branches and signed preview checkpoints are not to be force-pushed or deleted. A future change must be reviewed against current `main` as a new focused PR, not by blindly merging an old side branch.

**This archival action does not approve Play Store release, two-phone native LAN, spectator/queue features, or old prototype features absent from v0.9.75.** This table is an inventory and disposition log, not a claim all 60 were merged into the game.

## Historical PR registry (pre-closure)

| PR | Archived head SHA | Preserved branch | Source inclusion | Disposition / note |
| --- | --- | --- | --- | --- |
| [#103](https://github.com/PlayerEden/Ricochet-Rumble/pull/103) | `5753fcfd318b` | `experiment/ai-rare-opportunity-m2-a2` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#102](https://github.com/PlayerEden/Ricochet-Rumble/pull/102) | `f065cc0b129b` | `experiment/ai-shot-posture-m2-a1` | **diverged / unmerged archive** | Side docs v0.9.74 handoff imported; PR head itself diverged |
| [#101](https://github.com/PlayerEden/Ricochet-Rumble/pull/101) | `f121a1b86714` | `experiment/lan-mode-compatibility-d3-a2` | **diverged / unmerged archive** | Side docs v0.9.73 handoff imported; PR head itself diverged |
| [#100](https://github.com/PlayerEden/Ricochet-Rumble/pull/100) | `1a82515c3109` | `experiment/lan-host-bots-d3-a1` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#99](https://github.com/PlayerEden/Ricochet-Rumble/pull/99) | `35b7ed75b049` | `experiment/lan-room-state-d3-a0` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#98](https://github.com/PlayerEden/Ricochet-Rumble/pull/98) | `fc2556548580` | `plan/d3-persistent-lan-rooms` | **diverged / unmerged archive** | Historical planning branch copied/indexed; PR head diverged |
| [#97](https://github.com/PlayerEden/Ricochet-Rumble/pull/97) | `333fc9d9ffc5` | `experiment/lan-series-d2` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#96](https://github.com/PlayerEden/Ricochet-Rumble/pull/96) | `378a02e2cc19` | `experiment/lan-squad-tdm-d1` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#95](https://github.com/PlayerEden/Ricochet-Rumble/pull/95) | `bc4bd582253f` | `experiment/match-identity-colors-c1` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#94](https://github.com/PlayerEden/Ricochet-Rumble/pull/94) | `2e28f73625cb` | `experiment/allied-aim-traces-b2` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#93](https://github.com/PlayerEden/Ricochet-Rumble/pull/93) | `7d87fe95a1ed` | `experiment/friendly-fire-policy-b1` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#92](https://github.com/PlayerEden/Ricochet-Rumble/pull/92) | `f71e1644a07e` | `experiment/bot-trace-aim-a3-v1` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#91](https://github.com/PlayerEden/Ricochet-Rumble/pull/91) | `9604c89ecaab` | `experiment/trajectory-physics-core-a2` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#90](https://github.com/PlayerEden/Ricochet-Rumble/pull/90) | `d40192d2b09d` | `experiment/combat-parity-trajectory-a1` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#89](https://github.com/PlayerEden/Ricochet-Rumble/pull/89) | `33eefc1fa60a` | `experiment/friendly-unit-pass-through-v1` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#88](https://github.com/PlayerEden/Ricochet-Rumble/pull/88) | `679b85527b8e` | `experiment/ctf-human-escort-lane-clearance-v1` | **diverged / unmerged archive** | Separate CTF audit branch; not merged as-is |
| [#87](https://github.com/PlayerEden/Ricochet-Rumble/pull/87) | `bd7ae13ba38a` | `audit/ctf-armed-attacker-v1` | **ancestry-proven included** | Head commit is an ancestor of selected v0.9.75 mainline lineage |
| [#85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85) | `5f788de1334c` | `integration/v0956-main-rooted-rehearsal` | **diverged / unmerged archive** | Older integration rehearsal, not merged as-is |
| [#84](https://github.com/PlayerEden/Ricochet-Rumble/pull/84) | `e66117c329eb` | `audit/integration-fast-gate-v0955` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#83](https://github.com/PlayerEden/Ricochet-Rumble/pull/83) | `00344f1763de` | `fix/lan-guest-input-timeout-v0954` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#82](https://github.com/PlayerEden/Ricochet-Rumble/pull/82) | `9749cf3bce63` | `feature/lan-pilot-input-parity-v0953` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#81](https://github.com/PlayerEden/Ricochet-Rumble/pull/81) | `80c5321a040a` | `quality/android-update-preflight-v0952` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#80](https://github.com/PlayerEden/Ricochet-Rumble/pull/80) | `54b744cd4005` | `prototype/corridor-aware-recovery-v0951` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#79](https://github.com/PlayerEden/Ricochet-Rumble/pull/79) | `9cb83bcf199c` | `research/recovery-placement-comparison-v09501` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#78](https://github.com/PlayerEden/Ricochet-Rumble/pull/78) | `327501703c0e` | `research/procedural-fairness-v0950` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#77](https://github.com/PlayerEden/Ricochet-Rumble/pull/77) | `6196e0305ff6` | `research/control-feel-baseline-v0949` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#74](https://github.com/PlayerEden/Ricochet-Rumble/pull/74) | `9ab1b4871d0d` | `audit/ui-layout-hitboxes-v0948` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#72](https://github.com/PlayerEden/Ricochet-Rumble/pull/72) | `55a9eecbae2a` | `audit/targeted-and-overall-v0947` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#71](https://github.com/PlayerEden/Ricochet-Rumble/pull/71) | `dac3d6a34a2f` | `integration/v0947-consolidated-preview` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#70](https://github.com/PlayerEden/Ricochet-Rumble/pull/70) | `62cad0a63878` | `audit/release-readiness-v0947` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#67](https://github.com/PlayerEden/Ricochet-Rumble/pull/67) | `44169b463088` | `polish/ui-audio-feedback-v0946` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#66](https://github.com/PlayerEden/Ricochet-Rumble/pull/66) | `6c1e1842f308` | `polish/p03-pilot-motion-v09451` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#65](https://github.com/PlayerEden/Ricochet-Rumble/pull/65) | `25bba361030d` | `feature/pilot-silhouette-cleanup-v0945` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#63](https://github.com/PlayerEden/Ricochet-Rumble/pull/63) | `57b4b4a64d03` | `feature/pilot-visual-refinement-v0944` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#62](https://github.com/PlayerEden/Ricochet-Rumble/pull/62) | `415a492afdcc` | `feature/pinned-test-apk-signer-v0943` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#61](https://github.com/PlayerEden/Ricochet-Rumble/pull/61) | `0c8220e770e7` | `qa/apk-certificate-continuity-v0942` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#60](https://github.com/PlayerEden/Ricochet-Rumble/pull/60) | `e327bb8b8fb0` | `qa/first-plan-cross-system-audit-v0941` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#59](https://github.com/PlayerEden/Ricochet-Rumble/pull/59) | `55cfd243fea1` | `feature/android-upgrade-readiness-v0940` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#58](https://github.com/PlayerEden/Ricochet-Rumble/pull/58) | `b0e913d67283` | `feature/player-dossier-local-v0939` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#57](https://github.com/PlayerEden/Ricochet-Rumble/pull/57) | `f2e3cce52a94` | `qa/natural-bot-maze-audit-v0938` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#56](https://github.com/PlayerEden/Ricochet-Rumble/pull/56) | `0e428dff8c8e` | `feature/quick-play-scored-opt-in-v0937` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#55](https://github.com/PlayerEden/Ricochet-Rumble/pull/55) | `c3a314b536e2` | `feature/custom-presets-v0936` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#54](https://github.com/PlayerEden/Ricochet-Rumble/pull/54) | `5537a8d6bd0f` | `feature/custom-match-v0935` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#53](https://github.com/PlayerEden/Ricochet-Rumble/pull/53) | `7381e8917451` | `feature/scored-team-deathmatch-v0934` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#52](https://github.com/PlayerEden/Ricochet-Rumble/pull/52) | `8d4f492270c8` | `tuning/pilot-survival-parity-v0933` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#50](https://github.com/PlayerEden/Ricochet-Rumble/pull/50) | `c1f95a949bbb` | `tuning/vehicle-precision-v0932` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#49](https://github.com/PlayerEden/Ricochet-Rumble/pull/49) | `2960128bda17` | `polish/vehicle-twin-thumb-controls-v0931` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#48](https://github.com/PlayerEden/Ricochet-Rumble/pull/48) | `35896ead371f` | `feature/vehicle-stationary-aim-v0930` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#47](https://github.com/PlayerEden/Ricochet-Rumble/pull/47) | `935ec809e106` | `tuning/vehicle-ricochet-tempo-v0930` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#46](https://github.com/PlayerEden/Ricochet-Rumble/pull/46) | `5bf8ece972d4` | `feature/scored-vehicle-ffa-v0929` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#45](https://github.com/PlayerEden/Ricochet-Rumble/pull/45) | `0561b69e6b70` | `polish/cqc-dual-thumb-aim-v0928` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#44](https://github.com/PlayerEden/Ricochet-Rumble/pull/44) | `7a82be7ce941` | `feature/close-quarters-playable-v0927` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#42](https://github.com/PlayerEden/Ricochet-Rumble/pull/42) | `ba1f36723948` | `feature/scored-kernel-on-clean-v0926` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#41](https://github.com/PlayerEden/Ricochet-Rumble/pull/41) | `8258c23c68ae` | `integration/clean-v0925-approved-systems` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#40](https://github.com/PlayerEden/Ricochet-Rumble/pull/40) | `a81d86ec1f46` | `audit/sector-rebound-foundation-v0926` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#39](https://github.com/PlayerEden/Ricochet-Rumble/pull/39) | `6732ba40fce4` | `feature/scored-deathmatch-kernel-v0926` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#35](https://github.com/PlayerEden/Ricochet-Rumble/pull/35) | `96be4c054041` | `prototype/team-survival-allies-colors-v0925` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#34](https://github.com/PlayerEden/Ricochet-Rumble/pull/34) | `1145f2d5b284` | `integration/sector-rebound-quickplay-labe-v0924` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#32](https://github.com/PlayerEden/Ricochet-Rumble/pull/32) | `41215f9e1996` | `prototype/pilot-lab-e-arcade-modular-v0924` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#31](https://github.com/PlayerEden/Ricochet-Rumble/pull/31) | `a22afdb81fc1` | `prototype/pilot-fieldgrid-lab-d-v0923` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |
| [#24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24) | `6399a0b9bd49` | `dev/sector-rebound-quick-play-v0922` | **diverged / unmerged archive** | Divergent historical experiment; preserve head/branch, do not claim merged |

## Protected source and independent history

- **Old accepted `main` v0.9.21:** `9f67b2bea83d552cdbae8af1964c30eecf49022c`, archived `archive/main-v0921-before-2026-11-02-integration`.
- **Selected v0.9.75 exact signed APK source:** `45e06297cf440a4d5f5606c8f282957dba602d4f`, preserved `checkpoint/sector-rebound-v0975-rare-ai-openings-signed-ci-370001`.
- **Preferred owner-approved AI fairness fallback:** `0797cc8f18b6da35a1bdcaf62e4d49c2dd52c1aa`, preserved `checkpoint/sector-rebound-v0974-ai-shot-posture-signed-ci-360001`.
- **Full archived status** [PROJECT_STATUS_HISTORY_THROUGH_2026-11-02.md](PROJECT_STATUS_HISTORY_THROUGH_2026-11-02.md) (225 KB) · [historical master plan](MASTER_DEVELOPMENT_PLAN_2026-11-02.md) · [canonical plan](MASTER_DEVELOPMENT_PLAN.md).
- The 13 ancestry-proven source PRs are **#103, #100, #99, #97, #96, #95, #94, #93, #92, #91, #90, #89, #87**. All others must remain labeled as **unmerged historical work** rather than falsely marked as code included.

**Follow-up:** When the new `main` SHA and archive closures are verified, update the mainline audit with the actual PR merge result and remaining open PR count. Future tasks must branch from new `main`; do not inherit 60 obsolete dependencies.

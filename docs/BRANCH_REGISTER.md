# Branch register — Sector Rebound

**M2 AI fairness v0.9.74 owner preview:** [draft PR #102](https://github.com/PlayerEden/Ricochet-Rumble/pull/102), signed source `0797cc8f18b6da35a1bdcaf62e4d49c2dd52c1aa`, [game test SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41575543007), [Android signer/asset SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41576134341), [APK artifact ZIP](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41576134341/artifacts/13202544914), code 360001, same public AOSP preview signer. Exact source rollback `checkpoint/sector-rebound-v0974-ai-shot-posture-signed-ci-360001`, **do not delete/force push**, phone acceptance pending. v0.9.73 and main preserved.



**D3-A2 one-phone LAN four-mode signed preview (Nov 2 local):** [draft PR #101](https://github.com/PlayerEden/Ricochet-Rumble/pull/101), exact signed source `08580417bb43877b472f5b378d449f77e74bd4de`, versionCode `350001`, [Android PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41574012652), [game PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41573556329), [owner ZIP](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41574012652/artifacts/13203185715), checkpoint `checkpoint/sector-rebound-v0973-lan-modes-signed-ci-350001`. Owner phone/manual save acceptance and true two-phone Wi-Fi still pending; stable main and v0.9.71/72 unchanged.



**M1 owner preview verified 2026-11-02:** D3-A1 [PR #100](https://github.com/PlayerEden/Ricochet-Rumble/pull/100) staged source `848a14832d03486239b30d510f2fe5ae28fac7e6`, signed v0.9.72 owner preview versionCode `340001`, [CI SUCCESS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41572106373), [artifact](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41572106373/artifacts/13201384029); exact-source rollback at `checkpoint/sector-rebound-v0972-host-bots-signed-ci-340001`. [A0 #99](https://github.com/PlayerEden/Ricochet-Rumble/pull/99) also GREEN. **Both drafts unmerged**, owner phone installation and two-phone acceptance pending; stable main unchanged.



**2026-11-02 M1 implementation branches:** [D3-A0 #99](https://github.com/PlayerEden/Ricochet-Rumble/pull/99) pure LAN room kernel `35b7ed75b049a3b7e0fb9a16f88cf5c84a980a58` [full QA PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41570686213); [D3-A1 #100](https://github.com/PlayerEden/Ricochet-Rumble/pull/100) real one-phone host-only bot TDM source `860e15432cc32dfbf08f38f324f04a0937922289`, full QA/owner Android **pending**. Both are experimental descendants of D2 v0.9.71; stable main, rollback and signed APK unchanged.



**Canonical master plan update (2026-11-02):** [Sector Rebound Master Development Plan](MASTER_DEVELOPMENT_PLAN_2026-11-02.md) now owns the ordered roadmap, implemented-vs-designed inventory, D3 one-phone first milestone, open issue/PR reconciliation, Android/Google Play gates and owner decisions. This older plan is a **historical technical reference**, not the current next-task list. Follow the master and newest [Project Status](PROJECT_STATUS.md); do not interpret older "NOT IMPLEMENTED" design bullets as current runtime truth.



**2026-11-02 D3 handoff (planning only):** This register's older rows are historical. New active experimental lineage and its protected rollback:

| Branch | Purpose | Status |
| --- | --- | --- |
| `main` | Last merged stable development runtime | **UNCHANGED**, no D1/D2/D3 code merged |
| `experiment/match-identity-colors-c1` | C1 faction identities | [draft #95](https://github.com/PlayerEden/Ricochet-Rumble/pull/95), preserve |
| `experiment/lan-squad-tdm-d1` | D1 actual LAN scored squads | [draft #96](https://github.com/PlayerEden/Ricochet-Rumble/pull/96), CI [PASS 41564344765](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41564344765) |
| `experiment/lan-series-d2` | D2 best of three + signed v0.9.71 | [draft #97](https://github.com/PlayerEden/Ricochet-Rumble/pull/97), [whole game PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41565384859), [APK PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41566002036), physical LAN pending |
| `checkpoint/sector-rebound-v0971-lan-series-signed-ci-330001` | Immutable source pointer for v0.9.71 owner preview | Source `333fc9d9ffc5f5ff5e136121217240112def531e`, **do not force-push/delete** |
| `plan/d3-persistent-lan-rooms` | Approved D3 **documentation only**, on exact D2 source | No runtime change; separate D3-A0/A1 implementation draft branches to follow |

[D3 design spec](design/LAN_PERSISTENT_ROOMS_D3_SPEC_2026-11-02.md) · [one-phone test card](LAN_D3_ONE_PHONE_OWNER_QA_2026-11-02.md).

---


**Updated: 2026-10-27 through v0.9.22-dev5 / roadmap audit.** These preserved branches are history/rollback references; don't delete or force-push simply to reduce clutter. The next feature starts from tested `main`.

## Active and preserved checkpoints

| Branch | Purpose | Status |
| --- | --- | --- |
| `dev/sector-rebound-quick-play-v0922` | **Active draft [PR #24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24)**; Quick Play, frozen result stats, approved camera | [Full QA passed](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40601021890) on `55e69a82`; [dev5 APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev5-final-camera-test); **not merged** |
| `main` | **Current** tested v0.9.21 development baseline | [PR #23 merged](https://github.com/PlayerEden/Ricochet-Rumble/pull/23); [full QA passed](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40590979779) |
| `dev/sector-rebound-quick-play-v0922` | **Active unmerged v0.9.22 branch** — survival playlists, frozen solo match results, owner-approved camera | [Draft PR #24](https://github.com/PlayerEden/Ricochet-Rumble/pull/24); [full Android/Chromium QA passed](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/40601021890); [dev5 debug APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.22-dev5-final-camera-test); phone playlist/results acceptance remains pending |
| `integration/sector-rebound-mainline-v0921` | Accepted one-time integration branch | Historical merge branch, not the place for future changes |
| `dev/sector-rebound-polish-v0921` | Original v0.9.21 game-feel branch | Preserved rollback and release source; [closed historical PR #17](https://github.com/PlayerEden/Ricochet-Rumble/pull/17) |
| `dev/sector-rebound-integrated-v0920` | Pre-polish consolidated checkpoint | Preserve rollback; do not alter |
| `archive/legacy-main-v063-before-sector-rebound` | Main as it existed before v0.9.21 integration | Permanent named legacy recovery point; preserve |
| `design/sector-rebound-match-modes-v1` | Match playlists and next-session design | Historical design draft, not shipping code |
| `design/fieldgrid-cosmetics-bible-v1` | Cosmetics and portrait identity | Historical design draft, not purchasable |

## Historical progression — preserve until consolidated

Earlier experimental family: `dev/fieldgrid-clarity`, `dev/fieldgrid-visual`, `dev/pilot-survival`, `dev/procedural-deployments`, `dev/sector-rebound`, `dev/sector-rebound-motion`, `dev/sector-rebound-ui`, `dev/sector-rebound-visual-qa`, and `dev/unified-arena`.

Versioned milestones: `dev/sector-rebound-ui-v099`, `dev/sector-rebound-fullscreen-v0910`, `dev/sector-rebound-motion-polish-v0910b`, `dev/sector-rebound-fieldgrid-v0911`, `dev/sector-rebound-qa-v0912`, `dev/sector-rebound-camera-v0912a`, `dev/sector-rebound-combat-feel-v0913`, `dev/sector-rebound-camera-qa-v0914`, `dev/sector-rebound-feedback-v0915`, `dev/sector-rebound-combat-intelligence-v0916`, `dev/sector-rebound-match-flow-v0917`, `dev/sector-rebound-play-foundation-v0918`, `dev/sector-rebound-pilot-silhouette-v0919`, and `dev/sector-rebound-lobby-pilot-v0920`.

### Historic PR chain is closed, not deleted

On **2026-10-27**, PRs **#1–#17** were closed with comments linking to merged [PR #23](https://github.com/PlayerEden/Ricochet-Rumble/pull/23) after each head was verified to be in the consolidated code ancestry. They were *not* independently merged or stripped from Git history. All archived draft discussions are available in GitHub's **Closed** pull-request filter.

For new v0.9.22 work: branch from `main`, keep one cohesive PR per slice, pass cheap smoke CI and targeted manual Android/visual QA, and update [PROJECT_STATUS](PROJECT_STATUS.md) when accepted. The repo stays public; this is not permission to publish or delete secrets.

## Project hygiene still undecided

No explicit OSS license has been chosen. A public repo can be source-visible without granting reuse rights; **do not add a license without owner approval**. Repository rename is also unnecessary to publish the game under Sector Rebound; preserve the existing GitHub URL until any rename is deliberately planned. Branch protection and key custody require separate owner/admin review.

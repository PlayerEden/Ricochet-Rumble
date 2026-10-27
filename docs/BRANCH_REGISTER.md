# Branch register — Sector Rebound

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

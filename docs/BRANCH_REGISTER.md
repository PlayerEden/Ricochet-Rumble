# Branch register — Sector Rebound

**Snapshot: 2026-10-27.** This catalog explains historical branches and avoids mistaking a preserved experiment for current production. Do not delete or force-push branches solely to reduce visual clutter. Update after the mainline integration is accepted.

## Active / review candidates

| Branch | Purpose | Status |
| --- | --- | --- |
| `main` | Default branch; historical v0.6.3 runtime prior to candidate merge | Protected by review process; reconcile candidate before merge |
| `integration/sector-rebound-mainline-v0921` | Proposed v0.9.21 source + main handoff docs + reusable CI | New integration candidate; draft PR and checks required |
| `dev/sector-rebound-polish-v0921` | Latest working game-feel branch | Preserve, [draft PR #17](https://github.com/PlayerEden/Ricochet-Rumble/pull/17); [v0.9.21 APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.21-polish-preview) |
| `dev/sector-rebound-integrated-v0920` | Last pre-polish consolidated checkpoint | Preserve rollback; do not alter |
| `design/sector-rebound-match-modes-v1` | Match playlists and next-session design | Historical design draft, not shipping code |
| `design/fieldgrid-cosmetics-bible-v1` | Cosmetics and portrait identity | Historical design draft, not purchasable |

## Historical progression — preserve until consolidated

Earlier experimental family: `dev/fieldgrid-clarity`, `dev/fieldgrid-visual`, `dev/pilot-survival`, `dev/procedural-deployments`, `dev/sector-rebound`, `dev/sector-rebound-motion`, `dev/sector-rebound-ui`, `dev/sector-rebound-visual-qa`, and `dev/unified-arena`.

Versioned milestones: `dev/sector-rebound-ui-v099`, `dev/sector-rebound-fullscreen-v0910`, `dev/sector-rebound-motion-polish-v0910b`, `dev/sector-rebound-fieldgrid-v0911`, `dev/sector-rebound-qa-v0912`, `dev/sector-rebound-camera-v0912a`, `dev/sector-rebound-combat-feel-v0913`, `dev/sector-rebound-camera-qa-v0914`, `dev/sector-rebound-feedback-v0915`, `dev/sector-rebound-combat-intelligence-v0916`, `dev/sector-rebound-match-flow-v0917`, `dev/sector-rebound-play-foundation-v0918`, `dev/sector-rebound-pilot-silhouette-v0919`, and `dev/sector-rebound-lobby-pilot-v0920`.

### What to do with 17 chained draft PRs

1. Review the integration PR source tree and main-only documentation reconciliation.
2. Confirm the proposed merged source is a complete, tested snapshot; do not merge each old PR in a chain.
3. Once approved, close superseded PRs with a link to the integrated commit/PR and a note that work was retained. **Close, don't delete.**
4. Preserve GitHub Releases, critical tags, known-good v0.9.20/v0.9.21 branches, and records of failed tests.
5. Begin new gameplay features from accepted main or a clearly named current development baseline. Use one draft PR per cohesive slice, with explicit mainline base, not another long chain.

## Project hygiene still undecided

No explicit OSS license has been chosen. A public repo can be source-visible without granting reuse rights; **do not add a license without owner approval**. Repository rename is also unnecessary to publish the game under Sector Rebound; preserve the existing GitHub URL until any rename is deliberately planned. Branch protection and key custody require separate owner/admin review.

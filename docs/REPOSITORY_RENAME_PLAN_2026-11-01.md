# Sector Rebound — GitHub repository rename playbook
**Prepared:** 2026-11-01  
**Status:** PROPOSED / NOT PERFORMED  
**Current:** `PlayerEden/Ricochet-Rumble` (repository ID `1434527636`)  
**Target:** `PlayerEden/Sector-Rebound`

## Decision

Rename the **existing** repository, not create a new one. Its game is publicly branded **Sector Rebound**; **FIELDGRID** remains the fictional in-universe arena program. This is a repository URL/identity cleanup only. Do not combine it with gameplay, signing or Android package migration. This GitHub connection has read/write file/PR permissions but does not expose an operation to rename a repository; the owner must use GitHub Settings > General > Repository name.

## Owner rename action

1. On [the current repository](https://github.com/PlayerEden/Ricochet-Rumble), open **Settings → General → Repository name**.
2. Enter `Sector-Rebound`; confirm rename. Ensure the target is available.
3. Open `https://github.com/PlayerEden/Sector-Rebound` and confirm the repository, owner and history are the same, including repository ID `1434527636`.

**Do not claim completed until the live repository metadata shows the target name.** GitHub generally redirects old repository web/clone URLs, but do not rely on redirects for GitHub Pages, GitHub Actions `uses:` references or external integrations.

## Verification after rename

- Confirm `main`, the draft integration [PR #85](https://github.com/PlayerEden/Ricochet-Rumble/pull/85), all checkpoint branches, old tags/releases, existing artifacts and GitHub Actions history survived unchanged. No force push or duplicated replacement repository.
- Update local clones with `git remote set-url origin https://github.com/PlayerEden/Sector-Rebound.git`, then `git remote -v` to verify (if any local clones exist).
- Update **active** GitHub links in README, current-status/handoff docs, developer notes and user-facing links. Historical evidence and fixed release URLs may safely remain archival; don't rewrite old commits solely for naming.
- Audit repository references in workflows, badges, links, API scripts, Play listing, public privacy policy hosting, GitHub Pages/settings, webhooks, branch protection and external integrations. Check workflows do not use pinned `PlayerEden/Ricochet-Rumble` as a reusable action target.
- Run lightweight GitHub checks and one previously known-good Android/web package audit after identity-only changes, especially if tooling assumes `owner/repo`.
- Leave `main` unmerged and the draft PR open. Document the new canonical URL in the top-level handoff.

## Explicitly NOT part of the rename

| Surface | Keep for now | Why |
| --- | --- | --- |
| Play-visible game title / launcher | `Sector Rebound` | Approved public identity |
| Lore | `FIELDGRID` | Arena/facility designation, not repository title |
| Android production applicationId | `com.playereden.ricochetrumble` | Changing it creates a *different app*, not an in-place update |
| Android preview package | `com.playereden.ricochetrumble.preview` | Existing preview continuity and backed-up saves |
| Android Java package paths | `com/playereden/ricochetrumble/` | Native code/import compatibility |
| JS namespace | `window.RR` | Technical compatibility; not user-facing |
| Local Wi-Fi discovery protocol/service type | Current exact value | Avoid silently breaking local host/join interoperability |
| Old releases, commits, rollback tags | Existing immutable history | Traceability and restore paths |

A future production Android identifier decision must be made **separately before Play first publication**, with save migration tests. No signing keys, keystores or credentials should be committed. A repo rename does **not** establish game-title trademark clearance.

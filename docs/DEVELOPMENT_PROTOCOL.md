# Sector Rebound — Development & Handoff Protocol

**Maintained with:** [Project Status & Handoff](PROJECT_STATUS.md)  
**Purpose:** Keep the repo readable, reproducible, and resilient when a ChatGPT conversation ends or an assistant changes.

## One source of truth, not twenty contradictory summaries

- The default-branch \`docs/PROJECT_STATUS.md\` is the **navigation/status entry point**. Update it whenever current branch, release, validation, blockers, or planned next action changes. It links to the versioned technical/design documents.
- **Actual tested source and tests** determine what exists. A design Bible is not implementation. A CI pass is not proof of human hardware acceptance.
- Design decisions belong in \`docs/design/\`. Audit and acceptance notes belong in \`docs/design/reviews/\` or a clearly named release QA report. Long-term Play planning belongs in the roadmap. Avoid duplicating full Bibles into README.
- README on \`main\` identifies the default branch's code as historical until an actual reviewed integration; do not represent it as current game source.
- If documentation gets behind reality, repair its status **in the same session** as code work, not "next time."

## Branches and commit discipline

1. Preserve the v0.9.20 baseline \`dev/sector-rebound-integrated-v0920\` and v0.9.21 preview \`dev/sector-rebound-polish-v0921\` with draft PR #17 and its release. Historical draft PRs/branches may be chained; do not blindly merge or delete them.
2. Create each new development slice from the **known-good, explicitly named branch**, not automatically from outdated \`main\`. Use descriptive names such as \`dev/sector-rebound-quick-play-v0922\` for experiments.
3. Keep code/visual/gameplay changes together only when they form one reviewable feature. Commit scopes plainly; use draft PR until full checks and owner review.
4. Never discard an earlier working APK. Use annotated notes/release tags for acceptance checkpoints and keep download links pointing to **GitHub Releases**, rather than expiring chat/Actions artifact URLs.
5. When ready to consolidate development into \`main\`, review the true commit graph/diff, preserve provenance and release history, test a dedicated integration candidate, then update README/docs only after the code is there.

## Definition of done per slice

- State the **player-visible change**, explicit non-changes, intended branch, previous rollback branch and test criteria.
- Include gameplay regression + seeded procedural tests with saved failure seeds. Match/event state needs actual end-to-end test cases, not only static code checks.
- Compare before/after **in-game** screenshots at 740×360, 915×412, 1280×720 when UI/camera is touched. Check readable tiny pilot, safe areas, controls, menus and match results.
- Verify web game and bundled Android assets match (especially JS/HTML/CSS). Run Android debug APK build and unsigned AAB where applicable; do not call either a signed Play release.
- For networking changes, verify host authority, protocol parity, disconnect/background/rejoin and two physical phones on the same local Wi-Fi. Until hardware checks finish, label LAN as experimental.
- Store a short QA log and CI/workflow link in repo; preserve a GitHub pre-release link for installable builds. Mark **automated passed**, **manual passed**, **pending**, and **known issue** separately.
- Update \`docs/PROJECT_STATUS.md\`: latest milestone, PR/branch/release, implemented features, blockers and exact next slice.

## Resource-conscious build policy

Documentation-only commits should not trigger Android APK work. Run lightweight local/static checks first. Avoid re-running full CI/visual/browser/Gradle workflows until a candidate has changed enough to merit a genuine QA gate. GitHub Actions may be quota-limited, and normal Actions artifacts can expire; GitHub Release assets and Git history are the preferred longer-term handoff.

## Phone-first collaborator flow

A collaborator can work from Android without a local computer: open the GitHub repository, read \`docs/PROJECT_STATUS.md\`, inspect the linked PR/release, download the **debug preview** APK, play-test, and report screenshots/steps/seed when possible. Do **not** uninstall an older APK casually if Android signing differs; back up local game data first. Production keystores and secrets never go into public source control.

## How to recover when a chat fills

ChatGPT does not provide a reliable advance warning of remaining context capacity, so **do not depend on an automatic warning**. At each accepted development slice, write a compact checkpoint to GitHub before doing the next one. Keep a short user-visible handoff when a discussion grows large. To restart, paste the resume prompt in \`docs/PROJECT_STATUS.md\`; a new assistant should read the live repo before claiming features or redoing work.

## Decision record

- **2026-10-27:** GitHub is the durable backup of plan, context, code, tests, screenshots/release evidence, and known issues; the assistant chat is for discussion and work, not the only archive.
- **2026-10-27:** Keep a safe, reviewable \`main\` status hub while modern playable code remains in explicitly identified dev branches pending integration.
- **2026-10-27:** A complete Quick Play loop is more important than a rushed store, profile, remote PvP or a sprawling unfinished mode list. Preserve the "new procedural maze every match" game identity.

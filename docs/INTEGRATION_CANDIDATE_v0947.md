## Verified v0.9.47 integration QA — 2026-10-30

**Full actual Chromium/Android QA PASS**, [run 41014535504](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41014535504), and [fast integrated regression PASS, run 41014535531](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41014535531). Both tested the original assembled source commit `feea956856df767cbb20a02c8a954d22cf73b02f`. The completed full run produced artifacts: `debug-apk-41014535504`, `unsigned-aab-NOT-FOR-PLAY-41014535504`, and `sector-rebound-qa-41014535504-1`. These are GitHub Actions artifacts, **not** a permanent release and **not** signed update-safe or Play-approved. The automation results confirm source/gameplay regression and browser/Android packaging, **not** real two-phone networking, signing continuity, device stress, or Play approval.

**Current decision:** Keep [integration candidate PR #71](https://github.com/PlayerEden/Ricochet-Rumble/pull/71) DRAFT and unmerged. Main remains v0.9.21 game runtime with documentation updates. Next priority is private durable TEST signer and verified same-certificate upgrade with saves preserved, followed by Android long-session/precise-aim and two-phone LAN acceptance. Do not uninstall an existing APK with valuable local progress. Pilot P-03 and v0.9.46 UI/audio remain owner-approved.

---

# v0.9.47 — Controlled integration candidate from stable main (DO NOT MERGE)

**Status: SOURCE ASSEMBLED / NEW INTEGRATED SHA NOT YET QA-ACCEPTED.** Owner explicitly accepted P-03 pilot silhouette/movement and v0.9.46 UI/audio. This branch is a *separate, reversible review candidate*, not a production release and not approval to merge experimental features.

## Precise assembly method
- **Starting point:** stable `main` after documentation-only 2026-10-30 updates, SHA `b166ba3a662764742522620a566405d3e1ae47eb`. Original main gameplay prior to this is v0.9.21.
- **Source snapshot:** focused v0.9.46 [draft PR #67](https://github.com/PlayerEden/Ricochet-Rumble/pull/67) SHA `44169b463088816f9e4ff25720eeb44a477d4b0b`, preserving P-03 and UI/audio as accepted in the user's real phone feedback.
- A Git tree overlay imported exactly **32 non-documentation paths** changed from main in the source comparison: real Web game/HTML/CSS/modules, all Android bundled mirrors and Gradle, scored kernel, relevant game/test tools and CI/QA workflows. No `docs/` path was overwritten with an older branch's version.
- Verified **exact Git blob SHA equality to source #67** for all **six** mirrored Web/Android game assets, including `web/game.js`, `web/index.html`, `web/style.css`, `scored-match.js`, `dossier.js`, `save-backup.js`, plus `tests/smoke.mjs` and `android/app/build.gradle`. Main's authoritative `docs/APPROVED_PILOT_P03.md` and current handoff documents remain intact.
- Adds only v0.9.47 audit source-contract script and a corrected historical report version label, and executes them as part of fast PR smoke. No new gameplay features, art changes, sound composition, speed, bot rules, camera, networking behavior, data stores or package ID.

## QA / developer checklist for THIS integrated commit
- [ ] Fast PR regression including 300 seeded mazes, scoring, Custom/Quick Play, local profile/backup, all six Web/Android mirrors, signer guard, P-03 contract and audio settings.
- [ ] Real Chromium actual test at 740×360, 915×412, 1280×720, menu/pause/scored mode/After Action, no console errors.
- [ ] Android debug APK and unsigned AAB from *exact integrated source SHA*. Archive results/checksum with SHA if approved as a standalone test build. **Not** a safe in-place update until real same-cert test.
- [ ] Explicit final merge diff review of 32 imported paths and documentation retained from stable main.
- [ ] Owner physical pilot/controls, tank/mech precision, actual Android performance, save continuity and two-phone LAN if v1 includes it: **PENDING**.
- [ ] Google Play upload signing, compliance and privacy: **BLOCKED/NOT YET VERIFIED**.
- [ ] Only then consider explicit owner approval of a release candidate/main merge; never merge this draft PR automatically.

## Original rollback and evidence
- [Stable pre-integration v0.9.21 main](https://github.com/PlayerEden/Ricochet-Rumble/tree/main) is unchanged until specifically approved.
- [Owner-approved P-03 + movement v0.9.45.1 original APK](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.45.1-pilot-motion-test).
- [Owner-approved v0.9.46 UI/audio original tested APK, QA and digest](https://github.com/PlayerEden/Ricochet-Rumble/releases/tag/v0.9.46-ui-audio-test).
- [v0.9.47 audit run 41013774058 PASS](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41013774058) and [full risk register](QA_RELEASE_INTEGRATION_v0947.md).

**Exception:** A new integrated source commit is **not** equivalent to previously tested v0.9.46's source SHA. Its own CI results must pass and be recorded, even though all imported gameplay asset blobs are identical.

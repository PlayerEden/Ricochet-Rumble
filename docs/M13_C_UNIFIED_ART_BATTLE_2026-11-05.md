# M13-C combined physical-phone preview (2026-11-05)

**Status:** isolated draft, not merged, not production-approved.

This branch starts from verified M13-B5 gameplay PR #143 (commit `4ad9653`) and ports the user-approved M13-A visual work from draft PR #141 (commit `1ff458a`). Neither source PR nor `main` is changed or merged.

The disposable Android package `com.playereden.ricochetrumble.m13fusion`, labeled **SR M13 Unified**, loads `?hybridMenu=1&m13Preview=1&m13Pacing=1` automatically. On the same phone build: Warm Hangar, illustrated Mode Select, original SVG insignias and the **actually equipped Dossier badge**; combat changes are a fuller Survival starter, truthful DEPLOY/ENGAGE/FINAL stages, post-elimination Solo WATCHING/NEXT CAMERA, and preview-only CQC 15 / TDM 30 / FFA 10 KO targets. The real mode-card labels reflect the actual targets.

**Isolation:** 12 art SVGs are added through Android's `debug` sourceSet **only** with `-PsrM13FusionPackage=true`. Normal/debug/release/owner-preview/hybrid/pacing-only APKs do not include these studies. The main Android URL still has neither art nor pacing flag, keeping the old 10/15/10 targets and original art. No new save keys, progression changes, LAN protocol, signing identity, damage, bots, or achievement criteria.

**QA:** source/parity/smoke/upgrade and score-kernel tests, actual five-size Chromium tests from M13-A and M13-B, a dedicated M13-C combined art+mode labels+spectator test at 568x320 through 1280x720, normal-unflagged route negatives, Android APK package/label/compiled URL + exactly 12 asset verification, existing LAN and gameplay PR CI. Prior synthetic scored target A/B trials are documented in PR #143; no human claims.

**Owner physical review gates:** compare the cohesive visual/gameplay app, feel of CQC 15 and TDM 30, post-elimination watch camera clarity, match cue visibility, controls, frame rate, and any idle-ending bug. Actual hardware 2-phone LAN and durable APK signing remain unverified. Do not merge any PR without review. Installing a new CI-signed package may require uninstalling only the *SR M13 Unified* previous test app. Never uninstall regular Sector Rebound.

**Rollback:** remove this third feature branch; PR #141 and #143 verified source checkpoints remain intact.

# Sector Rebound — Change Review

> Read [PROJECT_STATUS](../docs/PROJECT_STATUS.md) and the [development protocol](../docs/DEVELOPMENT_PROTOCOL.md) before changing runtime or release branches.

## What changed for the player?
<!-- Describe the real working result, not the design-only proposal. -->

## What intentionally did not change?
<!-- Combat balance, LAN protocol, save format, scoring, cosmetics, billing, etc. -->

## Source, rollback and version
- Base/known-good source branch or SHA:
- Proposed branch and Android `versionCode`:
- Rollback tag/release:
- Design specification (if applicable):

## Verification
- [ ] Runtime is real, not a UI mockup or future design-only button
- [ ] Headless smoke and procedural seed cases pass
- [ ] Browser `web/` and Android bundled JS/HTML/CSS match
- [ ] Real before/after screenshots at 740×360, 915×412, 1280×720 when UI/visuals change
- [ ] Android debug APK compiles on exact source SHA (when relevant)
- [ ] Unsigned AAB validates (when release work is relevant)
- [ ] Host/guest and real two-phone tests recorded (if networking was touched)
- [ ] Known limitations and untested physical device scenarios listed explicitly
- [ ] Preview APK release has immutable tag, source SHA and checksum when published
- [ ] [PROJECT_STATUS](../docs/PROJECT_STATUS.md) updated or follow-up linked

## Evidence and caveats
- Automated test run:
- Screenshots / failure seeds:
- Release APK:
- Physical-device tests passed:
- Physical-device tests pending:
- Known regressions / deferred issues:

**Review gate:** Never merge to `main` solely because a draft PR exists. Review integration graph, status docs, checks, and rollback first.

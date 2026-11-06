# Sector Rebound M13-F — Solo TDM 40 KOs / 6-minute comparison app

**2026-11-06. Status: draft, opt-in development APK only. Not approved for release.**

## Intent

M13-E [draft PR #146](https://github.com/PlayerEden/Ricochet-Rumble/pull/146) simulated 20 games per option on the real physics/AI kernel, with the human seat replaced by an AI proxy. The candidate Solo TDM at **40 KOs / six-minute maximum** produced median **228.4 s** (P10 168.8 s; P90 360 s), **17/20 score-target completions, 3/20 clock endings**. The existing M13-C Unified 30 KOs / five-minute preview had median 181.5 s and 15/20 KO endings, 5/20 clock endings. These are **synthetic estimates, not user phone measurements**.

M13-F exists to compare the *feel* on a physical Android phone. It preserves the actual match engine, movements, damage, vehicles, bots, saved data, approved M13 art, CQC, FFA and Survivor camera.

## Dedicated Android comparison build

| Property | M13-C Unified baseline | M13-F Compare candidate |
|---|---|---|
| Android label | SR M13 Unified | **SR M13 Compare** |
| App package | `com.playereden.ricochetrumble.m13fusion` | **`com.playereden.ricochetrumble.m13compare`** |
| Preview flags | `m13Preview=1&m13Pacing=1` | `m13Preview=1&m13Pacing=1&m13FCompare=1` |
| Solo TDM | 30 team KOs; 300 s maximum | **40 team KOs; 360 s maximum** |
| CQC | 15 KOs; 180 s maximum | unchanged |
| FFA | 10 KOs; 240 s maximum | unchanged |
| Solo Survival | existing selected rules; 3 bots/3 lives/standard fresh default | unchanged |
| HUD / art / spectating | Warm Industrial art, real battle stages, after-elimination Solo watch | unchanged |
| LAN TDM | host-selected 15 or 30 KOs, 300 s maximum | unchanged |

Only when *all three* preview query flags are set can the new TDM candidate activate. Supplying `m13FCompare=1` without both M13-C base flags does nothing. The base M13-C URL still uses 30/300; unflagged web/ordinary Android still uses 15/300. Even in the comparator application, the actual scored TDM initialization **requires Solo session** with no CTF, Daily, Forward Bay or LAN-scored match before permitting 40/360. LAN host selection remains 15/30 under five-minute cap; the score kernel is unchanged. Custom, team survival, saves, dossier and upgrade keys have not changed.

The comparator build is **independent**, debug-only, and deliberately signed using a disposable CI key. It is *not* upgrade-safe and cannot replace regular Sector Rebound or SR M13 Unified. App data are isolated by Android package ID. A signature mismatch on a new comparator artifact means uninstall **only SR M13 Compare**. Do not clear or uninstall the regular app. This is not a final Play Store APK.

## Automated acceptance

The `.github/workflows/m13-f-tdm-comparator-apk.yml` workflow validates:

- Source parity `web/*` and `android/app/src/main/assets/*` for game and support modules, unchanged score/backup kernels, stable package restrictions.
- Real Chromium checks at 568×320, 640×360, 740×360, 915×412 and 1280×720: Mode Select, Warm Industrial Hangar, Dossier badge, Solo spectators and their NEXT CAMERA transitions; actual Solo TDM rules; the Quick Play 40 KO / 6 MIN label; safe thumb controls; no unexpected save writes.
- **Negative flag cases**: normal 15/300, M13-C 30/300 and partial M13-F flags cannot activate 40/360.
- Actual temporary host-scored state still resolves both 15/300 and 30/300. Existing LAN regression/unit tests run as well. **This is not a real two-phone test**.
- Android build targeted at API 36 with the exact `.m13compare` package, launcher label, compiled WebView start URL, bundled native game parity, exactly 12 debug-only art SVGs and a verified debug signature. Evidence including phone-size screenshots and verification.txt is uploaded as a temporary GitHub Actions artifact.

CI green certifies the *build and automated behavior*, not the device feel, real multiplayer connection, heat/FPS, or public release readiness.

## Physical A/B playtest

1. Open **SR M13 Unified**. Choose TDM and play at least **three** Solo matches, recording each elapsed time, actual KO score, ending reason (target vs timeout), if any AI felt unfair, visibility of DEPLOY/ENGAGE/FINAL PUSH, and 1–5 fun rating.
2. Open **SR M13 Compare** separately. Play at least **three** matches of Solo TDM at the same bot skill, orientation and phone conditions. Verify mode cards advertise **40 KOs**; match goal is **40** and timer starts at **6:00**. Compare against the baseline for meaningful engagement, quiet periods, score visibility, teammate presence and whether games overstay their welcome.
3. Recheck CQC/FFA/Survival. In Survival, become fully eliminated before all bots die, verify WATCH FIGHT centers a real survivor and NEXT CAMERA switches live targets. Verify controls are hidden for eliminated players.
4. Test Survival independently with **3 bots/5 lives/Standard** and **4 bots/5 lives/Large** using Custom Match (as supported). Measure real contact/engagement time as well as total round length; large maps should not become boring walks.
5. Reopen the usual **Sector Rebound** to confirm your normal saves are still present. This check does not replace true uninstall/upgrade-with-durable-key testing.

Keep phone clips or screenshots of issues. Do not mistake six minutes for a *minimum*: a genuine KO victory should end immediately. LAN retains the original rules in this experiment.

## Decision gate

- [ ] Five-size Chromium and isolated Android APK QA green, with the expected source SHA and verified digest.
- [ ] Owner physical Android A/B review accepts longer TDM without forced clock endings.
- [ ] Gameplay and LAN regressions green; actual **two-phone** play remains a separate mandatory gate.
- [ ] Frame rate/thermal/device handling on real phone acceptable.
- [ ] Durable signed release/update compatibility and backup/restore checked before production.
- [ ] Explicit owner approval to promote any M13 draft. **No auto-merges to main.**

**Rollback:** discard M13-F stacked draft branch. M13-E #146 and M13-C #144 remain unchanged; keep the [M13-C rollback checkpoint](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/m13-c-unified-art-battle-ci-green-2026-11-05).

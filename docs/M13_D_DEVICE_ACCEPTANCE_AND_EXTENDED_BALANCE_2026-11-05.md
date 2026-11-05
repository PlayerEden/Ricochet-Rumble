# M13-D — Unified preview: physical-device acceptance and extended balance evidence

**Date:** 2026-11-05. **Status:** isolated, advisory QA. **Source:** M13-C draft PR #144 (commit `d230227bf4028bb28d73609c16521d6287ef9671`). This is a *stacked* M13-D branch based on the M13-C head, not main. **Do not merge** any M13 PR without owner approval.

## What this milestone does—and does not do

- Adds a repeatable **20-seed-per-scenario** engine observation job and an actionable physical Android acceptance sheet. Results are inspectable JSON and a short Markdown table.
- Makes **no changes to game rules, bot AI, LAN authority, save data, art, Android application ID, or package signing**. The previously verified **SR M13 Unified** APK is still the artifact for phone testing; this milestone does not produce or claim a new APK.
- Synthetic observation uses the real in-repo game physics/scoring and natural bot AI with an **idle or AI-proxy player seat**. This is **not human play, hardware frame-rate testing, or a guarantee of target match lengths**.
- Visual M13-A PR #141, gameplay M13-B PR #143, unified M13-C PR #144 remain open drafts; main remains unchanged.

## Get the phone build

Install **SR M13 Unified**, the *separate* debug-signed APK attached to the successful M13-C [workflow artifact](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/42097017237/artifacts/13447637959). M13-C recorded SHA-256 `b5e7dc2bbccc549223dbdf39b64ab8d8e82595db8f881b82bf0c870d14c3c75a`. GitHub artifacts have limited retention; if this download expires, rebuild the same isolated package rather than switching to the normal owner app.

- Expected app label: **SR M13 Unified**.
- Expected package: `com.playereden.ricochetrumble.m13fusion`, NOT `com.playereden.ricochetrumble`.
- If signature conflicts, uninstall **only the SR M13 Unified test app**; leave the installed regular Sector Rebound and its progress alone.
- Test previews use **CQC 15 KOs / TDM 30 KOs / FFA 10 KOs**, with ordinary non-preview score rules unmodified.
- Different CI jobs may use different debug signers; test-app updates are not promised to install over each other.

## Owner test session (first pass)

Use the same phone, landscape orientation, and default **Normal** opponent skill unless specifically testing something else. Do **not** use this as a substitute for a future two-phone LAN test. Capture a screenshot or screen recording when a visual issue is observable.

| Case | Run | Observe |
|---|---|---|
| Start/hangar | Fresh open; navigate Hangar, Modes, Dossier | Warm Industrial art loads; insignia/equipped badge matches; cards legible and cohesive |
| CQC | 3 normal matches, actively playing | 15-KO target shown; whether first kill, engagement and FINAL PUSH are visible; feels too short / right / too long |
| FFA | 3 normal matches, actively playing | 10-KO target shown; genuine lead/clock and stage cues; no hidden thumb controls |
| TDM (vs bots) | 3 normal matches, actively playing | 30-KO target; ally/enemy identity; AI participation; final score and 5-minute cap are truthful |
| Survival, active | 3 matches with normal play | Fresh default 3 bots / 3 lives / standard map unless saved settings override; real enemy remaining/lives and final stand |
| Survival, idle | Start; do not move/fire for a full match, repeat twice | Does a match end while idle? Record **time and reason** (e.g. another bot wins, player eliminated, game bug) |
| Survival, spectate | Get fully eliminated while at least two bots remain | WATCH FIGHT appears; live target instantly visible; dead thumb controls disabled; NEXT CAMERA selects a *different living* bot; auto-retargets on bot elimination; result eventually resolves |
| UI/controls | Pause/resume; rematch; rotate/leave/reopen if supported | No missing screen, stuck black frame, lost joystick/fire zones, or hidden EXIT; safe 568×320 layout |
| Save separation | Open normal Sector Rebound separately | Existing normal game save/progress remains intact; test preview is not the release app |

**Timing:** record real wall-clock/recording durations for each round, not just impression. Write *time to first genuine shot or KO*, *actual match length*, *how it ended*, and your 1–5 enjoyment rating where possible.

**Stage truth:** no invented midpoint if the match ends quickly. Score-mode clock is a maximum, not a minimum; "final push" should derive from live score/clock. When dead, a real *remaining battle* must be watchable rather than holding an empty camera. If no bots remain or the round is over, existing results/exit should take priority.

**Phone performance:** record phone model, Android version, whether battery saver was on, approximate device temperature (cool/warm/hot), and any noticeable lag/stutter after 3+ consecutive rounds. Do not describe automated Chromium performance as Android hardware FPS.

## Quick report to paste into #142 or the work chat

```text
M13-D PHONE FEEDBACK — SR M13 Unified
Phone / Android / orientation / battery saver:
Build: SR M13 Unified (com.playereden.ricochetrumble.m13fusion)
Mode | played / idle | elapsed | result/end reason | fun 1-5 | what felt off
CQC:
FFA:
TDM:
Survival:
Survival idle #1:
Survival idle #2:
Spectator: first bot centered? [Y/N]; NEXT CAMERA works? [Y/N]; auto-retarget? [Y/N]
Menus/Hangar/Dossier art:
HUD readability or blocked buttons:
Controls / AI fairness:
Stutter, heat, audio:
Anything unexpected (screenshot or timestamp):
Regular Sector Rebound save still present? [Y/N/NOT CHECKED]
```

## Automated M13-D evidence gate

New independent workflow `.github/workflows/m13-d-balance-evidence.yml` runs **20 deterministic seeds for each of seven natural-engine scenarios**: old and candidate Survival × idle/proxy plus CQC/FFA/TDM proxy (140 match observations). It also runs **20 seeds for each of eight real-score-kernel target A/B scenarios** (160 observations), including CQC 15, TDM 30 and FFA 10. Report artifacts retain raw rows, per-scenario median/P10/P90, KO/end reasons and early endings, and mark **synthetic** prominently.

**Important distinction:** the scored target A/B experiments override the score target *only inside a test VM*; the M13-C Android preview still uses the candidate targets only when `m13Pacing=1`. CI validates sample integrity, parity and determinism but deliberately does **not assert** specific match times or claim playtest approval.

## Do-not-ship until

- [ ] Owner accepts physical Android match pacing, menus, controls and live spectating.
- [ ] The extended 20-seed job completes and any surprising early-ending/end-reason cluster is reviewed.
- [ ] 2-phone actual LAN gameplay/host-guest authority verified; browser LAN simulations do not replace this.
- [ ] Android hardware FPS/thermals and resume/orientation tested.
- [ ] Durable release signing/update continuity and data backup/restore verified with real installation path.
- [ ] Explicit owner authorization to promote from draft. No silent merge of #141/#143/#144 or this stacked review.

**Rollback:** discard the M13-D branch; the M13-C source and its pinned rollback checkpoint `checkpoint/m13-c-unified-art-battle-ci-green-2026-11-05` remain intact.
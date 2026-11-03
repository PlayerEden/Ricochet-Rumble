# Sector Rebound — Play Console submission worksheet (October 31, 2026)

This is an evidence log, **not a completed Play Console submission**. Keep information synchronized with the final signed AAB and policy. The user has **not** confirmed their Play account type, public publisher identity, support contact, or intended target ages.

## Pre-submission technical inventory

| Field | Evidence | Status |
|---|---|---|
| Android app ID | `com.playereden.ricochetrumble`; preview isolated as `.preview` | Verified in Gradle, not uploaded |
| Target/compile SDK | API 36 | Source verified; exact production AAB attestation pending |
| App bundle | unsigned `bundleRelease` built in full QA | Production upload-signed AAB pending |
| Permissions | INTERNET, ACCESS_NETWORK_STATE, ACCESS_WIFI_STATE | Manifest reviewed; production package needs reattestation |
| Accounts and login | None in current Solo code | Owner confirms release scope |
| Advertising SDKs | No in current manifest/Gradle/JS source | Proposed "Does not contain ads" only after final artifact/dependencies check |
| In-app purchases | Not integrated | Don't claim purchases/cosmetics sales; inspect final build |
| Analytics / crash reporting | No developer-run SDK in current reviewed source | Final dependency audit required |
| User data storage | Local WebView settings, Dossier, equipped paint/insignia, Custom rules/presets | Source backed; public policy must cover it |
| Manual backup | User copies exported text voluntarily | Disclose possible sharing via user-selected services |
| Local multiplayer | Direct TCP + local IP discovery; host/guest exchange inputs/state | Physical two-phone acceptance pending; not advertised in draft Play copy |
| Public privacy webpage | HTML staged, has publisher/contact placeholders | **BLOCKED**, do not enable Pages or submit |
| Data safety section | Developer must decide accurate answers for local peer data and third-party services | **PENDING**, not inferred "no data collected" |
| Target audience | No owner decision provided | **PENDING**, no fabricated age or content rating |
| Ads declaration | Proposed No for reviewed code only | Owner and final AAB check |
| Content rating questionnaire | Not submitted | **PENDING** |
| App access | Solo play requires no account; review other routes | Confirm in Play Console |
| Closed testing | Personal developer accounts registered after Nov 13, 2023 generally require 12 opted-in testers for 14 continuous days | Verify account-specific requirement; don't assume eligibility |
| Physical app update | Preview 100041+ Android signer continuity and Chromium storage rehearsal | **PENDING** physical install-over and data retention |
| Live LAN | Browser two-client tests 54 pass | **PENDING** two actual Wi-Fi Android devices |
| Feature graphics | 1024×500 opaque candidate + 512×512 RGBA icon + real gameplay browser screenshots | **OWNER REVIEW**, not uploaded or production-device captured |

## Go/no-go decisions needed from the owner

- **Official publisher name and public privacy contact** (email or an accessible inquiry form). These will appear publicly; do not use private GitHub credentials.
- **Launch scope:** include nearby LAN only after real two-phone proof or ship a Solo-first public version that does not market an unaccepted beta.
- **Audience/content declarations and release countries** chosen in Play Console.
- **Physical phone acceptance:** on-device update without uninstall, locally saved Dossier/Hangar/settings persistence, mode flows, orientation/resume, and (if included) two-phone Wi-Fi lobby/start/rematch/disconnect.
- **Submission:** independent signed AAB, Play Console setup, privacy page reachable with a logged-out browser, policy acceptance, testing eligibility and explicit approval.

## Submission constraints

Google Play requires app-specific policy on a public non-editable website without a login and linked from store listing and app. A GitHub repository HTML source file is *not* itself an active Play privacy page; Pages is currently disabled. The staged `store-listing/privacy-policy.html` contains placeholders and `noindex`, intentionally making it unsuitable for direct publication until reviewed.

**Official references:**
- https://support.google.com/googleplay/android-developer/answer/9859455
- https://support.google.com/googleplay/android-developer/answer/10144311
- https://support.google.com/googleplay/android-developer/answer/13393723
- https://support.google.com/googleplay/android-developer/answer/14151465

No existing game code, signed preview, or stable `main` was changed by creating this worksheet.

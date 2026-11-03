# Sector Rebound — privacy policy DRAFT, NOT ready for hosting or Play

Last reviewed October 31, 2026. This policy describes the current local-first Android development build, not planned future features.

**Developer:** [CONFIRM OWNER'S PUBLIC PLAY DEVELOPER NAME]
**Privacy contact:** [OWNER TO ADD APPROVED EMAIL OR CONTACT FORM]

## Local progress
Sector Rebound stores game settings, Solo match history/statistics, Custom Match drafts/presets and equipped earned cosmetics locally in app WebView storage. A Solo account is not required.

## Nearby play
In Local Wi-Fi multiplayer, two phones connect directly over the same network. They exchange gameplay input and match state, and a guest may see the host's local IP address and port. No developer-hosted matchmaking or remote game-data account service is present in the reviewed build.

## Optional exports
When a user deliberately exports a backup, the game displays text they can copy or share. It does not automatically send that backup to the developer; any third-party service used to store/share it may have separate practices.

## Ads / analytics / purchases
The reviewed code does not contain ad or analytics SDKs or connected purchase services. Do not extend this statement to future versions without review, or to the device platform and Play distribution services.

## Retention and deletion
Local progress is stored until the user clears app data or uninstalls the app. The game cannot erase external copies of manually exported backups. It does not currently maintain a developer-hosted database of saved player accounts.

## Security
The WebView is configured to block remote network loads. Nearby device-to-device TCP play is not documented as end-to-end encrypted. Players should avoid untrusted local networks.

## Audience / external review
[OWNER MUST CONFIRM TARGET AUDIENCE, CONTENT RATING, ANY CHILD-RELATED REQUIREMENTS, THIRD-PARTY SDKS, AND CONTACT METHOD.]

## Availability
Before publishing, create a publicly accessible non-editable HTTPS webpage for this approved policy, include its URL in the Play Store listing AND the app, and complete a truthful Data safety declaration. This draft is not sufficient for Google Play submission and is not legal advice.

# Sector Rebound — publishable policy-page staging

The HTML in `privacy-policy.html` is intentionally *not* approved for deployment. It contains conspicuous contact/publisher placeholders and `noindex,nofollow`, so it must not be used as the official public URL. The app presently includes explanatory privacy text under Help.

## Before publishing

1. Agree on the **public developer/publisher identity** and a working **public privacy contact email or inquiry form**, distinct from private credentials.
2. Have the publisher review all data-handling statements against the exact production AAB, SDK dependency manifest, the approved multiplayer scope, Play Console Data safety answers, and selected target audience.
3. Replace both `[[PUBLISHER_NAME_REQUIRED]]` and `[[PUBLIC_CONTACT_REQUIRED]]` with actual public contact details; delete the draft warning, source-development notes, and the `noindex` robots tag.
4. Host the completed HTML as a standard publicly accessible HTTPS webpage, without login, PDF, edit access, or geoblocking. **GitHub repository currently has Pages disabled**; the source page in GitHub's code browser is *not* automatically a published policy site. Enable Pages separately or use an approved domain/site.
5. Verify the public URL loads for logged-out visitors worldwide and record the verified URL in `store-listing/privacy-policy-url.txt`. Add the link inside the game and Play Console listing. Then perform owner device review and Play Console Data safety form.
6. The in-game Help notice is not a substitute for a live, complete public privacy-policy URL.

`node tests/store-listing-policy.mjs` verifies staged metadata and HTML without falsely approving publishing. `node tests/store-listing-policy.mjs --publish` deliberately **fails** for the present draft. The privacy policy and listing copy are source-backed drafts, not legal advice.

Release acceptance: phone upgrade/save test, real two-device LAN or an explicitly reduced Solo-only launch, private upload-signed AAB, account/closed testing requirements, app content forms, and owner approval. Never automatically merge or publish.

# Sector Rebound — Play Store presentation candidate / phase 2 (2026-10-31)

Full Android/visual QA [41264791656](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41264791656) **SUCCESS** and follow-up [41264994815](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41264994815) **SUCCESS**; current developer source remains on draft PR #85, owner-approved Preview 100041 retained.

**Owner review candidate, not Play upload:** prepared a 1024×500 nontransparent 24-bit PNG feature graphic composited from a genuine `1280x720-moving-tank.png` test capture, the approved Version A 512×512 RGBA Play icon, and four genuine RGB 1280×720 Chromium gameplay/menu screenshots from [QA run 41263535665](https://github.com/PlayerEden/Ricochet-Rumble/actions/runs/41263535665). Do not present browser QA captures as real phone screenshots, but they show actual game content with no fabricated gameplay. Files and SHA256 are in the separately delivered owner review ZIP, not yet approved/committed as production artwork.

**Durable generation path:** `node tools/build-play-store-candidate.mjs` consumes QA-generated images directly from `qa-screens/after`, copies four real game screenshots and produces a 1024×500 opaque **JPEG** marketing candidate plus JSON SHA256 provenance. Full Android QA uploads this separately as an artifact, to retain evidence across chats. Distinguish it from owner's PNG preview—the text and composition are consistent but render engines and encodings differ.

Draft listing [STORE_LISTING_COPY_DRAFT.md](STORE_LISTING_COPY_DRAFT.md); privacy [PRIVACY_POLICY_DRAFT.md](PRIVACY_POLICY_DRAFT.md). **Privacy draft is NOT complete** without owner's public developer name/contact, hosted immutable policy URL, audience confirmation and full Play data safety review. No claims about ranked online PvP or fully working two-phone local multiplayer before physical acceptance.

Keep `main` unchanged; PR #85 DRAFT; production release NO-GO remains in force. Next gates: owner reviews candidate gallery, public policy finalization, owner Android install-over and physical two-phone test or removal from v1 scope, private signed release AAB, Play console requirements.

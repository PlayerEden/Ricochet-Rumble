# 11 — Launch Pilot Roster Plan
**Version:** 1.0-draft | **Status:** Names and specifications are proposals, not released assets  
**Manifest:** [../../game-data/cosmetics/pilot_icons.v1.json](../../game-data/cosmetics/pilot_icons.v1.json)

## Launch target: 18 distinct portraits

**Five free starters + three earned + ten direct-purchase premiums**. Most catalog *options* are purchasable, but a respectful free collection stays available forever. This balances the requested monetization direction with a realistic one-person production scope.

**Art gate:** no 18-icon production rush. First create and approve *two starters + one premium* as a side-by-side style proof. Complete the remaining roster in controlled batches. If consistency takes too long, ship fewer approved icons rather than filler.

### Five free starters — available immediately

| ID | Name | Role silhouette / specific art brief |
|---|---|---|
| \`pilot.st.001\` | **Recruit** | Standard dark-slate training helmet; short matte visor and square uniform collar; cobalt seam |
| \`pilot.st.002\` | **Relay** | Adult pilot with visible curls and a slim radio headset; orange mic-arm tip; soft rounded jaw |
| \`pilot.st.003\` | **Vector** | Lean faceted full-visor helmet, thin teal center split and low collar; narrow angular silhouette |
| \`pilot.st.004\` | **Anchor** | Broad-shouldered tank-crew operator in a rounded padded cap and muted olive armor bib |
| \`pilot.st.005\` | **Signal** | Adult pilot with close-cropped hair, visible face, rectangular ear defenders and neutral grey flight suit |

The base roster needs a mix of face visibility, ages within adult range, hair/skin tones and gear silhouettes, without binding skin tone to job/rarity.

### Three earnable service records — no payment required

| ID | Name | Earning rule (proposed) | Design / identity |
|---|---|---|---|
| \`pilot.er.001\` | **First Responder** | Complete 5 solo matches | Warm field-orange first-response collar and compact visor |
| \`pilot.er.002\` | **Vehicle Recovery** | Perform 8 valid pilot-to-vehicle boardings during matches | Utility rig, reinforced headset, short equipment lanyard |
| \`pilot.er.003\` | **Sector Veteran** | Win 12 solo matches | Worn but clean sealed combat visor, sand-colored armor trim |

Rules are placeholders for future instrumented progression. Count once per valid event; do not grant credit for repeatedly hopping into the same vehicle without match conditions. No unlock requires purchase, streak anxiety or ads.

### Ten proposed premium portraits — direct purchase, permanent entitlement

| ID | Name | Series | Differentiating silhouette / visual hook |
|---|---|---|---|
| \`pilot.pr.001\` | **Cold Cell** | Climate | Compact frost-blue thermal pilot hood with a narrow opaque visor |
| \`pilot.pr.002\` | **Redline** | Test Range | Angled racing-test helmet, muted vermilion seam and instrument cheek guard |
| \`pilot.pr.003\` | **Surveyor** | Recon | Slim monocular rangefinder mounted on a believable side hinge; olive-grey cap |
| \`pilot.pr.004\` | **Sentinel** | Armored | Squared jaw-guard / tanker helmet; ochre hazard-stripe insert, not a team color |
| \`pilot.pr.005\` | **Night Relay** | Recon | Low-visibility midnight headset with one small emerald comms diode |
| \`pilot.pr.006\` | **Field Engineer** | Support | Modular eye shield up on helmet, tool-compatible work collar, pale steel accent |
| \`pilot.pr.007\` | **Containment** | HazMat | Compact fully sealed industrial hood, amber-window eye protection and functional seams |
| \`pilot.pr.008\` | **Cerulean** | Prototype | Angular blue-grey lab trial helm with single satin cyan optic stripe |
| \`pilot.pr.009\` | **Black Cell** | Security | Covert graphite helmet with short split visor, no skull motif / fake insignia |
| \`pilot.pr.010\` | **Test Pilot** | Test Range | Off-white aerodynamic trial cap, clear face shield, low-key flight jacket |

**Premium positioning:** no rarity-dependent glow/animation, combat effect, hidden stat bonus, better in-match visibility or priority matchmaking. They are new **identities**, not advantages.

## Purchase groupings (conceptual)

- **Singles:** every premium can be purchased directly by name.
- **Optional packs:** \`RECON: Surveyor + Night Relay\`; \`TEST RANGE: Redline + Test Pilot\`; \`PROTOTYPE: Cerulean + Field Engineer\`. Only offer bundles if the game correctly handles already-owned components, refunds and restoration.
- No paid loot box, premium capsule, purchasable spin, or duplicate-random purchase in launch plan.
- Prices, SKU IDs, store descriptions and regional eligibility **not set yet**. Never render placeholder prices as real offers.
- Earned cosmetic capsules, if later offered, should be strictly free, duplicate-free and transparent about the selection pool; direct choice is an acceptable fallback.

## Production sequencing

**Wave A / style lock:** Recruit, Relay, Cold Cell (two free and one premium).  
**Wave B / basic identity:** Vector, Anchor, Signal.  
**Wave C / earned milestones:** First Responder, Vehicle Recovery, Sector Veteran.  
**Wave D / store proof:** Redline, Surveyor, Sentinel, Night Relay.  
**Wave E / store expansion:** Field Engineer, Containment, Cerulean, Black Cell, Test Pilot.

Each wave must pass the shared crop/line/palette review before the next.

## How to expand after release

Release **1–3 carefully designed portraits per content update**, never a requirement. Use existing series, add one unique gear silhouette per new icon and measure whether players equip them. Do not remove paid purchases or create fear-of-missing-out countdowns. Keep older unlocked/purchased items available in profiles and support entitlement restoration.

## Important technical note

This is a **planned catalog**. Until the Pilot Dossier has versioned saves and the Android app has secure billing, **do not** display unimplemented icons as available, selectable or purchasable. A future SKU registry should map durable \`pilot.pr.*\` IDs to verified Play Billing one-time **non-consumable** products, with restoration and purchase acknowledgement handled in Android.

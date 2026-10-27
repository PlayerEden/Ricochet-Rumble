# 22 — Lobby Juice, Simpler Pilot & Mild Zoom Revision

**Status: PROPOSAL ONLY. No camera, portrait or UI code changed by this document.**
**Date:** 2026-10-27.

## The game lobby

v0.9.20 already has a better hero tank and primary QUICK PLAY action. Remove self-explanatory filler such as 'NO ACCOUNT REQUIRED' and repetitive FIELDGRID READY metadata; move version/build details to Settings/About.

Animate the actual game hero slowly (idle turret movement, restrained mechanical reflection, turntable rotation) and perhaps crossfade between tank and mech on a 6–9 second interval. User may tap previous/next if it remains subtle. Reuse the game's actual renderers so the menu preview never resembles unrelated generated art. Keep QUICK PLAY large. Reduced motion should disable showroom animation if offered.

## On-foot pilot

At normal landscape zoom the v0.9.20 pilot can still read as a circular drone. Consider exactly TWO cheap concepts: (1) strict overhead ultra-simple round head/visor, thin torso, two visible legs, tiny hand/pistol; (2) slight 3/4 top-down anatomy while movement/aim remains top-down. No extra gizmos or pseudo military insignia. Compare at actual phone scale rather than enlarged art crops. Keep collision, speed, weapon stats untouched.

## Camera

Current unit target zoom is approx 1.22 tank, 1.16 mech and 1.24 pilot. Lower numbers mean more world view. Try a modest 6–8% more scene width/height across all three classes, maintaining smooth vehicle-sensitive zoom and not scaling the HUD. Measure at arena edges, with mini-map, pick-up readability and projectile tracking. Larger view may worsen already-small pilot legibility, so don't commit until both changes are viewed side-by-side.

## No decorative feature creep

Home music in a separate sound pass. Don't add inoperative Hangar, Player Profile, Shop or Matchmaking buttons until real systems exist. Mode selection UI should be a short panel or readable chips, not a wall of government jargon. Test actual 740×360, 915×412 and 1280×720 phone landscape layouts.

## Recommended staging

First a reversible v0.9.21 camera/menu pilot-only visual slice; then the architectural mode split. Hold off on cosmetic commercial screens until mode pacing is fun. The player has not yet approved the exact numeric zoom target or in-map Forward Bay design.

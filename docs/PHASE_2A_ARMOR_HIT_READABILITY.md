# Phase 2A — readable armor impacts versus on-foot pilot hits

**Problem:** the same circular visual `hit` effect previously displayed both vehicle armor damage and actual pilot life loss; their meanings for scored play are different.

**Experimental correction:** accepted vehicle armor damage now emits `armor`, a small cyan diamond-plate impact (0.55 second TTL, 12 short fragments, four directional ticks). A true on-foot `hit` still emits the original rounded pulse (0.75 seconds / 24 particles), and separate armor-break `eject` VFX remains unchanged. LAN snapshots include the same event and guest audio matches armor versus pilot impacts. No new UI, no additional screen shake.

**Unchanged rules:** hull turn rate/pivot, pilot/mech/AI input, damage/armor/lives, scored KO credit, projectile physics, match flow, map, camera, music volume, cosmetics, win conditions. Web and Android WebView asset contents are mirrored exactly.

**Automated acceptance:** real `registerHit` asserts one armor decrement without an operator KO/death, `armor` FX serialized to guest, and actual pilot damage separately emits `hit` and adds one death. Require exact-head fast + full Chromium/Android + signed preview tests.

**Manual gate:** on phone inspect armor strike, break/ejection and pilot KO visual clarity. If distracting or unnecessary, roll back to [approved 100004](https://github.com/PlayerEden/Ricochet-Rumble/tree/checkpoint/sector-rebound-preview-100004-approved). Phase 3 onboarding/touch, Phase 4 earned cosmetics, Phase 5 LAN/remote play, Phase 6 Play release/privacy remain separate future work and need independent approval/evidence.

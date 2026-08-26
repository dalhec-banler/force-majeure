# The Night Report, III — 2026-08-26 (audit night)

*Standing orders: consequential history only; storms spin; full audit top to
bottom; play as many games as possible, backend and on screen; get a high
score; push everything.*

## 1. The record, consequential only
- Storms kept only if they came ashore, or reached major strength within
  ~300 km of a coast: **443** of 761 tracked (NA 50 · WP 182 · EP 13 ·
  NI 89 · SI 59 · SP 50). Eruptions kept only if they damaged something:
  **11** (Sarychev, Bagana, Paricutín's cone years, Bezymianny's 1955
  precursor, Merapi 1953–54 out). Earthquakes already trimmed to the major
  15. Weather/famine/epidemic/tornado/fire/avalanche: 31, all sourced or
  removed (`docs/history-sources.md`).
- The record's verified dead now count on the DEATH TOLL header as they
  happen (a 1946–55 campaign carries ~1.24M: the Soviet famine, Ashgabat,
  the typhoon decade). Attributable stays modelled.
- Storms now visibly rotate as they travel (one turn ≈ 4 s; southern
  hemisphere clockwise).
- ENSO forcing now reaches every basin's storm season (El Niño recurves
  typhoons away from China and the Philippines and quiets Australia and
  the Bay; La Niña the reverse; the eastern Pacific wakes) — player-only
  forcing, so the rival's ocean work is never narrated as yours.
- `docs/teleconnections.md`: all 76 wires with mechanism and evidence grade
  (43 documented, 33 extrapolated, 0 fantasy) and every tool→ocean chain
  graded; the fantasy (Polar, T3) is named as such and kept plausible.

## 2. Audit — what was wrong and is now fixed
**Engine (5 major, 5 minor).** The flagship earmark was paid even when the
funded op was refused (free $60M; now `cmd.earmark` is drawn only by the op
that commits). Natural or rival noise reset the dissolution streak (now
idleness itself counts). A $8M research op every fourth season was
perpetual immunity (research keeps the appropriation, not the mandate to
exist: no signature/magnitude op in 8 seasons → obsolescent). Resilience
over 100 inverted drought into profit (capped at 90). Rival ocean ops were
narrated as the player's. Minor: clawback now in the purse; lag-0 edges
rejected at construction; hostile-op alerts can no longer leak an unknown
wire; harness containment clamped like the UI; ADR-0016 rewritten for the
wound-up rule.

**Console (4 major, ~12 minor).** The frame loop died silently on any throw
(now wrapped; the black-globe class is closed) and started before all parts
had loaded (kick-off moved to boot). `runSeason` could wedge the RUN SEASON
button forever on an exception (try/finally + a FAULT line). Standing
directives were blocked from S10 to S23 by the S24-gated "Answer them"
(fixed; the committee keeps writing). Typhoons, tornadoes, blizzards and
avalanches carried the wrong alteration sign (wetting Kanto "unmade"
Kathleen). Also: earmark fuse is exactly three commits; one funded flagship
per earmark; storm/authored dedupe on word boundaries; archive tallies no
longer count altered seasons as recorded; chyron backlog flushed each
season; hover forecast matches the globe's ring; research shows IN FLIGHT;
tools/globe inert while resolving; storms hold position instead of
teleporting while a season resolves; prediction text escaped; canvas font
cached; driver ops print the ocean's name.

**Not changed (judgement calls, for the author):** containment bought the
season a T3 lands is hushed at full efficiency (sheet behaviour); the tray
on a ≤460 px pane still stacks three rows over the globe (a phone layout is
its own job).

## 3. Games played
- Backend: every scripted campaign, repeatedly, through the harness (which
  now draws a frame every season so render errors surface): naive 40s
  running $17M / +$77M; flagship 40s running $146M / +$81M rung 2;
  craftsman wound up S36 / +$100M; scholar wound up S19 (research-only,
  by rule); rampage wound up S29 rung 3; exporter S15; turtle S15.
- On screen, through the real handlers (tool → region clicks → RUN SEASON):
  game 1 (pre-audit build) 40 seasons survived, +$119M, dossier peak 34,
  456 disasters as recorded / 13 altered, no errors; game 2 (audited build)
  a heavy early spender who stalled — wound up S32, +$127M, dossier peak 92,
  earmark drawn at S13 by a real ENSO commit, no lapses, no errors.
- Strategist's campaign sweep and high score: see §4.

## 4. High score
The strategist ran ~60 headless campaigns (files under
`prototype/web/tools/campaign-*.js`). Pre-fix, the best **valid** score was
**493** (`campaign-monsoonF.js`: onboarding, then Stratospheric Aerosol
×3 at S11, ×4 at S25 with the S28 earmark into ENSO, ×6 at S34; price
231–239 in the last seasons, mandate pinned at 100). A nine-stack reached
573 and exposed itself on the final row.

That was an exploit (ADR-0019: same-season stacks paid base signature; no
price ceiling; the mandate flywheel). After the fix the same campaigns
score:

| campaign | profit | funds | rung | status |
|---|---|---|---|---|
| **monsoonF** (three aerosol waves) | **396** | 52 | 6 (dossier 194) | running — the high score |
| monsoonE | 336 | 151 | 6 | running |
| researchstrike (research S1–8, then waves) | 283 | 41 | 2 | running |
| ensoflag (ENSO on both earmarks) | 210 | 108 | 2 | running |
| fortress (homeland shield) | 197 | 84 | 3 | running |
| pricehawk (dry the exporters) | 102 | 0 | 1 | wound up S38 |
| typhoon (14 adaptations + waves) | 357 | 252 | 7 | **exposed S34** |
| tempest7 / veilshield4 | 286 / 247 | — | 7 | **exposed** |
| naive (tutorial follower) | 73 | 0 | 1 | running, warned |
| flagship | 81 | 146 | 2 | running |

**High score to beat: 396**, `campaign-monsoonF.js`, dossier 194 of 200 at
the final row — the winning line is now a knife-edge, which is the point.

### What the sweep says about the game
- Cash is the real game and cheap play is unviable: idle income ≈ overhead
  + $4M; only mandate windfalls and earmarks fund anything. S1–10 is
  waiting for money; S14–18 and S28–33 are the good part.
- Single-region drying barely moves the price (~+2% per $14M watershed) —
  the "wheat exporter" archetype the fiction advertises is the weakest one.
  Hubs count in the grain supply index (semiconductors move the wheat
  price) — a model simplification worth fixing at the ladder session.
- The rival never mattered to a strong player (−10 revenue once vs
  +50–150/season from a wave). Climate Research has no score effect —
  its payoff is legibility, by design, but nothing rewards knowing the
  wiring yet.
- Protecting your own homeland during a wave is the most suspicious act in
  the game (repeat seeding compounds the signature) — which is either a bug
  or the best piece of fiction in it.

## 5. For the author
- **The economy is tight at 36 regions.** Income ≈ overhead + $5–9M when
  active; the game is won on grants, earmarks and the grain price, and lost
  by stalling. Several scripted players are wound up. If that is too harsh,
  the levers are overhead ($32M) and the idle trim (×0.6).
- Season pacing on screen runs ~8 s of animation per season when driven
  fast; the 45 s clock hides it, but RUN SEASON spam feels heavy.

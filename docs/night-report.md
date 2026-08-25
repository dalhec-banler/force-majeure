# Night Report — Full Audit, Spec Review & Playtest

**2026-08-24, overnight session. Auditor and playtester: Claude.**
Everything below was done against the live build; every fix mentioned is
committed and shipped. Four full campaigns were played through the real
game code via a headless harness (`prototype/web/tools/`), plus a live
browser session.

---

## 1. The verdict first

**The gate question — "is it fun to nudge an invisible system and watch
consequences arrive seasons later in the wrong country?" — is a yes, with
conditions.** I played four forty-season campaigns and got measurably
better at the game across them, using only knowledge the game itself
taught me. The moment that sold it: season 1 of my first browser run, the
meteorology desk whispered *"a strong Pacific swing is building — whatever
you do next season will have cover"* and I immediately started saving for
ENSO Forcing. That is the design working: the game made me want to wait,
and waiting felt like a move.

Would I come back? Yes — and for the right reason: my last campaign ended
with a plan for the next one ("open with adaptation, hold fires until the
first cover event, rotate three targets, never twice in eight seasons").
When a run ends mid-thought like that, the retention loop exists.

The conditions: the drama systems only fire when the player is ambitious
(a cautious helper sees a calm, low-tension decade), the mid-game has
quiet stretches where "wait for cover" is correct but undramatic, and the
big-ticket fantasy tools are priced at the edge of reach in disciplined
play. Details in §5.

---

## 2. Code audit

Read every line of `engine.js` (272) and `template.html` (~1760), plus
`build.py`. Findings, all fixed and committed tonight:

| # | Defect | Severity | Status |
|---|---|---|---|
| 1 | Landed-loop covert guard missing — rival ops rendered as the player's (the "phantom planes" Austin saw) | High | fixed earlier tonight |
| 2 | Eastern Program archive reveal clobbered out (second time) | Med | restored |
| 3 | Archive op-count and natural-variability verdict included rival ops | Med | fixed |
| 4 | Doubled "appropriation trimmed" memo; doubled first-landing guard | Low | deduped |
| 5 | Lag-0 tools described as "lands in 0 seasons" | Low | "acts this season" |
| 6 | Spherical aerosol glaze circles drawn over the flat map | Low | gated |
| 7 | Flood "HARVEST COLLAPSE …crop drowns at 100%" absurdity | Med | no-damage storm lines added |
| 8 | Unrest headlines at 87% harvest (nobody hungry) | Low | gated on yield < 78 |

Engine notes (not defects): jet-break active window is 4 seasons, not the
advertised 3; envelope-stress average was diluted by the 16-region
expansion (addressed by forensics, below).

**Process finding — the clobber pattern.** At least five times this
session, edits verified in one pass were silently reverted by a later
pass (two editing mechanisms holding stale snapshots of one giant file).
The feature-gate grep list now runs before every publish, but the real
fix is structural: split `template.html` into modules with a build step,
or move the console into a small bundler project. Recommended first task
of the next working session.

## 3. Spec compliance review

### Against the handoff's six non-negotiable constraints

| Constraint | Status |
|---|---|
| 1. Hand-authored teleconnection graph, not gridded model | **Holds.** All expansion regions use authored coeffs/lags; engine core is the sheet port (conformance 302.40 verified after every change tonight). |
| 2. Attribution = evidence dossier, ladder shown, number hidden | **Holds.** Number behind a playtest-only toggle; ladder + signal meter are the interface. |
| 3. Obsolescence viable — a turtle must lose | **Holds.** Pure idle: committee warnings from S12, bleeds to insolvency. Verified. |
| 4. Never moralizes | **Holds, deliberately maintained.** Death toll is framed as information; archive states, never judges ("Whether that is victory is not a question this office answers"). The puncture is unannounced and costless per §4.4. |
| 5. Content rules (no real modern disasters as caused, no real figures, no real brands) | **Holds.** Fictional firms (Halvorsen), invented events, pre-1946 precedents only. One watch item: the ALLEGED precedent for Watershed cites the 1938 Yellow River breach — a real atrocity, used as *the program's own internal rumor file*, pre-1946. I read it as §19.6-compliant (pre-1946 real events are free) but flagging for Austin's judgment. |
| 6. Beauty truthful, never applied; no ugliness as editorial | **Holds.** Every disaster is actual NASA/NOAA photography (Isabel, Raikoke, NSW smoke, Blue Marble). Aftermath imagery is exactly as beautiful as the real satellite record, which is the rule. |

### Against the brief's core pillars

- **Deniability as primary resource** — in and now *sharp* (see forensics).
- **Energy ledger** — present as displacement debts ("LEDGER DEBT" on the
  countdown board; "the ledger always settles"). The full conservation
  invariant is a production-engine item (ADR-0005), correctly absent here.
- **Delayed/displaced/nonlinear feedback** — the teleconnection chain is
  the game (El Niño S2 → Pacific S3 → Australian drought S4 → price S5).
- **Staggered maturity / session shape** — countdown board + burn-downs +
  debts keep 3-6 things in flight; seasons end mid-arc.
- **Media as satirical layer** — Halvorsen ads, the shortwave broadcaster,
  wrong-conclusion journalism, memos: all live.
- **Knowledge progression** — *the one core pillar not represented*: all
  edges are effectively visible (the prototype's GRAPH sheet was open
  too). Fine for the playtest; required for v0.1 proper.

### Against every session directive from Austin

Playable now / SimCity interface / news-feed messaging / countdown clocks
/ TRACE causal labels / mission planes and ships / Blue Marble + clouds /
two-axis drag + zoom + flat map / photographic hurricanes-volcanoes-smoke
/ slow rotation / economic hubs incl. Taiwan / ice-cap melt event / jet
stream breaks ≥55°N / instant tools with burn-down / death toll / sound /
boot screen + full fiction furniture / committee directives with tool
callouts / defunding rebalance / idle-exploit closure / attack alerts /
visible incoming strikes / condition-coded markers — **all present and
verified in the shipped build.** Not done: nothing from the list; partial:
tiny-LLM headlines consciously replaced by the authored corpus (agreed).

## 4. What I played (and what it proved)

All campaigns ran through the real `runSeason` path; policies are my
decisions codified, preserved in `prototype/web/tools/`.

**C1 — First Contact (naive, directive-following).** Survived 40. All 7
directives completed by S24. $102M profit, zero deaths, max rung 2.
*Proved:* onboarding works end-to-end; helper play is safe and gently
profitable; the wire is a pleasure to read. *Exposed:* a cautious player
never meets the drama systems.

**C2 — The Quiet Exporter → the fire-loop exploit.** Burned Australia 30
consecutive seasons: $237M, 4.0M dead, dossier 17, rung 1 forever.
**Degenerate dominant strategy found.** Root causes: flat signatures,
global-average envelope amplifier (halved by the 16-region expansion),
flat containment efficiency.

**The night's balance work (all engine-gated; sheet conformance 302.40
preserved and re-verified after each):**
1. *Forensics:* repeat strikes on one target compound signature (patterns
   are evidence); region signatures amplify by the **target's** envelope
   stress.
2. *Containment saturation:* efficiency 0.9/(1+dossier/60) — hush money
   buys less once questions circulate.
3. *Investigation ratchet:* at rung 5 ("a rival service names your
   programme") decay stops and the file grows +3/season on its own.
4. *Activity accounting:* burning effects count as committee-visible
   output — saving for a big op no longer reads as idleness (found this
   one by being strangled by it mid-campaign).

**C3 — Scorched Earth.** Post-fixes: the full ladder finally plays as a
story — spree → "SOMEONE IS ASKING QUESTIONS" (S6) → INTERCEPT (S9) → UN
inspectors (S11) → **EXPOSED, S14, dossier 220.** Separately, the polar
arc is the best five seasons in the game: strike → beam → jet stream
buckles → "Northwest Passage is open water" → **"The pole is blue.
Nobody alive has seen this before."**

**C4 — The Craftsman (everything learned).** Survived 40 at **maximum
rung 1 the entire game**: $163M profit, 327K dead, 8 windfalls, via
target rotation (never twice in 8 seasons), strike-only-under-cover, and
proactive containment. *Proved:* skill expression is real. The gradient —
naive $102M safe / craftsman $163M invisible / exploiter bankrupted or
exposed — is exactly the shape a strategy game needs.

## 5. Fun assessment, honestly

**What is genuinely fun:** the FILED stamp after a clean op (the heist
payoff lands every time); the cover-timing metagame (the Pacific-swing
memo is the single best hook in the game); reading TRACE like a guilty
conscience; the countdown board; the polar escalation arc; the moment the
first red streak hits your homeland; the archive's last word.

**What is not yet fun:** (1) *The safe path is flat* — a helper player
gets forty pleasant seasons and no story; severity, deaths, and rivals
should press in even on the cautious. (2) *Quiet stretches* — "wait for
cover" is correct play ~40% of seasons; correct but passive; the wait
needs more to do (intelligence, forecasting, positioning trades). (3)
*The flagship tools are museum pieces in honest play* — I never fired
ENSO or T3 in my disciplined run; a "war chest" or directive-funded
flagship op once a decade would fix it. (4) *Attribution punishes crime
financially before reputationally* — the ladder should be the thing that
scares you; it still climbs too slowly against diversified play.

**Would a human come back?** The archive ends by asking which season was
the most fun — my answer across four campaigns was always a season where
*a plan met the world*: S4 of the rampage (jet break), S17 of the
craftsman run (first fire under perfect cover). The game reliably
produces those seasons once the player is ambitious. Getting the cautious
player to ambition faster is the core remaining design problem — the
directives arc already does half of it.

## 6. Recommendations, priority order

1. **Split the monolith** (template → modules + bundler) before any more
   feature work; the clobber tax is the project's biggest velocity drain.
2. **Pressure the passive player**: rival ops on a schedule that targets
   *whatever the player loves* (their top client region), natural-disaster
   frequency floor, and directive deadlines with mandate penalties.
3. **Fund the fantasy**: one "flagship appropriation" per decade
   (committee offers $60M earmarked when mandate > 60) so ENSO/T3/Polar
   are events in every campaign, not spreadsheets' dreams.
4. **Ladder tuning session with Austin at the controls**: rung-3-by-
   mid-game should be the *normal* cost of an offensive style (numbers to
   try: base sigs ×1.5, decay 0.03, repeat window 12).
5. **Knowledge progression** (hidden edges + research) — the last unbuilt
   core pillar and the natural next system: it gives quiet seasons their
   activity (research choices).
6. Small polish list: jet window says 3 means 3; famine ⚠ overlaps zoom
   labels at high zoom; ambient cyclones can still clip coastlines;
   the LEDGER sparks remain underdesigned.

## 7. Session statistics

- 4 campaigns × 40 seasons headless + 1 live browser session
- 8 code defects fixed; 4 balance mechanisms added (all conformance-gated)
- Baseline verification run after every engine change: **302.40 every time**
- The pristine sheet extraction (`model-data.json`) remains untouched —
  the reference implementation contract of the technical design holds.

*Filed by the night shift. The programme continues without me.*

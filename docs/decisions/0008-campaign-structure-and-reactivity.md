# ADR-0008: Sandbox campaign with an authored event calendar; reactive window retained

**Status:** Accepted · 2026-08-24 (open question §23.4 + Appendix A item 5,
resolved under delegated authority)

## Context
Campaign structure was open between a scripted arc and a sandbox. Separately,
TDD Appendix A flagged the reactive window (stage R6) as a possible cut if
rivals were never directly visible.

## Decision
- **Sandbox with authored events, no authored plot.** The spine of a run is
  the historical calendar — real driver data, scheduled eruptions, ENMOD in
  1976, the declassification drumbeat — plus emergent consequences. No
  mission structure, no story gates.
- **The reactive window (TDD §2.7/R6) is retained**, whitelisted to
  counter-intervention capabilities, at the specified attribution premium.

## Rationale against the north star
Retention: a scripted arc is consumed once; a sandbox on a fixed historical
board is replayed the way openings are replayed — same 1946 position every
run (see ADR-0011), different games. Chess-feel decides the reactive window
too: the bait mechanic (brief §13) is the *forced move* — being compelled to
respond, at a cost you can see, is core chess tension and survives rivals
being invisible (pressure on a client forces your hand regardless of whether
you saw who applied it).

## Consequences
- Authoring effort goes into the event calendar and interrupt triggers
  (data, per ADR-0003), not into plot content.
- R6 stays in the pipeline; its whitelist and penalty are pack constants.
- "Emergent narrative" quality now rests on the consequence/attribution
  systems being legible — which gap #2 (interface design) must eventually
  carry.

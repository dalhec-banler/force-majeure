# ADR-0015: Knowledge progression in the console — hidden wires, Signals Research, observation, and a forecast that cannot leak

**Status:** Accepted · 2026-08-25 (delegated authority; night-report recommendation #5; implements brief §7.5 and ADR-0007 in the prototype)

## Context
The last core pillar not represented in the playtest console. Brief §7.5:
the player starts seeing ~20% of the graph's edges and research reveals
teleconnections — the tech tree is *knowledge of how the world is wired*.
ADR-0007: the board is public, the wiring is hidden. TDD §2.6 F1: the
forecast takes only the revealed edge subset. Austin's hard requirement
from the game-feel pass: every disaster carries a TRACE naming the player
ops that caused it (causal legibility).

## Decision
Engine, gated on `knowledge:true` (baseline untouched, 302.40):
- **Wires** = nonzero driver→region coefficients, excluding GLOBAL (the
  planet's temperature is public science). 36 in the expanded world.
- **Start**: the homeland's own wires plus the strongest others up to 20%
  (8 of 36). Deterministic.
- **Signals Research** — a $8M, lag-1, signature-0, magnitude-0 region tool
  (added in build.py; model-data.json stays pristine). On landing it reveals
  the strongest unknown wire into its target; if none remain, the money is
  spent and the wire says so. Research counts as activity for the committee.
- **Observation** — a driver swing ≥1.1 whose contribution to a region is
  ≥0.55 reveals its own wire, at most two a season. Big El Niño years teach
  the world to anyone paying attention.
- **Forecast** — `knowledge.forecast()` projects next season from known
  wires plus the player's own region ops scheduled to land. Never the
  noise. It is structurally impossible for it to read a hidden edge.

Console:
- Known wires are drawn on the globe from the driver marker to the region:
  amber dries when its ocean warms, cyan wets; dashed and faint at rest,
  signal dots run along a wire while its driver is loud, freshly revealed
  wires burn solid for three seasons. Footer toggle. The map filling in
  *is* the progression, visibly.
- Dashed forecast ring on each region marker; hover shows wires known of
  total, unknown count, and the known-wiring projection.
- WIRES n/36 header stat. Wire feed: RESEARCH / ANALYSIS lines with the
  plain-language reading ("a warm swing dries it two seasons later");
  "The board is complete" when all 36 are known.
- **Causal legibility kept**: your own ops are always traced; when part of
  your signal arrived through a hidden wire the TRACE says so in its own
  sentence — the unknown wire becomes the research prompt.
- Advisor memo when a severe season is mostly unexplained by known wires.
- Directives: onboarding "Read the wiring"; standing rotation gains "Map the
  world" (two wires in five seasons).
- Archive: wires understood at the end of tenure and the strongest never
  found — "some of what you called weather was those."

## Consequences
- Headless: the scholar campaign (research every quiet season) reaches
  34/36 by S33 and ends at ~$36M — research is a real spend; the naive
  player drifts to 15/36 from observation alone. Quiet seasons now have a
  decision.
- Rival ops through hidden wires remain hidden in the trace (ADR-0007 §3
  intact); counterintelligence detection is unchanged.
- Not done: per-edge *strength* uncertainty (a revealed wire shows exact
  sign and lag). Worth revisiting if the ladder tuning session finds
  research too strong.

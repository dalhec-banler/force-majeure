# ADR-0003: Uniform seasonal simulation tick; time compression is decision cadence, not sim resolution

**Status:** Accepted · 2026-08-24

## Context
The 1946–2060 campaign is ~460 seasonal turns — more than the *player* can
carry at uniform resolution (brief §5). Handoff §3.5 requires coarse early
ticks and fine late ticks to coexist without two simulation paths. Lags,
ledger schedules, and dossier decay are all denominated in seasons; any
aggregated "decade tick" is a second physics that must be kept in agreement
with the first, forever.

## Decision
The engine ticks in seasons for the entire campaign, always. Compression
lives entirely in the command layer and presentation:
- Standing orders (policies) expand into ordinary per-season commands in the
  log; the engine has no concept of a policy.
- Auto-advance batches seasons until a data-authored interrupt trigger fires.
- Cadence tiers are UI grouping + interrupt sensitivity profiles with zero
  engine meaning; step-up triggers (open question §23.6) can be anything.

Verified compute budget: ≤ ~50µs per tick at the largest contemplated graph;
full-campaign re-simulation ≤ ~25ms (technical-design §5.4).

## Consequences
- One physics, one lag semantics, one save format across the century; the
  chess-opening property (early ops paying off decades later) works without
  unit conversion.
- Saves and replays are cadence-blind.
- Cheap full re-simulation becomes a UI primitive (forecast counterfactuals,
  ending archive).
- Cost: early-game feel depends on interrupt/policy content quality — the
  design burden moves to data, which is where the designer can reach it.

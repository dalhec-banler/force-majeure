# ADR-0006: Graph scale — 64 regions, 5 drivers, hard cap 80/8

**Status:** Accepted · 2026-08-24 (open question §23.1, resolved under
delegated authority; tie-broken by the north star)

## Context
The brief bounds the answer at 50–80 ("40 is authorable and legible; 200 is
realistic and unbalanceable"). Engine budget is verified to 200+ (TDD §5.4),
so this is purely a legibility and authoring-cost decision.

## Decision
- **64 region nodes**, hand-authored, each with ≤ 6 inbound teleconnection
  edges (≈ 300–380 edges total — a hand-tunable volume).
- **5 drivers:** ENSO, IOD, NATL (AMO), PDO, GLOBAL. PDO is added to the
  prototype's four because the decadal oscillation is the natural carrier of
  the "pre-seed for a decade" strategy; SAM and others are deferred.
- Hard caps in the pack validator: 80 regions, 8 drivers. Raising a cap
  requires superseding this ADR.

## Rationale against the north star
Chess-feel demands a board a devoted player can eventually hold in their
head: 64 regions × a handful of edges is learnable the way openings are
learnable; 200 is weather. Retention lives in "I now understand why that
happened" — which has a ceiling on graph size. (That 64 is the number of
squares on a chessboard is noted with a straight face.)

## Consequences
- Authoring budget: ~350 edges each need a coefficient, lag, and reveal tier.
- Region masks (§6, ingestion) are authored once against the fixed 64.
- Nation starts (6 of them) pick homelands from these 64.

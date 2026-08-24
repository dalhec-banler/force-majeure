# ADR-0005: Energy ledger legs balance at posting; residual routes to envelope widening

**Status:** Accepted · 2026-08-24 — author delegated the decision after review;
accepted including the Cascade-threshold corollary. The feedback loop (heavy
intervention → wider envelopes → cheaper deniability) is retained as the
design's thesis made mechanical.

## Context
Brief §6.2: consequences are conserved. Handoff §3.4: make it a checked
invariant. But the reference implementation does not conserve — the
prototype's displacement factors (0.4–0.6) let 45–65% of every displaced
unit vanish. Asserting "net ≈ 0" over that model would be a permanently red
test. The spec must first say where the remainder goes.

## Decision (proposed)
Every operation posts ledger legs at commitment: injection legs, displacement
legs, and a balancing residual leg to a Background account, summing to exactly
zero by construction. Gameplay coefficients remain freely tunable; conversion
constants map magnitudes to energy units.

Residual legs, on landing, fold into the variance-envelope widening
accumulator (with slow decay). Checks: per-op closure asserted always;
per-tick settlement within ε; property tests over cancellation, save/load
mid-flight, reactive ops, and precondition-scaled magnitudes
(technical-design §4.4).

Secondary proposal: the Cascade loss condition triggers on the widening
accumulator crossing an authored threshold — "the ledger breaks" gets a
precise, testable meaning.

## Why this routing
It makes the brief's central claim mechanical: the wide envelope of 2050
literally is the accumulated residue of a century of operations (brief §5,
"and the player caused that"), with zero scripting.

## Consequences
- Conservation becomes enforceable on day one, including all truncation
  cases where it would otherwise silently die.
- Creates a real feedback loop: heavy intervention → wider envelopes →
  cheaper deniability for everyone. I believe this loop is the design's
  thesis; it is nonetheless a balance decision, hence PROPOSED, not Accepted.

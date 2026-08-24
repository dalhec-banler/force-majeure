# ADR-0004: Determinism policy — f64 with vendored deterministic math, counter-based RNG, chained state hashes

**Status:** Accepted · 2026-08-24

## Context
A campaign must be a pure function of (pack hash, engine version, master
seed, command log), bit-identical across OS and architecture (handoff §3.3).
The hazards: transcendental libm functions differ per platform (the price
curve alone uses `pow(x, 1.8)`); compiler fast-math/FMA contraction; RNG
draw-order sensitivity; hash-ordered iteration.

## Decision
- **Numbers:** IEEE-754 f64 for all simulation scalars, with every operation
  routed through a `simmath` module; transcendentals from a vendored
  cross-platform-identical libm; fast-math and FMA contraction disabled for
  the sim crate. Fixed-point (Q32.32) was considered and rejected for tuning
  ergonomics; `simmath` keeps migration to it a one-module change if the CI
  matrix ever falsifies this policy.
- **RNG:** no RNG state in world state. Every draw is a counter-based keyed
  hash of (master seed, registered domain, tick, entity id, draw index).
  Domain registration is ADR-visible. The physics of a tick uses zero draws;
  randomness exists only for event generation, rival doctrine, and flavor.
- **Iteration:** no hash-ordered container may be iterated in the sim crate
  (CI lint); all loops run in dense-ID or (tick, sub_seq) order.
- **Verification:** per-tick chained blake3 hash of canonically serialized
  state; golden-campaign replays, save/load equivalence, snapshot honesty,
  log sufficiency, and determinism fuzz run in CI across
  {macOS, Linux, Windows} × {x86-64, arm64} with chains compared across
  platforms (technical-design §3.7).

## Consequences
- Adding a random draw or a new math primitive is a visible, reviewed act.
- Cross-platform reproducibility is continuously proven, not assumed.
- Cost: a vendored libm to maintain, and CI hardware breadth from day one —
  both far cheaper than the failure they prevent.

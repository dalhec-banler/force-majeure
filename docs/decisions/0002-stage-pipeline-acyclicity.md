# ADR-0002: Tick ordering is enforced by a typed stage pipeline, not detected at runtime

**Status:** Accepted · 2026-08-24

## Context
The spreadsheet prototype produced a genuine circular reference: operation
magnitude read the prior season's anomaly (precondition), while anomalies
summed the whole magnitude column — including future rows. Every formula was
individually correct; the cycle appeared only on assembly, with the symptom
six columns downstream of the cause. The handoff names this the project's
highest-risk area and requires structural enforcement.

## Decision
Two rules (technical-design §2.2):
1. Within a tick, computation is a fixed pipeline of stages; each stage's
   output is frozen before the next runs, and a stage may read only the
   content pack, committed history `S[..t-1]`, the command log, and earlier
   frozen stages.
2. Nothing crosses ticks except committed history and scheduled effects; all
   edge/capability lags ≥ 1, validated at pack compile.

Enforced in order of strength by: (a) types — stage functions whose input
types contain only earlier-stage outputs, with move semantics consuming the
state builder; (b) declared reads/writes topologically sorted at boot, fail-
fast on cycle, access-tracing proxies in debug builds; (c) a conformance test
reproducing the prototype's 40 seasons row-for-row.

Corollary decided here: **preconditions bind at commitment time against
S[t-1]**, storing a resolved magnitude on the operation, so resolution stages
never consult preconditions at all.

## Consequences
- The spreadsheet's bug class is unrepresentable, not merely detected.
- Adding a system means declaring its stage position and access set; the
  sorted DAG is dumped as a build artifact and diffable between versions.
- Cost: same-tick feedback (e.g., a precondition reacting to the tick it
  lands in) is inexpressible by design; anything that needs it must be
  restructured as an explicit stage ordering.

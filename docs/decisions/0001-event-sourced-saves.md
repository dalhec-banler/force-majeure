# ADR-0001: Saves are event-sourced; the command log is the truth

**Status:** Accepted · 2026-08-24

## Context
The design rests on causal chains 4–8 seasons long across a 460-tick
campaign. A save that fails to reproduce bit-identically corrupts long
campaigns in ways that surface weeks later (handoff §3.3). Snapshot-only
saves make corruption undetectable: a wrong state is just a state.

## Decision
A save is `(engine version, pack hash, master seed, command log)`. Full-state
snapshots are included every K ticks purely as a load-time cache. Loading
replays from the nearest snapshot and verifies the recomputed hash chain
(ADR-0004 hashing) against the stored chain; mismatch is a hard, loud error.

## Consequences
- Corruption is converted from "silent, delayed" to "refused at load with a
  diagnostic."
- Requires the tick to be a pure function of pack + history + commands
  (see technical-design §3.1) and total ordering of commands (tick, sub_seq).
- Full-campaign replay must stay cheap; verified budget ~25ms for 460 ticks
  (technical-design §5.4).
- The ending archive and all retrospective features derive from the log for
  free.

# ADR-0011: Between-run persistence is informational only — same board every game

**Status:** Accepted · 2026-08-24 (gaps register #10, resolved under
delegated authority)

## Context
Brief §17: runs are compared, not won. What persists between runs — unlocks,
codex, records — was undefined, and the retention mandate makes this the
most retention-sensitive open item.

## Decision
Three things persist; none of them touch the simulation:
1. **The codex** — every entry read stays read; declassified appendices from
   finished runs accumulate into a permanent library.
2. **The archive shelf** — completed runs are kept whole (they are just
   command logs — ADR-0001 makes this nearly free) and browsable: what
   history concluded, what rivals actually did (ADR-0007 point 4), which of
   your operations stayed filed as natural variability.
3. **The record book** — comparable run outcomes: tenure, treasury peak,
   ops-filed-as-natural count, rungs survived, per nation start.

**No mechanical unlocks. No persistent capability, budget, or revealed-edge
carryover. Every run opens on the identical 1946 board.**

## Rationale against the north star
This is the chess criterion applied directly: chess retains players for a
lifetime with zero meta-progression, because the board is always equal and
the only thing that grows is the player. Revealed-edge carryover was the
tempting cut — it would gut knowledge progression (brief §7.5), which is the
in-run tech tree, and turn run two into a shorter, worse run one. Retention
comes instead from the archive: every ending is designed to produce the
sentence "next time, I'll—".

## Consequences
- Profile storage is a codex bitset, a directory of old saves, and a small
  records table. No sim coupling, no save-compat burden on balance patches.
- Nation starts (6 archetypes) are the replay axis; the record book is
  per-start to make each one a distinct ladder to climb.
- If retention testing ever demands more, the permitted lever is *content*
  gating (codex/media unlocks), never sim advantage; superseding this
  requires a new ADR.

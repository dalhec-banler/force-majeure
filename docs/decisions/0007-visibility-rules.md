# ADR-0007: Visibility — the board is public, the wiring is hidden, rivals are inferred in play and revealed by history

**Status:** Accepted · 2026-08-24 (open questions §23.2 and §23.3, resolved
under delegated authority)

## Context
Two open questions: is the trade graph visible at start, and does the player
ever directly see rival operations?

## Decision
1. **Trade graph: fully visible from turn one.** Your own positions, every
   region's production/consumption profile, world prices — all public.
2. **Teleconnection edges: hidden**, revealed by research (unchanged from
   brief §7.5). Hidden state lives in the *wiring of the world*, and in
   rival intent — never in the player's own position.
3. **Rival operations: never directly visible in play.** The player sees
   anomalies, residuals, and the suspicion distribution, and infers. No
   "enemy op completed" toast, ever.
4. **The Glomar clock applies to rivals too.** Rival operations declassify
   into the archive on the same 25/50-year timers, both mid-campaign (a 1962
   rival op surfaces in 1987 while you play) and at the end-of-run archive.

## Rationale against the north star
Chess: your position is never hidden from you — losing to exposure you could
not have seen is roulette, not chess. Poker's depth comes from hidden *hands*
(rival intent) on a public *table* (the trade board); that is the equilibrium
"everyone knows, nobody can prove" needs. Retention: point 4 is the
between-run learning loop — the archive teaches you to read the anomaly
patterns you misread live, which is exactly what brings a player back for
the next run.

## Consequences
- Forecast/UI takes revealed-edge subsets (already in TDD §2.6 F1); the same
  mechanism needs no trade-visibility variant.
- Rival ops are recorded in the same log/archive structures as player ops
  (they already are — TDD §2.6 C2), so declassification is a query, not a
  system.
- The reactive window retains its value (see ADR-0008).

# ADR-0009: Exposure recovery — descent is possible below rung 5; rung 5+ ratchets permanently

**Status:** Accepted · 2026-08-24 (open question §23.5, resolved under
delegated authority)

## Context
Once exposure begins climbing, is there a comeback path, or is a death
spiral correct?

## Decision
- Ladder rungs 1–4 (graduate student → attribution study) are **recoverable**:
  with containment spend and quiet seasons, the dossier decays and the rung
  descends, one rung per sustained quiet period (pack-tunable N seasons below
  the rung threshold).
- Reaching rung 5 ("a rival service names your program in a classified
  brief") sets a **permanent dossier floor** — institutional memory:
  intelligence services do not forget, whatever the press cycle does. Rungs
  5–6 can be held and even nominally descended in *display*, but the floor
  means every future operation starts closer to the fire.
- Rung 7 (Exposed) remains terminal.

## Rationale against the north star
Retention first: a pure death spiral makes players abandon runs at rung 4
and reroll — spectating your own loss is the worst session shape. Chess
decides the form of the fix: you can defend a bad position, but the weakness
stays on the board. A recoverable-but-scarring ladder makes the late
midgame *tenser*, not safer — you are playing on with a permanent structural
weakness, which is exactly the feeling wanted.

## Consequences
- Dossier gains a `floor` field updated on rung-5 crossing (one line of
  state; the ladder stays derived).
- Containment spending has a real decision gradient at every rung except 7 —
  it is never a pure tax and never a full absolution.
- Tuning targets: rung 4→3 descent should feel earned (~2 years quiet);
  rung 5 crossing should be a campaign-defining event.

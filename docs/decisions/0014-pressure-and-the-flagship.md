# ADR-0014: The world does not wait — directive fuses, standing demands, a rival that reads your flight logs, and the flagship earmark

**Status:** Accepted · 2026-08-25 (delegated authority; night-report recommendations #2 and #3)

## Context
Four headless campaigns (docs/night-report.md) showed the late game going
quiet: after onboarding, a player who "holds" faces no demand, the rival's
schedule is fixed regardless of what the player does, and the expensive
tools (ENSO, T3, Polar) were never fired in any campaign because no
treasury ever reached them while the ladder was still safe. The north star
is retention; quiet seasons are where players leave.

## Decision
Three gated mechanisms. The engine's no-rivals baseline (treasury 302.40)
is unchanged; every new engine path is behind `rivals:true` or a new
`cmd.clawback` field the baseline never sends.

1. **Directive fuses.** Every committee directive carries a window
   (5–8 seasons for onboarding, 3–5 for later demands). Completion pays the
   reward next season (`cmd.grant`, as before); lapse claws back half
   (`cmd.clawback`) and the minutes record it. A `goal` directive ("Hold
   the line") is judged at its deadline and fails the moment the line breaks.
2. **Standing directives.** After onboarding the committee keeps writing:
   an unanswered attack on the homeland first ("Answer the Steppe"), a
   failing client second ("Protect the client"), else a rotation — move the
   wheat number / show the flag / hold the line. Never the same demand twice
   running. Two seasons of "drafting language" between them.
3. **The rival reads your flight logs.** From season 21, every seventh
   season the Eastern Program works the harvest the player has protected
   hardest (most relief-seeding/adaptation in 16 seasons, never the homeland
   or its own steppe). A programme with no signature op in eight seasons
   also gets its own watershed hit off-cycle. Counterintelligence names it:
   "they are reading our flight logs."
4. **Flagship earmark.** Twice a campaign (S12, S28) the committee finds
   $60M in a classified line for one demonstration — ENSO, T3, or Polar —
   with a three-season fuse. Drawn the season a flagship op is sealed;
   otherwise "the Navy sends its regards." The earmark funds the fantasy;
   the signature is still the player's.

## Consequences
- The turtle now lapses two directives and is dissolved by S15; the naive
  player survives forty seasons at ~$36M with two lapses on the record; an
  active player draws both earmarks and finishes at ~$200M and rung 2.
- Money is therefore not the binding constraint on active play — the
  dossier ladder is. That is the ladder-tuning session (night report #4),
  which stays with the author.
- The night report's "natural-disaster frequency floor" was *not* adopted:
  it would alter the authored climate substrate. The rival's escalation
  does the same job without touching the record.
- The play harness gained `directiveLeft`, `flagship`, `lapses` in its
  view, plus two campaigns: `campaign-turtle.js` and `campaign-flagship.js`.

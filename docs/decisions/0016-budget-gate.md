# ADR-0016: You cannot spend money you do not have

**Status:** Accepted · 2026-08-25 (author rule: "I shouldn't be able to accidentally overpay for something and then the game ends")

## Decision
- An operation whose cost exceeds the purse at commitment is refused; the
  containment budget is clamped to what remains. The purse is the treasury
  plus any earmark or directive grant landing that season, **minus the
  season's overhead** — you cannot spend the rent.
- Engine: `budgetGate:true` (default off; the conformance baseline commits
  no ops and is unchanged at 302.40). Refusals are recorded on the row and
  reported on the wire ("TREASURY — … refused: not in the budget").
- Console: unaffordable tools grey out with the price in red; the second
  slot is limited by what the first left; the containment slider's ceiling
  is the remaining purse; the header shows SPENDABLE (treasury − overhead).
  The flagship earmark counts as payment for its op.

## Consequences
- Insolvency remains a loss condition but is reachable only by attrition:
  an idle programme's trimmed appropriation (~$26M) is below the $32M
  overhead, so a broke programme bleeds ~$6M a season until the committee
  dissolves it or the treasury runs dry — whichever comes first — unless
  something happens (a directive reward, the flagship earmark, or a
  frightened committee). Verified: a campaign that tries to buy T3 + ENSO +
  full containment every season is refused 21 times and ends insolvent at
  S11 by attrition, never by purchase.
- Open for the author: whether attrition insolvency should instead floor
  at $0 and leave dissolution as the only ending for a broke programme.

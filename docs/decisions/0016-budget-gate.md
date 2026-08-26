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

## Consequences (revised 2026-08-26)
- **A broke programme is wound up, not bankrupted.** When nothing was
  spent and the rent alone would drive the treasury negative, the committee
  carries the rent while it deliberates: the treasury floors at zero and the
  season counts as obsolescent. Four such reviews and the programme is
  dissolved. Insolvency remains on the books only for the pathological case
  (a clawback exceeding a season's income), which does not occur in play.
- **Idleness itself counts.** The dissolution streak no longer resets when
  the weather or the rival raises severity; a programme with no signature
  or magnitude operation in eight seasons is obsolescent whatever the
  mandate. Research and adaptation keep the appropriation (no trim) but not
  the mandate to exist.
- **The flagship earmark is drawn only by the op it funds** (`cmd.earmark`);
  a refused flagship op leaves the earmark on the table. One funded flagship
  op per earmark.
- Verified: the idle 36-region programme is wound up at S15; a research-only
  programme is warned from S9; a campaign that tries to buy T3 + ENSO + full
  containment every season is refused throughout and never goes negative.

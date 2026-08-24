# ADR-0013: The core-loop gate is tested in the visual console, not the spreadsheet

**Status:** Accepted · 2026-08-24 (author-directed)

## Context
The handoff gates all gameplay code on playing the spreadsheet prototype
honestly for forty seasons. On seeing the setup, the author redirected:
the fun will not be legible in a spreadsheet — it lives in watching the
treasury drain, the earth change, the consequences arrive *visually*. The
brief agrees in principle: beauty-as-complicity is a core pillar (§4.2,
§15), and the gaps register's #2 (interface/legibility) is named as the
design's largest risk. A gate that cannot measure the thing it gates is the
wrong instrument.

## Decision
The gate question — *is nudging an invisible system and watching delayed,
displaced consequences fun?* — is answered by playing
`prototype/web/console.html`: a browser ops-console wrapping the **exact
same forty-season micro-model** as the workbook. The engine
(`prototype/web/engine.js`) is a formula-for-formula port of the ENGINE
sheet, cross-verified against an independent Python implementation to
1e-14 over both a no-op baseline and a scripted campaign. The spreadsheet
remains the reference implementation of the math; the console is the
reference instrument for the *experience*.

The console is prototype-tier code and inherits the prototype's status: if
the loop needs rework, it is discarded with the workbook. It is not `sim/`,
which stays frozen per handoff §5. One house rule marked as such: four
consecutive obsolescence-warning seasons dissolve the programme (the sheet
only warns), serving handoff constraint 3.

## Consequences
- The gate can now measure presentation-dependent fun — which the author
  has identified as where the fun actually is. That is itself a finding to
  carry into the eventual UI design (gap #2).
- The playtest asks for per-season predictions and replays them in the
  end-of-run archive, operationalising the workbook's "expected vs
  happened" protocol.
- Risk acknowledged: a beautiful shell can flatter a weak loop. The
  archive's prediction-match count is the guard — the loop is judged on
  legibility-under-delay, not on whether the globe is pretty.

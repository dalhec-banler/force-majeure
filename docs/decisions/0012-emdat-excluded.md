# ADR-0012: EM-DAT is excluded from all build profiles; severity calibration uses substitutes

**Status:** Accepted · 2026-08-24 (gaps register #11 / handoff §4 flagged risk)

## Context
EM-DAT carries a non-commercial license; parts of FAOSTAT are CC BY-NC-SA.
The handoff flags this as cheap to solve now, expensive later. The license
gate (TDD §6.5) already fails a Commercial pack containing non-commercial
rows — the open question was whether to carry EM-DAT in Research builds and
swap later.

## Decision
EM-DAT is not ingested at all, in any profile. Its only proposed role was
calibrating severity thresholds; that is served by public-domain substitutes:
NOAA Storm Events, NOAA billion-dollar disasters, HURDAT2 impact fields, and
authored calibration against the historical record. FAOSTAT is retained with
per-series license tags; any CC BY-NC-SA series is excluded from Commercial
packs by the existing gate.

## Rationale
Carrying a non-commercial dataset "temporarily" grows roots — thresholds get
tuned against it, and the eventual swap becomes a rebalance. Excluding it
now costs a slightly worse initial calibration, which the balance pass (gap
#3, not yet started) would have redone anyway.

## Consequences
- `ingest/sources/` has no EM-DAT module; the substitute (NOAA Storm Events)
  gets one when severity calibration work begins.
- No license agreement to negotiate; nothing to unwind at release.

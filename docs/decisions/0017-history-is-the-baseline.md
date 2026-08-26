# ADR-0017: History is the baseline; the player perturbs it

**Status:** Accepted · 2026-08-25 (author decision, supersedes the Divergence Rule of brief §19 for events; the Geophysical Exception stands)

## Context
Brief §19 held that post-1946 events are fictional ("the 1965 hurricane is
invented") with real climate *data* as the substrate. The author has
decided otherwise: every hurricane, cyclone, eruption, earthquake, flood,
famine, drought and epidemic on the board is the real one from the
historical record. Earthquakes and eruptions cannot be interfered with;
weather-driven events happen as recorded unless the player's actions have
pushed the region or the ocean against the record.

## Decision
- `prototype/web/history.json` (built by `tools/extract-history.py`) is
  the record: every Atlantic hurricane 1946–1955 from raw HURDAT2 with real
  names, dates, daily track points and landfalls; authored catalogues of
  real eruptions, earthquakes and major weather disasters.
- **Geophysics is canon and untouchable** until the player's first
  lithospheric operation (T3), when "the historical record stops" and a
  fictional catalogue takes over — the brief's own beat, kept.
- **Storms** run their real tracks during their real season. Forcing the
  Atlantic (NATL beyond nature) scales them: > +1.0 makes the season worse
  than the record; < −1.0 unmakes it ("the storms the almanacs expected
  did not form").
- **Weather disasters** fire as recorded unless the *player's own* traced
  contribution to that region opposes the event by more than 0.3 (unmade)
  or reinforces it (worse). The substrate's realism does not decide this —
  the player's hand does.
- The archive reports history on your watch: as recorded / unmade / worse.

## Consequences
- Authored dates come from general knowledge and must be verified against
  Smithsonian GVP, USGS/ISC and the period record (flagged in the file).
- Other basins need IBTrACS (NOAA, public) for real typhoon and cyclone
  tracks; until then they are absent rather than faked.
- The 16-region board cannot host much of the record (no China, Japan,
  Europe, California, Brazil); region expansion is the next step.

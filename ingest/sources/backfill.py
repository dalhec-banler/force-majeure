"""Authored ENSO values for 1946-1949 (ONI coverage starts DJF 1950).

Flagged AUTHORED, never OBSERVED — the pack records the flag per season and
the sim/UI may surface it (a codex-honest "reconstructed" marker).

Values are hand-written from the historical record's shape, not measured:
1946-47 carried a weak-to-moderate El Niño (documented South American
manifestations); 1948 was near-neutral; 1949 declined steadily into the
strong 1949-51 La Niña whose first observed ONI value is DJF 1950 = -1.32.
The authored series ends at SON 1949 = -1.1 to meet that observed point
without a jump. Replace freely with a proper reconstruction (e.g. an
ERSST-derived Niño3.4 extension) — that upgrade changes flags from AUTHORED
to BACKFILLED and nothing else downstream.
"""

from __future__ import annotations

from pathlib import Path

from ..schema import Flag, License, Observation, ScopeKind, season_index

SOURCE = "backfill"
NOTE = ("authored pre-ONI ENSO shape: weak 1946-47 El Nino, neutral 1948, "
        "decline into observed DJF-1950 La Nina (-1.32)")

# (year, [Winter, Spring, Summer, Autumn])
_VALUES = [
    (1946, [0.1, 0.2, 0.3, 0.4]),
    (1947, [0.5, 0.4, 0.2, 0.0]),
    (1948, [-0.1, -0.1, -0.2, -0.3]),
    (1949, [-0.5, -0.7, -0.9, -1.1]),
]


def normalize(_raw: Path | None = None) -> list[Observation]:
    return [
        Observation(
            source=SOURCE, dataset_version="authored-v1",
            variable="enso_index", scope_kind=ScopeKind.DRIVER, scope="enso",
            season=season_index(year, q), value=v, unit="index_degc",
            license=License.PUBLIC_DOMAIN, flag=Flag.AUTHORED, note=NOTE,
        )
        for year, quarters in _VALUES
        for q, v in enumerate(quarters)
    ]

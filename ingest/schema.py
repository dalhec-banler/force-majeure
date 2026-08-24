"""Canonical observation schema and season-index conventions.

Everything the pipeline produces is a row of `Observation`. All source
quirks must be resolved before rows are emitted; nothing downstream of a
source module may branch on which source a row came from.

Season convention (technical-design.md, conventions header):
    t = (year - 1946) * 4 + quarter
    quarter 0 = Winter (DJF, labeled by the year of the Jan/Feb)
    quarter 1 = Spring (MAM), 2 = Summer (JJA), 3 = Autumn (SON)
Pre-1946 seasons are negative and legal (used for baselines only).
"""

from __future__ import annotations

import dataclasses
import enum
from pathlib import Path

EPOCH_YEAR = 1946
QUARTER_NAMES = ("Winter", "Spring", "Summer", "Autumn")
# Months composing each quarter; Winter's December belongs to the PRIOR year.
QUARTER_MONTHS = {0: (12, 1, 2), 1: (3, 4, 5), 2: (6, 7, 8), 3: (9, 10, 11)}


class License(str, enum.Enum):
    PUBLIC_DOMAIN = "public_domain"
    ATTRIBUTION = "attribution"
    NON_COMMERCIAL = "non_commercial"
    RESTRICTED = "restricted"


class ScopeKind(str, enum.Enum):
    DRIVER = "driver"
    REGION = "region"
    BASIN = "basin"
    GLOBAL = "global"


class Flag(str, enum.Enum):
    OBSERVED = "observed"
    BACKFILLED = "backfilled"  # reconstructed from a secondary source
    AUTHORED = "authored"      # hand-written; must carry a rationale note


@dataclasses.dataclass(frozen=True)
class Observation:
    source: str              # "oni", "dmi", "amo", "pdo", "hurdat2", ...
    dataset_version: str
    variable: str            # "enso_index", "iod_index", "cyclone_count", ...
    scope_kind: ScopeKind
    scope: str               # driver/region/basin slug, or "" for global
    season: int              # canonical season index t
    value: float
    unit: str                # "index_degc", "count", ...
    license: License
    flag: Flag = Flag.OBSERVED
    note: str = ""           # required non-empty when flag == AUTHORED

    def __post_init__(self) -> None:
        if self.flag == Flag.AUTHORED and not self.note:
            raise ValueError(
                f"authored observation {self.variable}@t={self.season} "
                "must carry a rationale note"
            )


def season_index(year: int, quarter: int) -> int:
    if not 0 <= quarter <= 3:
        raise ValueError(f"quarter must be 0..3, got {quarter}")
    return (year - EPOCH_YEAR) * 4 + quarter


def season_of(t: int) -> tuple[int, int]:
    """Inverse of season_index -> (year, quarter)."""
    year, quarter = divmod(t, 4)
    return year + EPOCH_YEAR, quarter


def season_label(t: int) -> str:
    year, quarter = season_of(t)
    return f"{year} {QUARTER_NAMES[quarter]}"


def monthly_to_seasonal(
    monthly: dict[tuple[int, int], float]
) -> dict[int, float]:
    """Aggregate {(year, month): value} to {season_index: mean}.

    Winter of year Y averages Dec(Y-1), Jan(Y), Feb(Y). A season is emitted
    only when all three months are present — partial seasons at series edges
    are dropped rather than silently averaged over fewer months.
    """
    out: dict[int, float] = {}
    years = {y for (y, _) in monthly}
    for year in sorted(years):
        for quarter, months in QUARTER_MONTHS.items():
            vals = []
            for m in months:
                y = year - 1 if (quarter == 0 and m == 12) else year
                if (y, m) in monthly:
                    vals.append(monthly[(y, m)])
            if len(vals) == 3:
                out[season_index(year, quarter)] = sum(vals) / 3.0
    return out


# ---------------------------------------------------------------- parquet IO

COLUMNS = [
    "source", "dataset_version", "variable", "scope_kind", "scope",
    "season", "value", "unit", "license", "flag", "note",
]


def write_observations(obs: list[Observation], path: Path) -> None:
    import pandas as pd

    df = pd.DataFrame(
        [[getattr(o, c).value if isinstance(getattr(o, c), enum.Enum)
          else getattr(o, c) for c in COLUMNS] for o in obs],
        columns=COLUMNS,
    ).sort_values(["variable", "scope", "season"], kind="stable")
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(path, index=False)


def read_observations(path: Path) -> list[Observation]:
    import pandas as pd

    df = pd.read_parquet(path)
    return [
        Observation(
            source=r.source, dataset_version=r.dataset_version,
            variable=r.variable, scope_kind=ScopeKind(r.scope_kind),
            scope=r.scope, season=int(r.season), value=float(r.value),
            unit=r.unit, license=License(r.license), flag=Flag(r.flag),
            note=r.note,
        )
        for r in df.itertuples()
    ]

"""PDO index (ERSSTv5, via NOAA PSL) -> driver.pdo (added by ADR-0006).
Public domain. CSV: one "date, value" row per month; header line first.
Coverage 1854-present.
"""

from __future__ import annotations

from pathlib import Path

from ..manifest import RAW_DIR, download, record_fetch
from ..schema import Flag, License, Observation, ScopeKind, monthly_to_seasonal

SOURCE = "pdo"
URL = "https://psl.noaa.gov/pdo/data/pdo.timeseries.ersstv5.csv"
MISSING = -9999.0


def fetch() -> Path:
    dest = RAW_DIR / "pdo.timeseries.ersstv5.csv"
    download(URL, dest)
    record_fetch(SOURCE, URL, dest, dataset_version="psl-pdo-ersstv5-live")
    return dest


def normalize(raw: Path) -> list[Observation]:
    monthly: dict[tuple[int, int], float] = {}
    for line in raw.read_text().splitlines()[1:]:
        parts = [p.strip() for p in line.split(",")]
        if len(parts) != 2 or not parts[0]:
            continue
        try:
            year, month = int(parts[0][0:4]), int(parts[0][5:7])
            value = float(parts[1])
        except ValueError:
            continue
        if value > -90.0 and abs(value - MISSING) > 1e-9:
            monthly[(year, month)] = value

    seasonal = monthly_to_seasonal(monthly)
    obs = [
        Observation(
            source=SOURCE, dataset_version="psl-pdo-ersstv5-live",
            variable="pdo_index", scope_kind=ScopeKind.DRIVER, scope="pdo",
            season=t, value=v, unit="index_degc",
            license=License.PUBLIC_DOMAIN, flag=Flag.OBSERVED,
        )
        for t, v in sorted(seasonal.items())
    ]
    if not obs:
        raise ValueError(f"no PDO rows parsed from {raw}")
    return obs

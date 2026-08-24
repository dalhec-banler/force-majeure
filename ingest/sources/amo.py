"""AMO index, unsmoothed (Kaplan SST, via NOAA PSL) -> driver.natl.
Public domain distribution. Monthly; aggregated to seasons in-module.
The prototype's NATL driver maps here. Coverage 1856-present.
"""

from __future__ import annotations

from pathlib import Path

from ..manifest import RAW_DIR, download, record_fetch
from ..schema import Flag, License, Observation, ScopeKind, monthly_to_seasonal
from .psl_common import parse_psl_monthly

SOURCE = "amo"
URL = "https://psl.noaa.gov/data/correlation/amon.us.long.data"


def fetch() -> Path:
    dest = RAW_DIR / "amon.us.long.data"
    download(URL, dest)
    record_fetch(SOURCE, URL, dest, dataset_version="psl-amo-unsmoothed-live")
    return dest


def normalize(raw: Path) -> list[Observation]:
    seasonal = monthly_to_seasonal(parse_psl_monthly(raw.read_text()))
    obs = [
        Observation(
            source=SOURCE, dataset_version="psl-amo-unsmoothed-live",
            variable="natl_index", scope_kind=ScopeKind.DRIVER, scope="natl",
            season=t, value=v, unit="index_degc",
            license=License.PUBLIC_DOMAIN, flag=Flag.OBSERVED,
        )
        for t, v in sorted(seasonal.items())
    ]
    if not obs:
        raise ValueError(f"no AMO rows parsed from {raw}")
    return obs

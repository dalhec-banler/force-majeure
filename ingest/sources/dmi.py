"""Dipole Mode Index (HadISST-based, via NOAA PSL) -> driver.iod.
Public domain distribution. Monthly; aggregated to seasons in-module.
Coverage 1870-present: fully covers the campaign epoch.
"""

from __future__ import annotations

from pathlib import Path

from ..manifest import RAW_DIR, download, record_fetch
from ..schema import Flag, License, Observation, ScopeKind, monthly_to_seasonal
from .psl_common import parse_psl_monthly

SOURCE = "dmi"
URL = "https://psl.noaa.gov/gcos_wgsp/Timeseries/Data/dmi.had.long.data"


def fetch() -> Path:
    dest = RAW_DIR / "dmi.had.long.data"
    download(URL, dest)
    record_fetch(SOURCE, URL, dest, dataset_version="psl-dmi-had-live")
    return dest


def normalize(raw: Path) -> list[Observation]:
    seasonal = monthly_to_seasonal(parse_psl_monthly(raw.read_text()))
    obs = [
        Observation(
            source=SOURCE, dataset_version="psl-dmi-had-live",
            variable="iod_index", scope_kind=ScopeKind.DRIVER, scope="iod",
            season=t, value=v, unit="index_degc",
            license=License.PUBLIC_DOMAIN, flag=Flag.OBSERVED,
        )
        for t, v in sorted(seasonal.items())
    ]
    if not obs:
        raise ValueError(f"no DMI rows parsed from {raw}")
    return obs

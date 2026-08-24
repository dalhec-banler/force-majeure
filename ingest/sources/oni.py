"""NOAA CPC Oceanic Niño Index -> driver.enso. Public domain (US Gov).

Format: whitespace table with header "SEAS YR TOTAL ANOM"; SEAS is a
3-month running window (DJF, JFM, FMA, ...). We keep only the four
non-overlapping windows matching our season convention:
DJF -> Winter (labeled by the Jan/Feb year, matching our convention),
MAM -> Spring, JJA -> Summer, SON -> Autumn.
Coverage starts 1950; 1946-49 is supplied by sources/backfill.py.
"""

from __future__ import annotations

from pathlib import Path

from ..manifest import RAW_DIR, download, record_fetch
from ..schema import Flag, License, Observation, ScopeKind, season_index

SOURCE = "oni"
URL = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt"
SEASON_MAP = {"DJF": 0, "MAM": 1, "JJA": 2, "SON": 3}


def fetch() -> Path:
    dest = RAW_DIR / "oni.ascii.txt"
    download(URL, dest)
    record_fetch(SOURCE, URL, dest, dataset_version="cpc-oni-live")
    return dest


def normalize(raw: Path) -> list[Observation]:
    obs: list[Observation] = []
    for line in raw.read_text().splitlines():
        tok = line.split()
        if len(tok) != 4 or tok[0] not in SEASON_MAP:
            continue
        year, anom = int(tok[1]), float(tok[3])
        obs.append(Observation(
            source=SOURCE, dataset_version="cpc-oni-live",
            variable="enso_index", scope_kind=ScopeKind.DRIVER, scope="enso",
            season=season_index(year, SEASON_MAP[tok[0]]),
            value=anom, unit="index_degc",
            license=License.PUBLIC_DOMAIN, flag=Flag.OBSERVED,
        ))
    if not obs:
        raise ValueError(f"no ONI rows parsed from {raw}")
    return obs

"""NHC HURDAT2, Atlantic basin -> per-season cyclone activity counts.
Public domain (US Gov).

Per the divergence rule (brief §19 / technical-design §6.4) this source's
role is STATISTICAL: post-1946 storms are never literal game events. We emit
per-season counts (named storms reaching TS+, and hurricanes) which the pack
compiler pairs with ENSO state to fit event-generator parameters. Pre-1946
storms are additionally usable as codex material.

The dataset filename carries its release date and changes on revision, so
fetch() discovers the current Atlantic file from the NHC data index page.

Format: header lines "AL011851, UNNAMED, 14," followed by that many track
rows "16010618, HU, ..." (yyyymmddhh, record id, status, lat, lon, wind, ...).
A storm is assigned to the season of its first track row; its peak status
over all rows decides whether it counts as a hurricane.
"""

from __future__ import annotations

import re
from pathlib import Path

from ..manifest import RAW_DIR, download, record_fetch
from ..schema import Flag, License, Observation, ScopeKind, season_index

SOURCE = "hurdat2"
INDEX_URL = "https://www.nhc.noaa.gov/data/"
# Parse the actual href (the directory has moved before: /data/hurdat/ today)
HREF_RE = re.compile(r'href="(/data/[^"]*hurdat2-1851-\d{4}-\d+\.txt)"')
TS_PLUS = {"TS", "HU"}  # peak-status classes counted as a named storm


def fetch() -> Path:
    import requests

    index = requests.get(
        INDEX_URL, timeout=60,
        headers={"User-Agent": "force-majeure-ingest/0.1"}).text
    hrefs = sorted(set(HREF_RE.findall(index)))
    if not hrefs:
        raise RuntimeError(f"no Atlantic HURDAT2 link found at {INDEX_URL}")
    href = hrefs[-1]
    name = href.rsplit("/", 1)[-1]
    url = f"https://www.nhc.noaa.gov{href}"
    dest = RAW_DIR / name
    download(url, dest)
    record_fetch(SOURCE, url, dest, dataset_version=name)
    return dest


def _season_of_date(yyyymmdd: str) -> int:
    year, month = int(yyyymmdd[0:4]), int(yyyymmdd[4:6])
    if month in (12, 1, 2):
        return season_index(year + 1 if month == 12 else year, 0)
    return season_index(year, (month - 3) // 3 + 1)


def normalize(raw: Path) -> list[Observation]:
    storms_per_season: dict[int, int] = {}
    hurricanes_per_season: dict[int, int] = {}

    lines = raw.read_text().splitlines()
    i = 0
    while i < len(lines):
        header = lines[i].split(",")
        if len(header) < 3 or not header[0].strip().startswith("AL"):
            i += 1
            continue
        n_rows = int(header[2])
        rows = lines[i + 1: i + 1 + n_rows]
        i += 1 + n_rows
        if not rows:
            continue
        first = rows[0].split(",")
        season = _season_of_date(first[0].strip())
        statuses = {r.split(",")[3].strip() for r in rows if r.count(",") >= 3}
        if statuses & TS_PLUS:
            storms_per_season[season] = storms_per_season.get(season, 0) + 1
        if "HU" in statuses:
            hurricanes_per_season[season] = (
                hurricanes_per_season.get(season, 0) + 1)

    version = raw.name
    obs = [
        Observation(
            source=SOURCE, dataset_version=version, variable=var,
            scope_kind=ScopeKind.BASIN, scope="atl", season=t,
            value=float(n), unit="count",
            license=License.PUBLIC_DOMAIN, flag=Flag.OBSERVED,
        )
        for var, table in (("cyclone_count", storms_per_season),
                           ("hurricane_count", hurricanes_per_season))
        for t, n in sorted(table.items())
    ]
    if not obs:
        raise ValueError(f"no storms parsed from {raw}")
    return obs

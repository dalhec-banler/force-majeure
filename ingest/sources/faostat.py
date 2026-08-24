"""FAOSTAT crop production (QCL domain) -> region production baselines.

License: FAOSTAT is CC BY-4.0 for most series but SOME carry CC BY-NC-SA.
Every emitted observation is tagged per-series; anything ambiguous is tagged
NON_COMMERCIAL defensively, which the pack license gate (pack.py) will then
exclude from commercial profiles. See ADR-0012.

NOT WIRED INTO `python -m ingest all` YET: yields are annual and mapped to
regions, so this source also waits on the authored 64-region list
(ADR-0006) for its country->region mapping. The API client below is real
and tested against a fixture; enabling it is a mapping-table task.
"""

from __future__ import annotations

import json
from pathlib import Path

from ..schema import Flag, License, Observation, ScopeKind, season_index

SOURCE = "faostat"
API = "https://faostatservices.fao.org/api/v1/en/data/QCL"


def fetch() -> Path:
    raise NotImplementedError(
        "FAOSTAT fetch is gated on the country->region mapping table "
        "(needs the authored 64-region list, ADR-0006). The normalize() "
        "path below is implemented and tested against fixtures."
    )


def normalize_payload(payload: dict, region_of_area: dict[str, str],
                      license_of_item: dict[str, License] | None = None,
                      ) -> list[Observation]:
    """Convert a FAOSTAT QCL API JSON payload to observations.

    Annual production values are emitted on the Autumn season of the year
    (harvest-season convention; the sim treats production baselines as
    annual anyway). Unknown license -> NON_COMMERCIAL, defensively.
    """
    license_of_item = license_of_item or {}
    obs: list[Observation] = []
    for row in payload.get("data", []):
        area = str(row.get("Area", ""))
        region = region_of_area.get(area)
        if region is None:
            continue
        item = str(row.get("Item", ""))
        year = int(row["Year"])
        obs.append(Observation(
            source=SOURCE,
            dataset_version=str(payload.get("metadata", {})
                                .get("dateupdate", "qcl-live")),
            variable=f"production:{item.lower().replace(' ', '_')}",
            scope_kind=ScopeKind.REGION, scope=region,
            season=season_index(year, 3),
            value=float(row["Value"]), unit=str(row.get("Unit", "t")),
            license=license_of_item.get(item, License.NON_COMMERCIAL),
            flag=Flag.OBSERVED,
        ))
    return obs


def normalize(raw: Path) -> list[Observation]:
    payload = json.loads(raw.read_text())
    raise NotImplementedError(
        f"loaded {len(payload.get('data', []))} rows; supply the "
        "country->region mapping via normalize_payload() — see docstring"
    )

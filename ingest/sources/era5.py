"""ERA5 reanalysis (Copernicus C3S) -> per-region seasonal aggregates.
License: free with ATTRIBUTION REQUIRED; terms propagate into pack meta.

NOT WIRED INTO `python -m ingest all` YET, deliberately:
1. Requires a personal CDS API key in ~/.cdsapirc (interactive signup).
2. The per-region aggregation needs the 64 region masks (ADR-0006), which
   are authored alongside the region list itself — not yet written.
3. Payloads are large; fetches must be variable- and mask-scoped.

What this module will produce when enabled: per-region seasonal
precipitation and 2m-temperature anomalies against a 1951-1980 base period,
plus the per-region sigma baselines (variance envelopes) — variables
"moisture_anomaly", "temp_anomaly", "sigma_baseline", scope REGION.
Grids are reduced to region aggregates immediately and discarded; only
aggregates enter data/processed/.
"""

from __future__ import annotations

from pathlib import Path

from ..schema import Observation

SOURCE = "era5"


def fetch() -> Path:
    raise NotImplementedError(
        "ERA5 fetch requires CDS credentials (~/.cdsapirc) and the authored "
        "region masks from ADR-0006. See module docstring; enable when the "
        "64-region list is authored."
    )


def normalize(raw: Path) -> list[Observation]:
    raise NotImplementedError("see fetch()")

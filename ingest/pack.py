"""Pack compiler: data/processed/*.parquet -> pack-climate.json.

The sim only ever reads packs (technical-design §6.1). This compiler:
- assembles contiguous driver series from the campaign epoch (t=0, 1946
  Winter) to the last season where ALL drivers have values,
- prefers OBSERVED rows over BACKFILLED over AUTHORED when a season has
  several candidates for the same driver,
- carries per-season flags so authored/backfilled seasons stay visible,
- includes basin activity tables (event-generator raw material),
- enforces the license gate: a "commercial" profile build FAILS if any
  included row is tagged non_commercial (technical-design §6.5, ADR-0012),
- stamps a content hash over the canonical serialisation.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from .manifest import PROCESSED_DIR, load_manifest
from .schema import Flag, License, Observation, ScopeKind, season_label

DRIVERS = ["enso", "iod", "natl", "pdo"]  # GLOBAL is sim-side, not observed
_PREFERENCE = {Flag.OBSERVED: 0, Flag.BACKFILLED: 1, Flag.AUTHORED: 2}


class LicenseGateError(Exception):
    pass


def compile_pack(observations: list[Observation], profile: str,
                 out_path: Path) -> dict:
    if profile not in ("commercial", "research"):
        raise ValueError(f"unknown profile {profile!r}")

    if profile == "commercial":
        bad = [o for o in observations
               if o.license == License.NON_COMMERCIAL]
        if bad:
            variables = sorted({f"{o.source}:{o.variable}" for o in bad})
            raise LicenseGateError(
                f"commercial profile refused: {len(bad)} non-commercial "
                f"rows from {variables}"
            )

    # --- driver series -----------------------------------------------------
    per_driver: dict[str, dict[int, Observation]] = {d: {} for d in DRIVERS}
    for o in observations:
        if o.scope_kind == ScopeKind.DRIVER and o.scope in per_driver:
            best = per_driver[o.scope].get(o.season)
            if best is None or _PREFERENCE[o.flag] < _PREFERENCE[best.flag]:
                per_driver[o.scope][o.season] = o

    for d in DRIVERS:
        if 0 not in per_driver[d]:
            raise ValueError(
                f"driver {d!r} has no value at t=0 (1946 Winter); "
                "campaign epoch coverage is mandatory"
            )

    last_common = min(max(per_driver[d]) for d in DRIVERS)
    drivers_out = {}
    for d in DRIVERS:
        series, flags = [], []
        for t in range(0, last_common + 1):
            if t not in per_driver[d]:
                raise ValueError(
                    f"driver {d!r} missing season t={t} "
                    f"({season_label(t)}) inside its coverage window"
                )
            o = per_driver[d][t]
            series.append(round(o.value, 4))
            flags.append(o.flag.value)
        drivers_out[d] = {
            "first_season": 0,
            "values": series,
            "flags": flags,
            "unit": per_driver[d][0].unit,
        }

    # --- basin activity ----------------------------------------------------
    basins: dict[str, dict[str, dict[int, float]]] = {}
    for o in observations:
        if o.scope_kind == ScopeKind.BASIN:
            basins.setdefault(o.scope, {}).setdefault(
                o.variable, {})[o.season] = o.value
    basins_out = {
        basin: {
            var: [{"t": t, "n": int(v)} for t, v in sorted(table.items())]
            for var, table in variables.items()
        }
        for basin, variables in basins.items()
    }

    pack = {
        "meta": {
            "kind": "climate",
            "license_profile": profile,
            "seasons": last_common + 1,
            "epoch": "1946-winter",
            "attribution": [
                "Contains modified Copernicus Climate Change Service "
                "information (when ERA5 tables are present)",
                "NOAA CPC / PSL / NHC data: US Government public domain",
            ],
            "sources": load_manifest()["entries"],
        },
        "drivers": drivers_out,
        "basin_activity": basins_out,
    }

    canonical = json.dumps(pack, sort_keys=True, separators=(",", ":"))
    pack["meta"]["content_hash"] = hashlib.sha256(
        canonical.encode()).hexdigest()

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(pack, indent=1, sort_keys=True) + "\n")
    return pack


def compile_from_processed(profile: str = "research",
                           out_path: Path | None = None) -> dict:
    from .schema import read_observations

    obs: list[Observation] = []
    for parquet in sorted(PROCESSED_DIR.glob("*.parquet")):
        obs.extend(read_observations(parquet))
    if not obs:
        raise FileNotFoundError(
            f"no processed observations in {PROCESSED_DIR}; "
            "run `python -m ingest normalize` first"
        )
    out = out_path or PROCESSED_DIR / "pack-climate.json"
    return compile_pack(obs, profile, out)

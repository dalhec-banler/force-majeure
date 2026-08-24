"""Source registry. One module per dataset; each exposes:

    SOURCE: str                     slug
    fetch() -> Path                 download raw payload, record manifest
    normalize(raw: Path) -> list[Observation]

`backfill` has no fetch (it is authored data). `era5` and `faostat` fetch
only when credentials / explicit opt-in are present; see their docstrings.
"""

from . import oni, dmi, amo, pdo, hurdat2, backfill

FETCHABLE = {m.SOURCE: m for m in (oni, dmi, amo, pdo, hurdat2)}
ALL = {**FETCHABLE, backfill.SOURCE: backfill}

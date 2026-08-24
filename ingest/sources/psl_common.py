"""Shared parser for NOAA PSL ".long.data" monthly tables.

Format: first line "<startyear> <endyear>"; then one row per year with 12
monthly values; then a line holding the missing-value sentinel; then free-
text metadata. Values equal to the sentinel are dropped.
"""

from __future__ import annotations


def parse_psl_monthly(text: str) -> dict[tuple[int, int], float]:
    lines = [ln for ln in text.splitlines() if ln.strip()]
    header = lines[0].split()
    start_year, end_year = int(header[0]), int(header[1])

    monthly: dict[tuple[int, int], float] = {}
    sentinel: float | None = None

    # The sentinel line is the first line after the data block; find it by
    # scanning rows whose first token is a year in range.
    data_rows = []
    for ln in lines[1:]:
        tok = ln.split()
        try:
            year = int(tok[0])
        except ValueError:
            continue
        if start_year <= year <= end_year and len(tok) == 13:
            data_rows.append((year, [float(v) for v in tok[1:]]))
        elif sentinel is None:
            try:
                sentinel = float(tok[0])
            except ValueError:
                pass
    if sentinel is None:
        # Common PSL sentinels, used if the file omitted the marker line.
        sentinel = -99.99

    for year, vals in data_rows:
        for month, v in enumerate(vals, start=1):
            if abs(v - sentinel) > 1e-9 and v > -90.0:
                monthly[(year, month)] = v
    return monthly

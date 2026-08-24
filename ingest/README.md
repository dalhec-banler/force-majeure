# Deliverable 2 — Data ingestion layer

Fetch → normalise → compile, per `docs/technical-design.md` §6. Standalone
and useful regardless of how the core loop tunes: the sim only ever reads
compiled packs, never this pipeline's intermediates.

## Layout

```
ingest/
  schema.py          Canonical Observation schema, season index, parquet IO
  manifest.py        Fetch manifest (URL, date, sha256, dataset version)
  pack.py            Pack compiler + license gate (fails Commercial on NC data)
  sources/           One module per dataset
    oni.py           NOAA CPC ONI — driver.enso           (public domain)
    dmi.py           HadISST DMI via NOAA PSL — driver.iod (public domain)
    amo.py           AMO unsmoothed via NOAA PSL — driver.natl (public domain)
    pdo.py           ERSSTv5 PDO via NOAA PSL — driver.pdo (public domain)
    hurdat2.py       NHC HURDAT2 Atlantic — basin activity (public domain)
    backfill.py      Authored ENSO 1946–49 (ONI starts 1950), flagged authored
    era5.py          Copernicus ERA5 — requires CDS credentials (attribution)
    faostat.py       FAOSTAT QCL — per-series license tags (some CC BY-NC-SA)
  tests/             pytest; offline, runs against committed fixtures
```

EM-DAT is deliberately absent — ADR-0012.

## Usage

```bash
python3 -m venv .venv && .venv/bin/pip install -r ingest/requirements.txt
.venv/bin/python -m ingest fetch          # all fetchable sources → data/raw/
.venv/bin/python -m ingest normalize      # data/raw/ → data/processed/*.parquet
.venv/bin/python -m ingest compile        # → data/processed/pack-climate.json
.venv/bin/python -m ingest all            # the three above in order
.venv/bin/python -m pytest ingest/tests   # offline test suite
```

Season convention (canonical everywhere): `t = (year − 1946) × 4 + quarter`,
quarters 0..3 = Winter (DJF, year of the Jan), Spring (MAM), Summer (JJA),
Autumn (SON). Pre-1946 seasons are negative and legal (baselines only).

## Rules

- `data/raw/` is gitignored; every fetch writes a checksummed entry to
  `data/schema/fetch-manifest.json` so fetches are re-runnable and verifiable.
- Source quirks die inside the source's own module, under that module's tests.
- Every observation carries a `license` tag; `pack.py` refuses to compile a
  `commercial` profile containing `non_commercial` rows.

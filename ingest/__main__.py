"""CLI: python -m ingest {fetch|normalize|compile|all} [source ...]"""

from __future__ import annotations

import sys
from pathlib import Path

from . import sources
from .manifest import PROCESSED_DIR, RAW_DIR, load_manifest, REPO_ROOT
from .pack import compile_from_processed
from .schema import write_observations


def _selected(names: list[str], table: dict) -> dict:
    if not names:
        return table
    unknown = set(names) - set(table)
    if unknown:
        sys.exit(f"unknown source(s): {sorted(unknown)}; "
                 f"available: {sorted(table)}")
    return {n: table[n] for n in names}


def do_fetch(names: list[str]) -> None:
    for name, mod in _selected(names, sources.FETCHABLE).items():
        path = mod.fetch()
        print(f"fetched {name}: {path.relative_to(REPO_ROOT)} "
              f"({path.stat().st_size:,} bytes)")


def do_normalize(names: list[str]) -> None:
    manifest = load_manifest()["entries"]
    for name, mod in _selected(names, sources.ALL).items():
        if name == "backfill":
            obs = mod.normalize()
        else:
            entry = manifest.get(name)
            if entry is None:
                print(f"skip {name}: not fetched yet")
                continue
            obs = mod.normalize(REPO_ROOT / entry["raw_file"])
        out = PROCESSED_DIR / f"{name}.parquet"
        write_observations(obs, out)
        print(f"normalized {name}: {len(obs)} observations "
              f"-> {out.relative_to(REPO_ROOT)}")


def do_compile(profile: str) -> None:
    pack = compile_from_processed(profile=profile)
    meta = pack["meta"]
    print(f"pack-climate.json: {meta['seasons']} seasons, "
          f"profile={meta['license_profile']}, "
          f"hash={meta['content_hash'][:12]}…")


def main(argv: list[str]) -> None:
    if not argv:
        sys.exit(__doc__.strip())
    cmd, rest = argv[0], argv[1:]
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    if cmd == "fetch":
        do_fetch(rest)
    elif cmd == "normalize":
        do_normalize(rest)
    elif cmd == "compile":
        do_compile(rest[0] if rest else "research")
    elif cmd == "all":
        do_fetch([])
        do_normalize([])
        do_compile("research")
    else:
        sys.exit(f"unknown command {cmd!r}; " + __doc__.strip())


if __name__ == "__main__":
    main(sys.argv[1:])

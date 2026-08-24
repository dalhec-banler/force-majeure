"""Fetch manifest: every raw payload is recorded (URL, date, sha256, size)
so fetches are re-runnable and verifiable without committing payloads.
Lives at data/schema/fetch-manifest.json, committed to git.
"""

from __future__ import annotations

import datetime as _dt
import hashlib
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "data" / "raw"
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
MANIFEST_PATH = REPO_ROOT / "data" / "schema" / "fetch-manifest.json"


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_manifest() -> dict:
    if MANIFEST_PATH.exists():
        return json.loads(MANIFEST_PATH.read_text())
    return {"entries": {}}


def record_fetch(source: str, url: str, path: Path,
                 dataset_version: str) -> None:
    manifest = load_manifest()
    manifest["entries"][source] = {
        "url": url,
        "dataset_version": dataset_version,
        "fetched_at": _dt.datetime.now(_dt.timezone.utc).isoformat(
            timespec="seconds"),
        "sha256": sha256_of(path),
        "bytes": path.stat().st_size,
        "raw_file": str(path.relative_to(REPO_ROOT)),
    }
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2, sort_keys=True)
                             + "\n")


def download(url: str, dest: Path, timeout: int = 120) -> Path:
    import requests

    dest.parent.mkdir(parents=True, exist_ok=True)
    resp = requests.get(url, timeout=timeout,
                        headers={"User-Agent": "force-majeure-ingest/0.1"})
    resp.raise_for_status()
    dest.write_bytes(resp.content)
    return dest

import json

import pytest

from ingest.pack import DRIVERS, LicenseGateError, compile_pack
from ingest.schema import Flag, License, Observation, ScopeKind


def _driver_obs(scope, season, value, flag=Flag.OBSERVED,
                license=License.PUBLIC_DOMAIN, source="test"):
    return Observation(
        source=source, dataset_version="v",
        variable=f"{scope}_index", scope_kind=ScopeKind.DRIVER, scope=scope,
        season=season, value=value, unit="index_degc",
        license=license, flag=flag,
        note="test rationale" if flag == Flag.AUTHORED else "",
    )


def _full_coverage(n_seasons=8):
    return [_driver_obs(d, t, 0.1 * t)
            for d in DRIVERS for t in range(n_seasons)]


def test_compile_produces_contiguous_series(tmp_path):
    out = tmp_path / "pack.json"
    pack = compile_pack(_full_coverage(8), "research", out)
    assert pack["meta"]["seasons"] == 8
    for d in DRIVERS:
        assert len(pack["drivers"][d]["values"]) == 8
        assert pack["drivers"][d]["flags"] == ["observed"] * 8
    assert json.loads(out.read_text())["meta"]["content_hash"] == \
        pack["meta"]["content_hash"]


def test_observed_preferred_over_authored(tmp_path):
    obs = _full_coverage(4)
    obs.append(_driver_obs("enso", 2, 9.9, flag=Flag.AUTHORED))
    pack = compile_pack(obs, "research", tmp_path / "p.json")
    assert pack["drivers"]["enso"]["values"][2] != 9.9


def test_authored_fills_gaps_and_is_flagged(tmp_path):
    obs = [_driver_obs(d, t, 0.5)
           for d in DRIVERS for t in range(1, 4)]           # t=0 missing
    obs += [_driver_obs(d, 0, 0.2, flag=Flag.AUTHORED) for d in DRIVERS]
    pack = compile_pack(obs, "research", tmp_path / "p.json")
    assert pack["drivers"]["enso"]["flags"][0] == "authored"
    assert pack["drivers"]["enso"]["flags"][1] == "observed"


def test_missing_epoch_coverage_fails(tmp_path):
    obs = [_driver_obs(d, t, 0.5)
           for d in DRIVERS for t in range(1, 4)]           # no t=0 at all
    with pytest.raises(ValueError, match="1946 Winter"):
        compile_pack(obs, "research", tmp_path / "p.json")


def test_internal_gap_fails(tmp_path):
    obs = [_driver_obs(d, t, 0.5)
           for d in DRIVERS for t in (0, 1, 3)]             # t=2 missing
    with pytest.raises(ValueError, match="missing season t=2"):
        compile_pack(obs, "research", tmp_path / "p.json")


def test_license_gate_blocks_commercial(tmp_path):
    obs = _full_coverage(4)
    obs.append(Observation(
        source="faostat", dataset_version="v", variable="production:wheat",
        scope_kind=ScopeKind.REGION, scope="sahel", season=3, value=1.0,
        unit="t", license=License.NON_COMMERCIAL,
    ))
    with pytest.raises(LicenseGateError, match="faostat:production:wheat"):
        compile_pack(obs, "commercial", tmp_path / "p.json")
    # research profile accepts the same rows
    compile_pack(obs, "research", tmp_path / "p2.json")


def test_basin_activity_included(tmp_path):
    obs = _full_coverage(4)
    obs.append(Observation(
        source="hurdat2", dataset_version="v", variable="cyclone_count",
        scope_kind=ScopeKind.BASIN, scope="atl", season=2, value=7.0,
        unit="count", license=License.PUBLIC_DOMAIN,
    ))
    pack = compile_pack(obs, "research", tmp_path / "p.json")
    assert pack["basin_activity"]["atl"]["cyclone_count"] == [
        {"t": 2, "n": 7}]

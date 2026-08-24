import pytest

from ingest.schema import (
    Flag, License, Observation, ScopeKind,
    monthly_to_seasonal, season_index, season_label, season_of,
)


def test_season_index_epoch():
    assert season_index(1946, 0) == 0
    assert season_index(1946, 3) == 3
    assert season_index(1950, 0) == 16
    assert season_index(2060, 3) == 459


def test_season_index_roundtrip():
    for t in (-8, 0, 1, 16, 250, 459):
        assert season_index(*season_of(t)) == t


def test_season_label():
    assert season_label(0) == "1946 Winter"
    assert season_label(16) == "1950 Winter"


def test_pre_epoch_seasons_are_negative_and_legal():
    assert season_index(1940, 0) == -24


def test_monthly_to_seasonal_winter_uses_prior_december():
    monthly = {(1949, 12): 3.0, (1950, 1): 0.0, (1950, 2): 0.0}
    out = monthly_to_seasonal(monthly)
    assert out == {season_index(1950, 0): 1.0}


def test_monthly_to_seasonal_drops_partial_seasons():
    monthly = {(1950, 1): 1.0, (1950, 2): 1.0}  # no Dec 1949
    assert monthly_to_seasonal(monthly) == {}


def test_authored_requires_note():
    with pytest.raises(ValueError):
        Observation(
            source="x", dataset_version="v", variable="enso_index",
            scope_kind=ScopeKind.DRIVER, scope="enso", season=0,
            value=1.0, unit="index_degc", license=License.PUBLIC_DOMAIN,
            flag=Flag.AUTHORED, note="",
        )


def test_parquet_roundtrip(tmp_path):
    from ingest.schema import read_observations, write_observations

    obs = [Observation(
        source="oni", dataset_version="v", variable="enso_index",
        scope_kind=ScopeKind.DRIVER, scope="enso", season=t,
        value=float(t) / 10, unit="index_degc",
        license=License.PUBLIC_DOMAIN,
    ) for t in range(5)]
    path = tmp_path / "obs.parquet"
    write_observations(obs, path)
    assert read_observations(path) == obs

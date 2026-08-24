from pathlib import Path

from ingest.schema import Flag, License, ScopeKind, season_index
from ingest.sources import amo, backfill, dmi, hurdat2, oni, pdo
from ingest.sources.psl_common import parse_psl_monthly

FIXTURES = Path(__file__).parent / "fixtures"


# ------------------------------------------------------------------- ONI

def test_oni_keeps_only_canonical_windows():
    obs = oni.normalize(FIXTURES / "oni_excerpt.txt")
    # 14 fixture rows, only DJF/MAM/JJA/SON survive: 4 for 1950, 2 for 1951
    assert len(obs) == 6
    by_season = {o.season: o.value for o in obs}
    assert by_season[season_index(1950, 0)] == -1.32
    assert by_season[season_index(1950, 2)] == -0.72
    assert all(o.scope == "enso" and o.scope_kind == ScopeKind.DRIVER
               and o.license == License.PUBLIC_DOMAIN for o in obs)


# ------------------------------------------------------------- PSL common

def test_psl_parser_drops_sentinel_values():
    monthly = parse_psl_monthly((FIXTURES / "psl_excerpt.data").read_text())
    assert (1951, 3) not in monthly          # -99.99 dropped
    assert monthly[(1949, 12)] == 0.6
    assert monthly[(1950, 1)] == 0.6


def test_dmi_and_amo_seasonal_aggregation():
    for mod, variable, scope in ((dmi, "iod_index", "iod"),
                                 (amo, "natl_index", "natl")):
        obs = mod.normalize(FIXTURES / "psl_excerpt.data")
        by_season = {o.season: o for o in obs}
        winter_1950 = by_season[season_index(1950, 0)]
        # Dec 1949 (0.6) + Jan 1950 (0.6) + Feb 1950 (0.6)
        assert abs(winter_1950.value - 0.6) < 1e-9
        assert winter_1950.variable == variable
        assert winter_1950.scope == scope
        # Spring 1951 contains the sentinel month -> season dropped
        assert season_index(1951, 1) not in by_season


# ------------------------------------------------------------------- PDO

def test_pdo_parses_csv_and_skips_missing():
    obs = pdo.normalize(FIXTURES / "pdo_excerpt.csv")
    by_season = {o.season: o.value for o in obs}
    # Winter 1950 = mean(Dec 1949 -1.2, Jan -1.4, Feb -1.6)
    assert abs(by_season[season_index(1950, 0)] - (-1.4)) < 1e-9
    # Winter 1951 needs Dec 1950, which is the -9999 sentinel -> absent
    assert season_index(1951, 0) not in by_season


# --------------------------------------------------------------- HURDAT2

def test_hurdat2_counts_storms_by_peak_status():
    obs = hurdat2.normalize(FIXTURES / "hurdat2_excerpt.txt")
    table = {(o.variable, o.season): o.value for o in obs}
    summer_1950 = season_index(1950, 2)   # August
    autumn_1950 = season_index(1950, 3)   # September
    winter_1951 = season_index(1951, 0)   # December 1950 -> Winter 1951
    assert table[("cyclone_count", summer_1950)] == 1    # ABLE (peaks HU)
    assert table[("hurricane_count", summer_1950)] == 1
    assert table[("cyclone_count", autumn_1950)] == 1    # BAKER (TS only)
    assert ("hurricane_count", autumn_1950) not in table
    # CHARLIE never exceeds TD: not a named-storm count anywhere
    assert ("cyclone_count", winter_1951) not in table


# -------------------------------------------------------------- backfill

def test_backfill_covers_pre_oni_gap_and_is_flagged():
    obs = backfill.normalize()
    assert len(obs) == 16                          # 1946-1949 x 4 quarters
    assert {o.season for o in obs} == set(range(0, 16))
    assert all(o.flag == Flag.AUTHORED and o.note for o in obs)
    # meets observed DJF 1950 (-1.32) without a jump
    last = max(obs, key=lambda o: o.season)
    assert -1.32 < last.value < -0.8

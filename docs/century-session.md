# The century session — 2026-08-26

Authority delegated by the author at the start of the session ("I'll let
you shift the game mechanics how you see fit"), with these directions,
given mid-session: the ladder should make getting through hard while a
rich ending stays possible; only real grain gateways feed the supply
index; the weak-exporter archetype gets fixed; the rival grows teeth over
the century; attrition insolvency slides; desktop first; funding is
taught passively in the first seasons; the chest unlocks weapons and poor
performance loses them, with a way back; weapons and regions arrive
chronologically.

## What shipped (five ADRs, one commit each side of the timeline change)
- **ADR-0020 The ladder has teeth** — rung multipliers, ×1.5 signatures,
  slower decay, saturating hush money, the rung-5 floor, relief exempt
  from pattern evidence, retaliation once named.
- **ADR-0021 Grain is priced by the exporters** — grain hubs only
  (Gulf Coast, Panama, Malacca), export shares, elasticity 3.0, and the
  **shadow world**: PROFIT is what the programme made over a world where
  it never acted.
- **ADR-0022 The Eastern Program grows up** — five eras keyed to the
  calendar; absent before 1962, contemporary by 2000.
- **ADR-0023 The long campaign** — 460 seasons 1946–2060 from the climate
  pack, reviews at three cadences (262 a campaign), the century economy
  (appropriations follow the threat; the trade desk's 2× windfall;
  use-it-or-lose-it above $400M; patience measured in reviews; a starved
  programme loses wings, never the programme), one-slot saves that replay.
- **ADR-0024 The arsenal arrives on the calendar** — every wing has a
  year, a chest and an upkeep; ordered from the tray, mothballed by
  attrition or by ⏏, reopened at three-quarters; earmarks stand wings up
  for demonstrations and take them back down.
- **ADR-0025 The board grows** — 16 regions in 1946, 36 by 2010, each on
  its own date.
- **The record to 2022** — 1,674 storms, 54 eruptions, 64 major quakes,
  122 weather/famine/epidemic events; the 1956–2022 catalogs were authored
  and verified by three parallel passes (`tools/history/*-sources.md`).

## What the harness says
| line | end | PROFIT | rung (peak) |
|---|---|---|---|
| lab, a seed a year | 2060 running, $698M | +$1,352M | 2 (2) |
| builder, eight wings, waves | 2060 running, $175M | +$2,355M | 4 (4); starved 2019–20, recovered |
| naive tutorial follower, 40 reviews | 1980 running, $395M | +$45M | 1 |
| 40-season sweep after ADR-0020/21 (pre-timeline) | | researchstrike +$255M rung 4; monsoonF exposed S26 | |

Verified in the browser: 1946 board of sixteen, tray with eight dimmed
wings labelled by year, RUN THE YEAR resolving four seasons in ~16 s,
directive fuses in reviews, clock and ledger live, no console errors,
RESUME restoring the exact state after a reload.

## For the author
- **Play the opening decade.** Annual reviews with two tools and a
  seeding directive: is a lab with a budget line fun for thirty reviews?
  If not, the tier-1 clock (45 s) and the standing-directive cadence are
  the levers, or tier 1 could end with Popeye (1966) instead of ENMOD.
- The situation room is ~124 seasonal reviews (2030–60). Playtest the
  length; the trigger year is pack data (`MODEL.tiers`).
- The GLOBAL warming ramp is authored (0.4 × GMST, anchors in
  `build.py`); a real GMST series belongs in the ingest pack. PDO is in
  the pack but not yet a driver.
- Region dates and wing years are content; argue with them in `build.py`.
- The windfall lever (2×) is the number that decides whether an op tempo
  pays. The builder line is self-funding with it; without it nothing is.
- Mobile is untouched, as directed.

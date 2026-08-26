# ADR-0023: The long campaign — 1946 to 2060, decided in reviews

**Status:** Accepted · 2026-08-26 (century session; author's direction:
weapons and regions should arrive chronologically, funding should be
built and can be lost, always a way back)

## Context
The prototype played a ten-year slice (40 seasons, 1946–55). The brief
always said 1946–2060 with the timeline as the tutorial; the author's new
notes (an arsenal that arrives with history, a board that grows, a chest
that unlocks weapons and can be lost) only make sense across the century.

## Decision
1. **The substrate is the record.** `build.py` (`LONG = True`) builds 460
   seasons from `data/processed/pack-climate.json`: ONI as is, DMI ×2.0
   and AMO ×2.2 into the sheet's driver units, 1946–2022 observed;
   2023–2060 replays 1985–2022 (fiction with the record's rhythm). GLOBAL
   is an authored warming-stress ramp, 0.4 × GMST anomaly over the 1946–75
   mean (anchors flagged for verification in the source). Envelope
   widening 0.006 → 0.0006/season (opt `envelopeWidening`). Region noise
   is deterministic (LCG, ±0.28) for all 36 regions.
2. **Reviews, not seasons** (ADR-0010 made concrete): `MODEL.tiers` —
   PROGRAMME REVIEW yearly 1946–75 (45 s clock), OPERATIONS TEMPO
   half-yearly 1976–2029 (40 s), SITUATION ROOM seasonal 2030–60 (35 s).
   A review commits the armed ops on its first season; the seasons
   between pass briskly; containment and the earmark ride along. 262
   reviews in a campaign. Directive fuses and earmark fuses count reviews.
3. **The economy of a century** (engine opts, all default off):
   - *Appropriations follow the threat:* the committee's baseline mandate
     rises with the era (+0 in 1946, +10 by 1976, +24 by 2000, +48 by
     2060) — a lab's budget line becomes a standing directorate.
   - *The trade desk:* `windfall: 2` — the programme keeps twice what it
     made the homeland over the shadow world this season (leveraged
     positions; it knew what was coming). The wave is the money machine;
     the ladder is its price.
   - *Use it or lose it:* `reserveCap: 400` — treasury above the cap
     lapses at 15%/season.
   - *Patience in reviews:* the idle windows scale with the cadence
     (no op in 2 reviews trims the appropriation; no real op in 3 warns;
     3 more winds up). **A starved programme is never wound up** — if the
     purse cannot buy the cheapest operation the wings go by attrition and
     the treasury floors at zero; idleness *with money* is what the
     committee dissolves.
4. **Saves.** The campaign is its command list (`localStorage`, one slot);
   the engine is deterministic, so RESUME replays it silently in about a
   second. Ends clear it.
5. **The record to 2022.** `tools/extract-history.py` runs to 2022:
   HURDAT2 + IBTrACS (after 1955 only Cat 2+ landfalls and Cat 4+ near a
   coast), and the catalogs under `tools/history/` — 43 eruptions, 49
   major quakes, 91 weather/famine/epidemic entries, each verified against
   Wikipedia/GVP/USGS with a sources table beside it. 2023 on is fiction.

## Consequences (harness, `campaign-century.js`)
| line | 2060 | PROFIT | rung (peak) | wings |
|---|---|---|---|---|
| lab (a seed a year, follows directives, never strikes) | running, $698M | +$1,352M | 2 (2) | 3 |
| builder (stands wings up as the chest allows, strikes dry exporters, a wave a decade) | running, $175M | +$2,355M | 4 (4) — nearly wound up 2020, recovered | 8 |
| naive tutorial follower, 40 reviews | 1980, running, $395M | +$45M | 1 | 6 |

Console 3.9 MB. Open: the ramp anchors and GLOBAL scale want a real GMST
series in the pack; PDO is in the pack but not yet a driver (ADR-0006);
the situation-room decade is ~124 reviews — playtest the length.

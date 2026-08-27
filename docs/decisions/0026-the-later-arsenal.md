# ADR-0026: The later arsenal — six wings, and the record as forcing

**Status:** Accepted · 2026-08-27 (author: "let's go ahead and get all of
this baked in"; "engineered biology is definitely in bounds")

## Context
After ADR-0024 brought the arsenal's dates forward, the last wing still
arrived in 2014 and the situation-room decades (2030–60, 124 seasonal
reviews) had no new capability at all. Separately, playtest found that the
record's droughts, famines and floods were **narration only** — the wire
announced the 1946 Ukraine famine while the Black Sea Steppe marker stayed
green and its harvest never moved.

## Decision A — six new wings
Each is a distinct shape, not a reskin. All carry `from` / `chest` /
`upkeep` per ADR-0024.

| year | wing | shape | the history |
|---|---|---|---|
| 1955 | **Hurricane Steering** | +1.5 wet, **lag 0**, one season, sig 6, $16M. You do not make the storm; you choose whose coast it crosses. The Atlantic gives the energy back in three seasons. | Project Cirrus 1947, Stormfury 1962 |
| 2008 | **Engineered Bloom** | DRIVER on GLOBAL, **−0.85** — the only tool that *lowers* the planet's stress; every harvest eases. sig 4, $30M. The dead water surfaces in the Indian Ocean. | iron-fertilisation trials, 1990s–2009 |
| 2024 | **Marine Cloud Brightening** | +0.65 regional, lag 0, sig **1**, $10M — the scalpel: so quiet the ladder does not move. | Australian reef trials, 2020– |
| 2032 | **Orbital Mirror** | −1.6 regional, **lag 0**, sig 14, $45M — no lag and no meteorology to hide behind; the anomaly appears with nothing to explain it. | the brief's orbital tier |
| 2040 | **Engineered Biology** | −1.35, **dur 4, decay 0.88** — it persists in the seed stock and does not care what the weather does next. sig 8, $34M. | the brief's engineered biology |
| 2046 | **The AMOC Lever** | DRIVER on NATL, +2.6, dur 40, decay 0.985, sig **34**, $90M, chest $300M. **`once: true`** and **`requires`** the Ocean, ENSO and Polar wings ever stood up. | the brief's point of no return |

Two engine primitives were added for the lever, both gated by `eras`:
`once` (a second commit is refused with `why:"spent"`) and `requires`
(the wing is not eligible until the named wings have ever been online).
Refusals now say *why* on the wire — "spent", "the wing is not standing",
"that region is not on the board yet" — instead of always blaming the
budget.

**Cadence achieved:** 14 arrivals across 262 reviews; the longest gap is
32 reviews (2032→2040); the last 60 reviews are the consequence of the
lever rather than a wait for the next tool.

## Decision B — the record is forcing, not narration
Every recorded drought, famine, flood, fire, cold snap, locust plague and
tropical strike now enters the engine through the same exogenous channel
the eruptions use (`owner: "nature"`), pushing its region's anomaly for as
long as the record says it ran:

    famine −1.7 · drought −1.2 · fire −0.8 · cold −0.7 · blizzard −0.6
    avalanche −0.3 · flood +1.5 · typhoon/cyclone +1.3 · locusts +1.6
    (epidemic and tornado carry no weather anomaly — they are canon, and
     they are not the weather)

scaled by `1 + min(0.45, toll/2,000,000)` so the ones the century
remembers bite hardest. 109 of the 122 catalogued events are now forcing,
touching 230 region-seasons.

Consequences: the 1946 Ukraine famine drops the Black Sea Steppe to
**64%** and puts grain at 126 with mandate 36 — the marker turns, the
harvest falls, and cloud seeding is a real answer. Unmaking a recorded
event now requires offsetting **half its own force**, not a token
operation.

Two surface fixes follow from it: markers show a dashed **drying** ring
while the harvest still stands but the season is going against it (the
signal to seed *before* the collapse), and the relief directive names the
region and its harvest number instead of asking for "the driest region".

When one operation reaches the whole board (the lever, a wave), the wire
prints at most two traces and collapses the rest into one line.

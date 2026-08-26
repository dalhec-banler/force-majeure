# ADR-0018: The board grows to 36 regions — the world's breadbaskets and chokepoints

**Status:** Accepted · 2026-08-25 (author: "research the actual world and where food and industry takes place")

## Decision
Seventeen regions added to the 16-region prototype board, chosen for real
production or transit share, a distinct teleconnection signature, and
relevance across 1946–2060: California Central Valley, Canadian Prairies,
Gulf Coast Refineries, North China Plain, Yangtze Basin, Manchurian Plain,
Northern European Plain, Mediterranean Basin, Danube Basin, Nile Delta,
Japan (Kanto–Kansai), Mekong Delta, Cerrado, Southern African Maize Belt,
Kazakh Virgin Lands, Panama Canal, Malacca Strait — and, at the author's
request the same night, Pilbara Iron Belt, Murray–Darling Basin, Hawaiian
Islands (36 in all).

Each carries authored wiring (driver coefficients and lags) in
`prototype/web/build.py`, with the mechanism noted inline; the signs were
checked against NOAA CPC/NCEI, AOML and the standard ENSO/IOD/NAO/AMO
literature summaries (El Niño: dry Australia, Indonesia, India, southern
Africa, north China, Panama; wet Gulf coast, Peru, the Plata, East
Africa, the Yangtze the following summer. Positive IOD: wet East Africa,
dry Australia/Indonesia. Warm Atlantic: wet Sahel, US and central-Asian
drought, hot dry European summers, more hurricanes, dry NE Brazil).
Magnitudes and lags remain authored estimates — the ERA5 ingest, gated on
the full 64-region list, is what will fit them.

## Consequences
- Supply weights renormalise: the homeland is 9.9% of world supply (was
  16.9%), so single events move the world price less; the ladder-tuning
  session should revisit magnitudes with the author.
- Wires to learn: 76 (16 known at start). Every wire's mechanism and
  evidence grade is in `docs/teleconnections.md`. The shader carries 40 region
  slots. The record maps onto the new regions (Japan's typhoon decade, the
  1954 Yangtze, the 1947 winter, the North Sea flood on both shores, the
  Danube, the Nile cholera and locust years, California's Christmas floods).
- Still absent and worth adding at 64: Punjab/Indus separate from the
  Ganges, Java, the Corn Belt separate from the Plains, the Ruhr, the
  Urals/Donbas, Baku, the Pacific Northwest, Mesopotamia, NE Brazil.

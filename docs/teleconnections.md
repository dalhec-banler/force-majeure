# Teleconnections: every wire, its mechanism, and how sure we are

History is the baseline; the wiring is how the world moves. Each wire is `driver → region` with a coefficient (sign: + wet / − dry; magnitude in anomaly units per unit of driver) and a lag in seasons. Grade: **documented** (a well-established teleconnection in the literature — CPC/NCEI/BoM/AOML composites and the standard reviews), **extrapolated** (a plausible extension of a documented pattern, low confidence), **fantasy** (no precedent — kept physically plausible). Magnitudes and lags are authored; the ERA5 ingest (gated on the 64-region list) will fit them.

## Driver conventions
- **ENSO** (+ El Niño / − La Niña). **IOD** (+ positive dipole). **NATL** (+ warm Atlantic, AMO+). **GLOBAL**: a stratospheric/planetary stress axis — positive means harvest stress everywhere (aerosol veil, volcanic winter, polar melt feedback); every GLOBAL wire is negative by construction. Grade: the GLOBAL axis is a *simplification* — real aerosol cooling has regional structure (monsoon failure, Sahel/Nile drought after Laki 1783 and Pinatubo 1991) that the axis captures only as uniform stress.

## Tool → ocean chains (what heating the ocean does)
| tool | primary | displacement | grade | mechanism |
|---|---|---|---|---|
| Ocean Thermal Forcing | NATL +1.1, lag 1 | IOD −0.44, lag 8 | extrapolated | Warming the N Atlantic conveyor: AMO+ effects (Sahel wet, US drought, hurricanes). Displacement: a warmer Atlantic weakens the Indian Ocean dipole later — an authored ledger, not a documented chain. |
| ENSO Forcing | ENSO +1.6, lag 1 | NATL −0.96, lag 11 | documented / extrapolated | El Niño's global footprint is documented (see wires). Displacement: El Niño years are followed by a cooler tropical Atlantic and a quieter hurricane season — a real tendency, magnitude authored. |
| Stratospheric Aerosol Inj. | GLOBAL +1.3, lag 1 (4 seasons) | NATL −0.65, lag 7 | documented (sign) | Sulfate veils cool the surface, weaken monsoons, cut yields (Pinatubo 1991; Tambora 1815). Displacement: aerosol cooling damps the Atlantic warm phase and hurricanes later (documented for volcanic events). |
| Polar Destabilization | region (Arctic Shelf) +2.2 → melt | GLOBAL +0.77, lag 7 | **fantasy** | No precedent for deliberately breaking the ice. Kept plausible: melt → ice-albedo feedback → global stress; freshwater → a weaker AMOC → cooler NW Europe and a southward ITCZ (Sahel dry) is the documented *direction* of the real chain and is the next wire to add. Sea level from the sheets is permanent; sea ice regrows. |
| Ionospheric Coupling [T3] | region −, instant | — | **fantasy** | Directed-energy seismic coupling has no precedent; a coastal hub target produces a tsunami. It ends the geological record's canon. |
| Cloud Seeding / Watershed / Fire / Adaptation | region, direct | — | documented (as practices) | Seeding (Schaefer 1946) has real but modest effect; here it is a relief/cover tool. Watershed sabotage, fire enablement and adaptation are engineering, not climate. |

## Driver → region wires
| region | driver | coeff | lag | grade | mechanism |
|---|---|---|---|---|---|
| North American Plains | ENSO | +0.20 | 2 | documented | El Niño winters: wetter southern Plains/Gulf, milder north; net slight wet (CPC composites). |
| North American Plains | NATL | -0.30 | 2 | documented | Warm AMO: more frequent/severe US Midwest and Plains droughts (Dust Bowl, 1950s) — AOML. |
| Black Sea Steppe | ENSO | -0.10 | 3 | extrapolated | Weak, indirect: El Niño tends to a cold late winter over eastern Europe; slight dry. |
| Black Sea Steppe | NATL | -0.20 | 3 | extrapolated | Warm Atlantic summers → hotter, drier eastern Europe; modest. |
| La Plata Basin | ENSO | +0.50 | 2 | documented | El Niño: above-average rain in SE South America (Uruguay, Pampas, S Brazil); La Niña drought (2008, 2022). |
| South Asia | ENSO | -0.50 | 1 | documented | El Niño weakens the Indian summer monsoon (Walker circulation shift); most all-India droughts are El Niño years. |
| South Asia | IOD | +0.30 | 1 | documented | Positive IOD strengthens Indian monsoon rains (offsets El Niño, 1997). |
| South Asia | NATL | +0.20 | 2 | documented | Warm AMO strengthens the Indian summer monsoon (model and observational studies). |
| Southeast Asia | ENSO | -0.70 | 1 | documented | El Niño: drought across Indonesia/Indochina, delayed monsoon, fire season (1982, 1997, 2015). |
| Southeast Asia | IOD | -0.20 | 1 | documented | Positive IOD: drought over Indonesia (2019). |
| Eastern Australia | ENSO | -0.90 | 1 | documented | El Niño: reduced rainfall across eastern Australia, bushfire risk; La Niña floods (1950, 1974, 2010–11). |
| Eastern Australia | IOD | -0.60 | 1 | documented | Positive IOD: below-average rain SE Australia (2019 fires). |
| Sahel | ENSO | -0.30 | 2 | documented | El Niño years tend to weaker West African monsoon rains; secondary to the Atlantic. |
| Sahel | IOD | +0.10 | 2 | extrapolated | Minor. |
| Sahel | NATL | +0.70 | 2 | documented | Warm AMO: wetter Sahel; cool AMO: the 1970s–80s Sahel drought. |
| Horn of Africa | ENSO | +0.60 | 2 | documented | El Niño: enhanced East African short rains (Oct–Dec); La Niña: the 2010–11 drought. |
| Horn of Africa | IOD | +0.80 | 1 | documented | Positive IOD: East African short-rains floods (1997, 2019). |
| Horn of Africa | NATL | +0.20 | 3 | extrapolated | Minor. |
| Taiwan Strait Industrial | ENSO | -0.50 | 1 | extrapolated | El Niño: fewer typhoons reach Taiwan/South China; drier summers in the south-east; treated as mild dry stress on the hub. |
| Taiwan Strait Industrial | IOD | -0.10 | 1 | extrapolated | Minor. |
| Persian Gulf Terminals | ENSO | +0.10 | 2 | extrapolated | El Niño winters bring slightly more rain to the Gulf/SW Asia; minor. |
| Persian Gulf Terminals | IOD | +0.35 | 1 | extrapolated | Positive IOD: wetter Arabian Sea coasts; minor. |
| Persian Gulf Terminals | NATL | +0.15 | 2 | extrapolated | Minor. |
| Andean Copper Belt | ENSO | +0.60 | 1 | documented | El Niño: torrential rain on the Peruvian/N Chilean desert coast (1983, 1998) — flooding closes mines and railways. |
| Congo Cobalt Belt | ENSO | -0.20 | 2 | extrapolated | Weak: El Niño slightly drier central Africa; low confidence. |
| Congo Cobalt Belt | IOD | +0.30 | 1 | extrapolated | Positive IOD slightly wetter East/central Africa; minor. |
| Congo Cobalt Belt | NATL | +0.20 | 2 | extrapolated | Warm tropical Atlantic wetter central Africa; minor. |
| North Sea Energy Shelf | ENSO | -0.15 | 2 | extrapolated | Very weak European ENSO signal; late-winter cold/dry tendency in El Niño. |
| North Sea Energy Shelf | NATL | -0.40 | 1 | documented | Warm Atlantic/NAO− winters: stormier, wetter NW Europe; treated as a flood/storm stress on the hub. |
| Ganges Delta Ports | ENSO | -0.40 | 1 | documented | Monsoon failure in El Niño years reduces the Ganges flood; Bay of Bengal cyclone activity also lower. |
| Ganges Delta Ports | IOD | +0.45 | 1 | documented | Positive IOD: enhanced monsoon over the Bay of Bengal coast. |
| Ganges Delta Ports | NATL | +0.20 | 2 | documented | Warm AMO strengthens the South Asian monsoon. |
| Siberian Gas Fields | ENSO | +0.10 | 2 | extrapolated | Weak Eurasian signal; slight. |
| Siberian Gas Fields | NATL | +0.15 | 3 | extrapolated | Warm Atlantic → warmer Eurasian Arctic winters; minor. |
| Arctic Shelf | ENSO | +0.10 | 2 | extrapolated | Weak; El Niño winters slightly warmer in the Eurasian Arctic. |
| Arctic Shelf | NATL | +0.30 | 2 | documented | Warm Atlantic inflow reduces Barents/Kara sea ice ('Atlantification'). |
| California Central Valley | ENSO | +0.40 | 1 | documented | Strong El Niño: wet winters in central/southern California (1983, 1998); weak events are unreliable. |
| California Central Valley | NATL | -0.10 | 2 | extrapolated | Warm AMO: slightly wetter Pacific Northwest, mixed California; minor. |
| Canadian Prairies | ENSO | -0.25 | 1 | documented | El Niño: warm, dry Prairie winters/springs; La Niña: cold, snowy. |
| Canadian Prairies | NATL | -0.20 | 2 | documented | The AMO drought footprint extends into the Canadian Prairies. |
| Gulf Coast Refineries | ENSO | +0.30 | 1 | documented | El Niño: wet Gulf coast winters; La Niña: drought and a more active Atlantic hurricane season on the Gulf. |
| Gulf Coast Refineries | NATL | +0.50 | 1 | documented | Warm AMO doubles major-hurricane counts; Gulf landfalls and surge. |
| North China Plain | ENSO | -0.35 | 1 | documented | El Niño summers: weakened East Asian monsoon, north China drought (Meiyu front held south). |
| North China Plain | IOD | -0.10 | 2 | extrapolated | Minor. |
| North China Plain | NATL | -0.10 | 3 | extrapolated | Warm AMO teleconnection to a weaker N China rainy season; modest. |
| Yangtze Basin | ENSO | +0.60 | 2 | documented | Decaying El Niño summer: anomalous anticyclone over the W Pacific, Meiyu rains stall over the Yangtze (1954, 1998). |
| Yangtze Basin | IOD | +0.15 | 2 | extrapolated | Positive IOD summers slightly wetter over S China; minor. |
| Manchurian Plain | ENSO | -0.25 | 1 | documented | El Niño: cool, cloudy NE China summers (Yamase-type), lower soy/maize yields. |
| Manchurian Plain | NATL | -0.10 | 3 | extrapolated | Minor. |
| Northern European Plain | ENSO | -0.10 | 1 | extrapolated | Weak: El Niño late winters colder/drier over central Europe via the stratospheric pathway. |
| Northern European Plain | NATL | -0.35 | 2 | documented | Warm AMO: hotter, drier European summers (2003-type). |
| Mediterranean Basin | ENSO | +0.15 | 1 | extrapolated | El Niño autumns/winters somewhat wetter in the western Mediterranean; modest. |
| Mediterranean Basin | NATL | -0.40 | 2 | documented | Warm AMO: Mediterranean drought and heat. |
| Danube Basin | ENSO | -0.10 | 1 | extrapolated | Weak; treated as slight dry (as central Europe). |
| Danube Basin | NATL | -0.30 | 2 | extrapolated | As central Europe: drier summers. |
| Nile Delta | ENSO | -0.30 | 2 | documented | El Niño starves the Ethiopian summer rains (Kiremt) and the Blue Nile flood — a documented link since the 1900s. |
| Nile Delta | IOD | +0.15 | 2 | extrapolated | Positive IOD East African rains marginally raise the Nile; minor. |
| Nile Delta | NATL | +0.20 | 2 | extrapolated | Via the Sahel/Ethiopian rains: warm AMO raises the Nile; modest. |
| Japan (Kanto–Kansai) | ENSO | -0.30 | 1 | documented | El Niño summers cool and wet in Japan (rice failure 1993); typhoon tracks shift east. |
| Mekong Delta | ENSO | -0.50 | 1 | documented | El Niño: Mekong drought and salt intrusion (2016). |
| Mekong Delta | IOD | -0.20 | 1 | documented | Positive IOD: drier Indochina (with El Niño, 2019). |
| Cerrado | ENSO | +0.20 | 2 | extrapolated | El Niño: wetter south Brazil, drier north/centre; net slight wet for the central plateau — low confidence. |
| Cerrado | NATL | -0.30 | 2 | documented | Warm N Atlantic shifts the ITCZ north: drought in NE/central Brazil (2012–17). |
| Southern African Maize Belt | ENSO | -0.60 | 1 | documented | El Niño: summer drought over South Africa/Zimbabwe (1983, 1992, 2016). |
| Southern African Maize Belt | IOD | -0.20 | 1 | extrapolated | Positive IOD slightly drier southern Africa; minor. |
| Kazakh Virgin Lands | ENSO | -0.10 | 2 | extrapolated | Weak continental signal. |
| Kazakh Virgin Lands | NATL | -0.20 | 3 | extrapolated | Warm AMO → central Asian drought (studies of Aral/Kazakh rainfall); modest. |
| Panama Canal | ENSO | -0.60 | 1 | documented | El Niño: Panama drought, Gatún Lake low, canal draft restrictions (2015–16, 2023). |
| Panama Canal | NATL | +0.20 | 2 | extrapolated | Warm Caribbean → wetter Panama; minor. |
| Malacca Strait | ENSO | -0.50 | 1 | documented | El Niño: drought and the Sumatra/Borneo haze over the Strait (1997, 2015). |
| Malacca Strait | IOD | -0.30 | 1 | documented | Positive IOD: Sumatra drought and haze. |
| Pilbara Iron Belt | ENSO | -0.30 | 1 | documented | La Niña: more NW Australian cyclones (port closures); El Niño: fewer. |
| Pilbara Iron Belt | IOD | -0.30 | 1 | extrapolated | Negative IOD: wetter NW Australia; minor. |
| Murray–Darling Basin | ENSO | -0.60 | 1 | documented | El Niño drought in the Basin (Millennium drought years); La Niña floods. |
| Murray–Darling Basin | IOD | -0.50 | 1 | documented | Positive IOD drought in the Basin (BoM). |
| Hawaiian Islands | ENSO | -0.40 | 1 | documented | El Niño winters are dry in Hawaii; La Niña wetter. |

## GLOBAL wires
Every region carries a negative GLOBAL coefficient (−0.3 to −0.6) with lags of 2–4 seasons: the stress axis. Tropical and monsoon regions carry the larger magnitudes (monsoon failure is the documented first casualty of a stratospheric veil).

## Known gaps (next wires to add)
- Polar melt → freshwater → AMOC slowdown → NATL cooling (Europe cooler, Sahel dry): documented direction; would replace the uniform GLOBAL displacement for Polar ops.
- Aerosol veil → monsoon failure specifically (India, Sahel, Nile) rather than uniform stress.
- La Niña → Atlantic hurricane activity (documented: weaker shear) — currently only the AMO wire feeds storms.
- PDO and NAO as drivers (ADR-0006 plans five drivers): the NAO would carry Europe/Mediterranean winter wiring properly.

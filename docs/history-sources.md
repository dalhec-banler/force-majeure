# The record: sources and verification status

`prototype/web/history.json` is compiled by `prototype/web/tools/extract-history.py`.
History is the baseline (ADR-0017). This file says where each part comes
from and how far it has been checked.

## Storms — data, not authored
- **Atlantic (NA)**: NHC HURDAT2 (`data/raw/hurdat2-1851-*.txt`), US Government
  public domain. Every storm reaching hurricane status 1946–1955: 68. Names,
  dates, 6-hourly positions and winds, landfall records.
- **West Pacific, East Pacific, North Indian, South Indian, South Pacific**:
  NOAA NCEI IBTrACS v04r01 per-basin CSVs (`data/raw/ibtracs.*.csv`), public
  domain. WP and EP carry JTWC winds and names from 1945 (289 and 50 storms
  ≥ 64 kt). NI, SI and SP carry positions but **no wind measurements** before
  the satellite era (137, 128, 89 tracked storms): these render as cyclones of
  unrecorded strength — category is never invented.
- Daily track samples plus every landfall and peak; the console moves each
  storm along its recorded track during its recorded season.

## Eruptions — authored, verified 2026-08-25
Checked against the Wikipedia list of large 20th-century eruptions
(Smithsonian GVP-derived): Sarychev Peak 1946 (VEI 4), Hekla 1947 (VEI 4),
Lamington 1951 (VEI 4, 2,942 dead), Kelud 1951 (VEI 4), Bagana 1952 (VEI 4),
Spurr 1953 (VEI 4), Bezymianny 1955–57 (VEI 5). Smaller eruptions (Sakurajima
1946, Paricutín to 1952, Cumbre Vieja 1949, Mauna Loa 1950, Etna 1950–51,
Myōjin-shō 1952, Ruapehu/Tangiwai 1953, Merapi 1954, Kīlauea 1955) are from
general knowledge and the GVP; dates believed correct, **not yet checked
line by line against GVP eruption pages**.
Stratospheric forcing values (`climate`) are authored estimates: 1946–55 had
no Pinatubo-class event; Hekla 1947 is the only one with any reach.

## Earthquakes — authored, verified 2026-08-25
Checked against the Wikipedia yearly earthquake lists (USGS/ISC-derived),
kept to the major ones only (author rule): destroyed a city, killed by the
thousand, or M8+ with a tsunami. Magnitudes use Mw where sources differ
(Nankai 8.1, Samaná 8.0, Kern County 7.5). Tolls: Aleutian 167, Samaná
~1,800, Ancash 1,400, Nankai 1,362, Fukui 5,131, Ashgabat 110,000, Khait
12,000, Ambato 6,000, Assam 1,530, Jucuapa 1,100, Kamchatka 2,336,
Yenice–Gönen 1,070, Orléansville 1,243.

## Weather disasters, famine, epidemics — authored
Verified against sources 2026-08-25: Soviet famine 1946–47; UK winter 1946–47;
Operation Haylift / Snowbound 1949; NSW 1950 (wettest year on record); Great
Flood of 1951; Woodward 1947; Waco 1953; North Sea flood 1953 (2,551 dead);
Winter of Terror 1951; Chinchaga fire 1950; 1947 Egyptian cholera; Typhoons
Kathleen, Ione, Kitty, Irma, Jane, Ruth, Tess, Ida, Marie/Tōya Maru; 1954
Yangtze (33,000); 1954 Danube; 1955 Yuba–Sutter (74); 1955 Punjab; India's
1950–51 food crisis.
Removed after checking (no source): a 1949 Yangtze–Huai flood; a 1951 Sahel
locust wave (the FAO plague years 1949–63 stand; the Nile/Red Sea entry
remains). Verified: 1949–57 Texas drought (worst on the state's record;
1956, 1954, 1951 its driest years). Still on general knowledge: Assam 1950
floods (follow the verified earthquake); 1952 US polio year (57,628 cases).

## Consequential only (author rule, 2026-08-26)
Storms are kept only if they came ashore, or reached major-hurricane
strength within ~300 km of a coast: 443 of 761 tracked. Eruptions are kept
only if they damaged something: Sarychev 1946, Bagana 1952, Paricutín's
cone-building years, Bezymianny's 1955 precursor phase and Merapi 1953–54
(no recorded toll) are out.

## What "alterable" means
Geophysics is canon until the first lithospheric operation. Storms in the
Atlantic scale with what the player has done to the Atlantic; the other
basins are as recorded (no forcing reaches them yet). Weather disasters,
famine, locusts fire unless the player's own traced contribution to the
region opposes them (unmade) or reinforces them (worse). Epidemics and
tornadoes are canon.

## 1956–2022 (century session, 2026-08-26)
The record now runs to 2022. Storms: HURDAT2 + IBTrACS as before; after
1955 only Cat 2+ landfalls and Cat 4+ within reach of a coast are kept
(1,674 storms in all). Authored catalogs live under
`prototype/web/tools/history/` with a verification table beside each:
- `eruptions-1956-2022.py` (43) — `eruptions-sources.md`
- `quakes-1956-2022.py` (49, MAJOR rule) — `quakes-sources.md`
- `weather-1956-2022.py` (91: 82 alterable, 9 canon) — `weather-sources.md`
Every entry was checked against its Wikipedia article (GVP/USGS where
noted) by the authoring pass; fields marked *authored* in the tables
(display durations, ash/hit magnitudes, months of multi-year famines) are
game values, not record. Flags for the author: 2002 floods filed under
the Danube Basin (Elbe cities); 2011 Texas drought filed under the Gulf
Coast; famine tolls use the conservative end of the scholarly range
(ranges in the tables). 2023 onward is fiction.

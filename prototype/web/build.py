"""Assemble console.html from src/ (head, css, body, js/*.js in name order)
+ MODEL (expanded), LAND, textures, engine.
model-data.json stays the pristine sheet extraction (conformance target);
the console plays the EXPANDED world defined here: economic hubs, the
Arctic Shelf, and the Polar Destabilization capability."""
import json, pathlib
d = pathlib.Path(__file__).parent
M = json.load(open(d / "model-data.json"))

EXP = [
 # name, commodity, weight, sens, sigma, kind, coeffs(E,I,N,G), lags
 ("Taiwan Strait Industrial","Semiconductors",3,1.5,0.8,"hub",[-0.5,-0.1,0,-0.35],[1,1,2,3]),
 ("Persian Gulf Terminals","Crude oil",4,0.9,1.0,"hub",[0.1,0.35,0.15,-0.5],[2,1,2,4]),
 ("Andean Copper Belt","Copper",2,1.1,1.1,"hub",[0.6,0,0,-0.3],[1,1,2,3]),
 ("Congo Cobalt Belt","Cobalt",2,1.3,1.2,"hub",[-0.2,0.3,0.2,-0.45],[2,1,2,4]),
 ("North Sea Energy Shelf","Gas and crude",2,1.0,1.0,"hub",[-0.15,0,-0.4,-0.3],[2,1,1,3]),
 ("Ganges Delta Ports","Shipping and jute",2,1.4,0.7,"hub",[-0.4,0.45,0.2,-0.5],[1,1,2,4]),
 ("Siberian Gas Fields","Natural gas",2,0.8,1.3,"hub",[0.1,0,0.15,-0.6],[2,2,3,3]),
 ("Arctic Shelf","Sea lanes and ice",1,1.2,1.4,"ice",[0.1,0,0.3,-0.6],[2,2,2,2]),
 # --- the world's other breadbaskets and chokepoints (2026-08-25, ADR-0018) ---
 # wiring sign: coeff × driver = wet(+)/dry(−) anomaly. ENSO + = El Niño;
 # IOD + = positive dipole; NATL + = warm Atlantic (AMO+); GLOBAL = stress.
 ("California Central Valley","Fruit, nuts and rice",5,1.2,0.9,"",[0.4,0,-0.1,-0.45],[1,1,2,3]),     # El Niño wets the south/central valley winters
 ("Canadian Prairies","Wheat and canola",6,1.0,1.0,"",[-0.25,0,-0.2,-0.35],[1,1,2,3]),              # El Niño: warm, dry prairie winters; AMO+ drought reaches north
 ("Gulf Coast Refineries","Refined fuels, petrochemicals and the Mississippi grain terminals",3,1.3,1.0,"hub",[0.3,0,0.5,-0.3],[1,1,1,3]),  # El Niño wets the Gulf; a warm Atlantic means surge and storm
 ("North China Plain","Wheat and maize",9,1.1,0.9,"",[-0.35,-0.1,-0.1,-0.45],[1,2,3,3]),           # El Niño weakens the East Asian monsoon: north China dries
 ("Yangtze Basin","Rice",9,1.0,1.0,"",[0.6,0.15,0,-0.4],[2,2,1,3]),                                 # the decaying El Niño summer floods the Yangtze (1954, 1998)
 ("Manchurian Plain","Soy and maize",4,1.1,1.1,"",[-0.25,0,-0.1,-0.5],[1,1,3,3]),                   # cool El Niño summers in the northeast
 ("Northern European Plain","Wheat, sugar beet and dairy",8,0.9,0.8,"",[-0.1,0,-0.35,-0.35],[1,1,2,3]),  # a warm Atlantic brings the hot dry summers
 ("Mediterranean Basin","Olives, wheat and citrus",4,1.1,1.0,"",[0.15,0,-0.4,-0.5],[1,1,2,3]),     # El Niño wets Mediterranean autumns; AMO+ dries and bakes them
 ("Danube Basin","Wheat and maize",4,1.0,1.0,"",[-0.1,0,-0.3,-0.45],[1,1,2,3]),                     # southeast Europe's summer droughts ride the Atlantic
 ("Nile Delta","Cotton and wheat",3,1.4,0.9,"",[-0.3,0.15,0.2,-0.5],[2,2,2,4]),                     # El Niño starves the Ethiopian rains and the Nile flood; a wet Sahel feeds it
 ("Japan (Kanto–Kansai)","Steel, ships and rice",6,1.2,0.9,"hub",[-0.3,0,0,-0.35],[1,1,2,3]),       # El Niño's cool wet summers fail the rice (1993)
 ("Mekong Delta","Rice",5,1.0,0.9,"",[-0.5,-0.2,0,-0.4],[1,1,2,3]),                                  # El Niño drought and salt intrusion
 ("Cerrado","Soy, coffee and cattle",6,1.0,1.0,"",[0.2,0,-0.3,-0.4],[2,1,2,3]),                     # a warm north Atlantic pulls the rains north, off central Brazil
 ("Southern African Maize Belt","Maize",4,1.3,1.2,"",[-0.6,-0.2,0,-0.5],[1,1,2,4]),                 # El Niño summer drought, the region's oldest enemy
 ("Kazakh Virgin Lands","Spring wheat",4,1.2,1.3,"",[-0.1,0,-0.2,-0.55],[2,1,3,3]),                 # continental, variable; a warm Atlantic dries central Asia
 ("Panama Canal","Canal transits",2,1.5,0.9,"hub",[-0.6,0,0.2,-0.3],[1,1,2,3]),                     # El Niño drought empties Gatún Lake: draft restrictions
 ("Malacca Strait","Shipping, rubber and tin",3,1.1,0.9,"hub",[-0.5,-0.3,0,-0.35],[1,1,2,3]),      # El Niño and a positive dipole: drought and the haze
 ("Pilbara Iron Belt","Iron ore and port loadings",3,1.1,1.1,"hub",[-0.3,-0.3,0,-0.3],[1,1,2,3]),   # La Niña and a negative dipole bring the cyclones that close Port Hedland
 ("Murray–Darling Basin","Irrigated cotton, rice and wheat",4,1.3,1.1,"",[-0.6,-0.5,0,-0.45],[1,1,2,3]),  # El Niño and a positive dipole: the basin's droughts
 ("Hawaiian Islands","Sugar, pineapple and Pacific basing",2,1.2,0.9,"hub",[-0.4,0,0,-0.3],[1,1,2,3]),    # El Niño dries the islands; the tsunamis come from the record
]
LATS = {"North American Plains":41.5,"Black Sea Steppe":48,"La Plata Basin":-31,
 "South Asia":22,"Southeast Asia":12,"Eastern Australia":-29,"Sahel":14,
 "Horn of Africa":8,"Taiwan Strait Industrial":24,"Persian Gulf Terminals":26.5,
 "Andean Copper Belt":-24,"Congo Cobalt Belt":-11,"North Sea Energy Shelf":57,
 "Ganges Delta Ports":22.5,"Siberian Gas Fields":62,"Arctic Shelf":76,
 "California Central Valley":36.8,"Canadian Prairies":52,"Gulf Coast Refineries":29.7,
 "North China Plain":36.5,"Yangtze Basin":30.5,"Manchurian Plain":45,"Northern European Plain":50.5,
 "Mediterranean Basin":40,"Danube Basin":46.5,"Nile Delta":30.5,"Japan (Kanto–Kansai)":35.7,
 "Mekong Delta":10,"Cerrado":-15.8,"Southern African Maize Belt":-27,"Kazakh Virgin Lands":51,
 "Panama Canal":9.1,"Malacca Strait":2.5,"Pilbara Iron Belt":-20.3,"Murray–Darling Basin":-34.5,"Hawaiian Islands":21.3}
# Hubs that factually ship grain (ADR-0021): the Mississippi terminals are
# the world's largest grain export gateway; grain is the Panama Canal's
# largest cargo by tonnage; Australian and Black Sea wheat reaches Asia
# through Malacca. Only these hubs count in the grain supply index.
GRAIN_HUBS = {"Gulf Coast Refineries","Panama Canal","Malacca Strait"}
# Share of each region's output that reaches the traded market (ADR-0021).
# Only ~20% of the world's grain is ever traded, so the price is made by the
# exporters: a shortfall on the Steppe or the Plains moves Chicago; a
# shortfall in a self-consuming giant moves it only through import demand.
# Broad-brush 1946–present: net exporters ~1, importers/self-sufficient
# producers low, subsistence regions near zero (their failures are aid).
EXPORT = {"North American Plains":1.0,"Black Sea Steppe":0.9,"La Plata Basin":1.0,
 "South Asia":0.4,"Southeast Asia":0.8,"Eastern Australia":1.0,"Sahel":0.1,
 "Horn of Africa":0.1,"California Central Valley":0.4,"Canadian Prairies":1.0,
 "North China Plain":0.3,"Yangtze Basin":0.2,"Manchurian Plain":0.5,
 "Northern European Plain":0.8,"Mediterranean Basin":0.3,"Danube Basin":0.6,
 "Nile Delta":0.1,"Mekong Delta":0.8,"Cerrado":0.9,"Southern African Maize Belt":0.4,
 "Kazakh Virgin Lands":0.8,"Murray–Darling Basin":0.8,
 "Gulf Coast Refineries":1.0,"Panama Canal":0.7,"Malacca Strait":0.5}
for (name,com,wt,sens,sig,kind,co,lg) in EXP:
    reg={"name":name,"crop":com,"weight":wt,"sens":sens,"sigma":sig,"homeland":False}
    if kind: reg["kind"]=kind
    if name in GRAIN_HUBS: reg["grain"]=True
    if name in EXPORT: reg["export"]=EXPORT[name]
    M["regions"].append(reg)
    for di in range(4):
        M["coeff"][di].append(co[di]); M["lags"][di].append(lg[di])
for r in M["regions"]:
    r["lat"] = LATS.get(r["name"], 0)
    if r["name"] in EXPORT and "export" not in r: r["export"]=EXPORT[r["name"]]
total = sum(r["weight"] for r in M["regions"])
for r in M["regions"]: r["weight"] = round(r["weight"]*100.0/total, 4)
# deterministic weather noise for the new regions
seed = 990421
def rnd():
    global seed
    seed = (seed*1103515245+12345) & 0x7fffffff
    return seed/0x7fffffff
for row in M["climate"]:
    row["noise"] = row["noise"] + [round((rnd()*2-1)*0.28,3) for _ in EXP]
M["capabilities"].append({"name":"Climate Research","type":"REGION",
    "fixedTarget":0,"mag":0,"lag":1,"sig":0,"cost":8,"dispTo":"",
    "dispFactor":0,"dispExtraLag":0,"needsDrought":False,"resil":0,"research":True})
M["capabilities"].append({"name":"Polar Destabilization","type":"REGION",
    "fixedTarget":0,"mag":2.2,"lag":4,"sig":16,"cost":38,"dispTo":"GLOBAL",
    "dispFactor":0.35,"dispExtraLag":3,"needsDrought":False,"resil":0})
# Pacing tune (author): tools act NOW or next season, then burn down over
# a duration with decay. Ledger displacement debts keep their original
# sheet arrival distance from the commit. Signature charges once, on the
# first landing.
TUNE = {  # name: (lag, dur, decay)
 "Cloud Seeding": (0,2,0.5),
 "Watershed Interference": (1,3,0.7),
 "Fire Enablement": (0,3,0.6),
 "Ocean Thermal Forcing": (1,3,0.7),
 "Stratospheric Aerosol Inj.": (1,4,0.75),
 "ENSO Forcing": (1,2,0.6),
 "Ionospheric Coupling [T3]": (0,2,0.5),
 "Polar Destabilization": (1,3,0.7),
}
SHEET_ARRIVAL = {"Ocean Thermal Forcing":8,"Stratospheric Aerosol Inj.":7,
                 "ENSO Forcing":11,"Polar Destabilization":7}
for c in M["capabilities"]:
    if c["name"] in TUNE:
        lag,dur,dec = TUNE[c["name"]]
        c["lag"], c["dur"], c["decay"] = lag, dur, dec
        if isinstance(c.get("dispTo"), str) and c["dispTo"]:
            c["dispExtraLag"] = SHEET_ARRIVAL[c["name"]] - lag

# --- assembly: src/ is the source of truth; console.html is build output.
# The page script is one closure over shared state, so the js parts are
# concatenated into a single <script> in filename order (00-, 10-, ...).
# Keep each part self-contained by *topic*; cross-part references are fine.
src = d / "src"
def part(n): return (src / n).read_text()
js_parts = sorted((src / "js").glob("*.js"), key=lambda q: q.name)
tpl = (part("head.html") + "<style>\n" + part("console.css") + "</style>\n\n"
       + part("body.html") + "\n<script>\n"
       + "".join(q.read_text() for q in js_parts) + "</script>\n")
land = (d / "land.json").read_text()
engine = (d / "engine.js").read_text()
def b64(n): return (d / n).read_text().strip() if (d / n).exists() else ""
out = (tpl.replace("__MODEL__", json.dumps(M, separators=(",",":")))
          .replace("__LAND__", land)
          .replace("__ENGINE__", engine)
          .replace("__EARTH__", b64("earth.b64"))
          .replace("__CLOUDS__", b64("clouds.b64"))
          .replace("__STORM__", b64("storm.b64"))
          .replace("__VOLCANO__", b64("volcano.b64"))
          .replace("__SMOKE__", b64("smoke.b64"))
          .replace("__HISTORY__", (d / "history.json").read_text()))
(d / "console.html").write_text(out)
(d / "model-expanded.json").write_text(json.dumps(M, separators=(",",":")))  # the console's world, for engine tests
print(f"console.html: {len(out):,} bytes · {len(M['regions'])} regions · "
      f"{len(M['capabilities'])-1} tools · {len(js_parts)} js parts")

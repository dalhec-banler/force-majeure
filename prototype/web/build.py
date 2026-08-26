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
]
LATS = {"North American Plains":41.5,"Black Sea Steppe":48,"La Plata Basin":-31,
 "South Asia":22,"Southeast Asia":12,"Eastern Australia":-29,"Sahel":14,
 "Horn of Africa":8,"Taiwan Strait Industrial":24,"Persian Gulf Terminals":26.5,
 "Andean Copper Belt":-24,"Congo Cobalt Belt":-11,"North Sea Energy Shelf":57,
 "Ganges Delta Ports":22.5,"Siberian Gas Fields":62,"Arctic Shelf":76}
for (name,com,wt,sens,sig,kind,co,lg) in EXP:
    M["regions"].append({"name":name,"crop":com,"weight":wt,"sens":sens,
                         "sigma":sig,"homeland":False,"kind":kind})
    for di in range(4):
        M["coeff"][di].append(co[di]); M["lags"][di].append(lg[di])
for r in M["regions"]: r["lat"] = LATS.get(r["name"], 0)
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
print(f"console.html: {len(out):,} bytes · {len(M['regions'])} regions · "
      f"{len(M['capabilities'])-1} tools · {len(js_parts)} js parts")

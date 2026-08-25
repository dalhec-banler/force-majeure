"""Assemble console.html: template + MODEL (expanded), LAND, textures, engine.
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
for (name,com,wt,sens,sig,kind,co,lg) in EXP:
    M["regions"].append({"name":name,"crop":com,"weight":wt,"sens":sens,
                         "sigma":sig,"homeland":False,"kind":kind})
    for di in range(4):
        M["coeff"][di].append(co[di]); M["lags"][di].append(lg[di])
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
M["capabilities"].append({"name":"Polar Destabilization","type":"REGION",
    "fixedTarget":0,"mag":2.2,"lag":4,"sig":16,"cost":38,"dispTo":"GLOBAL",
    "dispFactor":0.35,"dispExtraLag":3,"needsDrought":False,"resil":0})

tpl = (d / "template.html").read_text()
land = (d / "land.json").read_text()
engine = (d / "engine.js").read_text()
def b64(n): return (d / n).read_text().strip() if (d / n).exists() else ""
out = (tpl.replace("__MODEL__", json.dumps(M, separators=(",",":")))
          .replace("__LAND__", land)
          .replace("__ENGINE__", engine)
          .replace("__EARTH__", b64("earth.b64"))
          .replace("__CLOUDS__", b64("clouds.b64"))
          .replace("__STORM__", b64("storm.b64")))
(d / "console.html").write_text(out)
print(f"console.html: {len(out):,} bytes · {len(M['regions'])} regions · {len(M['capabilities'])-1} tools")

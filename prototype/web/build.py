"""Assemble console.html: template + inlined MODEL, LAND, textures, engine."""
import json, pathlib
d = pathlib.Path(__file__).parent
tpl = (d / "template.html").read_text()
model = json.dumps(json.load(open(d / "model-data.json")), separators=(",", ":"))
land = (d / "land.json").read_text()
engine = (d / "engine.js").read_text()
earth = (d / "earth.b64").read_text().strip() if (d / "earth.b64").exists() else ""
clouds = (d / "clouds.b64").read_text().strip() if (d / "clouds.b64").exists() else ""
out = (tpl.replace("__MODEL__", model)
          .replace("__LAND__", land)
          .replace("__ENGINE__", engine)
          .replace("__EARTH__", earth)
          .replace("__CLOUDS__", clouds))
(d / "console.html").write_text(out)
print(f"console.html: {len(out):,} bytes")

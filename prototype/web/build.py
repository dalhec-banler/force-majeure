"""Assemble console.html: template + inlined MODEL, LAND, and engine."""
import json, pathlib
d = pathlib.Path(__file__).parent
tpl = (d / "template.html").read_text()
model = json.dumps(json.load(open(d / "model-data.json")), separators=(",", ":"))
land = (d / "land.json").read_text()
engine = (d / "engine.js").read_text()
out = (tpl.replace("__MODEL__", model)
          .replace("__LAND__", land)
          .replace("__ENGINE__", engine))
(d / "console.html").write_text(out)
print(f"console.html: {len(out):,} bytes")

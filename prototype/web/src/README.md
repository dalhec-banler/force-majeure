# console source parts

`build.py` assembles `console.html` from these files. Edit here, never the
build output. The page script is **one closure over shared state** (`t`,
`slots`, `effects`, `eng`, …), so the `js/` parts are concatenated in
filename order into a single `<script>` — no imports/exports, and any part
may reference names declared in an earlier (or, for functions, later) part.

| part | owns |
|---|---|
| `head.html` | title, meta, font links |
| `console.css` | all styling (single phosphor theme, no host-theme leak) |
| `body.html` | header / main / footer / overlays markup |
| `js/00-setup.js` | `__MODEL__` `__LAND__` `__ENGINE__` placeholders, engine instance + opts, positions, datelines, shared `let` state |
| `js/10-tray.js` | tool tray, descriptions, click-to-aim |
| `js/20-canvas.js` | 2D canvas sizing, drag/zoom, `project()` |
| `js/21-earth.js` | WebGL Blue Marble shader (drought browning, ice, terminator), region click |
| `js/22-effects.js` | persistent spectacle: fire, smoke, storms, beams |
| `js/23-ambient.js` | cosmetic volcanoes/cyclones, sprite loaders, starfield |
| `js/24-draw.js` | `drawGlobe` frame loop, markers, arcs, hover |
| `js/30-newsroom.js` | wire feed, headline corpus, precedent tree, briefings, alerts |
| `js/31-hud.js` | sparks, in-flight board, header HUD, TRACE attribution, advisor memos |
| `js/40-directives.js` | phase strip, committee directives (onboarding) |
| `js/41-audio.js` | WebAudio synth SFX |
| `js/50-season.js` | `runSeason` — the whole resolve/consequence/attribution beat, season clock |
| `js/60-archive.js` | end-of-campaign archive |
| `js/70-boot.js` | boot sequence, toggles, event wiring |

Add a new part with the next free number in its band; keep the order
semantics (declarations before first use at load time).

After any edit: `python3 build.py`, then the engine integrity check in
`docs/graphics-handoff.md` (treasury 302.40), then grep-verify the
feature list in the night report before publishing. Engine opts that must be
present in `00-setup.js`: `rivals:true, idleTrim:0.6, jetstream:true, forensics:true,
knowledge:true, budgetGate:true, priceCap:300, scrutiny:true, grainSupply:true,
priceElasticity:3.0, rivalEras:true, shadow:true, eras:true, envelopeWidening:0.0006,
windfall:2, reserveCap:400`. `model-expanded.json` is the
console's world for engine-level tests (`HTML=` overrides the harness page).

## The long campaign (ADR-0023)
`build.py` with `LONG = True` builds the 460-season world (1946–2060)
from the climate pack; regions carry `from`, capabilities `from/chest/
upkeep`, and `MODEL.tiers` sets the review cadence. `tools/extract-history.py`
rebuilds `history.json` to 2022 from `data/raw` and `tools/history/`.
Harness: `node tools/playharness.js "$PWD/tools/campaign-century.js"`
(`LAB=1` for the lab line); `api.review()` runs one review, `api.standup(cap)`
/ `api.mothball(cap)` order wings, `api.wing(cap)` reads a wing's status.

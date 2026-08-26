# Graphics & Interface Handoff — Playtest Console

**Audience:** an AI coding agent working locally in this repository, tasked
with improving the *graphics and interface* of the playtest console.
**Scope: presentation only.** The simulation is sacred; the pixels are yours.

---

## 1. What this is

Force Majeure is a grand strategy game: 1946–1955 (in this prototype), you
direct a covert state weather-warfare program. You nudge the climate
through slow, deniable operations; consequences arrive seasons later in
countries you did not target; the world's press reports the disasters; an
attribution dossier creeps toward exposing you. The prototype is a
40-season playable test of whether that loop is fun.

The console lives at `prototype/web/` and compiles to a **single
self-contained HTML file** (`console.html`). It currently features: a WebGL
Blue Marble globe with drifting clouds, drought-browning land, ambient
hurricanes and erupting volcanoes; a SimCity-style tool tray with
click-to-aim targeting; a breaking-news wire with datelines and chyrons; a
T-minus countdown board of operations in flight; advisor memos; causal
TRACE lines; screen-shake, shockwaves, and alarm flashes.

## 2. Files and build

```
prototype/web/
  src/              ← EDIT THESE. head.html, console.css, body.html, and
                      js/NN-topic.js parts concatenated in name order into
                      one <script> (single shared closure — see src/README.md)
  engine.js         ← DO NOT MODIFY. Exact port of the reference spreadsheet.
  model-data.json   ← DO NOT MODIFY. Game data extracted from the workbook.
  land.json         ← coastline polygons (wireframe fallback only)
  earth.b64         ← NASA Blue Marble texture, data URI (public domain)
  clouds.b64        ← NASA cloud layer, data URI (public domain)
  build.py          ← assembles console.html from the above
  console.html      ← BUILD OUTPUT. Never edit by hand.
```

Workflow: edit the relevant `src/` part (and add new `.b64` assets + `build.py`
injection if needed) → `python3 build.py` → serve with
`python3 -m http.server 8471` → open `http://localhost:8471/console.html`.

**Engine integrity check (run after any change, must pass):**
```bash
cd prototype/web && node -e "
const {createEngine}=require('./engine.js');
const M=require('./model-data.json');
const e=createEngine(M); let r;
for(let t=1;t<=40;t++) r=e.resolve(t,{});
console.assert(Math.abs(r.treasury-302.40)<0.01, 'ENGINE DRIFT');
console.log('engine OK', r.treasury.toFixed(2));"
```

Work on a branch (suggested: `gpt-graphics`). Do not push to `main`.

## 3. Hard rules — violating any of these fails the task

1. **Never modify** `engine.js`, `model-data.json`, or anything outside
   `prototype/web/` (the `docs/` are read-only context).
2. **Single self-contained file.** No CDN scripts, no external stylesheets,
   no remote images or fetches. The one allowed external host is Google
   Fonts (`fonts.googleapis.com` links). All other assets must be inlined
   as data URIs. Keep `console.html` under ~8 MB.
3. **No randomness in game state.** `Math.random()` must never influence
   anything the engine sees. Cosmetic animation should derive from
   timestamps and the season index (as current code does).
4. **The game never moralizes** (design constraint, non-negotiable). No
   guilt meters, no grim color grading on aftermath, no judging copy.
   Aftermath imagery is exactly as beautiful as real satellite imagery of a
   flood plain — which is very.
5. **The dossier number stays hidden.** The player sees ladder text and the
   signal meter only. (The footer telemetry toggle is a playtest tool —
   keep it.)
6. **No casualty counters in the HUD.** Suffering is never a number the
   player optimizes against.
7. **Information is preserved.** Restyle anything, but every current
   channel must survive: news wire (datelines + BREAKING), TRACE causal
   lines, IN FLIGHT countdowns, advisor memos, attribution ladder,
   containment slider, prediction input, five-phase resolve flow, end-of-run
   archive with predictions replay. If you remove something, say so
   explicitly in the commit message.
8. **Content rules:** no real political figures; no real modern disasters
   presented as caused by intervention; no real currencies or brands.

## 4. Art direction (the taste constraints)

- **North star:** keeps people coming back · beautiful AND destructive ·
  feels a bit like chess. See `docs/north-star.md`.
- **Register:** NASA scientific visualization, not disaster cinema. The
  reference set is Earth Observatory imagery, GOES loops, "Perpetual
  Ocean," SST anomaly maps. The game is beautiful because it is accurate.
- **Chrome:** 1946–1955 government ops center. Terminal green phosphor,
  memo typography (IBM Plex Mono/Sans), redaction bars, classification
  strips. The globe is sublime; the bureaucracy around it is dry.
- **Instruments loud, outcomes quiet.** Klaxons, countdowns, shockwaves,
  breaking-news chyrons for events *arriving*; calm, spare language for
  aftermath.
- **The world is the interface** (SimCity, not a management sim): tools are
  aimed at the globe by clicking it; feedback comes from the world and the
  news, not from form fields.

## 5. Known rough edges — a starting worklist (your judgment on priority)

- Ambient hurricanes sometimes drift over land; constrain them to their
  ocean basins and give them proper life cycles (spin up, peak, decay).
- Region markers: the sigma ring vs anomaly disc is the core mechanic
  (inside = safe weather, outside = evidence) — make that read instantly
  and stay legible at all zoom levels.
- The LEDGER sparklines are small and underdesigned.
- Chyron/alert stacking and timing could be choreographed better.
- The end-of-run archive screen deserves a real layout (it is the retention
  moment — the player should leave wanting another run).
- Plane/ship mission glyphs are primitive; contrails could be lovely.
- Volcano plumes, fire, and smoke can all be richer (still canvas/WebGL,
  still self-contained).
- No day/night terminator, no specular ocean, no star field — all fair
  game if they serve the register.
- No sound at all yet. Subtle, diegetic instrument audio (Geiger-tick
  telemetry, teletype for the wire, a low alarm) is welcome; must respect
  browser autoplay rules and a visible mute.
- Mobile/responsive layout is rough.

## 6. Engine API the UI consumes (read-only contract)

`createEngine(MODEL)` → `eng` with `resolve(t, cmd)` called once per season
in order; `cmd = {opA, targetA, opB, targetB, containment, prediction}`
(op names must match `MODEL.capabilities[].name`). Each call returns a row:
anomalies/sigmas/yields/resil per region (order = `MODEL.regions`),
driverTotals/driverNat, price, revenue, treasury, mandate, severity,
dossier (hidden!), ladderText, status
(`running|obsolescence-warning|exposed|insolvent|dissolved`), landed
effects, committed ops, prediction. `eng.state.rows` is full history;
`eng.state.ops` is every operation ever committed. The 2D overlay's
`project(lat,lon)` and the WebGL shader must stay in agreement if either
is touched.

## 7. Definition of done

- `python3 build.py` succeeds; the engine integrity check passes.
- A full 40-season run is playable start → archive with no console errors.
- Every rule in §3 holds. Screenshots of before/after for each visual
  change, in the PR/commit description.

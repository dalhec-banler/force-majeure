# Open-Source Tools, Engines & Graphical Resources

Assessment of what we can rely on, license-checked against the build-gate
policy (TDD §6.5: `public_domain` / `attribution` / `non_commercial` /
`restricted`). The art direction (brief §15) is scientific visualization —
which is a genuine cost advantage, because the best assets in that register
are government-produced and public domain.

## Engines & rendering

| Tool | License | Verdict |
|---|---|---|
| **Bevy** (Rust, wgpu) | MIT/Apache-2.0 | **Primary candidate** for the production presentation layer. Keeps one language with the sim core, and wgpu gives direct shader control — the sublime globe (anomaly fields, volcanic color-temperature shift, terminator line) is fundamentally a custom-shader problem, not an asset problem. Young editor tooling is the honest cost. |
| **Godot 4** | MIT | **Fallback candidate.** Mature editor, fast iteration, good UI toolkit for the bureaucratic screens (memos, dossiers, hearings). Rust sim binds via GDExtension. Choose this over Bevy if iteration speed on the *interface* game (gap #2 — our biggest risk) matters more than shader ergonomics on the globe. |
| **three.js / deck.gl / MapLibre GL** | MIT / MIT / BSD-3 | **The playtest build.** The WASM sim core + a three.js globe in the browser is the fastest path to putting the loop in testers' hands, and deck.gl was *built* for exactly our aesthetic (large-scale geospatial data viz). Nothing here is throwaway: shader work on anomaly rendering translates conceptually to wgpu. |
| CesiumJS | Apache-2.0 | Noted, not recommended — photoreal streaming-globe machinery we don't need; our globe renders authored sim state, not tiled earth imagery. |
| egui (Rust) | MIT/Apache-2.0 | Internal tooling: graph editors, balance dashboards, replay inspectors. Not the shipped UI. |

**The engine decision stays behind the prototype gate** (handoff §5 defers
all presentation), but the recommendation on record is: browser playtest
build now-ish, Bevy as the working assumption for production, Godot as the
documented fallback — revisit via ADR when `sim/` unfreezes.

## Planetary & cartographic data (the "art assets" of this game)

| Resource | License | Use |
|---|---|---|
| **NASA Blue Marble / Visible Earth** | Public domain | Base globe textures, monthly variants (the seasonal green-up of brief §15 is literally a texture sequence NASA already made). |
| **NASA Black Marble** | Public domain | Night lights — civilization as seen by the program; also a diegetic damage readout across the century. |
| **Natural Earth** | Public domain | Coastlines, borders, rivers, basins at three scales. The 1946 political map and the region boundaries both start here. |
| **GEBCO bathymetry / ETOPO** | Public domain (attribution requested) | Ocean floor relief for the globe; makes the ocean read as a physical system, which matters for a game about moving heat through it. |
| **NOAA GOES / Himawari imagery** | Public domain | Reference and possibly direct source material for the event-view briefing packages (brief §14 — satellite imagery, procedural or pre-rendered). |
| **NASA SVS (Scientific Visualization Studio)** | Public domain | The reference reel for the entire art direction; Perpetual Ocean is theirs. |
| CShapes 2.0 (historical borders 1886–2019) | CC BY-NC-SA | **Non-commercial — excluded** by the same gate as EM-DAT (ADR-0012). The evolving political map is authored fiction after 1946 anyway (brief §19); we only need the real 1946 opening map, which Natural Earth + authored edits covers. |

## Colormaps & typography

| Resource | License | Use |
|---|---|---|
| **cmocean** | MIT | Oceanographic colormaps (thermal, balance, curl) — the SST-anomaly blue-white-red divergent scale the brief names is `cmocean.balance`. |
| **Scientific Colour Maps (Crameri)** | MIT | Perceptually uniform, colorblind-safe; the calm-state palettes. |
| **viridis family (matplotlib)** | BSD-compatible | Fallback/general. |
| **Public Sans** | OFL/CC0 (US Gov) | *A US-government-commissioned typeface* — the memo/form voice, authentically. |
| **IBM Plex Mono** | OFL | Terminal green telemetry text. |
| **Routed Gothic** | CC0-style | Engineering-drawing lettering (cockpit/instrument annotation) — the instrument-feedback register of brief §14. |

All three colormap packages ship as data (RGB tables) — they compile into the
content pack; no runtime dependency.

## Simulation-side libraries (already implied by the TDD)

Rust: `blake3`, `serde`/`postcast`, `proptest` (all MIT/Apache). Python
ingestion: `pandas`, `pyarrow`, `xarray`, `netCDF4`, `cdsapi`, `requests`
(BSD/Apache/MIT). Audio, eventually: **Kira** (Rust, MIT) or Godot's bus
system — noted for gap #8, not started.

## What open source does *not* give us

Honesty about the gaps: no library renders "a cyclone from orbit that makes
you feel complicit." The globe's beauty will be custom shader work driven by
sim state — the open-source world supplies the substrate (textures, relief,
colormaps, borders) and the toolchain (wgpu/three.js), and that is most of
the pipeline answer to gap #9: **procedural from real data, authored where
the fiction diverges.** No licensed asset packs, no stock disaster footage —
both would violate the "beautiful because it is accurate" rule.

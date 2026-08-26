# FORCE MAJEURE

Grand strategy / simulation, single-player, **1946–2060**. You direct a state
environmental warfare programme — cloud seeding in 1946, watersheds by Popeye,
the stratosphere after El Chichón, the Pacific after TOGA, the ionosphere in the
HAARP years — to make your homeland prosper and your rivals fail, while making
sure no one can ever prove it was you. Every intervention is a wager that the
outcome falls inside the envelope of what climatology says could have happened
anyway.

Public repository. The design is the author's; the code is a playtest
instrument, not the game.

## Play it

The playtest console is a single HTML file: `prototype/web/console.html`.
Open it locally (`cd prototype/web && python3 -m http.server 8471`, then
`http://localhost:8471/console.html`) or use the published artifact.

- **Pick the programme you take over** on the intro screen — United States,
  Soviet Union, China, India, Western Europe. The choice sets the homeland,
  the rival programme and the chest; never the systems available.
- **Reviews, not seasons.** Decisions come once a year until the ENMOD era,
  twice a year to 2029, every season in the situation room after. The clock
  only nags (footer: CLOCK MANUAL/AUTO); **RUN THE YEAR** commits what is armed.
- **The board grows** — sixteen regions in 1946, thirty-six by 2010 — and so
  does the arsenal: dimmed tools show the year they become possible and the
  chest you must hold to stand the wing up. Wings charge upkeep, mothball when
  the chest collapses, and reopen at three-quarters.
- **The wire** opens in PRIORITY mode (the committee, your operations, hostile
  action, wings, the ladder, BREAKING events); each operation is one card that
  grows as it lands and is filed; each review folds into one line when the
  next begins.
- One save slot per programme, in the browser; RESUME replays it.

## Layout

```
docs/
  design-brief-v0.4.md      The design. Authoritative on intent, tone, systems.
  handoff.md                Scope, constraints, gaps register.
  technical-design.md       Deliverable 1 — the Technical Design Document.
  north-star.md             Retention, beautiful+destructive, chess-feel.
  decisions/                ADRs 0001–0025, one file per decision.
  night-report*.md, century-session.md, ladder notes — session records.
  history-sources.md        How the record was verified.
prototype/
  force-majeure-prototype.xlsx   The ENGINE sheet. Reference tick.
  web/
    engine.js               Exact port of the sheet + gated mechanisms (opts).
    model-data.json         Pristine sheet extraction (conformance target).
    build.py                Assembles console.html: the expanded world
                            (36 regions, 10 tools, 460 seasons), src/ parts.
    src/                    Console source (head, css, body, js/NN-topic.js).
    history.json            The record 1946–2022 (built by tools/extract-history.py).
    tools/                  playharness.js + campaign-*.js (scripted playtests),
                            extract-history.py, history/ (verified catalogs),
                            sizes.html (viewport harness).
data/
  raw/                      Gitignored. Fetched, never committed.
  processed/pack-climate.json   ONI/DMI/AMO/PDO 1946–2022 + basin activity.
ingest/                     Deliverable 2 — one module per dataset, 21 tests.
sim/                        Does not exist yet. Gated on the playtest.
```

## Build and verify

```
cd prototype/web
python3 build.py                       # src/ + engine + world → console.html
node -e "const {createEngine}=require('./engine.js');const M=require('./model-data.json');
const e=createEngine(M);let r;for(let t=1;t<=40;t++)r=e.resolve(t,{});
console.assert(Math.abs(r.treasury-302.40)<0.01,'ENGINE DRIFT');console.log('engine OK')"
node tools/playharness.js "$PWD/tools/campaign-century.js"     # a scripted century (LAB=1 for the lab line)
python3 tools/extract-history.py       # rebuild history.json from data/raw + tools/history/
```

The sheet baseline (treasury 302.40 after forty no-op seasons on
`model-data.json`) must never move; every mechanism beyond the sheet is an
engine option, default off, listed in `prototype/web/src/README.md`.

## Status

- [x] Deliverable 1 — Technical Design Document
- [x] Deliverable 2 — Data ingestion layer (driver series + basin activity)
- [x] Playable console: the century, reviews, the arsenal on the calendar, the
      growing board, the ladder with teeth, counterfactual PROFIT, the record
      to 2022, nation starts (ADR-0013 → ADR-0025)
- [ ] Core loop validated by the author playing the century
- [ ] ERA5/FAOSTAT ingest — gated on the authored region list
- [ ] `sim/` — gated on the playtest

## The gate

> Is it fun to nudge an invisible system and watch consequences arrive four to
> eight seasons later in the wrong country?

Nothing in `sim/` gets written until the prototype answers that.

## Data and record

Climate indices: NOAA CPC/PSL (ONI, AMO, PDO), Met Office HadISST DMI —
public domain / research use, see `ingest/`. Storms: HURDAT2 (NOAA/NHC) and
IBTrACS v04. Eruptions, earthquakes, famines, floods and epidemics 1946–2022
were authored from and verified against Wikipedia, the Smithsonian GVP and
USGS; the verification tables are beside each catalog under
`prototype/web/tools/history/`. Events after 2022 are fiction; the geophysical
record is canon until the first lithospheric operation.

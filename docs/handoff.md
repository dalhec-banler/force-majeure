# FORCE MAJEURE — Handoff Package v1.1
### Everything needed to start the technical design phase

---

## 0. Read this first

**Ready to hand off:** the design. Six conversations of concept work, resolved and written down. The systems are specified well enough to reason about data structures, dependency ordering, and architecture.

**Not ready to hand off:** the build. One question remains unanswered and it is the only one that matters:

> **Is it fun to nudge an invisible system and watch consequences arrive four to eight seasons later in the wrong country?**

Nothing in the brief proves this. Every system in it *assumes* it. `force-majeure-prototype.xlsx` is the test — forty seasons, playable in an afternoon.

**Therefore: hand off the technical design work now; gate implementation on the prototype.** A data model and an ingestion pipeline survive a rebalance of the loop. Gameplay code does not.

---

## 1. The artifacts

| File | What it is |
|---|---|
| `force-majeure-design-brief-v0.4.md` | The design. Authoritative on intent, tone, and systems. Not a spec. |
| `force-majeure-prototype.xlsx` | Playable core-loop test and a working micro-model of the graph, envelope, attribution, and economy. |
| `force-majeure-handoff.md` | This document. |

**Read order:** brief §1–§10 (what the game is), then the prototype's `HOW TO PLAY` and `ENGINE` sheets (how the maths resolves), then brief §11–§24.

The prototype is not throwaway. Its `GRAPH`, `REGIONS`, `CAPABILITIES`, and `ASSUMPTIONS` sheets are a working first pass at the real data schema, and its `ENGINE` sheet is an executable statement of the resolution order. Treat it as a reference implementation of the tick.

---

## 2. Local setup

Everything is built locally, then pushed to a private repository. Nothing goes to a public remote.

### Proposed layout

```
force-majeure/
├── docs/
│   ├── design-brief-v0.4.md
│   ├── handoff.md
│   ├── technical-design.md          <- Deliverable 1 lands here
│   └── decisions/                   <- ADRs, one file per architectural decision
├── prototype/
│   └── force-majeure-prototype.xlsx
├── data/
│   ├── raw/                         <- gitignored; fetched, never committed
│   ├── processed/                   <- normalised, cached
│   └── schema/                      <- Deliverable 2 output
├── ingest/                          <- Deliverable 2 code
│   ├── sources/                     <- one module per dataset
│   └── tests/
├── sim/                             <- NOT YET. Gated on the prototype.
├── .gitignore
└── README.md
```

### Rules
- **`data/raw/` is gitignored.** ERA5 alone is enormous; the repo holds fetch code, not payloads.
- **One ADR per architectural decision** in `docs/decisions/`. Across this many systems, the reason a choice was made is worth more than the choice.
- **Private remote from the first commit.** Do not initialise public and flip it later.
- **Commit the prototype.** It is the reference implementation of the tick and will be consulted repeatedly.

### Suggested first commands
```bash
mkdir -p force-majeure && cd force-majeure
git init
# create the tree above, add .gitignore, then:
gh repo create force-majeure --private --source=. --remote=origin
```

---

## 3. Deliverable 1 — Technical Design Document

**Not code. A document.** The brief describes systems in design language; this converts them into structures, and it is where the real architectural risks surface. Output to `docs/technical-design.md`.

**1. Data model.** Regions, drivers, edges, capabilities, operations, contracts, dossiers, trade positions. Include the schema for the teleconnection graph (§7.1) and the variance envelope (§7.2), and specify how envelope widening (§5) is stored — computed per tick or materialised per season.

**2. Tick resolution order.** The five phases (§8) as an explicit dependency graph. **Highest-risk area in the project.** *Concrete evidence:* the spreadsheet prototype produced a genuine circular reference — operation magnitude read the prior season's anomaly for the fire precondition, while anomalies summed the whole magnitude column. Every formula was individually correct; the cycle was invisible until assembly, and the symptom appeared six columns downstream of the cause. The real engine will produce this class of bug repeatedly. **Specify the acyclic ordering explicitly and enforce it, rather than discovering violations at runtime.**

**3. Determinism and save/load.** The design's tension depends on causal chains four to eight seasons long. A save that does not reproduce bit-identically corrupts a hundred-hour campaign in ways that surface weeks later. Specify seeded RNG, ordering guarantees for all iteration over collections, and a replay-from-log test proving a reloaded state produces identical outcomes for N further ticks.

**4. The energy ledger as a checked invariant.** §6.2 says consequences are conserved. Make it a tested property, not a convention — assert that total displaced energy nets to within tolerance across any operation sequence. If it can silently fail to conserve, it will.

**5. Time compression architecture.** §5 requires variable resolution across 1946–2060 (~460 seasons at uniform granularity, which the design cannot carry). Specify how coarse early ticks and fine late ticks coexist without two separate simulation paths.

**6. Data ingestion.** Schema and pipeline for the real climate substrate (§5).

**7. Recommended stack, with reasoning.** Deliberately last. It should fall out of sections 1–6, not precede them.

---

## 4. Deliverable 2 — Data ingestion layer

Standalone, testable, useful regardless of how the loop tunes. Fetch, normalise, and cache into the schema from Deliverable 1.

| Dataset | Source | Licence note |
|---|---|---|
| ONI / ENSO index | NOAA CPC | Public domain (US Gov) |
| PDO, AMO | NOAA / NCEI | Public domain |
| ERA5 reanalysis | Copernicus C3S | Free, **attribution required**, licence terms apply |
| HURDAT2 | NOAA NHC | Public domain |
| Crop yields | FAOSTAT | Some series carry CC BY-NC-SA — **check before commercial use** |
| Disaster records | EM-DAT | **Non-commercial licence. Not usable in a commercial game without agreement.** |

> **Flagged risk.** EM-DAT and parts of FAOSTAT carry non-commercial terms. Verify licensing before either becomes load-bearing — a substitute or a licence agreement is needed for a commercial release. Cheap to solve now, expensive later.

---

## 5. Do not build yet

Everything downstream of the unanswered question:

- Gameplay code, tick engine, or balance logic
- UI, map rendering, or any presentation layer
- Content — codex entries, media, capability text
- Nation starts (§21) or contractor systems (§20)

If the prototype shows the loop needs rework, all of the above is discarded. The data model and ingestion layer are not.

---

## 6. Non-negotiable constraints

Design decisions already made, not open questions. Argument is welcome; unilateral reversal is not.

1. **Hand-authored teleconnection graph, not a gridded atmospheric model** (§7.1). Uncertainty comes from hidden state, not chaos. A "more realistic" simulation is a *worse* game and is unbalanceable.
2. **Attribution is an accumulating evidence dossier, not a dice roll** (§7.4). The player sees symptoms on a ladder, never the number.
3. **The obsolescence loss condition must remain viable** (§17). Without it, "never intervene" is dominant. A pure-defence turtle must be able to lose.
4. **The game never moralises** (§4). No morality meter, no guilt mechanic, no judging ending, no suffering-as-slider. Constrains UI as much as writing.
5. **Content rules in §19 are hard.** No real modern disaster is ever presented as caused by intervention. No real currencies, tokens, or financial brands.
6. **Beauty is truthful, never applied** (§15). Never ugliness as editorial.

---

## 7. Gaps register — what we are lacking

Ordered by how much each blocks progress.

### Blocking

| # | Gap | Notes |
|---|---|---|
| 1 | **Core loop unvalidated** | The prototype exists and has not been played. Gates everything. |
| 2 | **No interface design whatsoever** | Zero screens. How does a player read the graph, plan an operation, perceive the dossier, understand a delayed consequence? The design's largest legibility risk lives entirely in UX and none of it has been attempted. |
| 3 | **No numbers** | Every value in the prototype is a guess. No balance pass has occurred against any target. |

### Substantial

| # | Gap | Notes |
|---|---|---|
| 4 | **No content written** | Not one codex entry, media segment, or capability description exists. §4 describes a voice nobody has written a line in. The tone is unproven in prose. |
| 5 | **Nation starts unspecified** | §21 defines the system and the archetypes. Which six countries, with what values, is undone. |
| 6 | **Rival doctrines undesigned** | §16 gives each rival a one-sentence character. That is not an AI design. |
| 7 | **Onboarding beyond "the timeline is the tutorial"** | The principle is sound; the first thirty minutes are unspecified, and they decide whether anyone reaches hour three. |
| 8 | **Audio entirely absent** | In a game this instrument-driven — telemetry, alerts, briefing rooms, the media layer — sound is a primary channel, not decoration. Nothing has been said about it. |
| 9 | **Art pipeline undefined** | §15 sets direction. Who or what actually produces the globe, the anomaly visualisation, the satellite imagery? Procedural, licensed, or authored is an unmade decision with large cost implications. |

### Deferred but real

| # | Gap | Notes |
|---|---|---|
| 10 | **Meta-progression** | §17 says runs are compared, not won. What persists between runs — unlocks, codex, records — is undefined. |
| 11 | **Data licensing** | See §4. EM-DAT is non-commercial. |
| 12 | **Team, budget, timeline** | The design implies a multi-year effort. No production plan exists. |
| 13 | **Commercial framing** | Platform, price, publisher, audience size. Absent. |
| 14 | **Real-country sensitivity pass** | §19 and §21 have the player run a program that starves named real countries during the historical era. The real-to-fictional map drift mitigates this, but it deserves a deliberate review rather than an assumption. |

---

## 8. Known open questions

Do not resolve unilaterally; flag them.

- Graph scale — node count (§23.1)
- Time compression granularity and step-up triggers (§23.6)
- Trade graph visibility at start (§23.2)
- Whether rival operations are ever directly visible (§23.3)
- Campaign structure: sandbox vs. authored arc (§23.4)
- Failure recovery after exposure begins (§23.5)

---

## 9. Scope warning

The design carries three ledgers, four spheres, six disaster families, four loss conditions, commodity exposure, contractors, knowledge progression, six nation starts, and a 114-year timeline — all interacting. That is more systems than most shipped strategy games, and interaction is where balancing cost lives.

**The deferred list in §22 will need to grow, not shrink.** A technical design that assumes everything ships is the wrong technical design. Flag anything that would be materially cheaper to build if a named system were cut.

---

*Companion to design brief v0.4.*

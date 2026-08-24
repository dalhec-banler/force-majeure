# FORCE MAJEURE — Technical Design Document

**Deliverable 1, per `handoff.md` §3. A document, not code.**

Scope: converts the design brief (v0.4) into data structures, an enforced tick
ordering, a determinism contract, a checked conservation invariant, a time
compression architecture, an ingestion pipeline, and — last, because it falls
out of the rest — a stack recommendation.

Sources of truth used here: the brief (intent), the handoff (scope and
constraints), and the prototype's `ENGINE` sheet, which I have read
formula-by-formula and treat as the reference implementation of the tick.
Where this document generalises beyond the prototype, it says so. Where it
contradicts the prototype, that is a bug in this document.

Conventions: `S[t]` is the committed world state after tick `t`. A **season
index** `t` is `(year − 1946) × 4 + quarter`, quarters `0..3` =
Winter/Spring/Summer/Autumn, matching the prototype's `CLIMATE` sheet. The
full campaign is `t ∈ 0..=459` (1946 Winter through 2060 Autumn).

Open questions from handoff §8 are **not resolved here**. Where one touches
the architecture, the design is parameterised over it and the dependency is
flagged in Appendix B.

---

## 1. Data model

### 1.1 The three-way split

Everything the simulation touches lives in exactly one of three stores. This
split is load-bearing for determinism (§3), saves (§3.4), and modability, and
it mirrors what the prototype already does with its sheet layout:

| Store | Prototype analogue | Mutability | Persistence |
|---|---|---|---|
| **Content pack** | `REGIONS`, `GRAPH`, `CAPABILITIES`, `ASSUMPTIONS`, `CLIMATE` | Immutable at runtime; versioned and content-hashed | Shipped with the game; saves reference it by hash |
| **World state** `S[t]` | One row of `ENGINE` | Replaced wholesale each tick; never mutated in place | Snapshotted periodically into saves |
| **Command log** | The blue cells on `PLAY` | Append-only | The canonical save (§3.4) |

Rule: **the tick function reads the content pack and `S[..t-1]` and the
command log, and produces `S[t]`.** Nothing else exists. There is no global,
no ambient clock, no config file read mid-run.

### 1.2 Identity

Content entities carry stable string slugs (`region.sahel`,
`capability.fire-enablement`, `driver.enso`). At pack compile time each slug
is assigned a dense integer index used everywhere at runtime. Saves record the
pack hash plus the slug→index table, so a save can detect (and, for
compatible edits, survive) a pack change. Runtime code never compares strings.

All runtime collections are index-ordered vectors. There are no hash-ordered
containers anywhere in the simulation (§3.3).

### 1.3 Content pack schema

Sketched in a typed pseudo-notation; field names are normative, syntax is not.

```
ContentPack {
  meta: {
    name, semver, content_hash,          // blake3 over canonical serialisation
    license_profile: Commercial | Research,   // §6.5
    engine_compat: semver range,
  }

  drivers: [Driver {
    id: DriverId,
    slug, display_name,
    kind: Oscillation | Background,      // ENSO/IOD/NATL vs GLOBAL
  }]

  regions: [Region {
    id: RegionId,
    slug, display_name,
    homeland_eligible: bool,
    production: [ { commodity: CommodityId, supply_weight: frac } ],
    consumption: [ { commodity: CommodityId, demand_weight: frac } ],
    yield_sensitivity: q,                // prototype REGIONS!E
    sigma_base: q,                       // prototype REGIONS!F
    geometry_ref: MaskId,                // for ingestion aggregation only (§6);
                                         // the sim never sees geometry
  }]

  edges: [Edge {
    id: EdgeId,
    from: DriverId,
    to: DriverId | RegionId,             // driver→region is the prototype;
                                         // driver→driver is allowed by schema
    coeff: q,
    lag: u8,                             // seasons; VALIDATED lag >= 1 (§2.4)
    reveal: RevealTier,                  // knowledge progression, §7.5 of brief
  }]

  capabilities: [Capability {
    id: CapabilityId,
    slug, display_name, tier: Plausible | Deniable | Absurd,
    sphere: Atmosphere | Lithosphere | Hydrosphere | Biosphere,
    target_kind: Region | Driver(DriverId) | None,
    magnitude: q,
    lag: u8,                             // VALIDATED lag >= 1
    signature: q,                        // base attribution per use
    cost: q,
    displacement: Option<{
      to: DriverId, factor: q, extra_lag: u8   // energy ledger, §4
    }>,
    residual_route: ResidualPolicy,      // §4.3 — where non-displaced energy goes
    preconditions: [Precondition],       // e.g. PriorAnomalyBelow{threshold},
                                         // evaluated against S[t-1] ONLY (§2.5)
    precondition_penalty: q,             // effectiveness multiplier if unmet
    resilience_delta: q,                 // adaptation
    unlock: PrecedentRef,                // the precedent tree, brief §18
    declass_years: u8,                   // Glomar clock, 25/50/indefinite
  }]

  climate: {
    driver_series: [DriverId → [q; 460]],   // observed + backfilled + projected (§6)
    region_noise: NoiseSpec,                // literal series (prototype) or a
                                            // seeded generator spec (§3.2)
    scheduled_events: [GeoEvent],           // real eruptions/quakes while canon
                                            // (brief §19 geophysical exception)
    event_generators: [GeneratorSpec],      // fitted distributions for fictional
                                            // events post-divergence (§6.4)
  }

  assumptions: { named scalar constants },  // the ASSUMPTIONS sheet, verbatim
  exposure_ladder: [ { threshold: q, text_ref } ],
  nation_starts: [ ... ],                   // §21 — schema reserved, content absent
  contractors: [ ... ],                     // §20 — schema reserved, content absent
}
```

`q` is "simulation scalar" — deliberately abstract until §3.5 (the
deterministic-math ADR decides its representation). Nothing in this document
depends on it being a float.

### 1.4 World state schema

```
WorldState {
  tick: u16,
  drivers:   [DriverState  { natural: q, injected: q, total: q }],
  regions:   [RegionState  { noise: q, anomaly: q, sigma: q,
                             resilience: q, yield: q }],
  envelope:  { widening_accum: q },        // §1.6
  economy:   { supply: q, price_index: q, homeland_revenue: q,
               severity: q, mandate: q, treasury: q },
  trade:     [Position { commodity, direction, size }],
  ops:       OpsInFlight,                  // §1.5
  dossier:   Dossier,                      // §1.7
  ledger:    EnergyLedger,                 // §4
  rivals:    [RivalState],                 // schema reserved; see Appendix A
  contracts: [ContractState],              // schema reserved
  status:    Running | Lost(LossCondition),
  hash:      Digest,                       // chained state hash, §3.6
}
```

`S[t]` is immutable once committed. The engine keeps the full history
`S[0..=t]` in memory — at ≤ 80 regions and 460 ticks this is a few megabytes,
and keeping all of it is what makes lag reads (§2), the ending archive (brief
§17), and replay verification (§3.7) trivial. There is no "sliding window to
save memory" — that would be complexity spent to lose capability.

### 1.5 Operations in flight

An operation is committed once and then produces **scheduled effects**, which
are the only mechanism by which anything the player does touches the world:

```
Operation {
  id: OpId,                        // dense, assigned in commit order
  capability: CapabilityId,
  target: RegionId | DriverId,
  committed_tick: u16,
  reactive: bool,                  // §2.7
  resolved_magnitude: q,           // preconditions bound at commit, §2.5
  effects: [ScheduledEffect {
    lands_at: u16,                 // committed_tick + lag (+ extra_lag)
    kind: DriverInjection | RegionInjection | ResilienceGrant,
    where: DriverId | RegionId,
    magnitude: q,
    ledger_leg: LedgerLegId,       // §4 — every effect is a ledger posting
  }],
  signature_base: q,
  declass_at: u16,                 // Glomar clock
}
```

`OpsInFlight` is a vector of operations ordered by `(committed_tick, sub_seq)`
where `sub_seq` is the within-tick commitment order from the command log. The
"matured effects" scan at tick `t` (§2.6, stage R2) is a linear pass selecting
`effects` with `lands_at == t`. No priority queue is needed at this scale; a
sorted scan is simpler to make deterministic.

The staggered-maturity session shape (brief §10, 5–8 ops in flight) is
exactly this vector viewed in the UI.

### 1.6 The variance envelope: computed, with a materialised trace

The handoff asks directly: is envelope widening computed per tick or
materialised per season? **Answer: computed per tick from a single
accumulator, and the computed value is materialised into `S[t]` as a trace.**

- The prototype's `σ_r(t) = sigma_base_r × (1 + w·t)` is a pure function of
  `t` — fine for a 40-season slice, wrong for the real game, because the brief
  (§5) is explicit that the widening is *caused by the player*: "the thing
  that makes the job easy in 2050 is the accumulated consequence of everything
  done since 1946."
- Therefore the real formula reads state:
  `σ_r(t) = sigma_base_r × (1 + w_secular·t + widening_accum[t-1] + shock(t))`
  where `widening_accum` grows from ledger residuals (§4.3) and `shock(t)` is
  the transient term from scheduled volcanic events (Pinatubo's two-year
  window, brief §15).
- Storing only the accumulator keeps the save small and the calculation
  auditable; writing the resulting per-region `sigma` into `S[t]` gives the
  UI, the attribution system, and the replay hash a stable record without
  recomputation drift.

The attribution check (brief §7.2, "does this outcome fall inside the
envelope?") reads the materialised `sigma` of the tick in which the effect
landed — never a recomputed one.

### 1.7 The dossier

Constraint 2 (handoff §6): attribution is an accumulating evidence dossier;
the player sees a ladder rung, never the number.

```
Dossier {
  entries: [Evidence {
    op: OpId,                      // evidence is per-operation
    tick: u16,
    kind: AnomalyResidual | Procurement | SatellitePass | GenomeMarker | ...,
    weight: q,
  }],
  total: q,                        // hidden; decayed and containment-reduced
  rung: derived,                   // index into exposure_ladder — the ONLY
                                   // value the presentation layer may read
}
```

Two structural notes:

- **Evidence is keyed by operation**, not just summed, because the ending
  (brief §17) needs "the operation you are proudest of is still filed as
  natural variability" — that is a per-op query over the archive, and rival
  attribution studies (ladder rungs 4–6) target specific anomalies.
- **The API boundary enforces the constraint.** `Dossier.total` is not
  exported from the sim crate; the presentation layer physically cannot render
  the number. The same pattern applies to constraint 4 (no morality meter):
  the sim exposes casualty figures as briefing *content records*, not as a
  numeric field on `S[t]` that a UI could turn into a meter.

### 1.8 Trade and commodities

The prototype collapses trade to "homeland yield × world price," and that was
enough to generate its economic game. The full §9.3 model (per-commodity
production/consumption profiles, positions, third-party bidding) is
schema-reserved above but should ship in stages:

- **v0.1:** prototype fidelity — one commodity class, homeland revenue =
  yield × price, price from world supply with the elasticity exponent.
- **v1:** per-commodity supply aggregation and player positions
  (the §9.3 exporter/importer/third-party cases fall out of signed positions
  against per-commodity price moves — no bilateral trade graph required).
- **Full bilateral trade graph: flagged as a cut candidate** (Appendix A). The
  third-party bidding story can be produced by the positions model at a
  fraction of the cost of a market-clearing sim.

---

## 2. Tick resolution order

The highest-risk area, per the handoff, with a reproduced bug as evidence.
This section specifies the ordering and — more importantly — the structural
rules that make the bug class unrepresentable.

### 2.1 Anatomy of the prototype's circular reference

Reconstructed from the `ENGINE` formulas (the *fixed* sheet encodes the
lesson):

- Operation magnitude at tick `t` reads the **prior season's** anomaly for the
  fire precondition — `E9` reads `AA8:AH8`. Individually correct.
- Anomaly at tick `t` sums operation magnitudes — and in the broken version,
  the `SUMPRODUCT` ranges spanned the **whole column** (`$8:$47`), i.e.
  including rows *after* `t`. Individually correct, if you assume future rows
  are blank.
- Assembled: `anomaly[t-1]` depends on `magnitude[t]` (whole-column sum), and
  `magnitude[t]` depends on `anomaly[t-1]` (precondition). Cycle — spanning
  two logical systems and surfacing six columns downstream, because Excel
  reports the symptom where evaluation happens to re-enter.

The fixed sheet's discipline, stated generally, is the entire content of this
section: **within-tick sums range over strictly prior ticks, and
state-dependent decisions read only committed prior state.** The real engine
must enforce that discipline structurally, because the handoff is right that
this class of bug will otherwise recur every time a system is added.

### 2.2 The two rules

**R1 — Within a tick, computation is a fixed pipeline of stages. Each stage's
output is frozen before the next stage runs.** A stage may read: the content
pack, committed history `S[0..t-1]`, the command log, and the frozen outputs
of *earlier* stages of the current tick. A stage may never read its own
partial output, a later stage, or mutable shared state (there is none).

**R2 — Nothing crosses ticks except through committed history or scheduled
effects.** Every edge lag and every capability lag is ≥ 1 season, validated
at pack compile time (§2.4). A "lag 0" influence is expressible only as a
within-tick stage ordering, which R1 already makes acyclic.

Together these guarantee global acyclicity by construction: the dependency
graph is (stage order within tick) × (strictly increasing tick order across
ticks). No runtime cycle detection is needed because no cycle is expressible.

### 2.3 Enforcement — structural, in order of strength

1. **Types.** Each stage is a pure function whose input type contains only
   earlier-stage output types. `DriverTotals` is constructed by stage R3 and
   consumed by R5; there is no way to write an R3 that takes `RegionAnomalies`
   because that type does not exist yet at R3's position in the pipeline. In a
   language with move semantics the builder for `S[t]` is *consumed* by each
   stage and returned enriched, so "read your own stage's output" is a
   compile error, not a code-review catch. This is the primary enforcement
   and it is the strongest argument in the stack decision (§7).
2. **Declared access, checked at boot.** Each stage declares
   `reads: {fields}` / `writes: {fields}` as data. At startup the engine
   topologically sorts the declarations and **fails to boot** on a cycle or on
   an undeclared access (debug builds wrap state in access-tracking proxies).
   This catches what types cannot — e.g. a stage reading `S[t-1].x` when it
   declared only `S[t-1].y` — and it makes the ordering *inspectable*: the
   sorted DAG is dumped to a doc artifact on every build, so a human can diff
   the resolution order between engine versions.
3. **The prototype as oracle.** A conformance test ports the `ENGINE` sheet's
   40 seasons and the exact play inputs, and asserts the engine reproduces
   every row. The spreadsheet is the executable spec of the ordering; drift
   from it is a failing test, not an opinion.

### 2.4 Pack-compile validations

- Every `Edge.lag ≥ 1`. Every `Capability.lag ≥ 1`. Every
  `displacement.extra_lag ≥ 1` (a displacement landing the same tick as its
  source injection is expressible but a displacement landing *before* it is
  not; `lands_at` monotonicity per op is asserted).
- Precondition references resolve to fields that exist in `S[t-1]`'s committed
  surface (they are expressed against a schema of *prior-tick* state — there
  is no syntax for referencing current-tick values in a precondition).
- Driver→driver edges are checked for cycles *among lag-0 edges* — trivially,
  because lag ≥ 1 means there are none; if a future design wants same-season
  driver coupling it must instead be expressed as a stage, where R1 applies.

### 2.5 Preconditions bind at commitment

The fire example, decided: **all preconditions evaluate against `S[t-1]` at
commitment time, and the resolved magnitude is stored on the operation.**
"Was the target dry *last season*" — exactly what the fixed prototype does
(`E9` reads row 8). Consequences:

- Resolution stages never consult op preconditions; ops arrive with
  `resolved_magnitude` already bound. No op-vs-anomaly ordering question can
  exist inside the tick.
- The player-facing meaning is honest: you commit against the world you can
  see, which is last season's. This is also the brief's core tension
  ("you must commit before you can know") applied uniformly.
- Cost: a precondition cannot react to the very tick it lands in. That is the
  correct price; the alternative reintroduces the spreadsheet bug as a design
  feature.

### 2.6 The pipeline

Player-facing phases (brief §8) map onto engine stages as follows. F and C
are input phases; R\* is the tick function proper; D and A are its tail.

```
PHASE F  FORECAST      (pure query; no writes)
  F1  Project S[t..t+k] from S[t-1] + ops-in-flight + revealed edges only.
      Spec: the forecast function takes the *revealed* edge subset as input —
      it must be impossible for the projection to leak hidden edges (§7.5).

PHASE C  COMMITMENT    (input; sealed)
  C1  Player commands appended to log with (tick, sub_seq).
  C2  Rival doctrine commands drawn (their own RNG streams, §3.2), appended.
  C3  Preconditions bound against S[t-1]; Operations constructed with
      resolved_magnitude and full effect schedules; ledger legs posted (§4).
      Treasury debited for op cost + containment at commit.

PHASE R  RESOLUTION    (the tick function)
  R1  Substrate: natural driver values d_nat[t] and region noise n[t] from
      the content pack (or its seeded generator).  FREEZE.
  R2  Maturation: scan ops-in-flight for effects with lands_at == t.
      Output: driver injections I_d, region injections I_r, resilience
      grants, ledger arrivals.  FREEZE.
  R3  Driver totals: D[t] = d_nat[t] + Σ I_d.  FREEZE.
  R4  Envelope: σ_r[t] from sigma_base, t, widening_accum[t-1], shocks[t].
      FREEZE.   (Reads accum from t-1 — envelope never sees this tick's
      residuals; see §4.3.)
  R5  Anomalies: A_r[t] = n_r[t] + Σ_edges coeff_e · D_from[t − lag_e] + I_r.
      All edge reads are historical (lag ≥ 1): they hit S[t-lag], never R3's
      output. (R3's D[t] enters *future* ticks' R5, via history.)  FREEZE.
  R6  Reactive window (§2.7), if open this tick: apply reactive effects to a
      provisional copy; re-freeze final A_r[t].
  R7  Resilience totals and yields: y_r[t] from A_r[t], sensitivity,
      resilience (drought and flood penalties per the ASSUMPTIONS formulas).
  R8  Markets: supply, price index (elasticity exponent), homeland revenue,
      position P&L.
  R9  Severity & mandate: global severity from |A_r| vs σ_r; mandate from
      severity (the dark engine).  Budget in; treasury update; overhead.
  R10 Ledger settlement & residual routing: arrivals reconciled; residuals
      routed per policy into widening_accum[t] (§4.3). Conservation asserted.

PHASE D  CONSEQUENCES  (derived; no new sim state)
  D1  Event classification: which anomalies exceeded severity thresholds;
      briefing records; puncture-rule hooks (content-side, unannounced,
      never mechanical — constraint 4/6).

PHASE A  ATTRIBUTION
  A1  Evidence accrual: for each effect that LANDED at t (not committed —
      landed, matching the prototype's BP formula), post Evidence with
      weight = signature_base × envelope_multiplier(|A|/σ at landing tick)
      × reactive_penalty.
  A2  Dossier update: total = max(0, total×(1−decay) + Σ new − containment×eff).
      Ladder rung derived. Rival suspicion update. Press cycle events.
  A3  Loss checks: Exposure (rung 7), Insolvency/Obsolescence, Cascade (§4.4),
      Capture (contract leverage — reserved).  Commit S[t]; chain hash (§3.6).
```

Two properties worth naming because they are the theme rendered as
architecture: evidence accrues at *landing*, so attribution pressure arrives
as delayed as the consequences themselves; and the envelope multiplier reads
the σ of the landing tick, so acting into a widened envelope (post-eruption,
strong natural ENSO) mechanically collapses signature — "wait for the noise"
is not a special case, it is the formula.

### 2.7 The reactivity rule, made deterministic

Brief §8 allows mid-resolution intervention at a steep attribution premium.
An interactive interrupt inside the tick function threatens both purity and
determinism, so it is specified as bounded input, not as re-entry:

- Resolution playback emits **checkpoints** after R5. If the player (or a
  rival doctrine) injects commands during playback, they are appended to the
  command log with the current tick and a `reactive` flag and a sub-sequence
  number. They are ordinary log entries; a replay reproduces them exactly.
- Only capabilities whitelisted as `reactive_capable` may be committed in the
  window (counter-seeding, cyclone steering — the §13 counter-intervention
  set). Their effects apply in stage R6 to the provisional anomalies of
  *this* tick.
- Preconditions still bind against `S[t-1]`. The evidence multiplier for
  reactive ops (`reactive_penalty`, from `assumptions`) is applied in A1.
- The tick function's signature is unchanged: reactive commands are part of
  its input. Determinism (§3) holds by construction.

The cheaper alternative — reactive ops simply resolve next tick with a
penalty — loses the "suppress the cyclone bound for the port" fantasy and
weakens the rival bait mechanic (§13). Whether the bait loop is worth R6's
complexity is tied to open question §23.3 (rival visibility); flagged in
Appendix B rather than decided here.

---

## 3. Determinism and save/load

The contract: **a campaign is a pure function of (content pack hash, engine
version, master seed, command log).** Everything below either enforces that
or tests it.

### 3.1 The tick as a pure function

`tick(pack, history, commands_at_t) → S[t]`. No I/O, no clock, no ambient
state, no allocation-order dependence. The sim crate has no dependency capable
of I/O; this is enforced by the module boundary, not by discipline.

### 3.2 Seeded RNG — counter-based streams, not a shared sequence

A single shared RNG sequence makes every draw order-sensitive: add one draw in
the rival AI and every subsequent event in the campaign changes, which turns
"we tuned a coefficient" into "every golden test broke for unrelated reasons."
Instead:

- **Counter-based derivation.** Every draw is
  `random(master_seed, domain, tick, entity_id, draw_index)` — a keyed hash
  (e.g. Philox or a blake3-derived stream). There is no RNG *state* in
  `WorldState` at all; nothing to save, nothing to corrupt, and draws are
  reproducible in isolation (a debugging superpower: "what would the 2011
  monsoon event roll have been?" is answerable without replay).
- **Domain separation.** `domain` is a registered constant per consumer
  (`EVENT_GEN`, `RIVAL_DOCTRINE`, `MEDIA_FLAVOR`, …). Adding draws in one
  domain cannot perturb another. Registering a domain is an ADR-visible act.
- **Where randomness is even used.** The physical substrate is *data* — the
  observed driver series and authored coefficients are deterministic content,
  exactly as in the prototype (whose CLIMATE noise is pre-authored, not
  rolled). RNG exists only for: fictional event generation post-divergence
  (§6.4), rival doctrine choices, and flavor/content selection. The core
  physics of a tick uses **zero** random draws. Keep it that way; every draw
  added to the physics is a draw someone will eventually make order-dependent.

### 3.3 Ordering guarantees on all iteration

- No hash-ordered container is iterated anywhere in the sim. Collections are
  vectors in ID order; associative lookups use sorted structures or dense
  index arrays. **CI enforces this with a lint** denying `HashMap`/`HashSet`
  iteration (and equivalents) inside the sim crate.
- All entity processing loops iterate in ascending dense-ID order. Ops
  process in `(committed_tick, sub_seq)` order. Ties cannot exist because
  `sub_seq` is total per tick.
- Any future parallelism must be fork-join over disjoint index ranges with
  deterministic reduction order. (At this scale — §5.4 — parallelism is
  unnecessary; the rule exists so nobody adds it casually.)

### 3.4 Save format — the log is the truth

```
Save {
  header:    { engine_version, pack_hash, master_seed, created, play_time },
  command_log: [ Command { tick, sub_seq, reactive, payload } ],  // canonical
  snapshots: [ { tick, S[t] serialized } ],   // every K ticks; a CACHE
  hash_chain: [ Digest; ticks_played ],       // §3.6
}
```

- **The command log is the save.** Snapshots exist so loading tick 400 does
  not require replaying 400 ticks — but at this engine's speed (§5.4) even
  that costs well under a second, so snapshots are an optimisation, never a
  source of truth.
- **Load verifies.** Loading replays from the nearest snapshot to the target
  tick and compares the recomputed hash chain against the stored one. A
  mismatch is a hard integrity error, surfaced loudly — *this is the
  mechanism that converts "corrupts a hundred-hour campaign in ways that
  surface weeks later" into "refuses to load, today, with a diagnostic."*
- Campaign-over archive (brief §17's declassification ending) is a pure
  function over the final history + dossier — it needs no additional
  persistence.

### 3.5 Numeric representation — the one genuinely hard determinism problem

Sums, products, and comparisons of IEEE-754 doubles are bit-deterministic on
every target platform *if* compiled without fast-math and without FMA
contraction. The hazards are transcendentals — the libm `pow` behind the
price elasticity exponent (`supply^1.8`) differs across platforms — and
compiler contraction. Two viable policies:

- **(a) f64 + vendored deterministic math.** All arithmetic in `q` goes
  through a `simmath` module; transcendentals come from a vendored,
  cross-platform-identical implementation (a deterministic libm port);
  fast-math and FMA contraction disabled for the sim crate; CI replay matrix
  (§3.7) across OS/arch is the enforcement.
- **(b) Fixed-point (Q32.32).** Absolute determinism by construction,
  including under any compiler. Cost: every formula in the ASSUMPTIONS sheet
  gets range analysis, and tuning-time ergonomics suffer.

**Recommendation: (a)**, recorded as ADR-0004, because the model's value
ranges are small and human-authored (anomalies in ±3σ, prices within an order
of magnitude) and (a) keeps the tuning loop in ordinary arithmetic. The
`simmath` indirection means migrating to (b) later touches one module, not
every formula. What is *not* acceptable is undisciplined f64 — that is the
default, and it is how the "surfaces weeks later" failure gets built.

### 3.6 The hash chain

After A3, `hash[t] = blake3(hash[t-1] ‖ canonical_serialize(S[t]))`, where
canonical serialisation is field-ordered and platform-independent. The chain
is cheap (µs per tick at this state size), stored in saves, and is the spine
of every test in §3.7.

### 3.7 The replay-from-log test — specified

Required by the handoff; acceptance criteria, not aspirations:

1. **Golden campaigns.** ≥ 3 scripted command logs (including reactive-window
   commands, op cancellations, and a full 460-tick run). CI replays each and
   compares the full hash chain against a committed golden chain.
   Any diff fails the build. Golden chains are regenerated only by an explicit
   `--bless`, which requires an ADR-referencing commit message.
2. **Save/load equivalence.** Property test: for random tick k and horizon
   N ≥ 40 — run 0..k+N straight; separately run 0..k, serialize, load,
   run k..k+N. Hash chains must be **bit-identical**. Runs across the CI
   matrix: {macOS, Linux, Windows} × {x86-64, arm64}, chains compared *across*
   platforms, not just within.
3. **Snapshot honesty.** Load from every snapshot in a golden save; each must
   reproduce the identical chain to a from-zero replay.
4. **Log sufficiency.** Strip all snapshots from a save; load must still
   succeed and match. (Guards against state sneaking outside the log.)
5. **Determinism fuzz.** Same seed + same log, 100 repeated in-process runs
   (allocator and thread-timing perturbation): identical chains. Different
   `sub_seq` interleavings of the *same* commands at a tick: **different**
   chains allowed, but stable per ordering (guards accidental order
   sensitivity claims in both directions).

---

## 4. The energy ledger as a checked invariant

### 4.1 The finding: the reference implementation does not conserve

Stating it plainly because the handoff asks for this invariant to be *checked*
and the check as-specified would fail on day one: in the prototype's
CAPABILITIES sheet, Ocean Thermal moves 1.1 into NATL and displaces to IOD at
factor −0.4; Aerosol 1.3 → NATL at −0.5; ENSO Forcing 1.6 → NATL at −0.6.
Between 45% and 65% of every displaced unit simply vanishes. Each individual
formula is fine; the *conservation claim* of brief §6.2 is not currently true
of the model.

That is not an argument against the invariant — it is the reason to build it.
But the spec must first define **where the remainder goes**, because "assert
net ≈ 0" over a system that by design leaks 50% per hop would just be a
permanently red test.

### 4.2 The ledger structure

Every scheduled effect (§1.5) posts a **ledger leg**. Conservation is
enforced over legs, not over gameplay magnitudes — gameplay coefficients stay
freely tunable while the accounting closes:

```
LedgerLeg {
  op: OpId,
  posted_tick, lands_tick: u16,
  account: Driver(DriverId) | Region(RegionId) | Background,
  amount: q,             // signed energy units E
  status: Scheduled | Landed | Voided(reason),
}
```

An operation's legs are created in full at commitment (C3): the injection
leg(s), the displacement leg(s), and a balancing **residual leg** to
`Background` such that the op's legs sum to exactly zero at posting time.
Amounts in E are derived from gameplay magnitudes by per-capability conversion
constants in the pack — the tuning knobs move, the sum stays zero.

### 4.3 Residual routing — proposal, flagged for author sign-off

The natural home for the residual is the **envelope widening accumulator**
(§1.6): energy an operation moves but does not deliver as a usable
displacement dissipates into background variance. Concretely, R10 folds each
tick's landed `Background` legs into `widening_accum[t]` (with a long decay).

This closes the ledger *and* makes the brief's central claim mechanical
rather than scripted: the widening envelope of 2050 literally is the summed
residue of a century of operations, per §5's "and the player caused that."
The prototype's linear `w·t` term becomes the *natural* (non-player) share of
widening, and player activity adds to it.

**Flagged, not decided** (Appendix A): this converts a pure accounting fix
into a balance-relevant feedback loop (heavy intervention → wider envelopes →
cheaper deniability for everyone, including rivals). I think that loop is the
design's thesis and should exist; it is nonetheless a design decision, not a
technical one, and constraint 0 of the handoff ("argument welcome, unilateral
reversal not") applies in spirit.

### 4.4 The checks

- **Per-op closure (posting).** Legs sum to 0 exactly at C3. Assert always —
  debug and release. (Exact: legs are constructed to balance, so this
  tolerates ε only if `q` is floating; with policy (a) of §3.5 the residual
  leg is computed as the negated sum, making closure exact by construction.)
- **Per-tick settlement (R10).** Σ(all landed legs at t) + Δwidening_accum
  + Δ(scheduled-not-yet-landed) = 0 ± ε, ε = n·2⁻⁴⁰ scale. Debug assert;
  release-build telemetry counter that trips a diagnostic event rather than a
  crash.
- **Truncation cases — where conservation silently dies.** Explicit property
  tests for each: op cancelled mid-flight (its unlanded legs must be Voided
  *as a group*, with the void itself balanced); save/load with legs in
  flight; campaign end with legs outstanding; reactive ops (R6 effects post
  legs like any other); precondition-penalised magnitudes (legs scale with
  `resolved_magnitude`, so the penalty must scale *all* legs of the op, not
  just the injection).
- **Property test.** Random op sequences, random cancellations, random
  save/load points, 460 ticks: final `Σ all legs + widening contributions = 0
  ± ε`, and at no tick did settlement drift exceed ε.
- **The Cascade loss condition** (brief §17: "the energy ledger breaks") gets
  a precise meaning for free: Cascade triggers on `widening_accum` crossing an
  authored threshold — losing control of the climate *is* the ledger's
  residual account overflowing. (Also flagged in Appendix A as a proposal.)

---

## 5. Time compression architecture

### 5.1 The requirement, restated as a trap to avoid

Handoff §3.5: coarse early ticks and fine late ticks must coexist "without
two separate simulation paths." The trap is taking "coarse ticks" literally —
a decade-tick engine and a season-tick engine that must agree. They never
will: lags are denominated in seasons, the ledger schedules in seasons, the
dossier decays per season. Any aggregated tick is a second physics.

### 5.2 The design: uniform simulation tick, variable decision cadence

**The engine always ticks in seasons — all 460 of them. What varies across
the century is how often the player is consulted, and how the interval is
presented.** "More than the design can carry at uniform resolution" (brief
§5) is true of player attention, not of compute; §5.4 shows the compute is
trivial. So compression is a property of the *command layer and presentation*,
neither of which touches the tick function:

- **Standing orders.** The early game's "handful of decisions per decade" are
  commands like any other, but durable: a `Policy` is a command template the
  command layer expands into per-season commands (each logged normally, so
  replay sees only ordinary per-tick commands and the engine has no concept
  of a policy). Examples: "containment budget at X per season," "re-run cloud
  seeding each spring," "hold." Exactly the texture of a 1950s program that
  meets quarterly and mostly continues existing programs.
- **Interrupts.** Auto-advance runs seasons in batch playback until an
  authored interrupt trigger fires: attribution rung change, treasury floor,
  precondition window opening (the drought you were building is ready),
  scheduled historical beat (ENMOD 1976), landed consequence above severity
  threshold. Triggers are data in the pack.
- **Cadence tiers.** Presentation groups seasons into year/half-year/season
  review intervals. A tier is *purely* a UI grouping plus an interrupt
  sensitivity profile. Step-up triggers between tiers are open question
  §23.6 — the architecture is deliberately agnostic: any trigger works
  because tiers have no engine meaning.

### 5.3 What this buys

- One physics, one lag semantics, one ledger, one dossier — for the whole
  century. The chess-opening property (brief §5: the 1961 ocean-thermal work
  *is why* you had cover in 1998) requires effects committed under coarse
  cadence to be denominated identically to fine-cadence ones; with a uniform
  tick this is free, with aggregated ticks it is a conversion-factor swamp.
- Replay, hash chain, and save format are cadence-blind. A save made in 1952
  under decade cadence and one made in 2055 are the same object.
- The fiction is served, not fought: "the early program genuinely did not do
  much" is expressed as *few commands*, not as a different clock.

### 5.4 The compute budget that makes this possible

Order-of-magnitude, at the open question's upper bound (80 regions, ~4–8
drivers, a few hundred edges, ≤ 32 ops in flight): a tick is a few thousand
multiply-adds plus bookkeeping — well under 50µs. The full 460-tick campaign
re-simulates from 1946 in ≤ ~25ms. Consequences worth designing around:

- Batch playback of 40 seasons is instantaneous; the *playback pacing* is an
  animation decision, unconstrained by simulation cost.
- Forecast (F1) can afford full Monte-Carlo-free projection *and* the UI can
  afford counterfactual queries ("what does the world look like if I do
  nothing for 8 seasons") by simply running the tick function forward on a
  scratch copy with commands stripped — same code path, no second model.
- The ending archive and any "what did history conclude" reconstruction can
  re-derive anything from the log at load time.

Graph scale (§23.1) does not threaten this: even 200 nodes × dense edges
stays sub-millisecond per tick. The node-count question is a *design
legibility* question (as the brief says), not an engineering one — noted in
Appendix B so it gets answered on the right grounds.

---

## 6. Data ingestion

### 6.1 Shape: fetch → normalise → compile, with the pack as the only exit

```
ingest/
  sources/            one module per dataset: oni.py, pdo_amo.py, era5.py,
                      hurdat2.py, faostat.py, disasters.py
  tests/
data/
  raw/                gitignored; checksummed originals, resumable fetch
  processed/          canonical seasonal observations (parquet)
  schema/             the canonical schema + pack manifest (Deliverable 2)
```

- **Fetch** is per-source, cached, and reproducible: each module records
  source URL, retrieval date, dataset version, and a checksum into a manifest
  committed to `data/schema/`. Raw payloads never enter git (handoff §2 rule);
  the manifest makes a fetch re-runnable and verifiable by anyone with the
  repo.
- **Normalise** emits one canonical row shape (§6.2) into `data/processed/`.
  All source quirks (units, calendars, missing values, basin conventions) die
  in this stage, inside the source's own module, under that module's tests.
- **Compile** builds the content-pack climate block (§1.3) from processed
  rows: driver series, per-region sigma baselines, event catalogs, fitted
  generator parameters (§6.4). The compiler validates against the pack schema
  (lags ≥ 1, license profile §6.5, series coverage 1946–present) and stamps
  the content hash. **The sim never reads processed data directly — only
  packs.** This is what makes Deliverable 2 "useful regardless of how the
  loop tunes": rebalancing changes pack constants, not the pipeline.

### 6.2 Canonical observation schema

```
Observation {
  source: SourceId,            // oni | pdo | amo | era5 | hurdat2 | faostat | ...
  dataset_version: str,
  variable: VarId,             // enso_index, sst_anomaly, precip, yield, ...
  scope: Driver(slug) | Region(slug) | Basin(slug) | Global,
  season: u16,                 // canonical season index (§ conventions above);
                               // pre-1946 allowed as negative for baselines
  value: f64, unit: UnitId,
  license: LicenseTag,         // §6.5
  provenance: url,
}
```

Region-scoped values are produced by aggregating gridded sources over the
region's `geometry_ref` mask (§1.3) — masks live in ingestion, are versioned
with the pack, and the sim never sees a grid.

### 6.3 Source-specific notes

| Dataset | Use | Notes |
|---|---|---|
| ONI / ENSO (NOAA CPC) | `driver.enso` series | **Starts 1950; the campaign starts 1946.** Backfill 1946–49 from an extended reconstruction or author it; either way the pack marks those seasons `backfilled`. Flagged as a small data gap the brief doesn't mention. |
| PDO, AMO (NCEI) | additional driver series | Straightforward; AMO informally maps to the prototype's NATL. |
| ERA5 (Copernicus) | per-region seasonal anomalies & **sigma baselines** | The only heavyweight source. Fetch via CDS API *for the region masks and variables only*; reduce to per-region seasonal aggregates immediately; grids are deleted or kept only in `data/raw/` locally. Attribution requirement propagates into pack `meta` and must surface in shipped credits. |
| HURDAT2 (NHC) | per-basin activity distributions | Post-divergence events are fictional (brief §19), so HURDAT2's role is *statistical*: seasonal activity distributions conditioned on ENSO state, feeding event generators (§6.4). Its literal storms are codex material, pre-1946 only. |
| FAOSTAT | baseline production/consumption profiles per region | Partially CC BY-NC-SA — per-series license tagging required (§6.5). |
| EM-DAT | calibration of severity thresholds | **Non-commercial license.** Keep behind the source-module interface so a substitute (NOAA Storm Events, ReliefWeb/DesInventar, or authored calibration) drops in. Do not let anything load-bearing grow roots into it. |

### 6.4 The divergence rule shapes the pipeline

Brief §19: real data is substrate, post-1946 *events* are fictional. So
ingestion produces **two distinct products** and the distinction is schema-
level, not convention:

1. **Literal series** — driver indices and climatological baselines. These
   drive the background rhythm directly ("the El Niño you wait for is the one
   that really happened").
2. **Fitted distributions** — event-generator parameters (e.g., cyclone
   counts by basin/season conditioned on ENSO phase; drought spell
   persistence). Consumed by seeded generators (`EVENT_GEN` domain, §3.2) to
   invent the fictional 1965 hurricane with true statistical texture.

Scheduled real geophysical events (eruptions with VEI and aerosol forcing)
enter as a literal catalog — canon until lithospheric capability unlocks,
after which the catalog switches to generated (the brief's guardrail,
implemented as a pack-level cutover keyed to the unlock, not authored
per-event).

### 6.5 Licensing as a build-time gate

`LicenseTag ∈ {public_domain, attribution, non_commercial, restricted}`
travels from source module → observation → pack table. The pack compiler
takes a `license_profile`; compiling a `Commercial` pack **fails** if any
included table derives from `non_commercial` rows. This turns the handoff's
"cheap to solve now, expensive later" flag into a mechanical impossibility
rather than a release-checklist item.

---

## 7. Recommended stack, with reasoning

Derived from the preceding sections — each requirement names the section that
created it:

| Requirement | Origin |
|---|---|
| Bit-identical determinism across OS/arch, including transcendental math | §3.5, §3.7 |
| Structural (ideally compile-time) enforcement of the stage pipeline | §2.3 |
| Pure-function tick, no ambient I/O, enforceable at a module boundary | §3.1 |
| Microsecond-scale ticks; full-campaign re-simulation as a UI primitive | §5.4 |
| Property-based testing culture (ledger §4.4, replay §3.7) | §3, §4 |
| Scientific-data wrangling: NetCDF/GRIB, CDS API, dataframes | §6 |
| Sim core embeddable in a to-be-decided presentation layer, including browser | handoff §5 (UI deferred) |

**Simulation core: Rust.** The reasoning, in order of weight:

1. **§2.3 enforcement is the decider.** Ownership and move semantics let the
   stage pipeline be expressed so that reading a later stage's output, or
   mutating a frozen one, is a *compile error* — the typestate pattern in
   §2.3(1) is idiomatic Rust and awkward-to-impossible in GC languages, where
   freezing is a runtime convention. The whole point of §2 is to make the
   spreadsheet's bug class unrepresentable; Rust is the mainstream language
   where that is cheapest to actually do.
2. **§3.5 policy (a) is executable:** per-crate control of fast-math/FMA, a
   vendored deterministic libm, no GC or JIT introducing nondeterministic
   timing into anything observable, and `#![no_std]`-style discipline making
   the "no I/O in the sim crate" boundary mechanical.
3. **WASM as a first-class target** means the sim core can back a browser
   prototype (the natural successor to the spreadsheet for playtesting the
   loop, and the cheapest way to put builds in testers' hands) — with the
   *same* bit-deterministic core, so playtest replays are valid bug reports
   against the native build.
4. `proptest` for §4.4/§3.7 property tests, `serde`+`postcard` (or
   FlatBuffers if zero-copy save inspection tooling is wanted) for canonical
   serialisation, `blake3` for hashing — all mature.

**Ingestion: Python.** §6 lives on xarray/netCDF4 (ERA5), `cdsapi`
(Copernicus), pandas/pyarrow → parquet. This ecosystem does not meaningfully
exist elsewhere, and Deliverable 2's consumers are offline build steps, so
none of §3's determinism constraints apply — determinism enters at the pack
hash. The pack compiler can be Python (it runs offline, its output is
hashed); its *schema* should be defined once in a language-neutral form
(JSON Schema or FlatBuffers IDL) so sim and ingestion cannot drift.

**Presentation: explicitly deferred**, per handoff §5 — and the architecture
guarantees deferral is safe: the sim crate exposes `S[t]` snapshots, the event
stream, and derived views (dossier rung, never the total — §1.7) over an FFI/
WASM boundary. Candidates when the gate opens: Bevy (Rust-native, keeps one
language), Godot (fastest route to the globe/projection UI), or a custom
renderer for the instrument aesthetic (§14–15 of the brief). Nothing in
sections 1–6 constrains this choice, which is the test that they were done in
the right order.

**Honest alternative considered:** TypeScript end-to-end (sim + eventual web
UI). It would reach a playable browser build faster and JS numbers are IEEE
f64 with deterministic basic arithmetic. It fails requirement 1 at the edges
(`Math.pow` is engine-dependent — the price curve's `^1.8` alone would need a
software `pow`) and requirement 2 almost entirely (stage freezing becomes
convention + `Object.freeze` at runtime). Given that the handoff names tick
ordering and determinism as the two highest-stakes properties, choosing the
stack that enforces both at compile time is the defensible call even at some
velocity cost. If the team context changes (e.g., a web-native collaborator
joins before `sim/` is unfrozen), revisit via ADR — the data model and this
document are stack-neutral by construction.

---

## Appendix A — Flags for the author (cut levers and proposals)

> **Status update 2026-08-24:** the author reviewed and delegated these
> decisions, with a recorded north star (`docs/north-star.md`). Items 1–4
> are **accepted** as scoped below. Item 5 is resolved: the reactive window
> is **retained** (ADR-0008). Items 6–7 are **accepted** (ADR-0005, now
> Accepted). Item 8 is handled in ingestion (`ingest/sources/backfill`).

Handoff §9 asks for anything materially cheaper if a named system is cut, and
for proposals to be flagged rather than silently adopted. Ordered by savings:

1. **Rivals as event generators, not agents (v0.1–v1).** The obsolescence
   loss condition (constraint 3) needs *pressure*, not minds: ambient rival
   anomalies drawn from doctrine-flavored generators + a suspicion
   distribution updated by the same attribution math the player faces. This
   preserves the noisy-channel escalation loop and defers actual doctrine AI
   (gap #6) — the largest single engineering item in the brief — until the
   loop is validated. The full agent design slots in later behind the same
   command interface the player uses (rival commands are just log entries,
   §2.6 C2).
2. **Bilateral trade graph → positions model (§1.8).** The three §9.3
   scenarios (exporter windfall, importer self-harm, third-party outbidding)
   are all reproducible with per-commodity world prices + signed positions.
   A market-clearing bilateral graph is a second simulation; the positions
   model is a page of code. Difficulty lever for nation starts survives
   intact (posture = starting positions).
3. **Contractors (§20).** Schema is reserved (cheap), but the leverage/
   nationalisation/non-exclusivity loop is a fourth economy interacting with
   attribution. Everything else in this document stands without it; the
   Capture loss condition is the only orphan. Recommend: keep contract
   *funding/laundering* as flat modifiers in v1, defer the leverage sim.
   Materially cheaper, and it's already "Strong" not "Core" in brief §22.
4. **Biosphere = a second attribution system — cut it cleanly from v1.**
   The brief itself says bio attribution is forensic and permanent
   (genome markers), i.e., *not* the envelope check — it's a different
   mechanic with different evidence kinds, UI, and balance. Deferring bio
   (already listed in §22) should mean deferring `GenomeMarker` evidence and
   everything §11-bio, not carrying half of it.
5. **Reactive window (R6/§2.7).** If open question §23.3 resolves to "rivals
   are never directly visible," the bait mechanic weakens and next-tick
   reactive resolution (cheaper by one pipeline stage and a whitelist) may
   suffice. Decide after the prototype verdict.
6. **Proposal needing sign-off: ledger residual → envelope widening (§4.3).**
   Closes conservation and mechanises the century-scale difficulty curve, but
   creates a real feedback loop with balance implications.
7. **Proposal needing sign-off: Cascade = widening-accumulator threshold
   (§4.4).** Gives the vaguest loss condition a precise, testable trigger.
8. **Small data gap:** ONI begins 1950; 1946–49 needs backfill or authoring
   (§6.3).

## Appendix B — Open questions (handoff §8): RESOLVED under delegated authority

The author reviewed Deliverable 1 and delegated these decisions
(2026-08-24), with the north star (`docs/north-star.md`) as the tiebreaker.
Each resolution has its own ADR with full rationale:

| Question | Resolution | ADR |
|---|---|---|
| Graph scale (§23.1) | 64 regions, 5 drivers (ENSO, IOD, NATL, PDO, GLOBAL); hard caps 80/8 | ADR-0006 |
| Trade graph visibility at start (§23.2) | Fully visible; hidden state is edges and rival intent only | ADR-0007 |
| Rival ops directly visible? (§23.3) | Never in play; inferred from anomalies, revealed later by the Glomar clock and the archive | ADR-0007 |
| Campaign structure (§23.4) | Sandbox with authored event calendar; no plot | ADR-0008 |
| Failure recovery after exposure (§23.5) | Recoverable below rung 5; rung 5 sets a permanent dossier floor; rung 7 terminal | ADR-0009 |
| Time compression tiers & triggers (§23.6) | Three tiers; step-ups on capability-tier unlocks (or ENMOD/2010 backstops); one-way, finer-zoom always allowed | ADR-0010 |

Also resolved from the gaps register: meta-progression (#10) is
informational-only persistence — ADR-0011; data licensing (#11) — EM-DAT
excluded entirely, ADR-0012.

---

*Companion to design brief v0.4 and handoff v1.1. Argue with it — especially
Appendix A.*

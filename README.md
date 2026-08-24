# FORCE MAJEURE

Grand strategy / simulation, single-player. 1946–2060. You direct a state
environmental warfare program; every intervention is a wager that the outcome
falls inside the envelope of what climatology says could have happened anyway.

**Private repository. Nothing here goes to a public remote.**

## Layout

```
docs/
  design-brief-v0.4.md      The design. Authoritative on intent, tone, systems.
  handoff.md                Scope, constraints, gaps register. Read this first.
  technical-design.md       Deliverable 1 — the Technical Design Document.
  decisions/                ADRs, one file per architectural decision.
prototype/
  force-majeure-prototype.xlsx   Playable core-loop test. Reference
                                 implementation of the tick. Not throwaway.
data/
  raw/                      Gitignored. Fetched, never committed.
  processed/                Normalised, cached.
  schema/                   Deliverable 2 output.
ingest/                     Deliverable 2 code — one module per dataset.
sim/                        DOES NOT EXIST YET. Gated on the prototype
                            answering the core-loop question. See handoff §0.
```

## Status

- [x] Deliverable 1 — Technical Design Document (`docs/technical-design.md`)
- [x] Deliverable 2 — Data ingestion layer (`ingest/`) — driver series + basin activity live; ERA5/FAOSTAT gated on the authored 64-region list
- [ ] Core loop validated (prototype played honestly, forty seasons)
- [ ] Open questions in handoff §8 resolved (blocked on the author, not on us)

## The gate

> Is it fun to nudge an invisible system and watch consequences arrive four to
> eight seasons later in the wrong country?

Nothing in `sim/` gets written until the prototype answers that.

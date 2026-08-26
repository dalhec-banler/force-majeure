# ADR-0021: Grain is priced by the exporters; profit is measured against the world that never acted

**Status:** Accepted · 2026-08-26 (author rule: "ACTUAL hubs that are
factually responsible for shipping grain … should supply index"; "fix"
the weak-exporter archetype)

## Context
The supply index summed every region's yield by weight, hubs included, so
a semiconductor outage moved the wheat price and drying the Black Sea
Steppe moved it ~2% per $14M operation — the "wheat exporter" archetype
the fiction advertises was the weakest line in the game. PROFIT was
Σ(revenue − 85), a flat baseline that printed free money whenever the
natural price ran high.

## Decision (engine opts `grainSupply`, `priceElasticity`, `shadow`; default off)
1. **Only grain counts.** Crop regions and hubs flagged `grain` enter the
   supply index. Factual grain hubs: **Gulf Coast** (the Mississippi
   terminals — the world's largest grain export gateway), **Panama Canal**
   (grain is its largest cargo by tonnage), **Malacca Strait** (Australian
   and Black Sea wheat to Asia). Taiwan Strait, the Gulf terminals, the
   copper/cobalt belts, the North Sea, Siberian gas, the Ganges ports,
   Pilbara, Hawaii keep their weight for severity and mandate only.
2. **Exporters make the price.** Each region carries an `export` share
   (Plains/Prairies/Plata/Australia 1.0, Steppe 0.9, Cerrado 0.9, Mekong
   and Southeast Asia 0.8, Kazakh 0.8, Northern Europe 0.8, Danube 0.6,
   Manchuria 0.5, South Asia 0.4, China 0.2–0.3, Sahel/Horn/Nile 0.1) —
   only ~20% of grain is ever traded, so the traded price is made by the
   surplus regions and the self-consuming giants move it only through
   import demand.
3. **Elasticity 1.8 → 3.0** in the console (staples: demand elasticity
   ≈ −0.15; crisis spikes 2–3×, cap 300 per ADR-0019). Calibration: one
   Steppe watershed +5.3% (was ~2%), two exporters +9%, a 3-stack aerosol
   wave +30% in-season; natural years range 101–120.
4. **PROFIT is counterfactual.** The engine runs a shadow world — same
   rules, same rival, same record, the programme never acts — and each
   row carries `baseRevenue`. PROFIT = Σ(revenue − baseRevenue): what the
   programme made for the homeland, not what the weather did. The header,
   windfall wires, archive and harness all read it.

## Consequences
- The exporter archetype is playable: a dry Steppe is a market event.
- Absolute revenue rose with the higher elasticity; the counterfactual
  score removes that inflation (naive tutorial play scores ≈ +$9M — it
  made nothing; a funded flagship line +$84M; the best careful line +$255M).
- The rival's chaos was the cover the cover-dependent scripts waited for;
  with no Eastern Program before 1962 (ADR-0022) those scripts idle and
  are wound up. Script behaviour, not an economy break.

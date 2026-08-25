/* Force Majeure — core-loop engine.
 * Exact port of the prototype workbook's ENGINE sheet, formula for formula.
 * The spreadsheet remains the reference implementation; this file must agree
 * with it or this file is wrong (technical-design §2.3, enforcement 3).
 *
 * Seasons are 1-indexed (t = 1..40) to match the sheet's column A.
 * All within-season sums range over strictly prior seasons; preconditions
 * read t-1 committed state (ADR-0002 discipline, as in the fixed workbook).
 */
"use strict";

function createEngine(MODEL, opts) {
  const rivalsOn = !!(opts && opts.rivals);
  // idle appropriation trim: with no player op in the last 4 seasons the
  // committee pays the mandate appropriation at this fraction. Default 1
  // (sheet behavior) keeps the conformance baseline exact.
  const idleTrim = (opts && opts.idleTrim !== undefined) ? opts.idleTrim : 1;
  // jet stream disruption: heavy ops landing at >=55N buckle the polar jet
  // for 3 seasons, throwing deterministic meanders across all regions >=40N.
  // Gated (default off) so the sheet-conformance baseline is untouched.
  const jetOn = !!(opts && opts.jetstream);
  const A = {};
  for (const [cell, o] of Object.entries(MODEL.assumptions)) A[cell] = o.value;
  // Named views of the ASSUMPTIONS cells the sheet references.
  const P = {
    droughtPenalty: A.B7,      // yield lost per unit negative anomaly
    floodPenalty: A.B8,
    floodThreshold: A.B9,
    priceElasticity: A.B10,
    revenueScale: A.B11,
    mandateBase: A.B12,
    mandatePerSeverity: A.B13,
    mandateCap: A.B14,
    budgetFromRevenue: A.B15,
    budgetFromMandate: A.B16,
    containmentEff: A.B17,
    dossierDecay: A.B18,
    envelopeWidening: A.B19,
    dryThreshold: A.B20,
    dryPenalty: A.B21,
    envelopeMultWeight: A.B22,
    overhead: A.B23,
    severityThreshold: A.B24,
    startingTreasury: A.B25,
  };

  const DRIVERS = MODEL.drivers;                  // ["ENSO","IOD","NATL","GLOBAL"]
  const REGIONS = MODEL.regions;
  const NR = REGIONS.length, ND = DRIVERS.length;
  const regionIndex = Object.fromEntries(REGIONS.map((r, i) => [r.name, i]));
  const capByName = Object.fromEntries(
    MODEL.capabilities.map((c) => [c.name, c]));

  const state = { ops: [], rows: [], jetUntil: 0 };  // rows[t-1] = season t

  function makeOp(t, capName, targetRegion, prevAnomalies, owner) {
    const cap = capByName[capName];
    if (!cap || cap.type === "NONE") return null;
    const target = cap.type === "DRIVER" ? cap.fixedTarget : targetRegion;
    if (!target) return null;
    let mag = cap.mag;
    if (cap.needsDrought) {
      // Precondition binds at commitment against S[t-1]; t=1 sees 0,
      // exactly as ENGINE!E8 hardcodes.
      const ri = regionIndex[target];
      const prior = (t > 1 && ri !== undefined) ? prevAnomalies[ri] : 0;
      mag *= prior < P.dryThreshold ? 1 : P.dryPenalty;
    }
    const disp = (typeof cap.dispTo === "string" && cap.dispTo)
      ? { to: cap.dispTo, mag: cap.mag * cap.dispFactor,
          lag: cap.lag + cap.dispExtraLag }
      : null;
    return { t, cap: cap.name, type: cap.type, target, mag, lag: cap.lag,
             sig: cap.sig, cost: cap.cost, disp, resil: cap.resil,
             owner: owner || "player" };
  }

  /* The Eastern Program — a rival wheat exporter running its own weather
   * war. Deterministic schedule (no RNG); physically identical ops through
   * the same pipeline. Its signatures never touch the player's dossier —
   * its chaos still raises severity, and therefore the player's mandate.
   * Enabled only with createEngine(MODEL, {rivals:true}); the no-rivals
   * baseline remains the exact ENGINE-sheet conformance target. */
  function rivalPlan(tt) {
    if (!rivalsOn || tt < 6) return [];
    const plan = [];
    if ((tt - 6) % 7 === 0)
      plan.push({ cap: "Cloud Seeding", target: "Black Sea Steppe" });
    if (tt > 14 && (tt - 6) % 7 === 3)
      plan.push({ cap: "Watershed Interference",
                  target: "North American Plains" });
    if (tt === 22) plan.push({ cap: "Ocean Thermal Forcing" });
    return plan;
  }

  /* Resolve season t (must be rows.length+1). cmd = {opA, opB, targetA,
   * targetB, containment, prediction}. Returns the committed row. */
  function resolve(t, cmd) {
    if (t !== state.rows.length + 1) throw new Error("seasons resolve in order");
    const clim = MODEL.climate[t - 1];
    const prev = state.rows[t - 2] || null;
    const prevAnom = prev ? prev.anomalies : new Array(NR).fill(0);

    // C — commitment: preconditions bound, ops recorded, costs fixed.
    const committed = [];
    for (const [capName, target] of [[cmd.opA, cmd.targetA],
                                     [cmd.opB, cmd.targetB]]) {
      const op = makeOp(t, capName, target, prevAnom, "player");
      if (op) { committed.push(op); state.ops.push(op); }
    }
    for (const r of rivalPlan(t)) {
      const op = makeOp(t, r.cap, r.target, prevAnom, "rival");
      if (op) state.ops.push(op);
    }
    const containment = Math.max(0, cmd.containment || 0);

    // R2 — maturation scan: effects landing at t from strictly prior commits.
    const landed = [];
    for (const op of state.ops) {
      if (op.t >= t) continue;
      if (op.t + op.lag === t && op.mag !== 0)
        landed.push({ kind: DRIVERS.includes(op.target) ? "driver" : "region",
                      target: op.target, mag: op.mag, cap: op.cap,
                      committedT: op.t, sig: op.sig, owner: op.owner });
      if (op.disp && op.t + op.disp.lag === t)
        landed.push({ kind: "driver", target: op.disp.to, mag: op.disp.mag,
                      cap: op.cap + " (displacement)", committedT: op.t,
                      sig: 0, owner: op.owner });
    }

    // jet stream check: did a heavy op just land in the high north?
    let jetTriggered = false;
    if (jetOn) for (const e of landed) {
      if (e.kind !== "region") continue;
      const reg = REGIONS[regionIndex[e.target]];
      if (reg && (reg.lat || 0) >= 55 && Math.abs(e.mag) >= 1.0) {
        state.jetUntil = Math.max(state.jetUntil, t + 3);
        jetTriggered = true;
      }
    }
    const jetActive = jetOn && t <= state.jetUntil;

    // R3 — driver totals: natural + landed driver injections.
    const driverTotals = DRIVERS.map((d, di) => {
      let v = clim.drivers[di];
      for (const e of landed)
        if (e.kind === "driver" && e.target === d) v += e.mag;
      return v;
    });

    // R4 — envelope (pure function of t in the prototype).
    const sigmas = REGIONS.map((r) => r.sigma * (1 + P.envelopeWidening * t));

    // R5 — anomalies: noise + lagged edge reads + landed region injections.
    const anomalies = REGIONS.map((r, ri) => {
      let v = clim.noise[ri];
      for (let di = 0; di < ND; di++) {
        const lag = MODEL.lags[di][ri];
        const ts = t - lag;                       // strictly historical: lag >= 1
        if (ts >= 1) v += state.rows[ts - 1].driverTotals[di]
                          * MODEL.coeff[di][ri];
        else if (ts === t) throw new Error("lag 0 edge: forbidden");
      }
      for (const e of landed)
        if (e.kind === "region" && e.target === r.name) v += e.mag;
      if (jetActive && (r.lat || 0) >= 40)
        v += 0.6 * Math.sin(t * 2.399 + ri * 1.73);   // the broken jet meanders
      return v;
    });
    // Edge reads of season t itself never occur (all lags >= 1) — but the
    // totals computed above are what FUTURE seasons' edge reads will see.
    // Store them via the row commit below.

    // R7 — resilience (cumulative, includes this season's commit, per AQ) and
    // yields.
    const resil = REGIONS.map((r) => {
      let v = 0;
      for (const op of state.ops)
        if (op.t <= t && op.target === r.name) v += op.resil;
      return v;
    });
    const yields = REGIONS.map((r, ri) => {
      const a = anomalies[ri];
      const damage = (Math.max(0, -a) * r.sens * P.droughtPenalty
        + Math.max(0, a - P.floodThreshold) * r.sens * P.floodPenalty)
        * (1 - resil[ri] / 100);
      return Math.max(0, Math.min(135, 100 - damage));
    });

    // R8 — markets.
    const supply = REGIONS.reduce(
      (s, r, ri) => s + yields[ri] * r.weight / 100, 0);
    const price = 100 * Math.pow(100 / Math.max(1, supply), P.priceElasticity);
    const homelandIdx = REGIONS.findIndex((r) => r.homeland);
    const revenue = yields[homelandIdx] * price / 100 * P.revenueScale;

    // R9 — severity, mandate, budget, treasury.
    const severity = REGIONS.reduce((s, r, ri) =>
      s + Math.max(0, Math.abs(anomalies[ri])
                      - sigmas[ri] * P.severityThreshold) * r.weight / 100, 0);
    const mandate = Math.min(P.mandateCap,
                             P.mandateBase + severity * P.mandatePerSeverity);
    const opsSpend = committed.reduce((s, o) => s + o.cost, 0);
    // the committee funds programmes that do things
    const recentOp = state.ops.some(
      (o) => o.owner === "player" && o.t > t - 4);
    const trimmed = t > 4 && !recentOp && idleTrim < 1;
    const budgetIn = revenue * P.budgetFromRevenue
                   + mandate * P.budgetFromMandate * (trimmed ? idleTrim : 1);
    const prevTreasury = prev ? prev.treasury : P.startingTreasury;
    const treasury = prevTreasury + budgetIn - opsSpend - containment
                   - P.overhead;

    // A — attribution: signatures of main effects that LANDED this season,
    // amplified by how far outside the envelope the world is.
    const envelopeStress = REGIONS.reduce((s, r, ri) =>
      s + Math.max(0, Math.abs(anomalies[ri]) / sigmas[ri] - 1), 0) / NR;
    // only the player's signatures feed the player's dossier
    const landedSig = landed.reduce(
      (s, e) => s + (e.owner === "player" ? e.sig : 0), 0);
    const attribution = landedSig
      * (1 + P.envelopeMultWeight * envelopeStress);
    const prevDossier = prev ? prev.dossier : 0;
    const dossier = Math.max(0, prevDossier * (1 - P.dossierDecay)
      + attribution - containment * P.containmentEff);

    let ladderText = MODEL.ladder[0].text;
    for (const rung of MODEL.ladder)
      if (dossier >= rung.threshold) ladderText = rung.text;

    // A3 — loss checks. Obsolescence: warning per the sheet's PLAY!S column,
    // gated on genuine inactivity — the committee counts you idle only if no
    // operation was committed in the last 4 seasons (ops in flight ARE your
    // visible output). Dissolution after 4 consecutive warned seasons is a
    // house rule serving handoff constraint 3 (a turtle must be able to
    // lose); playtest-tuned 2026-08-24 after "way too easy to get defunded".
    let status = "running";
    // (recentOp computed above counts PLAYER ops only — rival activity must
    // never shield the player from the committee)
    const obsolescent = t > 8 && mandate <= P.mandateBase + 1 && !recentOp;
    const obsStreak = obsolescent ? ((prev ? prev.obsStreak : 0) + 1) : 0;
    if (dossier >= 200) status = "exposed";
    else if (treasury < 0) status = "insolvent";
    else if (obsStreak >= 4) status = "dissolved";
    else if (obsolescent) status = "obsolescence-warning";

    const row = { t, year: clim.year, qtr: clim.qtr, driverNat: clim.drivers,
                  driverTotals, sigmas, anomalies, resil, yields, supply,
                  price, revenue, severity, mandate, opsSpend, containment,
                  budgetIn, trimmed, jetTriggered, jetActive,
                  treasury, attribution, dossier, ladderText,
                  status, obsStreak, landed, committed,
                  prediction: cmd.prediction || "" };
    state.rows.push(row);
    return row;
  }

  return { resolve, state,
           capabilities: MODEL.capabilities, regions: REGIONS,
           drivers: DRIVERS, ladder: MODEL.ladder, assumptions: P,
           seasons: MODEL.climate.length };
}

if (typeof module !== "undefined") module.exports = { createEngine };

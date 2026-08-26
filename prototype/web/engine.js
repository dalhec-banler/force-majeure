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
  // forensic attribution (playtest fix, night audit 2026-08-24): repeat
  // strikes on the same target compound the signature (a pattern is the
  // most damning evidence), and region-targeted signatures amplify by the
  // TARGET's envelope stress rather than the 16-region global average
  // (which diluted the sheet's 8-region amplifier). Default off.
  const forensics = !!(opts && opts.forensics);
  // knowledge progression (brief §7.5, ADR-0007): the wiring is hidden.
  // Driver→region edges start ~20% revealed (the homeland's own wires plus
  // the strongest few); research and observation reveal the rest. GLOBAL
  // edges are the planet's temperature — public science, always known.
  // Gated (default off): the baseline never asks what is known.
  const knowledgeOn = !!(opts && opts.knowledge);
  // budget gate (author rule 2026-08-25): the programme can never spend
  // money it does not have. An operation whose cost exceeds the purse at
  // commitment is refused; containment is clamped to what remains.
  // Insolvency is therefore reachable only by attrition (overhead), never
  // by a purchase. Gated (default off): the baseline commits no ops.
  const budgetGate = !!(opts && opts.budgetGate);
  // exogenous natural forcing (ADR-0017): the record's eruptions load the
  // stratosphere and drop ash on regions. Entries {t, driver|region, mag,
  // dur, decay, cap}. Landed with owner "nature" — never traced as anyone's.
  const exogenous = (opts && Array.isArray(opts.exogenous)) ? opts.exogenous : [];
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

  const EDGES = [];
  DRIVERS.forEach((d, di) => { if (d === "GLOBAL") return;
    REGIONS.forEach((r, ri) => { if (MODEL.coeff[di][ri] !== 0)
      EDGES.push({ di, ri, driver: d, region: r.name,
                   coeff: MODEL.coeff[di][ri], lag: MODEL.lags[di][ri] }); }); });
  const known = new Set();
  const ekey = (di, ri) => di + ":" + ri;
  const byStrength = (a, b) => Math.abs(b.coeff) - Math.abs(a.coeff) || a.di - b.di || a.ri - b.ri;
  if (knowledgeOn) {
    const home = REGIONS.findIndex((r) => r.homeland);
    for (const e of EDGES) if (e.ri === home) known.add(ekey(e.di, e.ri));
    const rest = EDGES.filter((e) => e.ri !== home).slice().sort(byStrength);
    const want = Math.max(0, Math.ceil(EDGES.length * 0.2) - known.size);
    for (const e of rest.slice(0, want)) known.add(ekey(e.di, e.ri));
  }
  function isKnown(di, ri) {
    return !knowledgeOn || DRIVERS[di] === "GLOBAL" || MODEL.coeff[di][ri] === 0
        || known.has(ekey(di, ri));
  }
  /* Projection of the NEXT season from known wiring only (TDD §2.6 F1: the
   * forecast cannot leak hidden edges) plus the player's own region ops
   * scheduled to land — you know what you did. No noise: the weather itself
   * is never forecast. */
  function forecast(extra) {   // extra: ops the player is about to commit
    const tn = state.rows.length + 1;
    if (tn > MODEL.climate.length) return null;
    const prevA = state.rows.length ? state.rows[state.rows.length - 1].anomalies : new Array(NR).fill(0);
    const pend = (extra || []).map((x) => makeOp(tn, x.cap, x.target, prevA, "player")).filter(Boolean);
    return REGIONS.map((r, ri) => {
      let v = 0, kn = 0, tot = 0;
      for (let di = 0; di < ND; di++) {
        if (MODEL.coeff[di][ri] === 0) continue;
        const g = DRIVERS[di] === "GLOBAL";
        if (!g) tot++;
        if (!isKnown(di, ri)) continue;
        if (!g) kn++;
        const ts = tn - MODEL.lags[di][ri];
        if (ts >= 1) v += state.rows[ts - 1].driverTotals[di] * MODEL.coeff[di][ri];
      }
      for (const op of state.ops) {
        if (op.owner !== "player" || op.mag === 0 || op.target !== r.name) continue;
        const start = op.t + op.lag, dur = op.dur || 1;
        if (tn >= start && tn < start + dur) v += op.mag * Math.pow(op.decay, tn - start);
      }
      for (const op of pend) if (op.lag === 0 && op.mag !== 0 && op.target === r.name) v += op.mag;
      for (const x of exogenous)   // the record's ashfall next season
        if (x.region === r.name && tn >= x.t && tn < x.t + (x.dur || 1)) v += x.mag;
      return { anomaly: v, known: kn, total: tot };
    });
  }

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
             dur: cap.dur || 1, decay: cap.decay === undefined ? 1 : cap.decay,
             sig: cap.sig, cost: cap.cost, disp, resil: cap.resil,
             owner: owner || "player", research: !!cap.research };
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
    // From season 21 the Eastern Program reads our flight logs: every
    // seventh season it works whichever harvest we have been protecting
    // hardest. A programme that has gone quiet for eight seasons gets its
    // own watershed hit again, off-cycle. The world does not wait for you.
    if (tt > 20 && (tt - 6) % 7 === 1) {
      const loved = playerFavourite(tt);
      if (loved) plan.push({ cap: "Watershed Interference", target: loved });
      const passive = !state.ops.some(
        (o) => o.owner === "player" && o.sig > 0 && o.t > tt - 8);
      if (passive) plan.push({ cap: "Watershed Interference",
                               target: "North American Plains" });
    }
    return plan;
  }
  // the non-homeland region the player has relieved or hardened most in
  // the last 16 seasons (the rival never sabotages its own steppe).
  // Deterministic: ties resolve by first commitment.
  function playerFavourite(tt) {
    const home = REGIONS.find((r) => r.homeland).name;
    const score = {};
    for (const o of state.ops) {
      if (o.owner !== "player" || o.t <= tt - 16) continue;
      if (o.cap !== "Cloud Seeding" && o.cap !== "Adaptation Investment") continue;
      if (o.target === home || o.target === "Black Sea Steppe") continue;
      score[o.target] = (score[o.target] || 0)
                      + (o.cap === "Adaptation Investment" ? 2 : 1);
    }
    let best = null, bs = 0;
    for (const k of Object.keys(score)) if (score[k] > bs) { best = k; bs = score[k]; }
    return best;
  }

  /* Resolve season t (must be rows.length+1). cmd = {opA, opB, targetA,
   * targetB, containment, prediction}. Returns the committed row. */
  function resolve(t, cmd) {
    if (t !== state.rows.length + 1) throw new Error("seasons resolve in order");
    const clim = MODEL.climate[t - 1];
    const prev = state.rows[t - 2] || null;
    const prevAnom = prev ? prev.anomalies : new Array(NR).fill(0);

    // C — commitment: preconditions bound, ops recorded, costs fixed.
    const committed = [], refused = [];
    // the purse reserves this season's overhead: you cannot spend the rent
    let purse = (prev ? prev.treasury : P.startingTreasury) + Math.max(0, cmd.grant || 0)
              - (budgetGate ? P.overhead : 0);
    // any number of operations a season (author rule 2026-08-25); the sheet's
    // two-slot cmd shape (opA/opB) is still accepted for conformance
    const wanted = Array.isArray(cmd.ops)
      ? cmd.ops.map((o) => [o.cap, o.target])
      : [[cmd.opA, cmd.targetA], [cmd.opB, cmd.targetB]];
    for (const [capName, target] of wanted) {
      const op = makeOp(t, capName, target, prevAnom, "player");
      if (!op) continue;
      if (budgetGate && op.cost > purse) { refused.push(op); continue; }
      purse -= op.cost;
      committed.push(op); state.ops.push(op);
    }
    for (const r of rivalPlan(t)) {
      const op = makeOp(t, r.cap, r.target, prevAnom, "rival");
      if (op) state.ops.push(op);
    }
    let containment = Math.max(0, cmd.containment || 0);
    if (budgetGate) containment = Math.min(containment, Math.max(0, purse));

    // R2 — maturation scan: effects landing at t from strictly prior commits.
    const landed = [];
    for (const op of state.ops) {
      if (op.lag === 0 ? op.t > t : op.t >= t) continue;
      const start = op.t + op.lag, dur = op.dur || 1;
      if (t >= start && t < start + dur && op.mag !== 0) {
        const k = t - start;                        // effect age (burn-down)
        landed.push({ kind: DRIVERS.includes(op.target) ? "driver" : "region",
                      target: op.target, mag: op.mag * Math.pow(op.decay, k),
                      cap: op.cap, committedT: op.t,
                      sig: k === 0 ? op.sig : 0,    // signature on first landing
                      first: k === 0, age: k, owner: op.owner });
      }
      if (op.disp && op.t + op.disp.lag === t)
        landed.push({ kind: "driver", target: op.disp.to, mag: op.disp.mag,
                      cap: op.cap + " (displacement)", committedT: op.t,
                      sig: 0, first: true, age: 0, owner: op.owner });
    }

    for (const x of exogenous) {
      const dur = x.dur || 1;
      if (t >= x.t && t < x.t + dur && x.mag)
        landed.push({ kind: x.driver ? "driver" : "region", target: x.driver || x.region,
                      mag: x.mag * Math.pow(x.decay === undefined ? 1 : x.decay, t - x.t),
                      cap: x.cap || "nature", committedT: x.t, sig: 0,
                      first: t === x.t, age: t - x.t, owner: "nature" });
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
    // K — knowledge: research landing this season reveals the strongest
    // unknown wire into its target; a large swing that visibly explains a
    // region's season reveals itself (at most two a season — analysts can
    // only chase so many leads). Deterministic.
    const revealed = [];
    if (knowledgeOn) {
      for (const op of state.ops) {
        if (!op.research || op.owner !== "player" || op.t + op.lag !== t) continue;
        const ri = regionIndex[op.target];
        const cand = EDGES.filter((e) => e.ri === ri && !known.has(ekey(e.di, e.ri)))
                          .sort(byStrength);
        if (cand.length) { known.add(ekey(cand[0].di, cand[0].ri));
                           revealed.push(Object.assign({ how: "research" }, cand[0])); }
        else revealed.push({ ri, region: op.target, how: "exhausted" });
      }
      const obs = [];
      for (const e of EDGES) {
        if (known.has(ekey(e.di, e.ri))) continue;
        const ts = t - e.lag; if (ts < 1) continue;
        const dv = state.rows[ts - 1].driverTotals[e.di], c = Math.abs(dv * e.coeff);
        if (Math.abs(dv) >= 1.1 && c >= 0.55) obs.push({ e, c });
      }
      obs.sort((a, b) => b.c - a.c || byStrength(a.e, b.e));
      for (const o of obs.slice(0, 2)) { known.add(ekey(o.e.di, o.e.ri));
                                         revealed.push(Object.assign({ how: "observed" }, o.e)); }
    }
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
      (o) => o.owner === "player"
        && (o.t > t - 4                                   // committed recently
            || (o.mag !== 0 && t < o.t + o.lag + (o.dur || 1))));  // or still burning

    const trimmed = t > 4 && !recentOp && idleTrim < 1;
    const budgetIn = revenue * P.budgetFromRevenue
                   + mandate * P.budgetFromMandate * (trimmed ? idleTrim : 1)
                   + Math.max(0, cmd.grant || 0)    // directive appropriations
                   - Math.max(0, cmd.clawback || 0); // lapsed-directive clawback
    const prevTreasury = prev ? prev.treasury : P.startingTreasury;
    let treasury = prevTreasury + budgetIn - opsSpend - containment
                   - P.overhead;
    // a broke programme is wound up, not bankrupted (author rule 2026-08-26,
    // budget gate only): when nothing was spent and the rent alone drives the
    // treasury negative, the committee carries the rent while it deliberates
    // — the treasury floors at zero and the season counts as obsolescent.
    const broke = budgetGate && opsSpend === 0 && containment === 0 && treasury < 0;
    if (broke) treasury = 0;

    // A — attribution: signatures of main effects that LANDED this season,
    // amplified by how far outside the envelope the world is.
    const envelopeStress = REGIONS.reduce((s, r, ri) =>
      s + Math.max(0, Math.abs(anomalies[ri]) / sigmas[ri] - 1), 0) / NR;
    // only the player's signatures feed the player's dossier
    let attribution = 0;
    for (const e of landed) {
      if (e.owner !== "player" || !e.sig) continue;
      let sig = e.sig;
      if (forensics) {
        // pattern evidence: same-target player landings in the last 8 seasons
        let repeats = 0;
        for (const o of state.ops)
          if (o.owner === "player" && o.sig > 0 && o.target === e.target
              && o.t + o.lag < t && o.t + o.lag >= t - 8) repeats++;
        sig *= 1 + 0.4 * Math.min(4, repeats);
        // the TARGET's own envelope stress, not the world average
        const ri = regionIndex[e.target];
        const stress = ri !== undefined
          ? Math.max(0, Math.abs(anomalies[ri]) / sigmas[ri] - 1)
          : envelopeStress;
        sig *= 1 + P.envelopeMultWeight * stress;
      } else {
        sig *= 1 + P.envelopeMultWeight * envelopeStress;
      }
      attribution += sig;
    }
    const prevDossier = prev ? prev.dossier : 0;
    // forensics: hush money buys less once questions circulate — containment
    // efficiency falls as the standing dossier grows (sheet behavior when off)
    const contEff = forensics
      ? P.containmentEff / (1 + prevDossier / 60)
      : P.containmentEff;
    // once a rival service has named you (rung 5, dossier 115+), the file
    // grows on its own: investigators are working it. Institutional
    // forgetting no longer applies above that line. (forensics only)
    const investigators = forensics && prevDossier >= 115 ? 3 : 0;
    const decayEff = investigators ? 0 : P.dossierDecay;
    const dossier = Math.max(0, prevDossier * (1 - decayEff)
      + attribution + investigators - containment * contEff);

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
    const obsolescent = (t > 8 && mandate <= P.mandateBase + 1 && !recentOp) || (broke && !recentOp);
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
                  status, obsStreak, landed, committed, refused, revealed,
                  prediction: cmd.prediction || "" };
    state.rows.push(row);
    return row;
  }

  return { resolve, state,
           capabilities: MODEL.capabilities, regions: REGIONS,
           drivers: DRIVERS, ladder: MODEL.ladder, assumptions: P,
           seasons: MODEL.climate.length,
           knowledge: { on: knowledgeOn, edges: EDGES, isKnown, forecast,
                        count: () => ({ known: known.size, total: EDGES.length }) } };
}

if (typeof module !== "undefined") module.exports = { createEngine };

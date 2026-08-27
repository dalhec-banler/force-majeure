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
  // grain price ceiling (author balance rule 2026-08-26): crisis spikes run
  // 2–3× baseline, not 5×. Default Infinity keeps the sheet exact.
  const priceCap = (opts && opts.priceCap) ? opts.priceCap : Infinity;
  // scrutiny (ADR-0020, ladder session 2026-08-26): the ladder has teeth.
  // Signatures scale up, the file forgets more slowly, patterns are
  // remembered longer, each rung amplifies every landing that follows
  // (more eyes), hush money saturates within a season, crossing rung 5
  // leaves a permanent floor (ADR-0009), and the service that named you
  // works your harvest. Default off: the sheet baseline never climbs.
  const scrutiny = (opts && opts.scrutiny)
    ? Object.assign({ sigScale: 1.5, decay: 0.03, repeatWindow: 12,
                      rungMult: [1, 1, 1.25, 1.5, 1.75, 2, 2],
                      contSat: 40, floor: 90, retaliateEvery: 4 },
                    opts.scrutiny === true ? {} : opts.scrutiny)
    : null;
  // grain supply (ADR-0021, author rule 2026-08-26): only regions that
  // grow grain or factually ship it (hubs flagged `grain`) count in the
  // supply index; the other hubs keep their weight for severity only.
  // Default off: the sheet's eight regions are all breadbaskets anyway.
  const grainSupply = !!(opts && opts.grainSupply);
  // traded-market elasticity (ADR-0021): staples have a demand elasticity
  // near −0.15, so a 1% shortfall in the traded market moves price ~5%.
  // Default: the sheet's exponent.
  const elasticity = (opts && opts.priceElasticity) ? opts.priceElasticity : null;
  // the Eastern Program by era (author 2026-08-26): almost irrelevant at
  // the start, contemporary in contemporary times. Keyed to the calendar
  // year, never to the season count. Default off: the season-count schedule.
  const rivalEras = !!(opts && opts.rivalEras);
  // the shadow world (ADR-0021): a second engine, same world and rules,
  // in which the programme never acts. Each row carries baseRevenue — what
  // the homeland would have earned anyway — so PROFIT is what the
  // programme made, not what the weather did. Default off.
  // eras (ADR-0023/24/25, author 2026-08-26): the world grows and the
  // arsenal arrives on the calendar. Regions carry `from` (the year they
  // come on the board); capabilities carry `from`, `chest` (the treasury the
  // programme must hold to stand the wing up) and `upkeep` (its rent per
  // season while online). A wing whose chest collapses is mothballed; it
  // reopens at three-quarters of the chest. Always a way back. Default off.
  const eras = !!(opts && opts.eras);
  // nation starts (brief §"difficulty is which programme you take over"):
  // the homeland region, the rival programme's own region, the chest
  if (opts && opts.homeland) for (const r of MODEL.regions) r.homeland = (r.name === opts.homeland);
  const HOME = (MODEL.regions.find((r) => r.homeland) || MODEL.regions[0]).name;
  // the committee's generosity by nation start (a flat lift on the mandate)
  const mandateBonus = (opts && opts.mandateBonus) || 0;
  const RHOME = (opts && opts.rivalHome) || (HOME === "Black Sea Steppe" ? "North American Plains" : "Black Sea Steppe");
  // the windfall cut (ADR-0023): the programme keeps this share of what it
  // made the homeland this season over the shadow world — the trade desk's
  // motive made into money. Needs the shadow; default 0 (sheet exact).
  const windfallCut = (opts && opts.windfall) ? opts.windfall : 0;
  // use it or lose it (ADR-0023): treasury above the reserve cap lapses at
  // 15% a season — the committee does not let a directorate bank a war
  // chest it is not using. Default Infinity (sheet exact).
  const reserveCap = (opts && opts.reserveCap) ? opts.reserveCap : Infinity;
  // envelope widening per season override (the sheet's 0.006 was tuned for
  // forty seasons; the long campaign uses ~0.0006)
  const envelopeWidening = (opts && opts.envelopeWidening !== undefined)
    ? opts.envelopeWidening : null;
  const shadow = (opts && opts.shadow)
    ? createEngine(MODEL, Object.assign({}, opts, { shadow: false })) : null;
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
    startingTreasury: (opts && opts.startingTreasury !== undefined) ? opts.startingTreasury : A.B25,
  };

  const DRIVERS = MODEL.drivers;                  // ["ENSO","IOD","NATL","GLOBAL"]
  const REGIONS = MODEL.regions;
  const NR = REGIONS.length, ND = DRIVERS.length;
  const regionIndex = Object.fromEntries(REGIONS.map((r, i) => [r.name, i]));
  const capByName = Object.fromEntries(
    MODEL.capabilities.map((c) => [c.name, c]));

  const state = { ops: [], rows: [], jetUntil: 0, dossierFloor: 0, wings: {} };  // rows[t-1] = season t
  for (const c of MODEL.capabilities) if (c.type !== "NONE") {
    // the lab (upkeep ≤ $1M) stands itself up — from the first season if
    // its year has come; wings are ordered
    const lab = (c.upkeep || 0) <= 1;
    const atStart = eras && lab && (!c.from || c.from <= MODEL.climate[0].year) && (c.chest || 0) <= P.startingTreasury;
    state.wings[c.name] = { online: !eras || atStart, ever: atStart, low: 0, wanted: lab };
  }
  // appropriations follow the threat (ADR-0023): the committee's baseline
  // mandate rises with the era — a lab's budget line in 1946, a Cold War
  // directorate by ENMOD, a standing programme by the century's end
  const MANDATE_RAMP = [[1946,0],[1960,2],[1976,10],[1990,18],[2000,24],[2015,32],[2030,40],[2060,48]];
  function mandateLift(year) {
    if (!eras) return 0;
    for (let i = 0; i + 1 < MANDATE_RAMP.length; i++) {
      const [y0, v0] = MANDATE_RAMP[i], [y1, v1] = MANDATE_RAMP[i + 1];
      if (year >= y0 && year <= y1) return v0 + (v1 - v0) * (year - y0) / (y1 - y0);
    }
    return MANDATE_RAMP[MANDATE_RAMP.length - 1][1];
  }
  const yearOf = (tt) => MODEL.climate[Math.max(1, Math.min(tt, MODEL.climate.length)) - 1].year;
  function regionOnline(ri, tt) { const r = REGIONS[ri]; return !eras || !r.from || yearOf(tt) >= r.from; }
  function wingOnline(name) { if (!eras) return true; const w = state.wings[name]; return !w || w.online; }
  function wingStatus(name) {   // {online, eligible, chest, need, upkeep, from, ever, wanted}
    const cap = capByName[name], w = state.wings[name];
    if (!cap || !w) return null;
    const tt = state.rows.length + 1, yr = yearOf(tt);
    const prevT = state.rows.length ? state.rows[state.rows.length - 1].treasury : P.startingTreasury;
    const need = (cap.chest || 0) * (w.ever ? 0.75 : 1);
    const behind = !cap.requires || cap.requires.every((n) => state.wings[n] && state.wings[n].ever);
    const eligible = (!cap.from || yr >= cap.from) && behind;
    return { online: w.online, eligible, from: cap.from || null, behind,
             requires: (cap.requires || []).filter((n) => !(state.wings[n] && state.wings[n].ever)),
             chest: cap.chest || 0, need, canStand: eligible && prevT >= need,
             once: !!cap.once, spent: !!cap.once && state.ops.some((o) => o.owner === "player" && o.cap === name),
             upkeep: cap.upkeep || 0, ever: w.ever, wanted: w.wanted };
  }
  function wingsSnapshot() { const o = {}; for (const k of Object.keys(state.wings)) o[k] = state.wings[k].online; return o; }
  // grain supply weights: share of the index carried by each region
  const supplyShare = (() => {
    const counts = REGIONS.map((r) => !grainSupply || !r.kind || !!r.grain);
    const w = REGIONS.map((r, ri) => counts[ri]
      ? r.weight * (grainSupply && r.export !== undefined ? r.export : 1) : 0);
    const tot = w.reduce((s, x) => s + x, 0);
    return w.map((x) => x * 100 / tot);
  })();
  for (let di = 0; di < ND; di++) for (let ri = 0; ri < NR; ri++)
    if (MODEL.coeff[di][ri] !== 0 && MODEL.lags[di][ri] < 1)
      throw new Error("lag 0 edge: forbidden (" + DRIVERS[di] + " → " + REGIONS[ri].name + ")");

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
  // era of the Eastern Program for a calendar year: 0 none, 1 a lab with
  // seeding planes, 2 ENMOD-era operator, 3 contemporary, 4 the future
  function rivalEra(year) {
    return year < 1962 ? 0 : year < 1976 ? 1 : year < 2000 ? 2 : year < 2030 ? 3 : 4;
  }
  function rivalPlan(tt) {
    if (!rivalsOn || tt < 6) return [];
    const plan = [];
    if (rivalEras) {
      const era = rivalEra(MODEL.climate[tt - 1].year);
      if (era === 0) return plan;
      // its own steppe, on its own clock
      if ((tt - 6) % (era === 1 ? 10 : 7) === 0)
        plan.push({ cap: "Cloud Seeding", target: RHOME });
      if (era === 1) return plan;                       // a lab. Nothing more.
      const homeEvery = era === 2 ? 7 : era === 3 ? 5 : 4;
      if ((tt - 6) % homeEvery === 3)
        plan.push({ cap: "Watershed Interference", target: HOME });
      if ((tt - 6) % 40 === 16) plan.push({ cap: "Ocean Thermal Forcing" });
      if (era >= 3 && (tt - 6) % 40 === 30) plan.push({ cap: "Stratospheric Aerosol Inj." });
      if (era >= 4 && (tt - 6) % 40 === 5) plan.push({ cap: "ENSO Forcing" });
      if ((tt - 6) % 7 === 1) {
        const loved = playerFavourite(tt);
        if (loved) plan.push({ cap: "Watershed Interference", target: loved });
        const passive = !state.ops.some(
          (o) => o.owner === "player" && o.sig > 0 && o.t > tt - 8);
        if (passive && !plan.some((p) => p.target === HOME))
          plan.push({ cap: "Watershed Interference", target: HOME });
      }
      if (scrutiny) {
        const pd = state.rows[tt - 2] ? state.rows[tt - 2].dossier : 0;
        const every = Math.max(2, scrutiny.retaliateEvery - (era - 2));
        if (pd >= MODEL.ladder[4].threshold && (tt - 6) % every === 0
            && !plan.some((p) => p.target === HOME))
          plan.push({ cap: "Watershed Interference", target: HOME });
      }
      return plan;
    }
    if ((tt - 6) % 7 === 0)
      plan.push({ cap: "Cloud Seeding", target: RHOME });
    if (tt > 14 && (tt - 6) % 7 === 3)
      plan.push({ cap: "Watershed Interference",
                  target: HOME });
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
                               target: HOME });
    }
    // Named (rung 5): the service that wrote the brief now works our
    // harvest on its own clock. The ladder is the rival's targeting order.
    if (scrutiny && tt > 6) {
      const pd = state.rows[tt - 2] ? state.rows[tt - 2].dossier : 0;
      if (pd >= MODEL.ladder[4].threshold && (tt - 6) % scrutiny.retaliateEvery === 0
          && !plan.some((p) => p.target === HOME))
        plan.push({ cap: "Watershed Interference", target: HOME });
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
      if (o.target === home || o.target === RHOME) continue;
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
    // a flagship earmark {amount, caps} is drawn only by the op it funds
    const earmark = cmd.earmark && cmd.earmark.amount > 0 ? cmd.earmark : null;
    let earmarkUsed = 0;
    // the arsenal (eras): wings stand up when the calendar and the chest
    // allow, are mothballed by order (cmd.mothball) or by attrition (four
    // seasons under a quarter of the chest), reopen at three-quarters
    const wingEvents = [];
    if (eras) {
      const prevT = prev ? prev.treasury : P.startingTreasury;
      const yr = yearOf(t);
      for (const cap of MODEL.capabilities) {
        if (cap.type === "NONE") continue;
        const w = state.wings[cap.name];
        // a wing may need the whole tree behind it before it is even possible
        const behind = !cap.requires || cap.requires.every((n) => state.wings[n] && state.wings[n].ever);
        const eligible = (!cap.from || yr >= cap.from) && behind;
        if (cmd.mothball && cmd.mothball.includes(cap.name)) {
          w.wanted = false;
          if (w.online) { w.online = false; w.low = 0;
            wingEvents.push({ cap: cap.name, what: "mothballed", why: "order" }); } }
        if (cmd.standup && cmd.standup.includes(cap.name)) w.wanted = true;
        const fundedNow = earmark && earmark.caps.includes(cap.name);
        if (!w.online && eligible && (w.wanted || fundedNow)) {
          const need = (cap.chest || 0) * (w.ever ? 0.75 : 1);
          const funded = fundedNow;
          if (prevT >= need || funded) {
            const why = (funded && !w.wanted) ? "earmark" : w.ever ? "reopened" : "new";
            w.online = true; w.low = 0; w.wanted = true; w.ever = true;
            wingEvents.push({ cap: cap.name, what: "online", why }); }
        } else if (w.online && (cap.chest || 0) > 0) {
          if (prevT < cap.chest / 4) w.low++; else w.low = 0;
          if (w.low >= 4) { w.online = false; w.low = 0; w.wanted = false;
            wingEvents.push({ cap: cap.name, what: "mothballed", why: "attrition" }); }
        }
      }
    }
    const upkeep = eras ? MODEL.capabilities.reduce((s2, c) =>
      s2 + ((c.type !== "NONE" && state.wings[c.name].online) ? (c.upkeep || 0) : 0), 0) : 0;
    const overhead = P.overhead + upkeep;
    // the purse reserves this season's overhead: you cannot spend the rent
    let purse = (prev ? prev.treasury : P.startingTreasury) + Math.max(0, cmd.grant || 0)
              - Math.max(0, cmd.clawback || 0) - (budgetGate ? overhead : 0);
    const purseAtCommit = purse;
    if (earmark) purse += earmark.amount;                 // available to the flagship op
    // any number of operations a season (author rule 2026-08-25); the sheet's
    // two-slot cmd shape (opA/opB) is still accepted for conformance
    const wanted = Array.isArray(cmd.ops)
      ? cmd.ops.map((o) => [o.cap, o.target])
      : [[cmd.opA, cmd.targetA], [cmd.opB, cmd.targetB]];
    for (const [capName, target] of wanted) {
      const op = makeOp(t, capName, target, prevAnom, "player");
      if (!op) continue;
      if (eras) {
        if (!wingOnline(op.cap)) { refused.push(Object.assign({ why: "locked" }, op)); continue; }
        // some things are done once in a century or not at all
        if (capByName[op.cap] && capByName[op.cap].once
            && state.ops.some((o) => o.owner === "player" && o.cap === op.cap)) {
          refused.push(Object.assign({ why: "spent" }, op)); continue; }
        const tri = regionIndex[op.target];
        if (op.type === "REGION" && tri !== undefined && !regionOnline(tri, t)) {
          refused.push(Object.assign({ why: "offline" }, op)); continue; }
      }
      const funded = earmark && !earmarkUsed && earmark.caps.includes(op.cap);
      if (budgetGate && op.cost > (funded ? purse : purse - (earmark && !earmarkUsed ? earmark.amount : 0))) { refused.push(op); continue; }
      purse -= op.cost;
      if (funded) earmarkUsed = earmark.amount;
      committed.push(op); state.ops.push(op);
    }
    for (const r of rivalPlan(t)) {
      // the rival shares the century's technology and the board as it stands
      if (eras) {
        const rc = capByName[r.cap];
        if (rc && rc.from && yearOf(t) < rc.from) continue;
        const tri = regionIndex[r.target];
        if (tri !== undefined && !regionOnline(tri, t)) continue;
      }
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

    // stacking: the k-th identical player driver injection landing in the
    // same season adds 0.65^(k-1) of its magnitude — the sky cannot be
    // veiled six times over (forensics only)
    if (forensics) {
      const seen = {};
      for (const e of landed) {
        if (e.owner !== "player" || e.kind !== "driver" || !e.first || e.cap.includes("displacement")) continue;
        const k = seen[e.cap + "|" + e.target] = (seen[e.cap + "|" + e.target] || 0) + 1;
        if (k > 1) e.mag *= Math.pow(0.65, k - 1);
      }
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
    const sigmas = REGIONS.map((r) => r.sigma * (1 + (envelopeWidening !== null ? envelopeWidening : P.envelopeWidening) * t));
    // the board as it stands this season (eras): regions not yet online
    // grow nothing anyone trades, weigh nothing, and cannot be worked
    const online = REGIONS.map((r, ri) => regionOnline(ri, t));
    const nOnline = online.filter(Boolean).length;
    const regionEvents = eras && t > 1
      ? REGIONS.map((r, ri) => ({ ri, region: r.name })).filter((x) => online[x.ri] && !regionOnline(x.ri, t - 1))
      : [];

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
        if (known.has(ekey(e.di, e.ri)) || !online[e.ri]) continue;
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
      if (!online[ri]) return 100;
      const a = anomalies[ri];
      const damage = (Math.max(0, -a) * r.sens * P.droughtPenalty
        + Math.max(0, a - P.floodThreshold) * r.sens * P.floodPenalty)
        * (1 - Math.min(90, resil[ri]) / 100);
      return Math.max(0, Math.min(135, 100 - damage));
    });

    // R8 — markets.
    const shareNow = eras ? (() => {
      const w = supplyShare.map((x, ri) => online[ri] ? x : 0);
      const tot = w.reduce((s2, x) => s2 + x, 0) || 1;
      return w.map((x) => x * 100 / tot); })() : supplyShare;
    const supply = REGIONS.reduce(
      (s, r, ri) => s + yields[ri] * shareNow[ri] / 100, 0);
    const price = Math.min(priceCap, 100 * Math.pow(100 / Math.max(1, supply), elasticity || P.priceElasticity));
    const homelandIdx = REGIONS.findIndex((r) => r.homeland);
    const revenue = yields[homelandIdx] * price / 100 * P.revenueScale;
    const baseRevenue = shadow ? shadow.resolve(t, {}).revenue : null;
    const windfall = (shadow && windfallCut) ? Math.max(0, revenue - baseRevenue) * windfallCut : 0;

    // R9 — severity, mandate, budget, treasury.
    const sevTot = eras ? REGIONS.reduce((s2, r, ri) => s2 + (online[ri] ? r.weight : 0), 0) : 100;
    const severity = REGIONS.reduce((s, r, ri) =>
      s + (online[ri] ? Math.max(0, Math.abs(anomalies[ri])
                      - sigmas[ri] * P.severityThreshold) * r.weight / sevTot : 0), 0);
    const mandate = Math.min(P.mandateCap,
                             P.mandateBase + mandateBonus + mandateLift(clim.year) + severity * P.mandatePerSeverity);
    const opsSpend = committed.reduce((s, o) => s + o.cost, 0);
    // the committee's patience is measured in reviews: at an annual cadence
    // the idle windows stretch so a year's silence is not a season's
    const every = (MODEL.tiers || []).filter((x) => clim.year >= x.from).map((x) => x.every).pop() || 1;
    const idleWin = Math.max(4, 2 * every), realWin = Math.max(8, 3 * every);
    // the committee funds programmes that do things
    const recentOp = state.ops.some(
      (o) => o.owner === "player"
        && (o.t > t - idleWin                             // committed recently
            || (o.mag !== 0 && t < o.t + o.lag + (o.dur || 1))));  // or still burning

    const trimmed = t > 4 && !recentOp && idleTrim < 1;
    // the committee winds up a programme that has run no real operation
    // (signature or magnitude) in eight seasons — research and adaptation
    // keep the appropriation, not the mandate to exist (budget gate only)
    const recentRealOp = state.ops.some(
      (o) => o.owner === "player" && (o.sig > 0 || o.mag !== 0) && o.t > t - realWin);
    const budgetIn = revenue * P.budgetFromRevenue
                   + mandate * P.budgetFromMandate * (trimmed ? idleTrim : 1)
                   + Math.max(0, cmd.grant || 0) + earmarkUsed   // directive appropriations, the earmark if drawn
                   + windfall                                    // the trade desk's cut
                   - Math.max(0, cmd.clawback || 0); // lapsed-directive clawback
    const prevTreasury = prev ? prev.treasury : P.startingTreasury;
    let treasury = prevTreasury + budgetIn - opsSpend - containment
                   - overhead;
    // a broke programme is wound up, not bankrupted (author rule 2026-08-26,
    // budget gate only): when nothing was spent and the rent alone drives the
    // treasury negative, the committee carries the rent while it deliberates
    // — the treasury floors at zero and the season counts as obsolescent.
    const broke = budgetGate && opsSpend === 0 && containment === 0 && treasury < 0;
    if (broke) treasury = 0;
    const lapsed = treasury > reserveCap ? (treasury - reserveCap) * 0.15 : 0;
    treasury -= lapsed;

    // A — attribution: signatures of main effects that LANDED this season,
    // amplified by how far outside the envelope the world is.
    const envelopeStress = REGIONS.reduce((s, r, ri) =>
      s + (online[ri] ? Math.max(0, Math.abs(anomalies[ri]) / sigmas[ri] - 1) : 0), 0) / Math.max(1, nOnline);
    // only the player's signatures feed the player's dossier
    const prevDossier = prev ? prev.dossier : 0;
    // scrutiny: the rung the world was on when these ops landed decides how
    // many eyes were on them. rungMult is indexed by ladder rung (0 = nothing)
    const prevRung = MODEL.ladder.filter((l) => prevDossier >= l.threshold).length - 1;
    const scrutinyMult = scrutiny
      ? scrutiny.sigScale * (scrutiny.rungMult[Math.min(prevRung, scrutiny.rungMult.length - 1)])
      : 1;
    const repeatWindow = scrutiny ? scrutiny.repeatWindow : 8;
    let attribution = 0;
    for (const e of landed) {
      if (e.owner !== "player" || !e.sig) continue;
      // relief pays half its signature under scrutiny and none of the rung's
      // eyes: rain on a harvest is announced and thanked, not investigated
      const reliefOp = scrutiny && e.kind === "region" && e.mag > 0;
      let sig = e.sig * (reliefOp ? 0.5 : scrutinyMult);
      // relief is the programme's public face (ADR-0020, widened in the
      // century session): rain put on a harvest is announced, photographed
      // and thanked — it is never pattern evidence, at home or abroad. It
      // still pays its signature under the eyes.
      const homeRelief = scrutiny && e.kind === "region" && e.mag > 0;
      if (forensics && !homeRelief) {
        // pattern evidence: same-target player landings in the repeat window
        let repeats = 0;
        for (const o of state.ops)
          if (o.owner === "player" && o.sig > 0 && o.target === e.target
              && o.t + o.lag < t && o.t + o.lag >= t - repeatWindow) repeats++;
        // and the ones that landed beside it this season — a stack is a pattern
        repeats += landed.filter((x) => x !== e && x.owner === "player" && x.sig > 0
                                      && x.first && x.target === e.target
                                      && landed.indexOf(x) < landed.indexOf(e)).length;
        sig *= 1 + 0.4 * Math.min(6, repeats);
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
    // forensics: hush money buys less once questions circulate — containment
    // efficiency falls as the standing dossier grows (sheet behavior when off)
    const contEff = forensics
      ? P.containmentEff / (1 + prevDossier / 60)
      : P.containmentEff;
    // scrutiny: hush money is a trickle, not a firehose — the points a
    // season's spend buys saturate (C / (1 + C/contSat))
    const contPts = scrutiny
      ? containment / (1 + containment / scrutiny.contSat)
      : containment;
    // once a rival service has named you (rung 5, dossier 115+), the file
    // grows on its own: investigators are working it. Institutional
    // forgetting no longer applies above that line. (forensics only)
    const investigators = forensics && prevDossier >= 115 ? 3 : 0;
    const decayEff = investigators ? 0 : (scrutiny ? scrutiny.decay : P.dossierDecay);
    let dossier = Math.max(0, prevDossier * (1 - decayEff)
      + attribution + investigators - contPts * contEff);
    // ADR-0009: crossing rung 5 sets a permanent floor — intelligence
    // services do not forget, whatever the press cycle does. Below 115 the
    // file decays again, but never beneath the floor. (scrutiny only)
    if (scrutiny) {
      if (dossier >= MODEL.ladder[4].threshold)
        state.dossierFloor = Math.max(state.dossierFloor, scrutiny.floor);
      dossier = Math.max(dossier, state.dossierFloor);
    }

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
    // a starved programme (the purse could not buy the cheapest operation)
    // is not idle — poverty costs it the wings by attrition, never the
    // programme (author 2026-08-26: always a way back). Idleness with money
    // is what the committee winds up.
    const cheapest = MODEL.capabilities.reduce((m, c) => (c.type !== "NONE" && c.cost > 0) ? Math.min(m, c.cost) : m, Infinity);
    const starved = budgetGate && (purseAtCommit < cheapest);
    const obsolescent = budgetGate
      ? (t > 8 && !starved && !recentRealOp)                 // idleness itself, not the weather, not poverty
      : (t > 8 && mandate <= P.mandateBase + 1 && !recentOp);
    const obsStreak = obsolescent ? ((prev ? prev.obsStreak : 0) + 1) : 0;
    // the committee winds a programme up after four warned seasons — never
    // fewer than two reviews at the current cadence (the player must have
    // had a chance to answer the warning)
    const obsLimit = Math.max(4, 3 * every);
    if (dossier >= 200) status = "exposed";
    else if (treasury < 0) status = "insolvent";
    else if (obsStreak >= obsLimit) status = "dissolved";
    else if (obsolescent) status = "obsolescence-warning";
    else if (starved && t > 8) status = "starved";

    const row = { t, year: clim.year, qtr: clim.qtr, driverNat: clim.drivers,
                  baseRevenue, windfall, lapsed,
                  driverTotals, sigmas, anomalies, resil, yields, supply,
                  price, revenue, severity, mandate, opsSpend, containment,
                  budgetIn, trimmed, jetTriggered, jetActive,
                  treasury, attribution, dossier, ladderText,
                  dossierFloor: state.dossierFloor, scrutinyMult,
                  online, regionEvents, wingEvents, upkeep, overhead, wings: wingsSnapshot(),
                  status, obsStreak, landed, committed, refused, revealed, earmarkUsed,
                  prediction: cmd.prediction || "" };
    state.rows.push(row);
    return row;
  }

  return { resolve, state,
           capabilities: MODEL.capabilities, regions: REGIONS,
           drivers: DRIVERS, ladder: MODEL.ladder, assumptions: P,
           seasons: MODEL.climate.length,
           eras, regionOnline, wingOnline, wingStatus, wings: wingsSnapshot, yearOf,
           shadowRows: () => shadow ? shadow.state.rows : null,
           knowledge: { on: knowledgeOn, edges: EDGES, isKnown, forecast,
                        count: () => { const tt = state.rows.length || 1;
                          const live = EDGES.filter((e) => regionOnline(e.ri, tt));
                          return { known: live.filter((e) => known.has(ekey(e.di, e.ri))).length, total: live.length }; } } };
}

if (typeof module !== "undefined") module.exports = { createEngine };

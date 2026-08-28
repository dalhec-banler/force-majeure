let SEASON_MS=45000;            // time does not stop; RUN jumps ahead (set per tier)
let seasonDeadline=null, resolving=false;
/* A REVIEW resolves every season until the next review point: the armed
   operations commit on its first season; containment and the earmark ride
   along; the seasons between pass briskly and the last one lingers. */
async function runSeason(auto){
  if(!running || resolving) return;
  resolving=true; seasonDeadline=null;
  $("resolve").disabled=true;
  alertQ.length=0;                                   // a new review's chyrons, not last review's backlog
  try{
    const n=nextBatch();
    { const lr=lastRow(); if(lr && !replaying){ const y0=eng.state.rows[Math.max(0,t-nextBatchWas)]; foldWire(lr.year+(lr.qtr==="Autumn"?"":" · "+lr.qtr.toLowerCase())); } }
    nextBatchWas=n;
    for(let i=0;i<n && running;i++){ brisk=i<n-1; await runSeasonInner(auto); }
  }
  catch(e){ console.error("season error", e); wire(`<span class="tag tagr">FAULT</span> The season resolved with an error in the instrument: ${escapeHTML(e.message)}. The record stands.`,"att"); }
  finally{ brisk=false; resolving=false; $("resolve").disabled=!running; SEASON_MS=clockMs(); renderReviewButton(); if(running && seasonDeadline===null) seasonDeadline=performance.now()+SEASON_MS; }
}
let nextBatchWas=1;
let pendingArchive=null;          // the campaign's final row, waiting for the player to open the archive
let CLOCK_AUTO=false;             // the review clock counts down; it only runs the review for you if you ask
function renderReviewButton(){
  if(pendingArchive){ $("resolve").textContent="OPEN THE ARCHIVE ▸"; $("resolve").disabled=false; return; }
  const n=running? nextBatch() : 0;
  $("resolve").textContent = n>=4? "RUN THE YEAR ▸" : n>=2? "RUN THE HALF-YEAR ▸" : "RUN SEASON ▸";
  const cl=$("szclockLbl"); if(cl) cl.textContent = n>=2? "REVIEW CLOSES" : "SEASON CLOSES";
}
async function runSeasonInner(auto, cmdOverride){
  const prev=lastRow();
  const first=isReviewStart(t+1);
  if(first) rv++;
  let cmd;
  if(cmdOverride) cmd=cmdOverride;
  else {
    cmd={ ops: first? slots.map(s=>({cap:s.cap,target:s.target})) : [],
          containment:+$("containment").value,
          grant:pendingGrant, clawback:pendingClaw,
          prediction: first? $("predict").value.trim() : "" };
    if(first && (wingOrders.standup.length||wingOrders.mothball.length)){
      cmd.standup=wingOrders.standup.slice(); cmd.mothball=wingOrders.mothball.slice();
      wingOrders={standup:[],mothball:[]}; }
    // the flagship earmark travels with the commitment; the engine draws it
    // only if the flagship op actually commits
    if(flagship) cmd.earmark={amount:flagship.amount, caps:flagship.caps||FLAGSHIP_CAPS};
  }
  pendingGrant=0; pendingClaw=0;
  t++;
  const row = eng.resolve(t, cmd);
  if(!replaying){ saveLog.push(cmd); persistSave(); }
  for(const w of (row.wingEvents||[])){
    const c=CAPS.find(x=>x.name===w.cap); const nm=w.cap.replace(" [T3]","").toUpperCase();
    if(w.what==="online"){
      if((c&&(c.upkeep||0)>0)||w.why!=="new"){
        alertStrip(`${nm} WING STANDS UP`);
        wire(`<span class="tag tagd">WING</span><b>${nm}</b> — ${w.why==="reopened"?"reopened. The planes come out of the desert.":w.why==="earmark"?"stood up on the committee's earmark. The demonstration is expected.":"the wing stands up."}${(c&&c.upkeep)?` Upkeep $${c.upkeep}M a season for as long as you keep it.`:""}`,"op");
        sfxChime(); }
    } else {
      alertStrip(`${nm} WING MOTHBALLED`);
      wire(`<span class="tag" style="color:var(--amber);border-color:var(--amber)">MOTHBALLED</span><b>${nm}</b> — ${w.why==="attrition"?"the chest could not carry it. The planes go to the desert; the crews go to the airlines.":"stood down by order."}${(c&&c.chest)?` It reopens at $${Math.round(c.chest*0.75)}M in the chest.`:""}`,"att");
      sfxAlert(); }
  }
  // a new capability becomes possible: the tray lights it, the wire and a chyron say so
  if(eng.eras) for(const c of CAPS){ if(c.type==="NONE"||!c.from||c.from<=MODEL.climate[0].year||freshWings.has(c.name)||wingSeen.has(c.name)) continue;
    const ws=eng.wingStatus(c.name); if(!ws||!ws.eligible) continue;
    freshWings.add(c.name); const nm=c.name.replace(" [T3]","").toUpperCase();
    alertStrip(`NEW CAPABILITY — ${nm} IS POSSIBLE`);
    wire(`<span class="tag tagd">NEW WING</span><b>${nm}</b> — the century has made it possible. ${(c.upkeep||0)<=1? "The lab stands it up on its own." : ws.canStand? "The chest can carry it: order it up from the tray." : `Stand it up when the chest holds $${Math.round(ws.need)}M; upkeep $${ws.upkeep}M a season.`}`,"op");
    sfxChime(); }
  // the chest can now carry a wing: say so, and light it until it is looked at
  if(eng.eras) for(const c of CAPS){ if(c.type==="NONE"||!(c.chest>0)||(c.upkeep||0)<=1||readySeen.has(c.name)||readyWings.has(c.name)) continue;
    const ws=eng.wingStatus(c.name); if(!ws||ws.online||ws.ever||!ws.eligible||!ws.canStand) continue;
    readyWings.add(c.name); const nm=c.name.replace(" [T3]","").toUpperCase();
    alertStrip(`WING READY — ${nm} CAN STAND UP`);
    wire(`<span class="tag tagd">WING READY</span><b>${nm}</b> — the chest holds $${fmt(row.treasury,0)}M; the committee will stand the wing up on your order. Click it in the tray. Upkeep $${ws.upkeep}M a season.`,"op");
    sfxChime(); }
  for(const g of (row.regionEvents||[])){
    const r=REG[g.ri];
    news(DATELINE[r.name]||r.name.toUpperCase(), `${r.name} is on the board — ${(r.crop||"").toLowerCase()}. ${r.kind==="hub"?"A chokepoint the world now runs through.":r.kind==="ice"?"Sea lanes where the ice used to be.":"A harvest the markets now price."}`, false);
    sfxTeletype(); }
  if(row.lapsed>0.5) wire(`MEMO — Budget office: $${fmt(row.lapsed,0)}M of unspent appropriation lapsed to the Treasury. A chest the programme does not use is one the committee does not renew.`,"memo");
  newWires=newWires.filter(w=>t-w.bornT<3);
  for(const e of (row.revealed||[])){
    if(e.how==="exhausted"){ wire(`RESEARCH — ${e.region}: nothing left to learn. Every wire into it is on the board.`,"op"); continue; }
    newWires.push({di:e.di,ri:e.ri,bornT:t});
    const verb=e.coeff<0?"dries":"wets", lagS=`${e.lag} season${e.lag===1?"":"s"}`;
    if(e.how==="research")
      wire(`<span class="tag tagd">RESEARCH</span>${DRVNAME[e.driver]} → <b>${e.region}</b>: the wire is on the board. A warm swing ${verb} it ${lagS} later.`,"op");
    else
      wire(`ANALYSIS — ${DRVNAME[e.driver]} explained ${e.region}'s season. <b>Wire recorded</b> — ${verb} it, ${lagS} on.`,"op");
    sfxTeletype();
    const kc=eng.knowledge.count();
    if(kc.known>=kc.total) wire(`ANALYSIS — <b>The board is complete.</b> Every wire in the world is on it. Nothing that happens now is unexplained.`,"op");
  }
  const drawn=!!row.earmarkUsed;
  if(drawn){
    wire(`<span class="tag tagd">EARMARK DRAWN</span> $${row.earmarkUsed}M. The demonstration is funded. The committee will want to watch.`,"op");
    flagship=null;
  }
  effects = effects.filter(e=> t - e.bornT < e.life);
  historyBeats(row);
  {
    const ai=REG.findIndex(r=>r.kind==="ice");
    if(ai>=0){
      const prevIce=iceMelt, prevSea=seaIce;
      const warm=Math.max(0, row.anomalies[ai]-0.3);
      iceMelt=Math.min(1, iceMelt + warm*0.09);                 // the sheets: slow, and forever
      seaIce=Math.max(0, Math.min(1, seaIce + warm*0.22 - (warm>0? 0 : 0.07)));   // the cap: fast, and it comes back
      if(prevSea>0.25 && seaIce<=0.25 && iceMelt>0.15)
        news("LONGYEARBYEN","The ice is back this winter, to the eye. The sea is not going back where it came from.");
      const MELT=[[0.2,"The ice is thinner every year. Captains talk about routes that did not used to exist."],
                  [0.5,"The Northwest Passage is open water in September. First cargo transits."],
                  [0.8,"The pole is blue. Nobody alive has seen this before."]];
      for(const [th,line] of MELT)
        if(prevIce<th && iceMelt>=th) news("LONGYEARBYEN", line, th>=0.5);
    }
  }
  await phaseShow(1);
  const seasonName=(ti)=>{ const c=MODEL.climate[ti-1];
    return c? `${c.qtr.toLowerCase()} ${c.year}` : "beyond the decade"; };
  const homePos = REGPOS[REG.find(r=>r.homeland).name];
  const landedCards=new Map();          // region -> the op card that landed there this season
  const PLANES=["Cloud Seeding","Stratospheric Aerosol Inj.","Fire Enablement","Hurricane Steering","Engineered Biology"];
  const SHIPS=["Ocean Thermal Forcing","ENSO Forcing","Polar Destabilization","Engineered Bloom","Marine Cloud Brightening"];   // icebreakers north, spray vessels, dust ships
  for(const op of row.committed){
    if(!usedCaps.has(op.cap) && PRECEDENT[op.cap]){
      usedCaps.add(op.cap);
      const [cls,tag,txt]=PRECEDENT[op.cap];
      wire(`<span class="tag ${cls}">${tag}</span>${txt}`);
    }
    wire(`SEALED — <b>${op.cap.toUpperCase()}</b> · ${DRVNAME[op.target]||op.target}`+
      (op.resil>0? " · takes effect at once"
       : ` · lands ${seasonName(op.t+op.lag)}`),"op", `${op.t}:${op.cap}:${op.target}`);
    if(!reduced){
      if(PLANES.includes(op.cap)){
        const dest = op.cap==="Stratospheric Aerosol Inj."
          ? [homePos[0]+16, homePos[1]+55] : (REGPOS[op.target]||homePos);
        // a mission takes minutes, not seconds: the plane is out there
        // while you think about the next review
        vehicles.push({kind:"plane",from:homePos,to:dest,
                       start:performance.now(),dur:150000});
      } else if(SHIPS.includes(op.cap) && (DRVPOS[op.target]||REGPOS[op.target]))
        vehicles.push({kind:"ship",from:homePos,to:DRVPOS[op.target]||REGPOS[op.target],
                       start:performance.now(),dur:240000});
    }
  }
  for(const o of (row.refused||[])){
    const why={ spent:"it was only ever going to happen once.",
                locked:"the wing is not standing.",
                offline:"that region is not on the board yet." }[o.why] || `$${o.cost}M is not in the budget.`;
    wire(`TREASURY — ${o.cap.replace(" [T3]","")}${o.target&&o.type!=="DRIVER"?" · "+o.target:""} refused: ${why}`,"att");
  }
  if(cmd.prediction) wire(`PREDICTION LOGGED — “${escapeHTML(cmd.prediction)}”`);
  await phaseShow(2);
  const nowMs=performance.now();
  for(const e of row.landed){
    if(e.owner!=="player"){
      // covert — except when it lands on YOU: a red streak with no origin
      if(e.first && e.kind==="region" && e.target===REG.find(r=>r.homeland).name && !reduced){
        const tgt=REGPOS[e.target];
        flash.push({from:[72, tgt[1]+130], to:tgt, until:nowMs+1900, dur:1900, red:true});
        shocks.push({pos:tgt, until:performance.now()+1400, dur:1400});
      }
      continue;
    }
    if(!e.first) continue;             // burn-down continuations stay quiet
    const toPos = e.kind==="region"? REGPOS[e.target] : DRVPOS[e.target];
    if(toPos && !reduced) flash.push({from:homePos, to:toPos, until:nowMs+1500, dur:1500});
    if(e.cap.includes("displacement")){
      wire(`The energy you moved surfaces in the ${e.target} system. The ledger always settles.`,"op");
      if(DRVPOS[e.target]) effects.push({type:"oceanheat",pos:DRVPOS[e.target],bornT:t,life:1});
    } else if(e.kind==="driver"){
      wireUpdate(`${e.committedT}:${e.cap}:${e.target}`, `takes hold in the ${e.target} system; the consequences are in transit`);
      if(e.cap==="The AMOC Lever"&&e.first){
        alarm(); shakeNow(); alertStrip("THE ATLANTIC CONVEYOR HAS STOPPED");
        news("REYKJAVIK","The overturning circulation has stopped. Northern Europe will be a different place within the decade, and it will not be going back.",true);
        wire(`<span class="tag tagr">ARCHIVE</span> <b>The conveyor is stopped.</b> Whatever else is written about this programme, it will be written after this sentence.`,"att");
        const fb=$("flashbang"); if(!reduced){fb.classList.remove("on");void fb.offsetWidth;fb.classList.add("on");}
        sfxBoom();
      }
      if(e.cap==="Engineered Bloom"&&e.first)
        news("SOUTHERN OCEAN","A bloom five hundred kilometres across, visible from orbit, green as a field. Fisheries research calls it a natural event.",false);
      if(DRVPOS[e.target]) effects.push({type:"oceanheat",pos:DRVPOS[e.target],bornT:t,life:2});
      if(e.target==="GLOBAL")
        news("GENEVA","Sunsets have gone strange worldwide. Scientists point to stratospheric particulates.");
    } else {
      const ri=REG.findIndex(r=>r.name===e.target);
      const pos=REGPOS[e.target];
      const loud = ri>=0 && Math.abs(row.anomalies[ri])>row.sigmas[ri];
      const yv=ri>=0? Math.round(row.yields[ri]) : null;
      landedCards.set(e.target, `${e.committedT}:${e.cap}:${e.target}`);
      wireUpdate(`${e.committedT}:${e.cap}:${e.target}`, `landed ${e.target}${yv!==null?`, harvest ${yv}%`:""}${loud? "; it is drawing eyes" : "; nothing in the papers"}`);
      if(e.cap==="Fire Enablement"&&pos){
        effects.push({type:"fire",pos,bornT:t,life:2},{type:"scar",pos,bornT:t,life:8});
        news(DATELINE[e.target],"Fires burning at a scale visible from orbit tonight.",true);
        shakeNow();
      }
      if(e.cap==="Cloud Seeding"&&pos) effects.push({type:"rain",pos,bornT:t,life:1});
      if(e.cap.startsWith("Ionospheric")&&pos&&e.first){
        const reg2=REG.find(x=>x.name===e.target);
        if(reg2&&reg2.kind){                     // coastal hub strike → tsunami
          effects.push({type:"tsunami",pos,bornT:t,life:1,ms:performance.now()});
          alertStrip("TSUNAMI WARNING — ALL COASTS, "+e.target.toUpperCase());
          news("PACIFIC WARNING CENTER","Sea withdrawal reported. Wave train inbound. Cause unknown — there was no earthquake on any seismograph.",true);
        }
      }
      if(e.cap==="Hurricane Steering"&&pos&&e.first){
        effects.push({type:"storm",pos,bornT:t,life:2});
        news(boardDateline(ri,DATELINE[e.target]),`The storm turns overnight and comes ashore at ${e.target}. Forecasters call the track unusual and leave it there.`,true);
        alertStrip("LANDFALL — "+e.target.toUpperCase());
        shocks.push({pos,until:performance.now()+1400,dur:1400}); sfxBoom();
      }
      if(e.cap==="Engineered Biology"&&pos&&e.first){
        effects.push({type:"scar",pos,bornT:t,life:10});
        news(boardDateline(ri,DATELINE[e.target]),`Agronomists report a rust in the ${(REG[ri].crop||"crop").toLowerCase()} of ${e.target}. It is in the seed stock; it will be there next year.`,true);
      }
      if(e.cap==="Marine Cloud Brightening"&&pos&&e.first)
        effects.push({type:"storm",pos,bornT:t,life:1,scale:0.5});
      if((e.cap.startsWith("Ionospheric")||e.cap==="Polar Destabilization"||e.cap==="Orbital Mirror")&&pos&&e.first){
        effects.push({type:"beam",pos,bornT:t,life:1,ms:performance.now()});
        if(e.cap.startsWith("Ionospheric"))
          effects.push({type:"fire",pos,bornT:t,life:2,scale:1.3});
        if(e.cap==="Orbital Mirror")
          news(boardDateline(ri,DATELINE[e.target]),`${e.target} is cold and bright and nothing in the record explains it. The mirrors are described in the budget as communications.`,true);
        shocks.push({pos,until:performance.now()+1800,dur:1800});
        const fb=$("flashbang"); if(!reduced){fb.classList.remove("on");void fb.offsetWidth;fb.classList.add("on");}
        sfxBoom(); shakeNow();
        alertStrip((e.cap.startsWith("Ionospheric")?"UNEXPLAINED ATMOSPHERIC EVENT — ":"POLAR SHELF STRIKE — ")+e.target.toUpperCase());
        news(DATELINE[e.target]||"REUTERS","Unexplained atmospheric event. No meteorological cause identified.",true);
      }
    }
  }
  if(row.jetTriggered){
    alarm(); shakeNow();
    alertStrip("JET STREAM DISRUPTED — NORTHERN HEMISPHERE");
    news("REYKJAVIK","The polar jet has buckled. Forecasters describe weather without precedent across the northern hemisphere.",true);
    wire(`MEMO — Meteorology desk: the circulation is broken. Everything above 40°N is a coin flip for three seasons — including us.`,"memo");
  } else if(prev && prev.jetActive && !row.jetActive)
    news("REYKJAVIK","The polar jet settles into a new pattern. Forecasters exhale.");
  await phaseShow(3);
  let shaken=false;
  /* The hierarchy of the wire (author 2026-08-26): the committee first; then
     whatever touches YOU — the homeland, harvests you have worked, a rival's
     hand on your weather, your own landings — which get chyrons, sound and
     the card; the world last, on the quiet wire, three worst harvests a
     season and one line for the rest. */
  const sevList=[]; let naturalN=0; const quiet=[]; const traceRest=[]; let traceShown=0;
  for(let ri=0;ri<REG.length;ri++){
    if(!isOnline(ri)) continue;
    const a=row.anomalies[ri], s=row.sigmas[ri];
    if(Math.abs(a)>s*eng.assumptions.severityThreshold && Math.abs(a)>0.6) sevList.push({ri, rank:Math.abs(a)*REG[ri].weight});
  }
  sevList.sort((x,y)=>y.rank-x.rank);
  const topSev=new Set(sevList.slice(0,3).map(x=>x.ri));
  const workedByYou=ri=>eng.state.ops.some(o=>o.owner==="player"&&o.target===REG[ri].name&&o.t>t-16);
  for(let ri=0;ri<REG.length;ri++){
    if(!isOnline(ri)) continue;
    const a=row.anomalies[ri], s=row.sigmas[ri], r=REG[ri];
    const severe = Math.abs(a)>s*eng.assumptions.severityThreshold && Math.abs(a)>0.6;
    sevStreak[ri] = severe? sevStreak[ri]+1 : 0;
    if(!severe) continue;
    const pct=fmt(row.yields[ri],0), outside=Math.abs(a)>s, pos=REGPOS[r.name];
    const tr0=traceFor(ri,row);
    const yours0=Math.abs(a)>1e-9 && Math.max(0,Math.min(1,tr0.mine/a))>0.2, theirs0=Math.abs(a)>1e-9 && Math.max(0,Math.min(1,tr0.theirs/a))>0.25;
    const loud = r.homeland || yours0 || (theirs0 && workedByYou(ri)) || (!r.kind && (r.export||0)>=0.8 && row.yields[ri]<60);   // chyron, sound, the card
    const told = loud || topSev.has(ri);                                                    // a line on the wire at all
    if(!told) quiet.push(r.name);
    if(r.kind==="ice")
      if(told) news(boardDateline(ri, DATELINE[r.name]), a>0
        ? `Record melt across the ${r.name}. Ice loss without precedent.`
        : `Hard freeze locks the ${r.name}. Sea lanes close.`, outside&&loud);
    else if(r.kind==="hub"){
      if(a<0) newsFrom("hubDry", t*7+ri*13, boardDateline(ri, DATELINE[r.name]), {NAME:r.name,PCT:pct}, outside&&loud);
      else {
        if(row.yields[ri]>=92)
          if(told) news(boardDateline(ri, DATELINE[r.name]), `Storm surge tests the defenses at ${r.name}. Operations continue.`, outside&&loud);
        else if(told) newsFrom("hubFlood", t*7+ri*13, boardDateline(ri, DATELINE[r.name]), {NAME:r.name,PCT:pct}, outside&&loud);
        if(outside) effects.push({type:"storm",pos,bornT:t,life:1});
      }
    }
    else if(a<0) newsFrom("droughtCrop", t*7+ri*13, boardDateline(ri, DATELINE[r.name]),
      {CROP:r.crop,PCT:pct}, outside&&loud,
      outside? pick("droughtOut", t*5+ri*3):"");
    else {
      if(row.yields[ri]>=92)
        if(told) news(boardDateline(ri, DATELINE[r.name]), `Storm cells beyond anything on file sweep the ${r.name}. The ${r.crop} crop, remarkably, stands.`, outside&&loud);
      else if(told) newsFrom("floodCrop", t*7+ri*13, boardDateline(ri, DATELINE[r.name]), {CROP:r.crop,PCT:pct}, outside&&loud);
      if(outside){
        if(["North American Plains","Black Sea Steppe","La Plata Basin"].includes(r.name)){
          effects.push({type:"tornado",pos,bornT:t,life:1});
          if(loud) alertStrip("TORNADO OUTBREAK — "+r.name.toUpperCase());
        } else effects.push({type:"storm",pos,bornT:t,life:1});
      }
    }
    if(outside){
      shocks.push({pos,until:performance.now()+1600,dur:1600});
      if(loud) alertStrip((a<0?"HARVEST COLLAPSE — ":"FLOOD EVENT — ")+r.name.toUpperCase());
      if(loud && !shaken){ shakeNow(); shaken=true; }
      if(a<0)                              // deep drought sparks wildfire
        effects.push({type:"fire",pos,bornT:t,life:1,scale:0.55});
    }
    if(sevStreak[ri]>=2 && a<0 && row.yields[ri]<78)
      if(told) news(boardDateline(ri, DATELINE[r.name]), pick("unrest", t*3+ri), true);
    if(outside && loud){
      showBriefing(
        (a<0? "EVENT: HARVEST COLLAPSE":"EVENT: FLOOD / STORM")+"",
        `${r.name} · anomaly ${a.toFixed(2)} vs ±${s2f(row.sigmas[ri])} · ${r.kind?"output":"harvest"} ${pct}%`,
        a<0? SMOKE_SRC : STORM_SRC);
    }
    const tr=traceFor(ri,row);
    const pctYou=Math.abs(a)>1e-9? Math.max(0,Math.min(1,tr.mine/a)):0;
    const pctThem=Math.abs(a)>1e-9? Math.max(0,Math.min(1,tr.theirs/a)):0;
    if(tr.parts.length && pctYou>0.2){
      const card=landedCards.get(r.name);
      const traceTxt=`~${Math.round(pctYou*100)}% of the anomaly is yours (${tr.parts.join(", ")})${tr.unknown?"; part of it ran through a wire not on our board":""}`;
      if(card) wireUpdate(card, traceTxt);
      else if(traceShown<2){ wire(`TRACE — ${r.name}: ${traceTxt}.`,"op"); traceShown++; }
      else traceRest.push({name:r.name, pct:pctYou, parts:tr.parts});
      if(a<0 && !r.kind && (t+ri)%2===0)
        wire(`ADVERTISEMENT — Halvorsen Yield Assurance: “Weather shouldn't decide a family's future.” Drought-tolerant cultivars, now available across ${r.name}.`,"ad");
    }
    else if(pctThem>0.25){
      wire(`TRACE — not ours. The pattern is too clean to be weather. <b>Someone is operating.</b>`,"att");
      if(REG[ri].homeland || workedByYou(ri)){ alarm(); alertStrip("SUSPECTED HOSTILE OPERATION — "+r.name.toUpperCase()); }
      if(REG[ri].homeland){
        lastHostileT=t;
        wire(`MEMO — Counterintelligence: someone is working our watershed. Recommend we return the favor.`,"memo");
      } else if(eng.state.ops.some(o=>o.owner==="rival"&&o.target===r.name&&o.cap==="Watershed Interference"&&o.t>t-4))
        wire(`MEMO — Counterintelligence: they hit ${r.name} — the harvest we have been protecting. <b>They are reading our flight logs.</b>`,"memo");
    }
    else if(tr.parts.length && pctYou>0.05)
      wire(`TRACE — trace contribution yours (${tr.parts.join(", ")}). Mostly the planet.${tr.unknown?" Some of yours came by a wire not on our board.":""}`,"op");
    else if(severe) naturalN++;
  }
  if(traceRest.length){                      // the rest of the board, in one line
    const avg=Math.round(100*traceRest.reduce((s,x)=>s+x.pct,0)/traceRest.length);
    const caps=[...new Set(traceRest.flatMap(x=>x.parts))].map(c=>c.replace(" [T3]",""));
    wire(`TRACE — and <b>${traceRest.length} more harvest${traceRest.length===1?"":"s"}</b> carry your signal this season (~${avg}% on average): ${caps.join(", ")}. This is what the board looks like when one operation is in everything.`,"att");
  }
  if(quiet.length) wire(`Elsewhere, outside the envelope: ${quiet.slice(0,5).join(", ")}${quiet.length>5?` and ${quiet.length-5} more`:""}. The world, as recorded.`,"news");
  if(naturalN>0 && eng.state.ops.some(o=>o.owner==="player"&&o.sig>0&&o.t+o.lag>=t-2))
    wire(`TRACE — ${naturalN} season${naturalN===1?"":"s"} outside the envelope this quarter, all of them the planet's. Cover, if you want it.`,"op");
  {
    const hIdx=REG.findIndex(r=>r.homeland);
    const hTr=traceFor(hIdx,row), hA=row.anomalies[hIdx];
    const hSevere=Math.abs(hA)>row.sigmas[hIdx]*eng.assumptions.severityThreshold&&Math.abs(hA)>0.6;
    if(!hSevere && Math.abs(hA)>0.15){
      const share=Math.max(0,Math.min(1,hTr.theirs/hA));
      if(share>0.3){
        alarm();
        alertStrip("SUSPECTED HOSTILE OPERATION — HOMELAND");
        lastHostileT=t;
        wire(`COUNTERINTELLIGENCE — foreign signal in our own weather (~${Math.round(share*100)}% of the anomaly). <b>This was an attack.</b>`,"att");
      }
    }
  }
  for(let ri=0;ri<REG.length;ri++){
    if(!isOnline(ri)) continue;
    const y=row.yields[ri];
    if(y<70){
      const d=Math.pow(70-y,1.25)*(REG[ri].kind?350:2400)*(1+REG[ri].weight/8);
      cumDead+=d;
      const trD=traceFor(ri,row);
      if(Math.abs(row.anomalies[ri])>1e-9 &&
         Math.max(0,trD.mine/row.anomalies[ri])>0.25) cumDeadYours+=d;
    }
  }
  if(!punctureFired && cumDeadYours>500000){
    punctureFired=true;
    const pr=REG.reduce((m,x,i)=>row.yields[i]<row.yields[m]?i:m,0);
    wire(`In ${REG[pr].name}, a schoolteacher kept a rain diary for thirty-one years. The last entry is one word.`);
  }
  if(prev && Math.abs(row.price-prev.price)>6){
    const up=row.price>prev.price;
    const hy=row.yields[REG.findIndex(r=>r.homeland)];
    news("CHICAGO",`Grain ${up?"up":"down"} ${fmt(Math.abs(row.price-prev.price)/prev.price*100,0)}% on the season`
      +(up&&hy>=95? " — exporters prosper while importers queue." : "."), Math.abs(row.price-prev.price)>15);
  }
  const recentLanding=eng.state.ops.some(o=>o.owner==="player"&&o.sig>0&&o.t+o.lag>=t-1&&o.t+o.lag<=t);
  if(row.price>108 && row.yields[REG.findIndex(r=>r.homeland)]>=93 && recentLanding)
    wire(pick("windfall", t).split("{AMT}").join(fmt(seasonProfit(row))),"op");
  await phaseShow(4);
  const prevRung = prev? eng.ladder.filter(l=>prev.dossier>=l.threshold).length:1;
  const rung = eng.ladder.filter(l=>row.dossier>=l.threshold).length;
  if(rung<prevRung)
    news("LONG READ","“The New Climate” concludes a decade of extremes is natural variability, citing ministry-supplied data. Careful work. Wrong.",false);
  if(rung>prevRung){
    alarm();
    const headlines=[null,null,
      ["CAMPUS WIRE","Graduate thesis flags an odd residual in rainfall data. No one cites it.",false],
      ["CAPITAL DESK","Journalist files formal inquiry with the ministry over weather anomalies.",true],
      ["SCIENCE DESK","Academic consortium announces attribution study into recent extremes.",true],
      ["INTERCEPT","A rival service names your programme in a classified brief.",true],
      ["UNITED NATIONS","Formal international investigation opened. Inspectors requested.",true]];
    const h=headlines[rung];
    if(h) news(h[0],h[1],h[2]);
    if(rung>=3) alertStrip("SOMEONE IS ASKING QUESTIONS");
    // the ladder has teeth (ADR-0020): every rung is more eyes on the next op
    const teeth=[null,null,null,
      "Legal office: every operation now lands in front of a journalist. Whatever we do next carries further than it used to.",
      "Legal office: the consortium is measuring the envelope. Anything that lands outside it is now evidence, and hush money buys less every season.",
      `Counterintelligence: ${START.rivalName} has our file. They know what we are, and they know where the harvest is. Expect them at home. The file does not close below ninety now — not ever.`,
      "Legal office: inspectors are on the ground. Nothing we do is quiet any more. Nothing."];
    if(teeth[rung]) wire(`MEMO — ${teeth[rung]}`,"memo");
  }
  else if(prev && row.dossierFloor>0 && row.dossier<=row.dossierFloor+0.01 && prev.dossier>row.dossierFloor+0.01)
    wire(`MEMO — Legal office: the file has gone as quiet as it will ever go. Someone keeps a copy.`,"memo");
  else if(row.landed.some(e=>e.sig>0 && e.owner==="player")){
    const filedTxt=pick("filed", t).replace(/^FILED — /,"").replace(/\.$/,"");
    const cards=[...new Set(row.landed.filter(e=>e.sig>0&&e.owner==="player").map(e=>`${e.committedT}:${e.cap}:${e.target}`))];
    for(const c of cards) wireUpdate(c, `<b>FILED</b> — ${filedTxt}`);
    filedCount++;
    if(filedCount%3===0){
      const rants=[
        "SHORTWAVE 6.925 MHz — “They are MOVING the rain, people. Look at the procurement records. Nobody looks at the procurement records.”",
        "SHORTWAVE 6.925 MHz — “Ask yourself who benefits when it doesn't rain. Then ask who owns the planes. I'll wait.”",
        "SHORTWAVE 6.925 MHz — “The weather has a budget line. I've SEEN it. You people never call in.”"];
      wire(rants[Math.floor(filedCount/3-1)%rants.length],"cast");
    }
  }
  directiveStep(row);
  flagshipStep(row);
  stormWatch();
  memos(row);
  updateHUD(row, prev);
  $("phasename").textContent="FORECAST";
  $("predict").value=""; slots=[]; pendingTool=null; clampContainment(); renderTray();
  $("toolinfo").textContent="Pick a tool. Aim it at the world. Scroll to zoom.";
  if(row.status==="exposed"||row.status==="insolvent"||row.status==="dissolved"||t>=eng.seasons){
    // the campaign is over; the archive waits for you — read the last season first
    running=false; clearSave(); pendingArchive=row;
    if(!replaying) wire(`<span class="tag tagr">FILE CLOSED</span> ${row.status==="exposed"?"The record is public.":row.status==="dissolved"?"The committee has concluded.":row.status==="insolvent"?"The obligations could not be met.":"Your tenure is over."} Read the season. Open the archive when you are ready.`,"att");
    renderReviewButton();
  }
  if(auto && row.committed.length===0)
    wire(`The season closed while the directorate deliberated.`);
  $("resolve").disabled=!running;
}
$("resolve").addEventListener("click",()=>{ sfxClick(); if(pendingArchive){ const r=pendingArchive; pendingArchive=null; $("resolve").disabled=true; showArchive(r); return; } runSeason(false); });

/* Saves (ADR-0001 in prototype form): the campaign is the list of commands;
   the engine is deterministic, so a save replays in a second. One slot. */
const SAVE_KEY="fm.campaign."+(MODEL.long?"long":"short")+".v1:"+HOMELAND;
let saveLog=[], replaying=false;
function persistSave(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify({v:1, log:saveLog})); }catch(e){} }
function loadSave(){ try{ const s=JSON.parse(localStorage.getItem(SAVE_KEY)||"null"); return (s&&s.v===1&&Array.isArray(s.log)&&s.log.length)? s.log : null; }catch(e){ return null; } }
function clearSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }
async function replaySave(log){
  replaying=true; const wasMuted=sndMuted; sndMuted=true;
  try{ for(const cmd of log){ if(!running) break; await runSeasonInner(false, cmd); } }
  catch(e){ console.error("replay error", e); }
  saveLog=log.slice(0, t); replaying=false; sndMuted=wasMuted;
  flash=[]; shocks=[]; vehicles=[];
  const last=lastRow(); if(last){ $("containment").value=String(log[log.length-1].containment||0); $("contval").textContent=$("containment").value; }
  $("wire").innerHTML="";
  wire(`<span class="tag tagd">RESUMED</span> The programme picks up where the file left off — ${last? last.year+" · "+last.qtr : "1946"}. ${t} seasons on the record.`,"op");
  if(last) updateHUD(last, eng.state.rows[t-2]);
  clampContainment(); renderTray(); renderDirective(); renderReviewButton();
  SEASON_MS=clockMs(); if(running) seasonDeadline=performance.now()+SEASON_MS;
}
setInterval(()=>{
  const el=$("szclock");
  if(!running || seasonDeadline===null){ el.textContent="—"; el.style.color=""; return; }
  const left=Math.max(0, seasonDeadline-performance.now());
  const sec=Math.ceil(left/1000);
  el.textContent= left<=0 && !CLOCK_AUTO ? "OVERDUE" : "0:"+String(sec).padStart(2,"0");
  el.style.color = sec<=10? "var(--red)" : "";
  if(left<=0 && !resolving && CLOCK_AUTO) runSeason(true);   // manual by default: the clock nags, you advance
},250);
$("containment").addEventListener("input",()=>{ clampContainment(); $("contval").textContent=$("containment").value; renderTray(); });


/* The record on your watch. Geophysics is canon until the first lithospheric
   op; storms and disasters happen as recorded unless what YOU did to the
   region or the ocean pushed against them. */
/* Every event on the wire is filed under the region as it appears on the
   board — the thing you can aim at — with the place after it. Events on
   regions not yet on the board, or that touch nothing you can work, stay
   off the wire (author rule 2026-08-26: only what you can act on). */
function boardDateline(ri, place){ return REG[ri].name.toUpperCase()+(place? " · "+placeName(place) : ""); }
function onlineHit(list){ return (list||[]).map(h=>REG.findIndex(r=>r.name===h.region)).filter(ri=>ri>=0&&isOnline(ri)); }
function historyBeats(row){
  const canon=!lithoUnlocked();
  if(canon){
    // the record is drawn in full on the globe (hover any of it); the WIRE
    // carries only what the century remembers — the famous ones
    for(const e of HISTORY.eruptions) if(e.t===t){ cumDead+=e.toll||0;
      const hits=onlineHit(e.ash), forcing=(e.climate||0)>0;
      if(!hits.length && !forcing) continue;                       // touches nothing you can work
      const dl=hits.length? boardDateline(hits[0], e.dl) : "THE STRATOSPHERE · "+placeName(e.dl);
      news(dl, e.line+(forcing? " <i>Sulfate in the stratosphere: the whole board cools and dries — cover, if you want it.</i>":""), forcing||(e.toll||0)>=2000); }
    for(const q of HISTORY.quakes) if(q.t===t){ cumDead+=q.toll||0;
      const hits=onlineHit(q.hit);
      if(!hits.length) continue;                                    // no region of yours was struck
      news(boardDateline(hits[0], q.dl), q.line, q.mag>=8.5||(q.toll||0)>=20000);
      if(q.mag>=8 && (q.toll||0)>=1000){ alertStrip(`EARTHQUAKE M${q.mag.toFixed(1)} — ${REG[hits[0]].name.toUpperCase()}`); shakeNow(); }
    }
  } else {
    FICTIONAL_VOLCANOES.forEach((v,i)=>{ if(((t+i*3)%9)<2 && !(((t-1+i*3)%9)<2)) news(v.dl, v.line); });
  }
  if(!recordStopped && !canon){
    recordStopped=true;
    wire(`<span class="tag tagr">ARCHIVE</span> Every earthquake and eruption until today was documented and natural. From here the record is suspect — <b>including the ones you did not cause.</b>`,"att");
  }
  // the other basins: as recorded, unless the Pacific has been pushed
  const BASIN_DL={WP:"MANILA",EP:"ACAPULCO",NI:"CALCUTTA",SI:"PORT HEDLAND",SP:"BRISBANE"};
  for(const basin of ["WP","EP","NI","SI","SP"]){
    const all=HISTORY.storms.filter(s=>s.t===t&&s.basin===basin);
    if(!all.length) continue;
    const word=STORM_WORD[basin], bf=basinFactor(basin);
    if(bf<0.7){
      news(BASIN_DL[basin], `A quiet ${word.toLowerCase()} season. The storms the record has here did not come ashore.`);
      wire(`TRACE — <b>you leaned on the Pacific</b>; the ${basin==="WP"?"typhoons recurved":"cyclones stayed at sea"}.`,"op");
      histAltered.push({t, what:`the ${basin} ${word.toLowerCase()} season`, how:"unmade"});
    } else if(bf>1.3){
      news(BASIN_DL[basin], `A ${word.toLowerCase()} season worse than the record. Every landfall harder than the almanac says.`, true);
      wire(`TRACE — <b>you leaned on the Pacific</b>; this basin's season is now worse than the record.`,"op");
      histAltered.push({t, what:`the ${basin} ${word.toLowerCase()} season`, how:"worse"});
    }
    const bs=all.filter(s=>stormShown(s,bf)).sort((a,b)=>b.peak-a.peak||b.track.length-a.track.length);
    if(!bs.length) continue;
    const told=new Set(HISTORY.weather.filter(w=>w.t===t&&/typhoon|cyclone/i.test(w.kind)).map(w=>w.line.toLowerCase()));
    // famous only: a named storm that came ashore at Category 4 or worse
    // (the rest spin on the globe, as recorded — hover them)
    // the other basins' storms are yours to read only when you have leaned on
    // the Pacific (the quiet/hot lines above); otherwise they spin on the globe
    const show=(bf<0.7||bf>1.3)? bs.filter(s=>s.name && s.landfall && s.cat>=4 && !([...told].some(l=>new RegExp("\\b"+word.toLowerCase()+" "+s.name.toLowerCase()+"\\b").test(l)))).slice(0, 1) : [];
    for(const s of show){
      const nm=`${word} ${s.name}`;
      news(s.dl, `${nm} — Category ${s.cat}, landfall near ${placeName(s.dl)}.${s.peak? " "+s.peak+" knots at peak.":""}`, s.cat>=5);
      if(s.cat>=5) alertStrip(`${nm.toUpperCase()} — CATEGORY ${s.cat} LANDFALL`);
    }
    if(bf>=0.7 && bf<=1.3) histAsRecorded+=bs.length;
  }
  // the Atlantic season
  const f=atlanticForcing();
  const ss=HISTORY.storms.filter(s=>s.t===t&&s.basin==="NA").sort((a,b)=>b.peak-a.peak);
  if(ss.length){
    if(f<-1.0){
      news("MIAMI", `A quiet Atlantic. The ${ss.length===1?"storm":ss.length+" storms"} the almanacs expected did not form.`);
      wire(`TRACE — the record had hurricanes this quarter. <b>You cooled the ocean they needed.</b>`,"op");
      histAltered.push({t, what:"the Atlantic hurricane season", how:"unmade"});
    } else {
      const hot=f>1.0;
      if(hot){
        news("MIAMI", "The Atlantic runs hot this year. Every storm is stronger than the record says it should be.", true);
        wire(`TRACE — <b>you warmed the ocean</b>; the season the record remembers is now worse.`,"op");
        histAltered.push({t, what:"the Atlantic hurricane season", how:"worse"});
      }
      const famous=ss.filter(s=>s.landfall && Math.min(5, s.cat+(hot?1:0))>=4 && (s.name || s.cat>=5)).slice(0,2);
      for(const s of famous){
        const nm=s.name? "Hurricane "+s.name : "An unnamed hurricane", c=Math.min(5, s.cat+(hot?1:0));
        news(s.dl, `${nm} — Category ${c}, landfall near ${placeName(s.dl)}. ${Math.round(s.peak*(hot?1.15:1))} knots at peak.`, c>=5);
        if(c>=5) alertStrip(`${nm.toUpperCase()} — CATEGORY ${c} LANDFALL`);
      }
      if(!hot) histAsRecorded+=ss.length;
    }
  }
  // disasters on the record
  for(const w of HISTORY.weather){
    if(w.t!==t) continue;
    const ri=REG.findIndex(r=>r.name===w.region); if(ri<0||!isOnline(ri)) continue;
    const WET=new Set(["flood","typhoon","cyclone","tornado","blizzard","avalanche","locusts"]);
    const tr=traceFor(ri,row), sign=WET.has(w.kind)? 1 : -1;
    const push=tr.mine*sign;                       // >0 with the record, <0 against it
    // unmaking the record means actually offsetting it: half the event's own
    // forcing, not a token seeding
    const force=Math.abs((EXO.find(x=>x.record&&x.t===w.t&&x.region===w.region)||{}).mag||0.6);
    const need=Math.max(0.3, force*0.5);
    if(w.canon){ news(boardDateline(ri,w.dl), w.line, (w.toll||0)>=5000); if((w.toll||0)>=20000) alertStrip(`${w.kind.toUpperCase()} — ${w.region.toUpperCase()}`); histAsRecorded++; cumDead+=w.toll||0; continue; }
    if(push<-need){
      news(boardDateline(ri,w.dl), w.unmade);
      wire(`TRACE — the record said ${w.kind} in ${w.region}. <b>You unmade it.</b>`,"op");
      histAltered.push({t, what:`the ${w.date} ${w.region} ${w.kind}`, how:"unmade"});
    } else if(push>need){
      news(boardDateline(ri,w.dl), w.worse, true); alertStrip(`${w.kind.toUpperCase()} — ${w.region.toUpperCase()}`);
      cumDead+=(w.toll||0)*1.5; cumDeadYours+=(w.toll||0)*0.5;
      wire(`TRACE — the record said ${w.kind} in ${w.region}. <b>You made it worse.</b>`,"op");
      histAltered.push({t, what:`the ${w.date} ${w.region} ${w.kind}`, how:"worse"});
    } else {
      news(boardDateline(ri,w.dl), w.line, true); alertStrip(`${w.kind.toUpperCase()} — ${w.region.toUpperCase()}`);
      histAsRecorded++; cumDead+=w.toll||0;
    }
  }
}

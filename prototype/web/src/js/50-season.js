const SEASON_MS=45000;          // time does not stop; RUN SEASON jumps ahead
let seasonDeadline=null, resolving=false;
async function runSeason(auto){
  if(!running || resolving) return;
  resolving=true; seasonDeadline=null;
  $("resolve").disabled=true;
  const prev=lastRow();
  const cmd={ ops:slots.map(s=>({cap:s.cap,target:s.target})),
              containment:+$("containment").value,
              grant:pendingGrant, clawback:pendingClaw,
              prediction:$("predict").value.trim() };
  // the flagship earmark is drawn the season a flagship op is sealed
  const drawn = flagship && slots.some(s=>FLAGSHIP_CAPS.includes(s.cap));
  if(drawn){ cmd.grant+=flagship.amount; }
  pendingGrant=0; pendingClaw=0;
  t++;
  const row = eng.resolve(t, cmd);
  for(const o of (row.refused||[]))
    wire(`TREASURY — ${o.cap}${o.target&&o.type!=="DRIVER"?" · "+o.target:""} refused: $${o.cost}M is not in the budget.`,"att");
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
  if(drawn){
    wire(`<span class="tag tagd">EARMARK DRAWN</span> $${flagship.amount}M. The demonstration is funded. The committee will want to watch.`,"op");
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
  const PLANES=["Cloud Seeding","Stratospheric Aerosol Inj.","Fire Enablement"];
  const SHIPS=["Ocean Thermal Forcing","ENSO Forcing","Polar Destabilization"];   // icebreakers north
  for(const op of row.committed){
    if(!usedCaps.has(op.cap) && PRECEDENT[op.cap]){
      usedCaps.add(op.cap);
      const [cls,tag,txt]=PRECEDENT[op.cap];
      wire(`<span class="tag ${cls}">${tag}</span>${txt}`);
    }
    wire(`SEALED — <b>${op.cap.toUpperCase()}</b> · ${op.target}`+
      (op.resil>0? " · takes effect at once"
       : ` · lands ${seasonName(op.t+op.lag)}`),"op");
    if(!reduced){
      if(PLANES.includes(op.cap)){
        const dest = op.cap==="Stratospheric Aerosol Inj."
          ? [homePos[0]+16, homePos[1]+55] : (REGPOS[op.target]||homePos);
        vehicles.push({kind:"plane",from:homePos,to:dest,
                       start:performance.now(),dur:2600});
      } else if(SHIPS.includes(op.cap) && (DRVPOS[op.target]||REGPOS[op.target]))
        vehicles.push({kind:"ship",from:homePos,to:DRVPOS[op.target]||REGPOS[op.target],
                       start:performance.now(),dur:3800});
    }
  }
  if(cmd.prediction) wire(`PREDICTION LOGGED — “${cmd.prediction}”`);
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
      wire(`Your <b>${e.cap}</b> work takes hold in the ${e.target} system. The consequences are now in transit.`,"op");
      if(DRVPOS[e.target]) effects.push({type:"oceanheat",pos:DRVPOS[e.target],bornT:t,life:2});
      if(e.target==="GLOBAL")
        news("GENEVA","Sunsets have gone strange worldwide. Scientists point to stratospheric particulates.");
    } else {
      const ri=REG.findIndex(r=>r.name===e.target);
      const pos=REGPOS[e.target];
      const loud = ri>=0 && Math.abs(row.anomalies[ri])>row.sigmas[ri];
      wire(`Your <b>${e.cap}</b> work reaches ${e.target}. ${loud? "It is drawing eyes." : "Nothing in the papers."}`,"op");
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
      if((e.cap.startsWith("Ionospheric")||e.cap==="Polar Destabilization")&&pos&&e.first){
        effects.push({type:"beam",pos,bornT:t,life:1,ms:performance.now()});
        if(e.cap.startsWith("Ionospheric"))
          effects.push({type:"fire",pos,bornT:t,life:2,scale:1.3});
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
  for(let ri=0;ri<REG.length;ri++){
    const a=row.anomalies[ri], s=row.sigmas[ri], r=REG[ri];
    const severe = Math.abs(a)>s*eng.assumptions.severityThreshold && Math.abs(a)>0.6;
    sevStreak[ri] = severe? sevStreak[ri]+1 : 0;
    if(!severe) continue;
    const pct=fmt(row.yields[ri],0), outside=Math.abs(a)>s, pos=REGPOS[r.name];
    if(r.kind==="ice")
      news(DATELINE[r.name], a>0
        ? `Record melt across the ${r.name}. Ice loss without precedent.`
        : `Hard freeze locks the ${r.name}. Sea lanes close.`, outside);
    else if(r.kind==="hub"){
      if(a<0) newsFrom("hubDry", t*7+ri*13, DATELINE[r.name], {NAME:r.name,PCT:pct}, outside);
      else {
        if(row.yields[ri]>=92)
          news(DATELINE[r.name], `Storm surge tests the defenses at ${r.name}. Operations continue.`, outside);
        else newsFrom("hubFlood", t*7+ri*13, DATELINE[r.name], {NAME:r.name,PCT:pct}, outside);
        if(outside) effects.push({type:"storm",pos,bornT:t,life:1});
      }
    }
    else if(a<0) newsFrom("droughtCrop", t*7+ri*13, DATELINE[r.name],
      {CROP:r.crop,PCT:pct}, outside,
      outside? pick("droughtOut", t*5+ri*3):"");
    else {
      if(row.yields[ri]>=92)
        news(DATELINE[r.name], `Storm cells beyond anything on file sweep the ${r.name}. The ${r.crop} crop, remarkably, stands.`, outside);
      else newsFrom("floodCrop", t*7+ri*13, DATELINE[r.name], {CROP:r.crop,PCT:pct}, outside);
      if(outside){
        if(["North American Plains","Black Sea Steppe","La Plata Basin"].includes(r.name)){
          effects.push({type:"tornado",pos,bornT:t,life:1});
          alertStrip("TORNADO OUTBREAK — "+r.name.toUpperCase());
        } else effects.push({type:"storm",pos,bornT:t,life:1});
      }
    }
    if(outside){
      shocks.push({pos,until:performance.now()+1600,dur:1600});
      alertStrip((a<0?"HARVEST COLLAPSE — ":"FLOOD EVENT — ")+r.name.toUpperCase());
      if(!shaken){ shakeNow(); shaken=true; }
      if(a<0)                              // deep drought sparks wildfire
        effects.push({type:"fire",pos,bornT:t,life:1,scale:0.55});
    }
    if(sevStreak[ri]>=2 && a<0 && row.yields[ri]<78)
      news(DATELINE[r.name], pick("unrest", t*3+ri), true);
    if(outside){
      showBriefing(
        (a<0? "EVENT: HARVEST COLLAPSE":"EVENT: FLOOD / STORM")+"",
        `${r.name} · anomaly ${a.toFixed(2)} vs ±${s2f(row.sigmas[ri])} · ${r.kind?"output":"harvest"} ${pct}%`,
        a<0? SMOKE_SRC : STORM_SRC);
    }
    const tr=traceFor(ri,row);
    const pctYou=Math.abs(a)>1e-9? Math.max(0,Math.min(1,tr.mine/a)):0;
    const pctThem=Math.abs(a)>1e-9? Math.max(0,Math.min(1,tr.theirs/a)):0;
    if(tr.parts.length && pctYou>0.2){
      wire(`TRACE — ~${Math.round(pctYou*100)}% your signal: ${tr.parts.join(", ")}.${tr.unknown?" <b>Part of it ran through a wire not on our board.</b>":""}`,"op");
      if(a<0 && !r.kind && (t+ri)%2===0)
        wire(`ADVERTISEMENT — Halvorsen Yield Assurance: “Weather shouldn't decide a family's future.” Drought-tolerant cultivars, now available across ${r.name}.`,"ad");
    }
    else if(pctThem>0.25){
      wire(`TRACE — not ours. The pattern is too clean to be weather. <b>Someone is operating.</b>`,"att");
      alarm();
      alertStrip("SUSPECTED HOSTILE OPERATION — "+r.name.toUpperCase());
      if(REG[ri].homeland){
        lastHostileT=t;
        wire(`MEMO — Counterintelligence: someone is working our watershed. Recommend we return the favor.`,"memo");
      } else if(eng.state.ops.some(o=>o.owner==="rival"&&o.target===r.name&&o.cap==="Watershed Interference"&&o.t>t-4))
        wire(`MEMO — Counterintelligence: they hit ${r.name} — the harvest we have been protecting. <b>They are reading our flight logs.</b>`,"memo");
    }
    else if(tr.parts.length && pctYou>0.05)
      wire(`TRACE — trace contribution yours (${tr.parts.join(", ")}). Mostly the planet.${tr.unknown?" Some of yours came by a wire not on our board.":""}`,"op");
    else if(severe)
      wire(`TRACE — fully natural. Cover, if you want it.`,"op");
  }
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
    wire(pick("windfall", t).split("{AMT}").join(fmt(row.revenue-85)),"op");
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
  }
  else if(row.landed.some(e=>e.sig>0 && e.owner==="player")){
    wire(pick("filed", t),"op");
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
  memos(row);
  updateHUD(row, prev);
  $("phasename").textContent="FORECAST";
  $("predict").value=""; slots=[]; pendingTool=null; clampContainment(); renderTray();
  $("toolinfo").textContent="Pick a tool. Aim it at the world. Scroll to zoom.";
  if(row.status==="exposed"||row.status==="insolvent"||row.status==="dissolved"||t>=eng.seasons){
    running=false; setTimeout(()=>showArchive(row), reduced?0:900);
  }
  if(auto && row.committed.length===0)
    wire(`The season closed while the directorate deliberated.`);
  $("resolve").disabled=!running;
  resolving=false;
  if(running) seasonDeadline=performance.now()+SEASON_MS;
}
$("resolve").addEventListener("click",()=>{ sfxClick(); runSeason(false); });
setInterval(()=>{
  const el=$("szclock");
  if(!running || seasonDeadline===null){ el.textContent="—"; el.style.color=""; return; }
  const left=Math.max(0, seasonDeadline-performance.now());
  const sec=Math.ceil(left/1000);
  el.textContent="0:"+String(sec).padStart(2,"0");
  el.style.color = sec<=10? "var(--red)" : "";
  if(left<=0 && !resolving) runSeason(true);
},250);
$("containment").addEventListener("input",()=>{ clampContainment(); $("contval").textContent=$("containment").value; renderTray(); });


/* The record on your watch. Geophysics is canon until the first lithospheric
   op; storms and disasters happen as recorded unless what YOU did to the
   region or the ocean pushed against them. */
function historyBeats(row){
  const canon=!lithoUnlocked();
  if(canon){
    for(const e of HISTORY.eruptions) if(e.t===t) news(e.dl, e.line, (e.scale||1)>=1.2);
    for(const q of HISTORY.quakes) if(q.t===t){
      news(q.dl, q.line, q.mag>=8);
      if(q.mag>=8){ alertStrip(`EARTHQUAKE M${q.mag.toFixed(1)} — ${q.name.toUpperCase()}`); shakeNow(); }
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
    const show=bs.filter(s=>(s.landfall||s.cat>=3) && !(s.name&&[...told].some(l=>l.includes(s.name.toLowerCase())))).slice(0, basin==="WP"?3:2);
    for(const s of show){
      const nm=s.name? `${word} ${s.name}` : `An unnamed ${word.toLowerCase()}`;
      const where=s.landfall? `landfall near ${placeName(s.dl)}` : "at sea";
      news(s.dl, `${nm} — ${s.cat? "Category "+s.cat+", " : "strength unrecorded, "}${where}.${s.peak? " "+s.peak+" knots at peak.":""}`, s.cat>=4&&s.landfall);
      if(s.cat>=4 && s.landfall) alertStrip(`${nm.toUpperCase()} — CATEGORY ${s.cat} LANDFALL`);
    }
    if(bs.length>show.length) news(bs[0].dl, `${bs.length-show.length} more ${word.toLowerCase()}${bs.length-show.length>1?"s":""} in the basin this quarter, as recorded.`);
    histAsRecorded+=bs.length;
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
      for(const s of ss.slice(0,3)){
        const nm=s.name? "Hurricane "+s.name : "An unnamed hurricane", c=Math.min(5, s.cat+(hot?1:0));
        const where=s.landfall? `landfall near ${placeName(s.dl)}` : "at sea";
        news(s.dl, `${nm} — Category ${c}, ${where}. ${Math.round(s.peak*(hot?1.15:1))} knots at peak.`, c>=4);
        if(c>=4 && s.landfall) alertStrip(`${nm.toUpperCase()} — CATEGORY ${c} LANDFALL`);
      }
      if(ss.length>3) news("MIAMI", `${ss.length-3} more hurricane${ss.length>4?"s":""} this quarter. The season the record remembers.`);
      histAsRecorded+=ss.length;
    }
  }
  // disasters on the record
  for(const w of HISTORY.weather){
    if(w.t!==t) continue;
    const ri=REG.findIndex(r=>r.name===w.region); if(ri<0) continue;
    const tr=traceFor(ri,row), sign=(w.kind==="flood")? 1 : -1;
    const push=tr.mine*sign;                       // >0 with the record, <0 against it
    if(push<-0.3){
      news(w.dl, w.unmade);
      wire(`TRACE — the record said ${w.kind} in ${w.region}. <b>You unmade it.</b>`,"op");
      histAltered.push({t, what:`the ${w.date} ${w.region} ${w.kind}`, how:"unmade"});
    } else if(push>0.3){
      news(w.dl, w.worse, true); alertStrip(`${w.kind.toUpperCase()} — ${w.region.toUpperCase()}`);
      wire(`TRACE — the record said ${w.kind} in ${w.region}. <b>You made it worse.</b>`,"op");
      histAltered.push({t, what:`the ${w.date} ${w.region} ${w.kind}`, how:"worse"});
    } else {
      news(w.dl, w.line, true); alertStrip(`${w.kind.toUpperCase()} — ${w.region.toUpperCase()}`);
      histAsRecorded++;
    }
  }
}

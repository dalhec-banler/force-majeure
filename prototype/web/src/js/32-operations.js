/* The field report is a view of resolved rows, never another simulation.
   Early reviews contain four seasons: observations keep their landing date. */
let rainObservations=[], inspectionTarget=HOMELAND;
function observationKey(e){ return `${e.committedT}:${e.cap}:${e.target}`; }
function observeRain(row,e){
  const key=observationKey(e);
  if(rainObservations.some(o=>o.key===key)) return;
  rainObservations.push({key,target:e.target,season:row.t,
    date:`${row.qtr.toUpperCase()} ${row.year}`,ms:performance.now()});
  if(!inspectionTarget) focusObservation(e.target);
}
function focusObservation(target){
  const pos=REGPOS[target]||DRVPOS[target]; if(!pos) return;
  inspectionTarget=target;
  rot=-pos[1]; tilt=Math.max(-80,Math.min(80,pos[0]));
  zoom=1; relayout(); renderRegionInspector();
}
function renderOperationReport(){
  renderRegionInspector();
  const panel=$("opreport"), list=$("opresults");
  if(!t){ panel.hidden=true; return; }
  let start=t; while(start>1 && !isReviewStart(start)) start--;
  const rows=eng.state.rows.slice(start-1,t), reports=new Map();
  const entry=(key,cap,target)=>{
    if(!reports.has(key)) reports.set(key,{cap,target,cost:0,count:0});
    return reports.get(key);
  };
  for(const row of rows){
    for(const op of row.committed){
      const r=entry(`${op.t}:${op.cap}:${op.target}`,op.cap,op.target);
      r.cost+=op.cost; r.count++;
      const due=MODEL.climate[op.t+op.lag-1];
      r.detail=op.resil>0? "Protection installed" : due? `In transit · ${due.qtr.toLowerCase()} ${due.year}` : "In transit";
      if(op.resil>0){ const ri=REG.findIndex(x=>x.name===op.target);
        r.detail+=` · hardening ${Math.round(row.resil[ri])}`; }
    }
    for(const e of row.landed){
      if(e.owner!=="player" || !e.first || e.cap.includes("displacement")) continue;
      const r=entry(observationKey(e),e.cap,e.target);
      r.date=`${row.qtr} ${row.year}`;
      const ri=REG.findIndex(x=>x.name===e.target);
      r.detail=ri>=0? `${REG[ri].kind?"Output":"Harvest"} ${Math.round(row.yields[ri])}% at landing · ${e.cap==="Engineered Biology"?"biological damage "+fmt(row.biologicalDamage[ri],1)+" points":"own forcing "+(e.mag>=0?"+":"")+fmt(e.mag,2)}` : "Driver forcing established · regional effects in transit";
      if(ri<0){
        const di=DRV.indexOf(e.target), connections=eng.knowledge.edges.filter(x=>x.di===di&&eng.knowledge.isKnown(x.di,x.ri));
        r.detail=`Driver forcing ${e.mag>=0?'+':''}${fmt(e.mag,2)} · `+connections.slice(0,3).map(x=>`${x.region} ${x.coeff*e.mag<0?'dries':'wets'} in ${x.lag} seasons`).join('; ')+(connections.length>3?`; ${connections.length-3} more known links`:'');
      }
      if(e.cap==="Cloud Seeding"){
        r.detail=`Rainfall observed · ${r.detail.toLowerCase()}`;
        observeRain(row,e);
      }
    }
    for(const op of row.refused||[]){
      const r=entry(`refused:${row.t}:${op.cap}:${op.target}`,op.cap,op.target);
      r.detail="Refused · "+({invalid:"invalid target, protection at cap, or research exhausted",locked:"wing not standing",offline:"region not on the board",spent:"one-use operation already spent"}[op.why]||"insufficient funds");
      r.refused=true;
    }
    for(const e of row.revealed||[]) if(e.how==="research"){
      for(const r of reports.values()) if(r.cap==="Climate Research" && r.target===e.region)
        r.detail=`Wire recorded · ${DRVNAME[e.driver]||e.driver} ${e.coeff<0?"dries":"wets"} this region ${e.lag} season${e.lag===1?"":"s"} later`;
    }
  }
  panel.hidden=!reports.size;
  $("opcount").textContent=String(reports.size);
  list.innerHTML="";
  for(const r of reports.values()){
    const card=document.createElement("article"); card.className="opresult";
    const name=document.createElement("b"); name.textContent=r.cap.replace(" [T3]","")+(r.count>1?` ×${r.count}`:"");
    const target=document.createElement("div"); target.className="op-target"; target.textContent=DRVNAME[r.target]||r.target;
    const detail=document.createElement("p"); detail.textContent=r.detail;
    const foot=document.createElement("div"); foot.className="op-foot";
    const stamp=document.createElement("span"); stamp.textContent=[r.date,r.cost?`$${r.cost}M committed`:null].filter(Boolean).join(" · ");
    foot.appendChild(stamp);
    if(!r.refused && (REGPOS[r.target]||DRVPOS[r.target])){
      const view=document.createElement("button"); view.type="button"; view.className="wmode";
      view.textContent="LOCATE ▸"; view.setAttribute("aria-label",`Locate ${r.cap} at ${r.target}`);
      view.addEventListener("click",()=>{ focusObservation(r.target); sfxClick(); });
      foot.appendChild(view);
    }
    for(const el of [name,target,detail,foot]) card.appendChild(el);
    list.appendChild(card);
  }
}

/* The weather itself is composited into the Earth shader. Keep only a
   restrained instrument annotation here, outside the cloud footprint. */
function drawRainObservations(nowMs){
  for(const o of rainObservations){
    if(inspectionTarget!==o.target) continue;
    const p=project(...REGPOS[o.target]); if(!p.vis) continue;
    const label=`SEEDING · ${o.date}`;
    cx.save(); cx.font="9px "+MONO_FONT;
    const tw=cx.measureText(label).width;
    const x=Math.max(12,Math.min(W-tw-16,p.x+Rp*0.16));
    const y=p.y+Rp*0.13;
    cx.strokeStyle="rgba(164,201,174,.45)";cx.lineWidth=0.7;
    cx.beginPath();cx.moveTo(p.x+12,p.y+12);cx.lineTo(x-5,y-4);cx.stroke();
    cx.fillStyle="rgba(10,15,12,.78)";cx.fillRect(x-3,y-11,tw+6,16);
    cx.fillStyle="#a4c9ae";cx.fillText(label,x,y);cx.restore();
  }
}

function armRegion(target){
  if(!pendingTool || resolving || !running) return;
  const q=eng.quote(pendingTool,target), c=CAPS.find(x=>x.name===pendingTool);
  const installed=eng.state.ops.filter(o=>o.target===target).reduce((v,o)=>v+(o.resil||0),0);
  const queued=slots.filter(o=>o.target===target&&o.cap==='Adaptation Investment').length*12;
  if(!q.valid || (c.resil && installed+queued>=90)) {$("toolinfo").textContent=q.reason||'Protection already reaches the 90% cap.';return;}
  if(!isOnline(REG.findIndex(r=>r.name===target))){$("toolinfo").textContent='This region is not yet on the board.';return;}
  if(q.cost>available() && capCost(c.name)!==0){$("toolinfo").textContent='Insufficient spendable funds for this order.';return;}
  slots.push({cap:pendingTool,target}); inspectionTarget=target;
  clampContainment();renderTray();renderRegionInspector();sfxClick();
  $("toolinfo").textContent=`${pendingTool} armed on ${target}. ${q.useful?'':'No demonstrated need: this seeding will not count as useful work for the committee. '}Review the known projection before committing.`;
}
function renderRegionInspector(){
  if(DRV.includes(inspectionTarget)){
    const edges=eng.knowledge.edges.filter(e=>e.driver===inspectionTarget&&eng.knowledge.isKnown(e.di,e.ri));
    $("regionpick").value='';$("regionarm").disabled=true;
    $("regionreadout").innerHTML=`<p>${escapeHTML(DRVNAME[inspectionTarget]||inspectionTarget)} · KNOWN DOWNSTREAM LINKS</p>`+edges.map(e=>`<p>${escapeHTML(e.region)} · positive forcing ${e.coeff<0?'dries':'wets'} · ${e.lag} seasons · strength ${fmt(Math.abs(e.coeff),2)}</p>`).join('');return;
  }
  const target=REGPOS[inspectionTarget]?inspectionTarget:HOMELAND, ri=REG.findIndex(r=>r.name===target);
  const row=lastRow(), base=eng.knowledge.forecast([]), planned=eng.knowledge.forecast(slots);
  $("regionpick").value=target;
  const lines=[];
  if(row){
    const labels=[];
    if((row.biologicalDamage?.[ri]||0)>0) labels.push(`Seed-stock damage: ${fmt(row.biologicalDamage[ri],1)} output points; rain cannot cancel it`);
    if(row.landed.some(e=>e.target===target&&e.cap==='Fire Enablement')) labels.push('Active burn / smoke');
    if(row.anomalies[ri]>1.2) labels.push('Flood stress');
    if(row.resil[ri]) labels.push('Persistent protection');
    if(labels.length) lines.push(labels.join(' · '));
  }
  if(row) lines.push(`Output ${fmt(row.yields[ri],0)}% · protection ${fmt(row.resil[ri],0)}% · anomaly ${fmt(row.anomalies[ri],2)}`);
  if(base && planned) lines.push(`Next season, known forcing: ${fmt(base[ri].anomaly,2)} → ${fmt(planned[ri].anomaly,2)} with orders. Negative dries; above +1.2 floods.`);
  if(pendingTool){const q=eng.quote(pendingTool,target);lines.push(q.valid?`${pendingTool}: $${fmt(q.cost,1)}M base cost${q.resil?' · adds '+q.resil+' protection points':''}`:q.reason);}
  lines.push('Projection excludes weather noise, hidden wires and rival orders; assumes your orders are funded.');
  const edges=eng.knowledge.edges.filter(e=>e.region===target && eng.knowledge.isKnown(e.di,e.ri));
  for(const e of edges) lines.push(`${DRVNAME[e.driver]||e.driver}: ${e.coeff<0?'dries':'wets'} · ${e.lag} season delay · strength ${fmt(Math.abs(e.coeff),2)}`);
  $("regionreadout").innerHTML=lines.map(s=>`<p>${escapeHTML(s)}</p>`).join('');
  $("regionarm").disabled=!pendingTool || !running || resolving;
}

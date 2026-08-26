function spark(canvas, series, color, label){
  const c=canvas.getContext("2d"), dpr=devicePixelRatio||1;
  const w=canvas.clientWidth, h=canvas.clientHeight;
  canvas.width=w*dpr; canvas.height=h*dpr; c.setTransform(dpr,0,0,dpr,0,0);
  c.clearRect(0,0,w,h);
  if(series.length<1) return;
  const lo=Math.min(0,...series), hi=Math.max(...series), span=(hi-lo)||1;
  const X=i=>2+(w-30)*i/Math.max(1,eng.seasons-1), Y=v=>h-2-(h-8)*(v-lo)/span;
  c.strokeStyle="rgba(200,230,207,.10)";
  c.beginPath(); c.moveTo(0,Y(series[0])); c.lineTo(w,Y(series[0])); c.stroke();
  c.beginPath(); series.forEach((v,i)=>i?c.lineTo(X(i),Y(v)):c.moveTo(X(i),Y(v)));
  c.strokeStyle=color; c.lineWidth=1.5; c.stroke();
  c.lineTo(X(series.length-1),h); c.lineTo(2,h); c.closePath();
  c.fillStyle=color.replace("rgb","rgba").replace(")",",.12)"); c.fill();
  const lx=X(series.length-1), ly=Y(series[series.length-1]);
  c.fillStyle=color; c.beginPath(); c.arc(lx,ly,2.2,0,7); c.fill();
  c.font="8px monospace"; c.fillStyle="rgba(200,230,207,.8)";
  c.fillText((label||"")+" "+series[series.length-1].toFixed(0),
             Math.min(lx+4,w-28), Math.max(8,ly-2));
}

function renderInflight(){
  const items=[];
  for(const o of eng.state.ops){
    if(o.owner!=="player") continue;
    const start=o.t+o.lag, dur=o.dur||1;
    if(start>t && (o.mag!==0 || o.research))
      items.push({label:o.cap, tgt:o.target, rem:start-t, mode:"pending"});
    else if(o.mag!==0 && t>=start && t<start+dur && dur>1)
      items.push({label:o.cap, tgt:o.target, rem:start+dur-1-t, mode:"active"});
    if(o.disp){ const dr=o.t+o.disp.lag-t;
      if(dr>0) items.push({label:"LEDGER DEBT", tgt:o.disp.to, rem:dr, mode:"debt"}); }
  }
  items.sort((a,b)=>a.rem-b.rem);
  $("inflight").innerHTML = items.length? items.map(i=>
    i.mode==="active"
    ? `<div class="fl"><span><b>${i.label.toUpperCase()}</b> · ${DRVNAME[i.tgt]||i.tgt}</span>
       <span class="tmin" style="color:var(--green)">● ACTIVE${i.rem>0?" +"+i.rem:""}</span></div>`
    : `<div class="fl${i.rem===1&&i.mode==="pending"?" t1":""}${i.mode==="debt"?" debt":""}">
       <span><b>${i.label.toUpperCase()}</b> · ${i.tgt}</span>
       <span class="tmin">T−${i.rem}${i.rem===1?" ⚠":""}</span></div>`).join("")
    : '<p class="none">Nothing in transit. The world is doing this to itself.</p>';
}

function updateHUD(row, prev){
  $("clock").textContent = `${row.year} · ${row.qtr.toUpperCase()}  ·  S${row.t}/40`;
  $("hFunds").textContent = "$"+fmt(row.treasury)+"M";
  const dt = row.treasury-(prev?prev.treasury:eng.assumptions.startingTreasury);
  $("hFundsD").textContent=(dt>=0?"+":"−")+"$"+fmt(Math.abs(dt))+"M";
  $("hFundsD").className="d "+(dt>=0?"up":"down");
  $("hMandate").style.width=row.mandate+"%";
  $("hFree").textContent="$"+fmt(spendable(),0)+"M";
  $("hFree").style.color = spendable()<6? "var(--red)" : spendable()<20? "var(--amber)" : "";
  $("hPrice").textContent=fmt(row.price);
  const dp=prev? row.price-prev.price:0;
  $("hPriceD").textContent=(dp>=0?"+":"")+fmt(dp);
  $("hPriceD").className="d "+(dp>=0?"up":"down");
  $("hYield").textContent=fmt(row.yields[REG.findIndex(r=>r.homeland)],0)+"%";
  if(eng.knowledge.on){ const kc=eng.knowledge.count(); $("hWires").textContent=kc.known+"/"+kc.total;
    $("hWires").style.color = kc.known>=kc.total? "var(--green)" : ""; }
  const hd=$("hDead"), newDead=fmtDead(cumDead);
  if(hd.textContent!==newDead && cumDead>0){
    hd.classList.remove("tick"); void hd.offsetWidth; hd.classList.add("tick"); }
  hd.textContent=newDead;
  const profit=profitOf(eng.state.rows);
  $("hProfit").textContent=(profit>=0?"+$":"−$")+fmt(Math.abs(profit))+"M";
  $("hProfit").style.color=profit>=0?"var(--green)":"var(--red)";
  $("ladder").textContent=row.ladderText;
  $("ladder").className = row.dossier>=80? "hot":"";
  const rung = eng.ladder.filter(l=>row.dossier>=l.threshold).length-1;
  [...$("sigmeter").children].forEach((el,i)=>el.className = i<rung? "on":"");
  $("sigmeter").classList.toggle("hunted", rung>=4);
  $("dosnum").textContent = `dossier ${fmt(row.dossier)} / 200`+(row.dossierFloor>0? ` · floor ${fmt(row.dossierFloor)}`:"");
  spark($("tspark"), eng.state.rows.map(r=>r.treasury), "rgb(83,217,123)", "$");
  spark($("pspark"), eng.state.rows.map(r=>r.price), "rgb(200,230,207)", "");
  renderInflight();
  const b=$("banner");
  if(row.status==="obsolescence-warning"){
    b.style.display="block";
    b.textContent=`▲ NO OPERATIONS IN A YEAR — COMMITTEE ASKING WHAT YOU ARE FOR (${row.obsStreak}/4 reviews to dissolution)`;
  } else b.style.display="none";
}

/* whose disaster is this? — trace the player's share of an anomaly */
/* whose disaster is this? — split an anomaly into player / rival / nature */
function traceFor(ri, row){
  const parts=[]; let mine=0, theirs=0, unknown=false;
  for(let di=0; di<ND; di++){
    const ts=t-MODEL.lags[di][ri];
    if(ts>=1){
      for(const o of eng.state.ops){
        const start=o.t+o.lag, dur=o.dur||1;
        let hit=0;
        if(o.target===DRV[di] && ts>=start && ts<start+dur && o.mag!==0)
          hit=o.mag*Math.pow(o.decay===undefined?1:o.decay, ts-start);
        if(o.disp && o.t+o.disp.lag===ts && o.disp.to===DRV[di]) hit+=o.disp.mag;
        if(!hit) continue;
        const c=hit*MODEL.coeff[di][ri];
        if(o.owner==="player"){ mine+=c; parts.push(o.cap);
          if(!eng.knowledge.isKnown(di,ri)) unknown=true; }
        else if(o.owner==="rival" && eng.knowledge.isKnown(di,ri)) theirs+=c;   // an unknown wire hides them too
      }
    }
  }
  for(const e of row.landed)
    if(e.kind==="region" && e.target===REG[ri].name){
      if(e.owner==="player"){ mine+=e.mag;
        if(!e.cap.includes("displacement")) parts.push(e.cap); }
      else if(e.owner==="rival") theirs+=e.mag;
    }
  return {mine, theirs, unknown, parts:[...new Set(parts)]};
}

function s2f(x){ return x.toFixed(2); }
function memos(row){
  const out=[];
  if(row.trimmed)
    out.push("Budget office: appropriation trimmed. The committee funds programmes that do things.");
  const nx=MODEL.climate[t];                       // next season's substrate
  if(nx && Math.abs(nx.drivers[0])>=1.0)
    out.push("Meteorology desk: a strong Pacific swing is building. Whatever you do next season will have cover.");
  const dryRi=REG.findIndex((r,ri)=>!r.kind && row.anomalies[ri]<eng.assumptions.dryThreshold);
  if(dryRi>=0)
    out.push(`Ops desk: ${REG[dryRi].name} is dry as tinder. Conditions for enablement will not hold.`);
  if(eng.knowledge.on){                             // the unexplained season
    let worst=null;
    REG.forEach((r,ri)=>{ const a=row.anomalies[ri];
      if(Math.abs(a)<=row.sigmas[ri]*eng.assumptions.severityThreshold) return;
      let u=0; for(let di=0;di<ND;di++){ if(eng.knowledge.isKnown(di,ri)) continue;
        const ts=t-MODEL.lags[di][ri]; if(ts>=1) u+=Math.abs(eng.state.rows[ts-1].driverTotals[di]*MODEL.coeff[di][ri]); }
      if(u>=0.3&&(!worst||u>worst.u)) worst={r,u}; });
    if(worst) out.push(`Analysis desk: we cannot explain ${worst.r.name}'s season. Something is wired to it that is not on our board.`);
  }
  if(row.dossier>=25 && row.containment===0)
    out.push("Legal office: we spend nothing on containment while questions accumulate.");
  if(t>4 && row.mandate<=eng.assumptions.mandateBase+1)
    out.push("Budget office: the committee sees a calm world. Calm worlds do not fund directorates.");
  if(row.treasury>=0 && row.treasury<25)
    out.push("Budget office: at current burn this programme fails within the year.");
  if(iceMelt>=0.5 && t%6===0)
    out.push("Science desk: the Greenland sheet is past recovering on any timescale we will see. The coastlines on the map are now the coastlines.");
  if(flagship && flagship.deadline-t<=1)
    out.unshift(`Budget office: the flagship earmark lapses ${flagship.deadline-t===0?"this season":"next season"}. Sixty million dollars, and nothing to show the committee.`);
  if(lapses>=2 && t%3===0)
    out.push("Chief of staff: two lapsed directives on the record. The committee has started using the word 'review'.");
  if(t%9===5)
    out.push("██████ ██ ███████ cleared through legal. Do not discuss on this channel.");
  for(const m of out.slice(0,2)) wire(`MEMO — ${m}`,"memo");
}


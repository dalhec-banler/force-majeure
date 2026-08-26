/* -------------------------------------------------------------- archive
   The debrief is a file you can study: a tenure timeline with every
   operation on it, the ledger against the shadow world, a flat map of the
   world as you left it, the ladder's loudest seasons, the record, and the
   lessons the numbers support. Hover anything. One x-axis per chart; tool
   classes carry a glyph shape as well as a colour. */
const TOOL_CLASS={"Cloud Seeding":"relief","Adaptation Investment":"relief","Climate Research":"relief",
  "Watershed Interference":"strike","Fire Enablement":"strike",
  "Ocean Thermal Forcing":"ocean","Stratospheric Aerosol Inj.":"ocean","ENSO Forcing":"ocean",
  "Ionospheric Coupling [T3]":"heavy","Polar Destabilization":"heavy"};
const CLASS_COL={relief:"#53d97b",strike:"#e0a458",ocean:"#5bc8e8",heavy:"#e05252",rival:"#e05252",wing:"#c8e6cf",dir:"#c8e6cf"};
const CLASS_NAME={relief:"relief & research",strike:"regional strikes",ocean:"ocean & atmosphere",heavy:"lithosphere & polar"};
function esc(x){ return escapeHTML(x); }
function glyph(cls,x,y,r,col,extra){          // ● relief · ▲ strike · ◆ ocean · ■ heavy
  const a=extra||"";
  if(cls==="relief") return `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" ${a}/>`;
  if(cls==="strike") return `<path d="M${x} ${y-r} L${x+r} ${y+r} L${x-r} ${y+r} Z" fill="${col}" ${a}/>`;
  if(cls==="ocean")  return `<path d="M${x} ${y-r} L${x+r} ${y} L${x} ${y+r} L${x-r} ${y} Z" fill="${col}" ${a}/>`;
  return `<rect x="${x-r}" y="${y-r}" width="${2*r}" height="${2*r}" fill="${col}" ${a}/>`;
}
function showArchive(finalRow){
  const rows=eng.state.rows, N=rows.length, shadow=eng.shadowRows()||[];
  const ops=eng.state.ops, mine=ops.filter(o=>o.owner==="player"), theirs=ops.filter(o=>o.owner==="rival");
  const yearOf=i=>rows[i].year, y0=rows[0].year, y1=finalRow.year;
  const cause={ exposed:"EXPOSED — the record is public and it is yours.",
    insolvent:"INSOLVENT — the programme could not meet its obligations.",
    dissolved:"DISSOLVED — the committee concluded you were for nothing.",
  }[finalRow.status] || `TENURE COMPLETE — ${y1}. The programme continues without you.`;
  const profit=profitOf(rows), peakT=Math.max(...rows.map(r=>r.treasury)), peakDos=Math.max(...rows.map(r=>r.dossier));
  const rungOf=d=>eng.ladder.filter(l=>d>=l.threshold).length;
  const peakRung=rungOf(peakDos);
  const wingsUp=rows.flatMap(r=>r.wingEvents||[]).filter(w=>w.what==="online"&&w.why!=="new"||w.what==="online"&&CAPS.find(c=>c.name===w.cap&&(c.upkeep||0)>1)).length;
  const moth=rows.flatMap(r=>r.wingEvents||[]).filter(w=>w.what==="mothballed"&&w.why==="attrition").length;
  const spend=mine.reduce((s,o)=>s+o.cost,0), contSpend=rows.reduce((s,r)=>s+r.containment,0);
  const windfalls=rows.reduce((s,r)=>s+(r.windfall||0),0), trimmed=rows.filter(r=>r.trimmed).length;
  const earmarksDrawn=rows.filter(r=>r.earmarkUsed>0).length, emOffered=(typeof earmarksOffered!=="undefined")? earmarksOffered.size : 0;
  const met=dirLog.filter(d=>d.done).length, lapsed=dirLog.filter(d=>!d.done).length;
  const tile=(l,v,sub,col)=>`<div class="tile"><div class="tl">${l}</div><div class="tv" ${col?`style="color:${col}"`:""}>${v}</div>${sub?`<div class="ts">${sub}</div>`:""}</div>`;

  // ---------- tenure timeline (one x-axis; three bands)
  const W=1000, PL=96, PR=70, X=i=>PL+(W-PL-PR)*(N<=1?0:i/(N-1));
  const bandT={y:14,h:96}, bandD={y:128,h:84}, lane={y:232,h:120}, H=lane.y+lane.h+26;
  const line=(vals,band,max,min)=>vals.map((v,i)=>`${i?"L":"M"}${X(i).toFixed(1)} ${(band.y+band.h-(band.h)*((v-min)/((max-min)||1))).toFixed(1)}`).join(" ");
  const tMax=Math.max(peakT,100), decades=[]; for(let i=0;i<N;i++) if(rows[i].year%10===0&&rows[i].qtr==="Winter") decades.push(i);
  let svg=`<svg class="chart" viewBox="0 0 ${W} ${H}" id="arcTimeline">`;
  svg+=decades.map(i=>`<line x1="${X(i)}" x2="${X(i)}" y1="${bandT.y}" y2="${lane.y+lane.h}" class="grid"/><text x="${X(i)+3}" y="${lane.y+lane.h+16}" class="ax">${rows[i].year}</text>`).join("");
  // treasury
  svg+=`<text x="${PL}" y="${bandT.y-3}" class="lbl">CHEST · $M</text>`;
  svg+=`<path d="${line(rows.map(r=>r.treasury),bandT,tMax,0)}" fill="none" stroke="#53d97b" stroke-width="2"/>`;
  svg+=`<text x="${W-PR+6}" y="${bandT.y+bandT.h-(bandT.h)*(rows[N-1].treasury/tMax)+4}" class="dl" fill="#53d97b">$${fmt(rows[N-1].treasury,0)}M</text>`;
  // dossier with rung bands
  svg+=`<text x="${PL}" y="${bandD.y-3}" class="lbl">DOSSIER · the ladder</text>`;
  for(const l of eng.ladder.slice(1)){ const yy=bandD.y+bandD.h-bandD.h*(l.threshold/200); svg+=`<line x1="${PL}" x2="${W-PR}" y1="${yy}" y2="${yy}" class="rung"/><text x="${W-PR+6}" y="${yy+3}" class="ax">${l.threshold}</text>`; }
  svg+=`<path d="${line(rows.map(r=>r.dossier),bandD,200,0)}" fill="none" stroke="#e0a458" stroke-width="2"/>`;
  // event lane: 5 rows
  const laneRow={relief:0,strike:1,ocean:2,heavy:3,rival:4,wing:5,dir:5}, LR=lane.h/6, ly=k=>lane.y+LR*k+LR/2;
  svg+=[["relief","YOUR RELIEF"],["strike","YOUR STRIKES"],["ocean","OCEAN · SKY"],["heavy","HEAVY"],["rival","THEIRS"],["wing","WINGS · COMMITTEE"]].map(([k,l])=>`<text x="${PL-4}" y="${ly(laneRow[k])+3}" class="ax" text-anchor="end">${l}</text><line x1="${PL}" x2="${W-PR}" y1="${ly(laneRow[k])}" y2="${ly(laneRow[k])}" class="lane"/>`).join("");
  const tipOf=o=>{ const land=rows[Math.min(N,o.t+o.lag)-1]; const yv=land&&REG.findIndex(r=>r.name===o.target)>=0? Math.round(land.yields[REG.findIndex(r=>r.name===o.target)]) : null;
    return `${rows[o.t-1].year} ${rows[o.t-1].qtr} · ${o.cap.replace(" [T3]","")} → ${DRVNAME[o.target]||o.target}${o.cost?` · $${o.cost}M`:""}${o.sig?` · signature ${o.sig}`:""}${yv!==null?` · harvest after: ${yv}%`:""}`; };
  for(const o of mine){ const cls=TOOL_CLASS[o.cap]||"heavy"; svg+=glyph(cls,X(o.t-1),ly(laneRow[cls]),4.5,CLASS_COL[cls],`data-tip="${esc(tipOf(o))}"`); }
  for(const o of theirs){ svg+=`<line x1="${X(o.t-1)}" x2="${X(o.t-1)}" y1="${ly(4)-6}" y2="${ly(4)+6}" stroke="#e05252" stroke-width="2" data-tip="${esc(`${rows[o.t-1].year} · ${START.rivalName}: ${o.cap} → ${DRVNAME[o.target]||o.target}`)}"/>`; }
  rows.forEach((r,i)=>{ for(const w of (r.wingEvents||[])){ if(w.what==="online"&&w.why==="new"&&(CAPS.find(c=>c.name===w.cap)||{}).upkeep<=1) continue;
      svg+=`<text x="${X(i)}" y="${ly(5)+4}" class="ev" fill="${w.what==="online"?"#53d97b":"#e0a458"}" text-anchor="middle" data-tip="${esc(`${r.year}: ${w.cap.replace(" [T3]","")} wing ${w.what==="online"?"stood up":"mothballed"} (${w.why})`)}">${w.what==="online"?"▲":"▼"}</text>`; } });
  for(const d of dirLog){ const i=d.t-1; if(i<0||i>=N) continue; svg+=`<text x="${X(i)}" y="${ly(5)-8}" class="ev" fill="${d.done?"#53d97b":"#e05252"}" text-anchor="middle" data-tip="${esc(`${rows[i].year}: directive “${d.title}” ${d.done?"met · +$"+d.reward+"M":"lapsed · −$"+d.claw+"M"}`)}">${d.done?"✓":"✗"}</text>`; }
  svg+=`<line id="arcX" x1="0" x2="0" y1="${bandT.y}" y2="${lane.y+lane.h}" class="xhair" style="display:none"/><text id="arcXt" x="0" y="${bandT.y-3}" class="dl" style="display:none"></text>`;
  svg+=`</svg>`;
  const legend=`<div class="leg">${Object.entries(CLASS_NAME).map(([k,n])=>`<span><svg width="12" height="12" viewBox="-6 -6 12 12">${glyph(k,0,0,5,CLASS_COL[k])}</svg>${n}</span>`).join("")}<span><i style="color:#e05252">|</i> ${START.rivalName}</span><span>▲▼ wings</span><span>✓✗ directives</span></div>`;

  // ---------- ledger: revenue vs the shadow world; spend by tool
  const rev=rows.map(r=>r.revenue), base=rows.map(r=>r.baseRevenue==null?85:r.baseRevenue);
  const rMax=Math.max(...rev,...base), rMin=Math.min(...rev,...base);
  let cum=0; const cumP=rows.map((r,i)=>cum+=rev[i]-base[i]);
  const HL=190, bR={y:14,h:110}, bC={y:140,h:40}, HH=bC.y+bC.h+26;
  let led=`<svg class="chart" viewBox="0 0 ${W} ${HH}" id="arcLedger">`;
  led+=decades.map(i=>`<line x1="${X(i)}" x2="${X(i)}" y1="${bR.y}" y2="${bC.y+bC.h}" class="grid"/><text x="${X(i)+3}" y="${bC.y+bC.h+16}" class="ax">${rows[i].year}</text>`).join("");
  led+=`<text x="${PL}" y="${bR.y-3}" class="lbl">HOMELAND REVENUE · yours vs the world where you never acted</text>`;
  led+=`<path d="${line(base,bR,rMax,rMin)}" fill="none" stroke="#7fa389" stroke-width="2" stroke-dasharray="4 4"/>`;
  led+=`<path d="${line(rev,bR,rMax,rMin)}" fill="none" stroke="#5bc8e8" stroke-width="2"/>`;
  led+=`<text x="${W-PR+6}" y="${bR.y+bR.h-bR.h*((rev[N-1]-rMin)/((rMax-rMin)||1))+4}" class="dl" fill="#5bc8e8">yours</text><text x="${W-PR+6}" y="${bR.y+bR.h-bR.h*((base[N-1]-rMin)/((rMax-rMin)||1))+14}" class="dl" fill="#7fa389">shadow</text>`;
  const cMax=Math.max(1,...cumP.map(Math.abs));
  led+=`<text x="${PL}" y="${bC.y-3}" class="lbl">PROFIT · cumulative</text><line x1="${PL}" x2="${W-PR}" y1="${bC.y+bC.h/2}" y2="${bC.y+bC.h/2}" class="rung"/>`;
  led+=`<path d="${line(cumP,bC,cMax,-cMax)} L${X(N-1)} ${bC.y+bC.h/2} L${X(0)} ${bC.y+bC.h/2} Z" fill="${profit>=0?"#53d97b":"#e05252"}" fill-opacity=".25" stroke="${profit>=0?"#53d97b":"#e05252"}" stroke-width="1.5"/>`;
  led+=`<text x="${W-PR+6}" y="${bC.y+bC.h-bC.h*((cumP[N-1]+cMax)/(2*cMax))+4}" class="dl" fill="${profit>=0?"#53d97b":"#e05252"}">${profit>=0?"+":"−"}$${fmt(Math.abs(profit),0)}M</text>`;
  led+=`</svg>`;
  const byTool={}; for(const o of mine){ byTool[o.cap]=(byTool[o.cap]||{n:0,cost:0}); byTool[o.cap].n++; byTool[o.cap].cost+=o.cost; }
  const toolRows=Object.entries(byTool).sort((a,b)=>b[1].cost-a[1].cost);
  const maxCost=Math.max(1,...toolRows.map(x=>x[1].cost));
  const bars=`<div class="bars">${toolRows.map(([k,v])=>{ const cls=TOOL_CLASS[k]||"heavy"; return `<div class="bar"><span class="bn">${k.replace(" [T3]","")} <i>×${v.n}</i></span><span class="bt"><span class="bf" style="width:${(100*v.cost/maxCost).toFixed(1)}%;background:${CLASS_COL[cls]}"></span></span><span class="bv">$${fmt(v.cost,0)}M</span></div>`; }).join("")}
    <div class="bar"><span class="bn">containment</span><span class="bt"><span class="bf" style="width:${(100*Math.min(contSpend,maxCost)/maxCost).toFixed(1)}%;background:#7fa389"></span></span><span class="bv">$${fmt(contSpend,0)}M</span></div></div>`;

  // ---------- the world as you left it (flat map)
  const span=Math.min(N,40), sIdx=N-span;
  const regionStats=REG.map((r,ri)=>{
    const online=rows[N-1].online? rows[N-1].online[ri] : true;
    const yv=rows.slice(sIdx).reduce((s,x)=>s+x.yields[ri],0)/span;
    const sh=shadow.length? shadow.slice(sIdx).reduce((s,x)=>s+x.yields[ri],0)/span : yv;
    const myOps=mine.filter(o=>o.target===r.name), rv=theirs.filter(o=>o.target===r.name);
    const alt=histAltered.filter(h=>h.what.includes(r.name));
    return {r,ri,online,yv,delta:yv-sh,myOps,rv,alt,final:rows[N-1].yields[ri]};
  });

  // ---------- the ladder's loudest seasons
  const loud=rows.map((r,i)=>({i,r})).filter(x=>x.r.attribution>0).sort((a,b)=>b.r.attribution-a.r.attribution).slice(0,5);
  const loudRows=loud.map(({i,r})=>`<tr><td>${r.year} ${r.qtr}</td><td>+${fmt(r.attribution,0)}</td><td>${fmt(r.dossier,0)} · rung ${rungOf(r.dossier)}</td><td>${[...new Set(r.landed.filter(e=>e.owner==="player"&&e.sig>0).map(e=>e.cap.replace(" [T3]","")+" → "+(DRVNAME[e.target]||e.target)))].join("; ")||"—"}</td></tr>`).join("");

  // ---------- lessons the numbers support
  const lessons=[];
  if(trimmed>0) lessons.push(`The committee trimmed your appropriation in <b>${trimmed} season${trimmed===1?"":"s"}</b> for having nothing in the air. A seed a year keeps it whole.`);
  { const hits={}; for(const o of mine.filter(o=>o.sig>0&&o.mag<0)){ (hits[o.target]=hits[o.target]||[]).push(o.t); }   // strikes, not relief
    const rep=Object.entries(hits).map(([k,ts])=>{ ts.sort((a,b)=>a-b); let m=0; for(let i=0;i<ts.length;i++){ let n=0; for(let j=i;j<ts.length&&ts[j]<ts[i]+12;j++) n++; m=Math.max(m,n);} return [k,m]; }).filter(x=>x[1]>=3).sort((a,b)=>b[1]-a[1]);
    if(rep.length) lessons.push(`You struck <b>${rep[0][0]}</b> ${rep[0][1]} times inside three years. Repeats compound the signature — a pattern is the evidence; rotate targets.`); }
  if(peakDos>=115) lessons.push(`A rival service named you (dossier ${fmt(peakDos,0)}). Past 115 the file grows on its own and never closes below 90 — everything after was played on a wound.`);
  else if(peakDos>=50 && contSpend<20) lessons.push(`Questions circulated (peak dossier ${fmt(peakDos,0)}) and you spent $${fmt(contSpend,0)}M on containment. Hush money is cheapest early, before the dossier saturates it.`);
  if(emOffered>earmarksDrawn) lessons.push(`<b>${emOffered-earmarksDrawn} of ${emOffered}</b> flagship earmarks went to the Navy unused. An earmark stands the wing up for you — the money is the demonstration.`);
  if(moth>0) lessons.push(`<b>${moth}</b> wing${moth===1?"":"s"} went to the desert by attrition. A wing costs its upkeep every season; the chest must carry it, not just stand it up.`);
  if(lapsed>0) lessons.push(`<b>${lapsed}</b> directive${lapsed===1?"":"s"} lapsed and the committee clawed back. The fuse is in reviews — answer the cheap ones the season they arrive.`);
  { let bi=-1,bv=0; rows.forEach((r,i)=>{ if((r.windfall||0)>bv){bv=r.windfall;bi=i;} });
    if(bi>=0&&bv>=10) lessons.push(`Your best season was <b>${rows[bi].year} ${rows[bi].qtr}</b>: the desk returned $${fmt(bv,0)}M${rows[bi].landed.some(e=>e.owner==="player"&&e.kind==="driver")?" — an ocean or atmosphere operation landing into a market":" — a strike landing into a shortage"}. That is the shape of a profitable move.`); }
  const helped=regionStats.filter(x=>x.online&&x.delta>1.5).length, hurt=regionStats.filter(x=>x.online&&x.delta<-1.5).length;
  lessons.push(`Against the world where you never acted, you left <b>${helped}</b> harvest${helped===1?"":"s"} better off and <b>${hurt}</b> worse — hover the map to see which, and by how much.`);
  if(!lessons.length) lessons.push("Nothing in the numbers argues with what you did. Play it more ambitiously.");

  // ---------- table view
  const table=`<table class="szt"><tr><th>season</th><th>chest</th><th>dossier</th><th>grain</th><th>revenue</th><th>shadow</th><th>ops</th></tr>${rows.map((r,i)=>`<tr><td>${r.year} ${r.qtr[0]}</td><td>${fmt(r.treasury,0)}</td><td>${fmt(r.dossier,0)}</td><td>${fmt(r.price,0)}</td><td>${fmt(r.revenue,0)}</td><td>${fmt(base[i],0)}</td><td>${r.committed.map(o=>o.cap.replace(" [T3]","")).join(", ")}</td></tr>`).join("")}</table>`;

  let html=`<div class="arc-head"><div><h2>THE ARCHIVE OPENS — TWENTY-FIVE YEARS LATER</h2>
    <div class="cls">DECLASSIFIED ${y1+25} // ${START.nation} PROGRAMME // ${y0}–${y1} // REVIEW COPY</div></div></div>
    <p class="q">${cause}</p>
    <div class="tiles">
      ${tile("PROFIT · vs the shadow world",(profit>=0?"+$":"−$")+fmt(Math.abs(profit),0)+"M","what the programme made the homeland",profit>=0?"#53d97b":"#e05252")}
      ${tile("PEAK CHEST","$"+fmt(peakT,0)+"M",`final $${fmt(finalRow.treasury,0)}M · $${fmt(windfalls,0)}M from the desk`)}
      ${tile("THE LADDER","rung "+peakRung+" / 7",`peak dossier ${fmt(peakDos,0)} · $${fmt(contSpend,0)}M containment`,peakRung>=5?"#e05252":peakRung>=3?"#e0a458":"")}
      ${tile("OPERATIONS",mine.length,`$${fmt(spend,0)}M · ${wingsUp} wing${wingsUp===1?"":"s"} stood up · ${moth} lost`)}
      ${tile("THE COMMITTEE",`${met} met · ${lapsed} lapsed`,`${earmarksDrawn} of ${emOffered} earmarks flown`)}
      ${tile("DEATH TOLL",fmtDead(cumDead),`${fmtDead(cumDeadYours)} attributable to you · in no report`,"#e05252")}
    </div>
    <h3>TENURE</h3>${legend}${svg}
    <h3>THE LEDGER</h3>${led}<div class="two"><div><div class="sub">SPEND BY TOOL</div>${bars}</div>
      <div><div class="sub">THE COMMITTEE'S LEDGER</div><div class="dirs">${dirLog.length? dirLog.map(d=>`<span class="${d.done?"ok":"no"}" title="${esc(d.title)}">${rows[d.t-1]?rows[d.t-1].year:""} ${d.done?"✓":"✗"} ${esc(d.title)}</span>`).join("") : "<span>No directives on the record.</span>"}</div></div></div>
    <h3>THE WORLD AS YOU LEFT IT</h3>
    <div class="leg"><span><i class="sw" style="background:#5bc8e8"></i>better off than the shadow world</span><span><i class="sw" style="background:#7fa389"></i>unchanged</span><span><i class="sw" style="background:#e0a458"></i>worse off</span><span>size = your operations there</span><span><i class="sw ring" style="border-color:#e05252"></i>${START.rivalName} struck it</span><span><i class="sw ring" style="border-color:#53d97b"></i>homeland</span></div>
    <div class="mapwrap"><canvas id="arcMap" width="1000" height="380"></canvas><div id="arcMapInfo" class="mapinfo">Hover a region.</div></div>
    <h3>THE LADDER'S LOUDEST SEASONS</h3>
    <table class="szt"><tr><th>season</th><th>added to the file</th><th>file after</th><th>what landed</th></tr>${loudRows||"<tr><td colspan=4>Nothing you did ever reached the file.</td></tr>"}</table>
    <h3>THE RECORD ON YOUR WATCH</h3>
    <p><b>${histAsRecorded}</b> recorded disasters happened as the record has them. ${histAltered.length? histAltered.map(h=>`<span class="${h.how==="unmade"?"ok":"no"}">${h.how==="unmade"?"unmade":"worse"}: ${esc(h.what)}${rows[h.t-1]?" ("+rows[h.t-1].year+")":""}</span>`).join(" · ") : "You changed none of it."}${recordStopped? " <b>The geophysical record stopped the day you reached for the lithosphere.</b>" : " Every earthquake and eruption is in the textbooks, exactly as it happened."}</p>
    <h3>LESSONS THE NUMBERS SUPPORT</h3><ul class="lessons">${lessons.map(l=>`<li>${l}</li>`).join("")}</ul>
    <p style="margin-top:10px">Which season was the most fun, and why? <span class="redact">That answer gates everything.</span> (Select to reveal.)</p>
    <div class="arc-actions"><button onclick="location.reload()">RUN IT BACK ▸</button><button id="arcTable" class="ghost">TABLE VIEW</button></div>
    <div id="arcTableWrap" style="display:none">${table}</div>
    <div id="arctip" class="arctip" style="display:none"></div>`;
  $("archivebody").innerHTML=html;
  $("archive").style.display="flex";
  const sheet=$("archivebody"); sheet.classList.add("archive");
  // hover: glyph tooltips + crosshair
  const tip=$("arctip");
  const showTip=(ev,text)=>{ tip.style.display="block"; tip.textContent=text; const r=sheet.getBoundingClientRect(); tip.style.left=(ev.clientX-r.left+sheet.scrollLeft+12)+"px"; tip.style.top=(ev.clientY-r.top+sheet.scrollTop+12)+"px"; };
  sheet.addEventListener("mousemove",ev=>{ const el=ev.target.closest&&ev.target.closest("[data-tip]"); if(el){ showTip(ev, el.dataset.tip); return; } if(ev.target.closest&&ev.target.closest("#arcMap")) return; tip.style.display="none"; });
  const tl=$("arcTimeline"), xh=$("arcX"), xt=$("arcXt");
  if(tl){ tl.addEventListener("mousemove",ev=>{ const pt=tl.createSVGPoint(); pt.x=ev.clientX; pt.y=ev.clientY; const p=pt.matrixTransform(tl.getScreenCTM().inverse());
      const i=Math.max(0,Math.min(N-1,Math.round((p.x-PL)/((W-PL-PR)/(N-1||1))))); const r=rows[i];
      xh.style.display="block"; xh.setAttribute("x1",X(i)); xh.setAttribute("x2",X(i)); xt.style.display="block"; xt.setAttribute("x",Math.min(X(i)+4,W-220)); xt.textContent=`${r.year} ${r.qtr} · chest $${fmt(r.treasury,0)}M · dossier ${fmt(r.dossier,0)} · grain ${fmt(r.price,0)}`; });
    tl.addEventListener("mouseleave",()=>{ xh.style.display="none"; xt.style.display="none"; }); }
  $("arcTable").addEventListener("click",()=>{ const w=$("arcTableWrap"); w.style.display=w.style.display==="none"?"block":"none"; });
  // the map
  const mc=$("arcMap"), mx=mc.getContext("2d"), MW=mc.width, MH=mc.height;
  const px=(la,lo)=>[(lo+180)/360*MW, (90-la)/180*MH];
  mx.fillStyle="#07100b"; mx.fillRect(0,0,MW,MH);
  mx.strokeStyle="rgba(200,230,207,.22)"; mx.lineWidth=1;
  for(const ring of LAND){ mx.beginPath(); ring.forEach(([lo,la],i)=>{ const [x,y]=px(la,lo); i?mx.lineTo(x,y):mx.moveTo(x,y); }); mx.closePath(); mx.stroke(); }
  mx.strokeStyle="rgba(200,230,207,.07)"; for(let lo=-150;lo<180;lo+=30){ const [x]=px(0,lo); mx.beginPath(); mx.moveTo(x,0); mx.lineTo(x,MH); mx.stroke(); } for(let la=-60;la<=60;la+=30){ const [,y]=px(la,0); mx.beginPath(); mx.moveTo(0,y); mx.lineTo(MW,y); mx.stroke(); }
  const dots=[];
  for(const st of regionStats){ if(!st.online) continue; const [la,lo]=REGPOS[st.r.name]; const [x,y]=px(la,lo);
    const rad=5+2.2*Math.sqrt(st.myOps.length); const col=st.delta>1.5?"#5bc8e8":st.delta<-1.5?"#e0a458":"#7fa389";
    mx.beginPath(); mx.arc(x,y,rad,0,7); mx.fillStyle=col; mx.globalAlpha=.85; mx.fill(); mx.globalAlpha=1;
    mx.lineWidth=1.5; mx.strokeStyle="#07100b"; mx.stroke();
    if(st.rv.length){ mx.beginPath(); mx.arc(x,y,rad+3,0,7); mx.strokeStyle="#e05252"; mx.lineWidth=1.6; mx.stroke(); }
    if(st.r.homeland){ mx.beginPath(); mx.arc(x,y,rad+6,0,7); mx.strokeStyle="#53d97b"; mx.lineWidth=1.6; mx.stroke(); }
    mx.fillStyle="rgba(214,239,220,.8)"; mx.font="9px "+MONO_FONT; mx.fillText(st.r.name.length>16? st.r.name.slice(0,15)+"…" : st.r.name, x+rad+3, y+3);
    dots.push({x,y,rad:rad+6,st}); }
  const info=$("arcMapInfo");
  mc.addEventListener("mousemove",ev=>{ const r=mc.getBoundingClientRect(); const x=(ev.clientX-r.left)*MW/r.width, y=(ev.clientY-r.top)*MH/r.height;
    let best=null,bd=18; for(const d of dots){ const dd=Math.hypot(d.x-x,d.y-y); if(dd<bd+d.rad-6){ bd=dd; best=d; } }
    if(!best){ info.innerHTML="Hover a region."; return; }
    const st=best.st, by={}; for(const o of st.myOps){ by[o.cap]=(by[o.cap]||0)+1; }
    info.innerHTML=`<b>${st.r.name.toUpperCase()}</b>${st.r.homeland?" · HOMELAND":""} · ${esc(st.r.crop||"")}<br>
      final harvest <b>${Math.round(st.final)}%</b> · last decade <b>${st.delta>=0?"+":""}${st.delta.toFixed(1)}</b> pts vs the shadow world<br>
      your operations: ${Object.entries(by).map(([k,v])=>`${k.replace(" [T3]","")} ×${v}`).join(", ")||"none"}<br>
      ${START.rivalName}: ${st.rv.length? st.rv.length+" operation"+(st.rv.length===1?"":"s")+" ("+[...new Set(st.rv.map(o=>o.cap))].join(", ")+")" : "never touched it"}${st.alt.length? "<br>the record: "+st.alt.map(h=>h.how+" — "+esc(h.what)).join("; ") : ""}`; });
  mc.addEventListener("mouseleave",()=>{ info.innerHTML="Hover a region."; });
}

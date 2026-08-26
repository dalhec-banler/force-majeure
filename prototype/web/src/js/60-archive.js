/* -------------------------------------------------------------- archive */
function showArchive(finalRow){
  const rows=eng.state.rows;
  const cause={ exposed:"EXPOSED — the record is public and it is yours.",
    insolvent:"INSOLVENT — the programme could not meet its obligations.",
    dissolved:"DISSOLVED — the committee concluded you were for nothing.",
  }[finalRow.status] || `TENURE COMPLETE — ${finalRow.year}. The programme continues without you.`;
  const opsDone=eng.state.ops.filter(o=>o.owner==="player").length;
  const outside=rows.reduce((n,r)=>n+r.anomalies.filter((a,i)=>Math.abs(a)>r.sigmas[i]).length,0);
  const peakDos=Math.max(...rows.map(r=>r.dossier));
  const preds=rows.filter(r=>r.prediction);
  const naturalOps = eng.state.ops.filter(o=>o.owner==="player"&&o.sig>0).length && peakDos<25;
  let html=`<h2>THE ARCHIVE OPENS — TWENTY-FIVE YEARS LATER</h2>
    <div class="cls">DECLASSIFIED ${finalRow.year+25} // REVIEW COPY</div>
    <p class="q">${cause}</p>
    <table><tr><th>tenure</th><th>operations</th><th>seasons outside envelope</th>
    <th>peak dossier</th><th>final funds</th></tr>
    <tr><td>${rows.length} seasons</td><td>${opsDone}</td><td>${outside}</td>
    <td>${fmt(peakDos)}</td><td>$${fmt(finalRow.treasury)}M</td></tr></table>
    <p>Estimated excess mortality, 1946–${finalRow.year}: <b style="color:var(--red)">${fmtDead(cumDead)}</b>
    — of which attributable to your operations: <b>${fmtDead(cumDeadYours)}</b>.
    Both figures appear in no report.</p>
    <p>The world you left behind: <b>${Math.round(devastation()*100)}% devastated</b>${
      devastation()>0.55? " — from orbit, the night side glows." :
      devastation()>0.25? " — the burn scars will outlive the programme." :
      " — largely intact. History may call that restraint."}</p>
    <p>Profit above baseline, lifetime: <b>${(()=>{const pr=profitOf(rows);return (pr>=0?"+$":"−$")+fmt(Math.abs(pr))+"M";})()}</b>.</p>`;
  html += `<p>${ naturalOps
    ? "Every operation you ran is still filed as natural variability. No one will ever know. Whether that is victory is not a question this office answers."
    : peakDos>=115 ? "History concluded a programme existed. Several events you did not cause are attributed to you; several you did cause are not."
    : "A graduate student's residual paper was cited twice, then forgotten. The record holds."}</p>`;
  if(preds.length){
    html+=`<h2 style="margin-top:14px">PREDICTIONS VS RECORD</h2>`;
    for(const r of preds.slice(0,12))
      html+=`<p style="margin-bottom:4px"><span style="color:var(--ink-faint)">S${r.t} ${r.year}·${r.qtr[0]}</span>
        — “${r.prediction}” <span style="color:var(--ink-dim)">· worst hit that season:
        ${REG[r.anomalies.reduce((m,a,i,ar)=>Math.abs(a)>Math.abs(ar[m])?i:m,0)].name}</span></p>`;
    html+=`<p style="color:var(--ink-dim)">Count the matches yourself. Near zero: the model is noise.
      Near all of them: no tension. The game lives in between.</p>`;
  }
  {
    const un=histAltered.filter(h=>h.how==="unmade"), wo=histAltered.filter(h=>h.how==="worse");
    html+=`<h2 style="margin-top:14px">HISTORY ON YOUR WATCH</h2>
      <p><b>${histAsRecorded}</b> recorded disasters occurred as the record has them. <b>${un.length}</b> did not happen; <b>${wo.length}</b> were worse than the record.${
        un.length? ` Unmade: ${un.map(h=>h.what).join("; ")}.`:""}${wo.length? ` Worse: ${wo.map(h=>h.what).join("; ")}.`:""}${
        recordStopped? " The geophysical record stopped the day you reached for the lithosphere; nothing after is canon.":" Every earthquake and eruption on your watch is in the textbooks, exactly as it happened."}</p>`;
  }
  if(eng.knowledge.on){
    const K=eng.knowledge, kc=K.count();
    const never=K.edges.filter(e=>!K.isKnown(e.di,e.ri)).sort((a,b)=>Math.abs(b.coeff)-Math.abs(a.coeff)).slice(0,3);
    html+=`<h2 style="margin-top:14px">THE WIRING</h2>
      <p>You left office understanding <b>${kc.known} of ${kc.total}</b> wires in the world.${
        never.length? ` The strongest you never found: ${never.map(e=>`${DRVNAME[e.driver]} → ${e.region}`).join("; ")}. Some of what you called weather was those.`
        : " The board was complete. Nothing that happened to you was unexplained — only unforeseen."}</p>`;
  }
  const rivalOps=eng.state.ops.filter(o=>o.owner==="rival");
  if(rivalOps.length){
    html+=`<h2 style="margin-top:14px">DECLASSIFIED — ${START.rivalName.replace(/^the /,"THE ").toUpperCase()}</h2>
      <p>You were never alone in the sky. Their file, opened after ${finalRow.year+25}:</p>`;
    for(const o of rivalOps.slice(0,10))
      html+=`<p style="margin-bottom:3px;color:var(--ink-dim)">S${o.t} — ${o.cap} · ${o.target}</p>`;
  }
  html+=`<p style="margin-top:10px">Which season was the most fun, and why?
    <span class="redact">That answer gates everything.</span> (Select to reveal.)</p>
    <button onclick="location.reload()">RUN IT BACK ▸</button>`;
  $("archivebody").innerHTML=html;
  $("archive").style.display="flex";
}


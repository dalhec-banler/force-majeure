/* ------------------------------------------------------------- resolve */
const PHASES=["FORECAST","COMMITMENT","RESOLUTION","CONSEQUENCES","ATTRIBUTION"];
async function phaseShow(i){ $("phasename").textContent=PHASES[i];
  if(!reduced) await new Promise(r=>setTimeout(r,i===0?60:360)); }

/* Directives — the committee teaches you your own job (onboarding).
   Sequential; each completion is appropriated next season via cmd.grant. */
const DIRECTIVES=[
 {title:"Prove the concept", reward:8, tool:"☁ CLOUD SEEDING — any region",
  text:"Put rain somewhere. Anywhere. Schenectady wants photographs for the appropriations hearing.",
  check:(row)=>eng.state.ops.some(o=>o.owner==="player"&&o.cap==="Cloud Seeding")},
 {title:"Stabilize a drought", reward:12, tool:"☁ CLOUD SEEDING — the driest region (amber/red marker)",
  text:"Find the driest region on the board and seed it. A fed market is a buying market — and a grateful one.",
  check:(row)=>row.landed.some(e=>e.owner==="player"&&e.first&&e.cap==="Cloud Seeding"&&(()=>{
    const ri=REG.findIndex(r=>r.name===e.target);
    const pr=eng.state.rows[t-2];
    return ri>=0&&pr&&pr.anomalies[ri]<-0.25;})())},
 {title:"Harden the homeland", reward:10, tool:"🛡 ADAPTATION INVESTMENT — your homeland (green ring)",
  text:"The committee funds what it can tour. Reservoirs and seed banks photograph well. Invest in Adaptation at home.",
  check:()=>eng.state.ops.some(o=>o.owner==="player"&&o.cap==="Adaptation Investment"&&o.target===REG.find(r=>r.homeland).name)},
 {title:"Move the ocean, not the country", reward:14, tool:"🌊 OCEAN THERMAL, ✈ AEROSOL, or 🌀 ENSO FORCING",
  text:"Stop pushing countries. Push the sea that pushes them — commit any ocean or atmospheric driver operation.",
  check:()=>eng.state.ops.some(o=>o.owner==="player"&&o.type==="DRIVER")},
 {title:"Move a market", reward:18, tool:"🚱 WATERSHED INTERFERENCE — a wheat exporter (Black Sea, Australia)",
  text:"Make the weather move a price. The board is watching the wheat number, and your positioning.",
  check:(row)=>row.price>=107&&eng.state.ops.some(o=>o.owner==="player"&&o.sig>0&&o.t+o.lag>=t-2&&o.t+o.lag<=t)},
 {title:"Stay invisible", reward:15, tool:"CONTAINMENT BUDGET — the slider under ATTRIBUTION",
  text:"Operations are landing and the ladder has not moved. Keep the dossier quiet — that is the craft, not the storm.",
  check:(row)=>row.dossier<25&&eng.state.ops.filter(o=>o.owner==="player"&&o.sig>0&&o.t+o.lag<=t).length>=3},
 {title:"Answer them", reward:20, from:24, tool:"🚱 WATERSHED or ⚡ IONOSPHERIC — Black Sea Steppe",
  text:"Counterintelligence is certain enough. The Steppe grows wheat too. Answer them — quietly or otherwise.",
  check:()=>eng.state.ops.some(o=>o.owner==="player"&&o.t>=24&&o.sig>0&&o.target==="Black Sea Steppe")},
];
let dirIdx=0, pendingGrant=0;
function renderDirective(){
  const d=DIRECTIVES[dirIdx];
  if(!d){ $("dirtext").textContent="No standing directives. The programme writes its own now.";
    $("dirreward").textContent=""; return; }
  if(d.from && t<d.from){
    $("dirtext").textContent="The committee is drafting language. Continue operations.";
    $("dirreward").textContent=""; return; }
  $("dirtext").innerHTML=d.text+(d.tool?
    `<div style="margin-top:5px;font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;color:var(--green)">USE: ${d.tool}</div>`:"");
  $("dirreward").textContent="+$"+d.reward+"M";
}

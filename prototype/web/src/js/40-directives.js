/* ------------------------------------------------------------- resolve */
const PHASES=["FORECAST","COMMITMENT","RESOLUTION","CONSEQUENCES","ATTRIBUTION"];
async function phaseShow(i){ $("phasename").textContent=PHASES[i];
  if(!reduced) await new Promise(r=>setTimeout(r,i===0?60:360)); }

/* Directives — the committee teaches you your own job (onboarding), then
   keeps demanding. Every directive has a fuse: complete it for the reward,
   let it lapse and the committee claws back half. Sequential; rewards are
   appropriated next season via cmd.grant, clawbacks via cmd.clawback. */
const DIRECTIVES=[
 {title:"Prove the concept", reward:8, window:5, tool:"☁ CLOUD SEEDING — any region",
  text:"Put rain somewhere. Anywhere. Schenectady wants photographs for the appropriations hearing.",
  check:(row)=>eng.state.ops.some(o=>o.owner==="player"&&o.cap==="Cloud Seeding")},
 {title:"Stabilize a drought", reward:12, window:7, tool:"☁ CLOUD SEEDING — the driest region (amber/red marker)",
  text:"Find the driest region on the board and seed it. A fed market is a buying market — and a grateful one.",
  check:(row)=>row.landed.some(e=>e.owner==="player"&&e.first&&e.cap==="Cloud Seeding"&&(()=>{
    const ri=REG.findIndex(r=>r.name===e.target);
    const pr=eng.state.rows[t-2];
    return ri>=0&&pr&&pr.anomalies[ri]<-0.25;})())},
 {title:"Harden the homeland", reward:10, window:6, tool:"🛡 ADAPTATION INVESTMENT — your homeland (green ring)",
  text:"The committee funds what it can tour. Reservoirs and seed banks photograph well. Invest in Adaptation at home.",
  check:()=>eng.state.ops.some(o=>o.owner==="player"&&o.cap==="Adaptation Investment"&&o.target===REG.find(r=>r.homeland).name)},
 {title:"Move the ocean, not the country", reward:14, window:6, tool:"🌊 OCEAN THERMAL, ✈ AEROSOL, or 🌀 ENSO FORCING",
  text:"Stop pushing countries. Push the sea that pushes them — commit any ocean or atmospheric driver operation.",
  check:()=>eng.state.ops.some(o=>o.owner==="player"&&o.type==="DRIVER")},
 {title:"Move a market", reward:18, window:7, tool:"🚱 WATERSHED INTERFERENCE — a wheat exporter (Black Sea, Australia)",
  text:"Make the weather move a price. The board is watching the wheat number, and your positioning.",
  check:(row)=>row.price>=107&&eng.state.ops.some(o=>o.owner==="player"&&o.sig>0&&o.t+o.lag>=t-2&&o.t+o.lag<=t)},
 {title:"Stay invisible", reward:15, window:8, tool:"CONTAINMENT BUDGET — the slider under ATTRIBUTION",
  text:"Operations are landing and the ladder has not moved. Keep the dossier quiet — that is the craft, not the storm.",
  check:(row)=>row.dossier<25&&eng.state.ops.filter(o=>o.owner==="player"&&o.sig>0&&o.t+o.lag<=t).length>=3},
 {title:"Answer them", reward:20, from:24, window:5, tool:"🚱 WATERSHED or ⚡ IONOSPHERIC — Black Sea Steppe",
  text:"Counterintelligence is certain enough. The Steppe grows wheat too. Answer them — quietly or otherwise.",
  check:()=>eng.state.ops.some(o=>o.owner==="player"&&o.t>=24&&o.sig>0&&o.target==="Black Sea Steppe")},
];
/* Standing directives — after onboarding the committee writes its own,
   from the state of the board. Deterministic choice: an unanswered attack
   first, a failing client second, then a rotation of demands. */
let lastHostileT=-99;                 // last season the homeland was worked by a rival
const STANDING=[
 {key:"answer", when:()=>lastHostileT>=t-3, title:"Answer the Steppe", reward:18, window:4,
  tool:"🚱 WATERSHED, 🔥 FIRE, or ⚡ IONOSPHERIC — Black Sea Steppe",
  text:"They worked our watershed again. The committee wants a reply on the Steppe before the next hearing — it does not care what kind.",
  check:(row,d)=>eng.state.ops.some(o=>o.owner==="player"&&o.sig>0&&o.target==="Black Sea Steppe"&&o.t>d.issued)},
 {key:"client", when:(row)=>clientInNeed(row)!==null, title:"Protect the client", reward:10, window:3,
  make:(row,d)=>{ const r=clientInNeed(row); d.region=r.name;
    d.tool=`☁ CLOUD SEEDING — ${r.name}`;
    d.text=`${r.name} is failing, and they buy our wheat with money they will not have. Put rain on it before the ministry stops answering our calls.`; },
  check:(row,d)=>eng.state.ops.some(o=>o.owner==="player"&&o.cap==="Cloud Seeding"&&o.target===d.region&&o.t>d.issued)},
 {key:"price", title:"Move the wheat number", reward:16, window:5,
  tool:"🚱 WATERSHED or 🔥 FIRE — a competing exporter",
  text:"The board wants wheat above $108 before the fiscal year closes. It does not want to know how.",
  check:(row,d)=>row.price>=108&&eng.state.ops.some(o=>o.owner==="player"&&o.sig>0&&o.t>d.issued)},
 {key:"flag", title:"Show the flag", reward:14, window:5,
  tool:"🌊 OCEAN THERMAL, ✈ AEROSOL, or larger",
  text:"Appropriations season. The committee funds programmes that do things. Do something they can see from a satellite.",
  check:(row,d)=>eng.state.ops.some(o=>o.owner==="player"&&o.sig>=7&&o.t>d.issued)},
 {key:"hold", title:"Hold the line", reward:12, window:4, goal:true,
  tool:"🛡 ADAPTATION or ☁ CLOUD SEEDING — homeland",
  text:"Four seasons. The homeland harvest does not drop below 94%. The Secretary has said as much on television.",
  check:(row,d)=>{ const h=REG.findIndex(r=>r.homeland);
    return eng.state.rows.slice(d.issued).every(r=>r.yields[h]>=94); },
  fail:(row,d)=>{ const h=REG.findIndex(r=>r.homeland); return row.yields[h]<94; }},
];
function clientInNeed(row){
  let best=null;
  REG.forEach((r,ri)=>{ if(r.kind||r.homeland||r.name==="Black Sea Steppe") return;
    if(row.anomalies[ri]<eng.assumptions.dryThreshold&&(!best||row.anomalies[ri]<best.a)) best={name:r.name,a:row.anomalies[ri]}; });
  return best;
}
let dirIdx=0, dirIssued=0, pendingGrant=0, pendingClaw=0;
let standing=null, standingCount=0, nextStandingT=99, lapses=0, lastStandingKey=null;
function curDir(){ return DIRECTIVES[dirIdx]||standing; }
function dirActive(d){ return d && !(d.from && t<d.from); }
function issueStanding(row){
  const rot=["price","flag","hold"];
  // never the same demand twice running — the committee has a memory
  const ok=s=>s.key!==lastStandingKey;
  let src=STANDING.find(s=>s.key==="answer"&&ok(s)&&s.when(row))
       ||STANDING.find(s=>s.key==="client"&&ok(s)&&s.when(row))
       ||STANDING.find(s=>s.key===rot[standingCount%3]&&ok(s))
       ||STANDING.find(s=>s.key===rot[(standingCount+1)%3]);
  lastStandingKey=src.key;
  standing=Object.assign({},src,{issued:t, standing:true});
  if(standing.make) standing.make(row,standing);
  standingCount++;
  wire(`<span class="tag tagd">DIRECTIVE</span><b>${standing.title.toUpperCase()}</b> — ${standing.text}`,"op");
  sfxChime();
}
function directiveStep(row){
  const d=curDir();
  if(d){
    if(d.from && t<d.from){ /* drafting language */ }
    else{
      if(d.from && dirIssued<d.from && !d.standing) dirIssued=d.from;
      const issued=d.standing? d.issued : dirIssued;
      const left=d.window-(t-issued);
      const done=!d.goal && d.check(row,d);
      const broke=d.fail && d.fail(row,d);
      const due=left<=0;
      if(done || (due && d.goal && d.check(row,d))){
        wire(`<span class="tag tagd">DIRECTIVE COMPLETE</span><b>${d.title.toUpperCase()}</b> — +$${d.reward}M appropriated next quarter. The committee is pleased. For now.`,"op");
        pendingGrant+=d.reward; sfxChime(); advanceDir();
      } else if(broke || due){
        const claw=Math.round(d.reward/2); lapses++;
        wire(`<span class="tag" style="color:var(--red);border-color:var(--red)">DIRECTIVE LAPSED</span><b>${d.title.toUpperCase()}</b> — ${broke?"the line broke.":"the fuse ran out."} The committee withdraws $${claw}M from next quarter's appropriation. Minutes record “a directorate that does not deliver.”`,"att");
        pendingClaw+=claw; sfxAlert(); advanceDir();
      }
    }
  } else if(t>=nextStandingT) issueStanding(row);
  renderDirective();
}
function advanceDir(){
  if(DIRECTIVES[dirIdx]){ dirIdx++; dirIssued=t; }
  else standing=null;
  if(!DIRECTIVES[dirIdx]) nextStandingT=t+2;     // the committee drafts language
}
function earmarkLine(){
  if(!flagship) return "";
  const n=flagship.deadline-t;
  return `<div style="margin-top:5px;font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;color:${n<=1?"var(--red)":"var(--amber)"}">EARMARK: $${flagship.amount}M for a flagship demonstration — ENSO, IONOSPHERIC, or POLAR · ${n} season${n===1?"":"s"} left</div>`;
}
function renderDirective(){
  const d=curDir();
  if(!d || (d.from && t<d.from)){
    $("dirtext").innerHTML="The committee is drafting language. Continue operations."+earmarkLine();
    $("dirreward").textContent=""; return; }
  const issued=d.standing? d.issued : Math.max(dirIssued, d.from||0);
  const left=Math.max(0,d.window-(t-issued));
  $("dirtext").innerHTML=d.text+(d.tool?
    `<div style="margin-top:5px;font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;color:var(--green)">USE: ${d.tool}</div>`:"")
    +earmarkLine();
  $("dirreward").innerHTML=`+$${d.reward}M <span style="color:${left<=1?"var(--red)":"var(--ink-dim)"}">· ${left} season${left===1?"":"s"}</span>`;
}

/* Flagship earmark — twice a campaign the committee finds money in a
   classified line for one demonstration: ENSO, T3, or Polar. Three seasons,
   then it goes to the Navy. Funds the fantasy; the signature is still yours. */
const FLAGSHIP_CAPS=["ENSO Forcing","Ionospheric Coupling [T3]","Polar Destabilization"];
const FLAGSHIP_AT=[12,28], FLAGSHIP_AMOUNT=60, FLAGSHIP_FUSE=3;
let flagship=null;
function flagshipStep(row){
  if(flagship && t>flagship.deadline){
    wire(`<span class="tag" style="color:var(--amber);border-color:var(--amber)">EARMARK WITHDRAWN</span> $${flagship.amount}M returns to the classified line. The Navy sends its regards.`,"att");
    flagship=null; renderTray(); renderDirective();
  }
  if(!flagship && FLAGSHIP_AT.includes(t) && row.status==="running"){
    flagship={amount:FLAGSHIP_AMOUNT, issued:t, deadline:t+FLAGSHIP_FUSE};
    alertStrip("FLAGSHIP APPROPRIATION — $"+FLAGSHIP_AMOUNT+"M EARMARKED");
    wire(`<span class="tag tagd">EARMARK</span><b>FLAGSHIP APPROPRIATION</b> — the committee has found $${FLAGSHIP_AMOUNT}M in a classified line. It wants a demonstration: ENSO, Ionospheric, or Polar. ${FLAGSHIP_FUSE} seasons, then the money goes to the Navy.`,"op");
    sfxChime(); renderTray(); renderDirective();
  }
}

/* ------------------------------------------------------------- resolve */
const PHASES=["FORECAST","COMMITMENT","RESOLUTION","CONSEQUENCES","ATTRIBUTION"];
async function phaseShow(i){ $("phasename").textContent=PHASES[i];
  if(!(reduced||replaying)) await new Promise(r=>setTimeout(r, brisk? (i===0?20:110) : (i===0?60:360))); }
let brisk=false;                 // the seasons inside a review pass quickly; the last one lingers

/* Directives — the committee teaches you your own job (onboarding), then
   keeps demanding. Every directive has a fuse: complete it for the reward,
   let it lapse and the committee claws back half. Sequential; rewards are
   appropriated next season via cmd.grant, clawbacks via cmd.clawback. */
/* Fuses are counted in REVIEWS (a year, a half-year, a season — whatever
   the era's cadence is). Directives that need a capability the century has
   not produced yet wait for their year (fromYear); the committee fills the
   gap with standing demands. */
const DIRECTIVES=[
 {title:"Prove the concept", reward:8, window:2, tool:"☁ CLOUD SEEDING — any region",
  text:"Put rain somewhere. Anywhere. Schenectady wants photographs for the appropriations hearing.",
  check:(row)=>eng.state.ops.some(o=>o.owner==="player"&&o.cap==="Cloud Seeding")},
 {title:"Stabilize a drought", reward:12, window:3, tool:"☁ CLOUD SEEDING — a strained or failing harvest (amber/red marker)",
  when:(row)=>row && REG.some((r,ri)=>!r.kind && isOnline(ri) && row.yields[ri]<90),   // the committee waits for a real drought
  text:"Find the driest region on the board and seed it. A fed market is a buying market — and a grateful one.",
  check:(row)=>row.landed.some(e=>e.owner==="player"&&e.first&&e.cap==="Cloud Seeding"&&(()=>{
    const ri=REG.findIndex(r=>r.name===e.target);
    const pr=eng.state.rows[t-2];
    return ri>=0&&pr&&pr.yields[ri]<90;})())},
 {title:"Harden the homeland", reward:10, window:2, tool:"🛡 ADAPTATION INVESTMENT — your homeland (green ring)",
  text:"The committee funds what it can tour. Reservoirs and seed banks photograph well. Invest in Adaptation at home.",
  check:()=>eng.state.ops.some(o=>o.owner==="player"&&o.cap==="Adaptation Investment"&&o.target===REG.find(r=>r.homeland).name)},
 {title:"Read the wiring", reward:10, window:2, fromYear:1950, needs:["Climate Research"], tool:"🔬 CLIMATE RESEARCH — a region whose weather you do not understand",
  text:"Your analysts can see a fifth of how the world is wired. The committee has funded a room of them. Point it somewhere.",
  check:()=>eng.state.ops.some(o=>o.owner==="player"&&o.research)},
 {title:"Move a market", reward:24, window:3, fromYear:1966, needs:["Watershed Interference"], standable:true, tool:"🚱 WATERSHED INTERFERENCE — a wheat exporter (Black Sea, Australia, the Plata)",
  text:"Make the weather move a price. Stand the watershed wing up if it is not, and put it on an exporter. The board is watching the wheat number, and your positioning.",
  check:(row)=>row.price>=107&&eng.state.ops.some(o=>o.owner==="player"&&o.sig>0&&o.t+o.lag>=t-2&&o.t+o.lag<=t)},
 {title:"Stay invisible", reward:15, window:3, tool:"CONTAINMENT BUDGET — the slider under ATTRIBUTION",
  text:"Operations are landing and the ladder has not moved. Keep the dossier quiet — that is the craft, not the storm.",
  check:(row)=>row.dossier<40&&eng.state.ops.filter(o=>o.owner==="player"&&o.sig>0&&o.t+o.lag<=t).length>=3},
 {title:"Move the ocean, not the country", reward:30, window:3, fromYear:1975, needs:["Ocean Thermal Forcing"], standable:true, tool:"🌊 OCEAN THERMAL — the Atlantic",
  text:"Stop pushing countries. Push the sea that pushes them. The ships exist now; stand the wing up and commit an ocean operation.",
  check:()=>eng.state.ops.some(o=>o.owner==="player"&&o.type==="DRIVER")},
 {title:"Answer them", reward:30, window:3, fromYear:1978, needs:["Watershed Interference","Fire Enablement"], tool:"🚱 WATERSHED or 🔥 FIRE — Black Sea Steppe",
  text:"Counterintelligence is certain enough: the Eastern Program is real and it is working our watershed. The Steppe grows wheat too. Answer them — quietly or otherwise.",
  check:(row,d)=>eng.state.ops.some(o=>o.owner==="player"&&o.t>=(d.issuedT||0)&&o.sig>0&&o.target==="Black Sea Steppe")},
];
/* Standing directives — after onboarding the committee writes its own,
   from the state of the board. Deterministic choice: an unanswered attack
   first, a failing client second, then a rotation of demands. */
let lastHostileT=-99;                 // last season the homeland was worked by a rival
const STANDING=[
 {key:"answer", when:()=>lastHostileT>=t-3, needs:["Watershed Interference","Fire Enablement","Ionospheric Coupling [T3]"], title:"Answer the Steppe", reward:18, window:2,
  tool:"🚱 WATERSHED, 🔥 FIRE, or ⚡ IONOSPHERIC — Black Sea Steppe",
  text:"They worked our watershed again. The committee wants a reply on the Steppe before the next hearing — it does not care what kind.",
  check:(row,d)=>eng.state.ops.some(o=>o.owner==="player"&&o.sig>0&&o.target==="Black Sea Steppe"&&o.t>d.issued)},
 {key:"client", when:(row)=>clientInNeed(row)!==null, title:"Protect the client", reward:10, window:2,
  make:(row,d)=>{ const r=clientInNeed(row); d.region=r.name;
    d.tool=`☁ CLOUD SEEDING — ${r.name}`;
    d.text=`${r.name} is failing, and they buy our wheat with money they will not have. Put rain on it before the ministry stops answering our calls.`; },
  check:(row,d)=>eng.state.ops.some(o=>o.owner==="player"&&o.cap==="Cloud Seeding"&&o.target===d.region&&o.t>d.issued)},
 {key:"price", needs:["Watershed Interference","Fire Enablement"], title:"Move the wheat number", reward:16, window:2,
  tool:"🚱 WATERSHED or 🔥 FIRE — a competing exporter",
  text:"The board wants wheat above $108 before the fiscal year closes. It does not want to know how.",
  check:(row,d)=>row.price>=108&&eng.state.ops.some(o=>o.owner==="player"&&o.sig>0&&o.t>d.issued)},
 {key:"flag", needs:CAPS.filter(c=>c.sig>=7).map(c=>c.name), title:"Show the flag", reward:30, window:2,
  tool:"🌊 OCEAN THERMAL, ✈ AEROSOL, or larger",
  text:"Appropriations season. The committee funds programmes that do things. Do something they can see from a satellite.",
  check:(row,d)=>eng.state.ops.some(o=>o.owner==="player"&&o.sig>=7&&o.t>d.issued)},
 {key:"map", needs:["Climate Research"], title:"Map the world", reward:12, window:2,
  tool:"🔬 CLIMATE RESEARCH — regions whose seasons you cannot explain",
  text:"Two wires. The committee has read the analysts' estimate of how much of the world we understand, and did not enjoy it.",
  check:(row,d)=>eng.state.rows.slice(d.issued).reduce((n,r)=>n+(r.revealed||[]).filter(x=>x.how!=="exhausted").length,0)>=2},
 {key:"relief", title:"Put rain on it", reward:9, window:2,
  tool:"☁ CLOUD SEEDING — the driest region on the board",
  text:"The committee funds programmes that do things. Find the driest harvest on the board and put rain on it — photographs for the hearing, and a market that remembers who fed it.",
  check:(row,d)=>eng.state.ops.some(o=>o.owner==="player"&&o.cap==="Cloud Seeding"&&o.t>d.issued)},
 {key:"hold", title:"Hold the line", reward:12, window:2, goal:true,
  tool:"🛡 ADAPTATION or ☁ CLOUD SEEDING — homeland",
  text:"Four seasons. The homeland harvest does not drop below 94%. The Secretary has said as much on television.",
  check:(row,d)=>{ const h=REG.findIndex(r=>r.homeland);
    return eng.state.rows.slice(d.issued).every(r=>r.yields[h]>=94); },
  fail:(row,d)=>{ const h=REG.findIndex(r=>r.homeland); return row.yields[h]<94; }},
];
function clientInNeed(row){
  let best=null;
  REG.forEach((r,ri)=>{ if(r.kind||r.homeland||r.name==="Black Sea Steppe"||!isOnline(ri)) return;
    if(row.anomalies[ri]<eng.assumptions.dryThreshold&&(!best||row.anomalies[ri]<best.a)) best={name:r.name,a:row.anomalies[ri]}; });
  return best;
}
let dirIdx=0, dirIssued=0, dirIssuedRv=0, pendingGrant=0, pendingClaw=0;
let standing=null, standingCount=0, nextStandingRv=99, lapses=0, lastStandingKey=null;
/* The committee never asks for what the programme cannot fly: a directive
   needs its year AND one of its wings online (or, for the onboarding asks
   that say "stand the wing up", a wing the chest could stand up). */
const ICON={"Watershed Interference":"🚱 WATERSHED","Fire Enablement":"🔥 FIRE","Ionospheric Coupling [T3]":"⚡ IONOSPHERIC","Ocean Thermal Forcing":"🌊 OCEAN THERMAL","Stratospheric Aerosol Inj.":"✈ AEROSOL","ENSO Forcing":"🌀 ENSO FORCING","Polar Destabilization":"❄ POLAR","Climate Research":"🔬 CLIMATE RESEARCH","Cloud Seeding":"☁ CLOUD SEEDING","Adaptation Investment":"🛡 ADAPTATION"};
function wingUsable(name, standable){ const ws=eng.eras? eng.wingStatus(name) : null; return !ws || ws.online || (standable && ws.canStand); }
function needsMet(d){ return !d.needs || d.needs.some(n=>wingUsable(n, d.standable)); }
function gated(d){ return !!(d && ((d.fromYear && curYear()<d.fromYear) || !needsMet(d) || (!d.standing && d.when && !d.when(lastRow())))); }
function useLine(d){                       // the USE line names only wings you can actually fly
  if(!d.needs) return d.tool||"";
  const have=d.needs.filter(n=>wingUsable(n, d.standable)).map(n=>ICON[n]||n.toUpperCase());
  const where=(d.tool||"").split("—").slice(1).join("—").trim();
  return (have.length? have.join(", ") : (d.tool||"").split("—")[0].trim())+(where? " — "+where : "");
}
function curDir(){ const d=DIRECTIVES[dirIdx]; return (d && !gated(d))? d : (standing||d||null); }
function onboardingGated(){ return gated(DIRECTIVES[dirIdx]); }
function dirActive(d){ return d && !gated(d); }
function issueStanding(row){
  const rot=["price","flag","map","relief","hold"];
  // never the same demand twice running — the committee has a memory
  const ok=s=>s.key!==lastStandingKey && needsMet(s);
  let src=STANDING.find(s=>s.key==="answer"&&ok(s)&&s.when(row))
       ||STANDING.find(s=>s.key==="client"&&ok(s)&&s.when(row))
       ||STANDING.find(s=>s.key===rot[standingCount%rot.length]&&ok(s)&&(!s.when||s.when(row)))
       ||STANDING.find(s=>s.key===rot[(standingCount+1)%rot.length]&&ok(s)&&(!s.when||s.when(row)))
       ||STANDING.find(s=>s.key===rot[(standingCount+2)%rot.length]&&ok(s)&&(!s.when||s.when(row)))
       ||STANDING.find(s=>s.key==="relief"&&ok(s))
       ||STANDING.find(s=>s.key==="hold");
  lastStandingKey=src.key;
  standing=Object.assign({},src,{issued:t, issuedT:t, issuedRv:rv, standing:true});
  if(standing.make) standing.make(row,standing);
  if(rot.includes(src.key)) standingCount++;
  wire(`<span class="tag tagd">DIRECTIVE</span><b>${standing.title.toUpperCase()}</b> — ${standing.text}`,"op");
  sfxChime();
}
function directiveStep(row){
  const d=curDir();
  if(d){
    if(gated(d)){ /* drafting language */ }
    else{
      if(!d.standing && d.fromYear && d.issuedT===undefined){ d.issuedT=t; dirIssued=t; dirIssuedRv=rv; }   // the year arrived: the fuse starts now
      if(!d.standing && d.issuedT===undefined) d.issuedT=dirIssued;
      const issuedRv=d.standing? d.issuedRv : dirIssuedRv;
      const left=d.window-(rv-issuedRv);
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
  } else if(rv>=nextStandingRv && t<eng.seasons-4 && isReviewStart(t)) issueStanding(row);
  if(onboardingGated() && !standing && rv>=nextStandingRv && t<eng.seasons-4 && isReviewStart(t)) issueStanding(row);   // the committee does not wait for the year
  renderDirective();
}
function advanceDir(){
  const d=DIRECTIVES[dirIdx];
  if(d && !d.standing && curDir()===d){ dirIdx++; dirIssued=t; dirIssuedRv=rv; }
  else standing=null;
  if(!DIRECTIVES[dirIdx] || onboardingGated()) nextStandingRv=rv+1;     // the committee drafts language for a review
}
function earmarkLine(){
  if(!flagship) return "";
  const n=flagship.issuedRv+FLAGSHIP_FUSE-rv;
  return `<div style="margin-top:5px;font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;color:${n<=1?"var(--red)":"var(--amber)"}">EARMARK: $${flagship.amount}M for ${flagship.ask} · ${n} review${n===1?"":"s"} left</div>`;
}
function renderDirective(){
  const d=curDir();
  if(!d || gated(d)){
    $("dirtext").innerHTML="The committee is drafting language. Continue operations."+earmarkLine();
    $("dirreward").textContent=""; return; }
  const issuedRv=d.standing? d.issuedRv : dirIssuedRv;
  const left=Math.max(0,d.window-(rv-issuedRv));
  $("dirtext").innerHTML=d.text+(d.tool?
    `<div style="margin-top:5px;font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;color:var(--green)">USE: ${useLine(d)}</div>`:"")
    +earmarkLine();
  $("dirreward").innerHTML=`+$${d.reward}M <span style="color:${left<=1?"var(--red)":"var(--ink-dim)"}">· ${left} review${left===1?"":"s"}</span>`;
}

/* Flagship earmark — twice a campaign the committee finds money in a
   classified line for one demonstration: ENSO, T3, or Polar. Three seasons,
   then it goes to the Navy. Funds the fantasy; the signature is still yours. */
const FLAGSHIP_CAPS=["ENSO Forcing","Ionospheric Coupling [T3]","Polar Destabilization"];
/* The committee funds the fantasy when the century makes it possible: an
   earmark arrives with each new tier of capability. It stands the wing up
   whether or not the chest could — the demonstration is the point. */
const EARMARKS=[
 {year:1984, amount:40, caps:["Stratospheric Aerosol Inj."], ask:"a stratospheric demonstration — AEROSOL", line:"El Chichón proved the sky can be veiled. The committee wants ours."},
 {year:1995, amount:60, caps:FLAGSHIP_CAPS, ask:"a flagship demonstration — ENSO", line:"The Pacific is understood well enough to be pushed. The committee wants to watch it move."},
 {year:2015, amount:60, caps:FLAGSHIP_CAPS, ask:"a flagship demonstration — ENSO, IONOSPHERIC, or POLAR", line:"The Arctic is open and the heater is warm. Something the committee can see from orbit."},
 {year:2035, amount:80, caps:FLAGSHIP_CAPS, ask:"a flagship demonstration — ENSO, IONOSPHERIC, or POLAR", line:"The world is louder than it was. The committee wants the programme to be louder than the world."},
];
const FLAGSHIP_FUSE=3;
let flagship=null; const earmarksOffered=new Set();
function flagshipStep(row){
  // wings the earmark stood up stand down with it if the demonstration never flew
  if(flagship) for(const w of (row.wingEvents||[])) if(w.what==="online"&&w.why==="earmark") (flagship.stood||(flagship.stood=[])).push(w.cap);
  if(flagship && rv-flagship.issuedRv>=FLAGSHIP_FUSE){
    wire(`<span class="tag" style="color:var(--amber);border-color:var(--amber)">EARMARK WITHDRAWN</span> $${flagship.amount}M returns to the classified line. The Navy sends its regards.${(flagship.stood||[]).length?" The wing it stood up goes back to the desert.":""}`,"att");
    for(const c of (flagship.stood||[])) if(!wingOrders.standup.includes(c)&&!wingOrders.mothball.includes(c)) wingOrders.mothball.push(c);
    flagship=null; renderTray(); renderDirective();
  }
  if(!flagship && row.status==="running") for(const em of EARMARKS){
    if(earmarksOffered.has(em.year) || row.year<em.year) continue;
    earmarksOffered.add(em.year);
    flagship={amount:em.amount, caps:em.caps, ask:em.ask, issued:t, issuedRv:rv};
    alertStrip("FLAGSHIP APPROPRIATION — $"+em.amount+"M EARMARKED");
    wire(`<span class="tag tagd">EARMARK</span><b>FLAGSHIP APPROPRIATION</b> — ${em.line} $${em.amount}M in a classified line for ${em.ask}. ${FLAGSHIP_FUSE} reviews, then the money goes to the Navy.`);
    sfxChime(); renderTray(); renderDirective(); break;
  }
}

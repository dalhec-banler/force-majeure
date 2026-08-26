/* ------------------------------------------------------------ tool tray */
const DESC={
  "Climate Research":"instruments, ship logs, a room of analysts — learn one hidden wire into a region: which ocean moves its weather, and how long it takes",
  "Cloud Seeding":"silver-iodide flights wring rain from passing clouds",
  "Watershed Interference":"dams, diversions, quiet sabotage — a region's water goes missing",
  "Fire Enablement":"fuel, access roads, delayed ignition — a fire waiting for lightning",
  "Adaptation Investment":"reservoirs, seed banks, hardened farms at home",
  "Ocean Thermal Forcing":"ships stir warm water into the Atlantic conveyor",
  "Stratospheric Aerosol Inj.":"high-altitude flights veil the sky; the planet cools",
  "ENSO Forcing":"tips the Pacific into an artificial El Niño — the world's weather leans with it",
  "Ionospheric Coupling [T3]":"the directed-energy option — seismic coupling, no meteorological cause. It cannot be denied",
  "Polar Destabilization":"breaks the polar ice — the melt feeds the planet's fever, and everyone pays",
};
/* the briefing card: what a tool is, what it does, and what it costs you */
const BRIEF={
  "Cloud Seeding":"Silver-iodide flights wring rain out of passing cloud. Relief for a dry client — or cover for the next thing you do. Nobody investigates rain.",
  "Watershed Interference":"Dams, diversions, quiet sabotage. The region's water goes missing and stays missing. Moves a harvest, then a price. Repeat strikes on the same target compound the evidence.",
  "Fire Enablement":"Fuel, access roads, delayed ignition — a fire waiting for lightning that was coming anyway. <b>Wants the target already dry</b>; on wet ground you get a fraction. Visible from orbit.",
  "Adaptation Investment":"Reservoirs, seed banks, hardened farms. Permanent resilience for the region — the homeland especially. Invisible, and the committee loves a ribbon-cutting.",
  "Ocean Thermal Forcing":"Ships stir warm water into the Atlantic conveyor. Reaches every region wired to the Atlantic, each by its own delay — <b>arm it and the wires light up</b>. The energy you move surfaces in the Indian Ocean later. The ledger always settles.",
  "Stratospheric Aerosol Inj.":"High-altitude flights veil the sky. The whole board pays, each region by its own delay, for a year. Strange sunsets worldwide, and a signature to match. What you veil in the stratosphere comes out of the Atlantic later.",
  "ENSO Forcing":"Tips the Pacific into an artificial El Niño and the world's weather leans with it: Australia, Indonesia, India dry; Peru, the Plata, East Africa wet — through whichever wires you know. A flagship. The board notices flagships.",
  "Ionospheric Coupling [T3]":"The directed-energy option: seismic coupling with no meteorological cause. Instant, and it cannot be denied. A coastal hub means a tsunami. <b>The day you use it, the geological record stops being canon</b> — every quake after is suspect, including the ones you did not cause.",
  "Climate Research":"Instruments, ship logs, a room of analysts pointed at one region. Next season the strongest hidden wire into it is on the board: which ocean moves its weather, and how long it takes. <b>Arm it and the unknown wires show as dotted stubs.</b> The committee counts research as output.",
  "Polar Destabilization":"Breaks the polar ice. Icebreakers north; the melt feeds global stress for a year and every coast pays later. Loud. The kind of thing the archive opens with.",
};
function toolCard(c){
  const reach=c.type==="DRIVER"? (()=>{ const di=DRV.indexOf(c.fixedTarget); if(di<0) return "";
      const n=eng.knowledge.edges.filter(e=>e.di===di).length, k=eng.knowledge.edges.filter(e=>e.di===di&&eng.knowledge.isKnown(e.di,e.ri)).length;
      return `<i>reaches ${n} regions · ${k} wires known</i>`; })() : "";
  const lr=lastRow(), sm=lr&&lr.scrutinyMult? lr.scrutinyMult : 1;
  const eyes=sm>=3? " · every eye on us" : sm>=2.5? " · under investigation" : sm>=2.2? " · under study" : sm>=1.8? " · under scrutiny" : "";
  const sig=(c.sig>=20? "loud — the ladder moves" : c.sig>=10? "leaves a signature" : c.sig>0? "quiet" : "invisible")+(c.sig>0?eyes:"");
  const when=c.lag===0? "acts this season" : `lands in ${c.lag} season${c.lag===1?"":"s"}`;
  const burn=c.dur&&c.dur>1? ` · burns ${c.dur} seasons` : "";
  return `<div class="tc-h">${(TOOLICON[c.name]||"")+" "+c.name.replace(" [T3]","").toUpperCase()}<span>$${c.cost}M${flagship&&FLAGSHIP_CAPS.includes(c.name)?" · FUNDED":""}</span></div>
    ${BRIEF[c.name]||DESC[c.name]||""}
    <div class="tc-f"><i>${when}${burn}</i><i>${sig}</i>${c.needsDrought?"<i>wants drought</i>":""}${c.resil?"<i>permanent</i>":""}${reach}${wingLine(c)}</div>`;
}
function showToolCard(c){ const el=$("toolcard"); el.innerHTML=toolCard(c); el.style.display="block"; }
function hideToolCard(){ $("toolcard").style.display="none"; }
function capInfo(c){
  if(c.research) return `${DESC[c.name]} · $${c.cost}M · the strongest unknown wire is on the board next season · invisible`;
  const bits=[DESC[c.name]||"", `$${c.cost}M`,c.lag===0? "acts this season" : `lands in ${c.lag} season${c.lag===1?"":"s"}`,
    c.sig>=20? "loud signature" : c.sig>=10? "leaves a signature" : c.sig>0? "quiet" : "invisible"];
  if(c.type==="DRIVER") bits.push(`works through the ${c.fixedTarget} system`);
  if(typeof c.dispTo==="string") bits.push("what you move surfaces elsewhere, later");
  if(c.needsDrought) bits.push("wants the target already dry");
  if(c.resil>0) bits.push("hardens a region, permanently");
  return bits.join(" · ");
}
/* The century's arsenal: why a wing is not yet possible, in the fiction */
const WHEN={
 "Climate Research":"The instruments do not exist yet. The committee funds a room of analysts from 1950; the International Geophysical Year is 1957.",
 "Watershed Interference":"Nobody has moved a watershed yet. Stormfury flies from 1962; the wing is possible from then.",
 "Fire Enablement":"Enablement needs the drying technique and the aircraft to deliver it. 1966.",
 "Ocean Thermal Forcing":"The ships and the theory come together on the eve of ENMOD. 1972.",
 "Stratospheric Aerosol Inj.":"Budyko wrote it down in 1974. The wing is possible from 1980.",
 "ENSO Forcing":"The Pacific is not understood until the 1982–83 Niño has been studied. 1990.",
 "Ionospheric Coupling [T3]":"The ionospheric heater is a 1990s machine. 1996.",
 "Polar Destabilization":"The Arctic is not open enough to work until the 2010s. 2014.",
};
function wingLine(c){
  const ws=eng.eras? eng.wingStatus(c.name) : null; if(!ws) return "";
  if(ws.online) return ws.upkeep? `<i>wing online · upkeep $${ws.upkeep}M/season</i>` : "";
  if(!ws.eligible) return `<i>arrives ${ws.from}</i>`;
  return `<i>${ws.canStand? "the wing can stand up" : `needs $${Math.round(ws.need)}M in the chest`} · upkeep $${ws.upkeep}M/season</i>`;
}
function buildTray(){
  const bar=$("toolbar"); bar.innerHTML="";
  for(const c of CAPS){
    if(c.type==="NONE") continue;
    const b=document.createElement("button");
    b.className="tool"; b.dataset.cap=c.name;
    b.innerHTML=`<span class="ic">${TOOLICON[c.name]||"◈"}</span>
      <span class="nm">${c.name.replace(" [T3]","")}</span>
      <span class="pr">$${c.cost}M</span><span class="mb" title="stand this wing down (mothball)">⏏</span>`;
    b.addEventListener("click",()=>toolClick(c));
    const mb=b.querySelector? b.querySelector(".mb") : null;
    if(mb) mb.addEventListener("click",(ev)=>{ ev.stopPropagation(); if(!running||resolving) return;
      const i=wingOrders.mothball.indexOf(c.name);
      if(i>=0){ wingOrders.mothball.splice(i,1); $("toolinfo").textContent=`${c.name} — the wing stays.`; }
      else { wingOrders.mothball.push(c.name); $("toolinfo").innerHTML=`<b>${c.name.replace(" [T3]","").toUpperCase()} WING</b> stands down at the next review — no upkeep, no capability. It reopens at three-quarters of the chest. Click ⏏ again to keep it.`; }
      sfxClick(); renderTray(); });
    b.addEventListener("mouseenter",()=>showToolCard(c));
    b.addEventListener("focus",()=>showToolCard(c));
    b.addEventListener("mouseleave",hideToolCard);
    b.addEventListener("blur",hideToolCard);
    bar.appendChild(b);
  }
}
function budgetRefuse(c){                 // true if the purse says no (and says why)
  if(canAfford(c)) return false;
  alertStrip(`NOT IN THE BUDGET — ${c.name.replace(" [T3]","").toUpperCase()} NEEDS $${capCost(c.name)}M, $${fmt(available(),0)}M LEFT`);
  if(spendable()<6)
    $("toolinfo").innerHTML = `<span style="color:var(--red)">Nothing is in the budget.</span> Overhead is $${eng.assumptions.overhead}M a season. Wait for the committee — or for the world to frighten it.`;
  else
    $("toolinfo").innerHTML = `<span style="color:var(--red)">Not in the budget</span> — $${capCost(c.name)}M needed, $${fmt(available(),0)}M left${armedCost()?" after what is already armed":""} (the $${eng.assumptions.overhead}M overhead is reserved).`;
  sfxAlert(); renderTray(); return true;
}
function toolClick(c){
  if(!running || resolving) return;
  if(pendingTool===c.name){ pendingTool=null; renderTray();
    $("toolinfo").textContent="Pick a tool. Aim it at the world. Scroll to zoom."; return; }
  const ws=eng.eras? eng.wingStatus(c.name) : null;
  if(ws && !ws.online){                        // a wing that is not flying
    const i=wingOrders.standup.indexOf(c.name);
    if(i>=0){ wingOrders.standup.splice(i,1); renderTray(); sfxClick(); $("toolinfo").textContent=`${c.name} — the order is withdrawn.`; return; }
    if(!ws.eligible){ $("toolinfo").innerHTML=`<span style="color:var(--amber)">${c.name.replace(" [T3]","")}</span> — not yet. ${WHEN[c.name]||`This capability arrives in ${ws.from}.`}`; sfxAlert(); return; }
    if(!ws.canStand){ $("toolinfo").innerHTML=`<span style="color:var(--amber)">${c.name.replace(" [T3]","")}</span> — the committee stands a wing up when the programme can carry it: <b>$${Math.round(ws.need)}M in the chest</b> (you hold $${fmt(funds(),0)}M). Build the chest. Upkeep is $${ws.upkeep}M a season once it flies.`; sfxAlert(); return; }
    wingOrders.standup.push(c.name); renderTray(); sfxChime();
    $("toolinfo").innerHTML=`<b>${c.name.replace(" [T3]","").toUpperCase()} WING</b> stands up at the next review — $${ws.upkeep}M a season for as long as you keep it. Click again to withdraw the order.`; return;
  }
  if(budgetRefuse(c)) return;
  if(false){
  }
  if(c.type==="DRIVER"){                       // aims itself at the ocean
    slots.push({cap:c.name, target:null});
    pendingTool=null; clampContainment(); renderTray();
    $("toolinfo").textContent=`${c.name} armed — ${capInfo(c)}`;
  } else {
    pendingTool = c.name;                      // stays lit until you run the season
    renderTray();
    $("toolinfo").textContent=`${c.name} — click regions to target; click the tool again to put it down · ${capInfo(c)}`;
  }
}
function renderTray(){
  $("globe").classList.toggle("aiming", !!pendingTool);
  for(const b of $("toolbar").children){
    const cap=b.dataset.cap, c=CAPS.find(x=>x.name===cap);
    b.classList.toggle("sel", cap===pendingTool);
    b.classList.remove("off");
    const funded=!!flagship && (flagship.caps||FLAGSHIP_CAPS).includes(cap);
    const ws=eng.eras? eng.wingStatus(cap) : null;
    const ordered=wingOrders.standup.includes(cap), moth=wingOrders.mothball.includes(cap);
    const locked=!!ws && !ws.online;
    b.classList.toggle("locked", locked && !ordered);
    b.classList.toggle("ordered", ordered||moth);
    b.classList.toggle("wing", !!ws && ws.online && ws.upkeep>0);
    b.classList.toggle("funded", funded && !locked);
    b.classList.toggle("poor", !locked && !canAfford(c) && cap!==pendingTool);
    const pr=b.querySelector(".pr");
    if(pr) pr.textContent = ordered? "STANDING UP" : moth? "STANDING DOWN"
      : locked? (ws.eligible? (ws.canStand? "STAND UP" : "CHEST $"+Math.round(ws.need)+"M") : String(ws.from))
      : (funded? "FUNDED" : "$"+c.cost+"M");
  }
  renderTab();
  $("armed").innerHTML = slots.map((s,i)=>
    `<span class="pill">${s.cap.toUpperCase()}${s.target? " · "+s.target:""}
     <button data-i="${i}" aria-label="cancel">✕</button></span>`).join("");
  for(const x of $("armed").querySelectorAll("button"))
    x.addEventListener("click",()=>{ slots.splice(+x.dataset.i,1); clampContainment(); renderTray(); });
}


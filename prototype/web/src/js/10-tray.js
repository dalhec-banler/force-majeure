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
  const sig=c.sig>=20? "loud — the ladder moves" : c.sig>=10? "leaves a signature" : c.sig>0? "quiet" : "invisible";
  const when=c.lag===0? "acts this season" : `lands in ${c.lag} season${c.lag===1?"":"s"}`;
  const burn=c.dur&&c.dur>1? ` · burns ${c.dur} seasons` : "";
  return `<div class="tc-h">${(TOOLICON[c.name]||"")+" "+c.name.replace(" [T3]","").toUpperCase()}<span>$${c.cost}M${flagship&&FLAGSHIP_CAPS.includes(c.name)?" · FUNDED":""}</span></div>
    ${BRIEF[c.name]||DESC[c.name]||""}
    <div class="tc-f"><i>${when}${burn}</i><i>${sig}</i>${c.needsDrought?"<i>wants drought</i>":""}${c.resil?"<i>permanent</i>":""}${reach}</div>`;
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
function buildTray(){
  const bar=$("toolbar"); bar.innerHTML="";
  for(const c of CAPS){
    if(c.type==="NONE") continue;
    const b=document.createElement("button");
    b.className="tool"; b.dataset.cap=c.name;
    b.innerHTML=`<span class="ic">${TOOLICON[c.name]||"◈"}</span>
      <span class="nm">${c.name.replace(" [T3]","")}</span>
      <span class="pr">$${c.cost}M</span>`;
    b.addEventListener("click",()=>toolClick(c));
    b.addEventListener("mouseenter",()=>showToolCard(c));
    b.addEventListener("focus",()=>showToolCard(c));
    b.addEventListener("mouseleave",hideToolCard);
    b.addEventListener("blur",hideToolCard);
    bar.appendChild(b);
  }
}
function budgetRefuse(c){                 // true if the purse says no (and says why)
  if(canAfford(c)) return false;
  if(spendable()<6)
    $("toolinfo").innerHTML = `<span style="color:var(--red)">Nothing is in the budget.</span> Overhead is $${eng.assumptions.overhead}M a season. Wait for the committee — or for the world to frighten it.`;
  else
    $("toolinfo").innerHTML = `<span style="color:var(--red)">Not in the budget</span> — $${capCost(c.name)}M needed, $${fmt(available(),0)}M left${armedCost()?" after what is already armed":""} (the $${eng.assumptions.overhead}M overhead is reserved).`;
  sfxAlert(); renderTray(); return true;
}
function toolClick(c){
  if(!running) return;
  if(pendingTool===c.name){ pendingTool=null; renderTray();
    $("toolinfo").textContent="Pick a tool. Aim it at the world. Scroll to zoom."; return; }
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
    b.classList.toggle("sel", b.dataset.cap===pendingTool);
    b.classList.remove("off");
    const funded=!!flagship && FLAGSHIP_CAPS.includes(b.dataset.cap);
    b.classList.toggle("funded", funded);
    b.classList.toggle("poor", !canAfford(CAPS.find(c=>c.name===b.dataset.cap)) && b.dataset.cap!==pendingTool);
    const pr=b.querySelector(".pr"); if(pr) pr.textContent=funded? "FUNDED" : "$"+CAPS.find(c=>c.name===b.dataset.cap).cost+"M";
  }
  renderTab();
  $("armed").innerHTML = slots.map((s,i)=>
    `<span class="pill">${s.cap.toUpperCase()}${s.target? " · "+s.target:""}
     <button data-i="${i}" aria-label="cancel">✕</button></span>`).join("");
  for(const x of $("armed").querySelectorAll("button"))
    x.addEventListener("click",()=>{ slots.splice(+x.dataset.i,1); clampContainment(); renderTray(); });
}


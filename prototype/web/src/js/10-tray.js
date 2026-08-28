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
  "Hurricane Steering":"nudges a storm the record already made onto a coast you choose",
  "Engineered Bloom":"seeds the ocean — the only thing you have that cools the whole century",
  "Marine Cloud Brightening":"brightens the marine cloud over one coast: cheap, brief, almost invisible",
  "Orbital Mirror":"steals the sunlight from one region, this season, with no weather to blame",
  "Engineered Biology":"puts something in the seed stock; the weather stops mattering there",
  "The AMOC Lever":"stops the Atlantic conveyor. Once. There is no second one.",
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
  "Hurricane Steering":"Seeding flights into the eyewall of a storm the record already produced. You do not make the hurricane — you decide whose coast it crosses. <b>Instant</b>, and the Atlantic gives the energy back in three seasons. The wire will name the storm; nobody will name you.",
  "Engineered Bloom":"Iron dust across a dead stretch of ocean; the bloom follows, and the drawdown with it. <b>The only tool that lowers the planet's stress instead of raising it</b> — every harvest on the board gets easier for a year. Nearly invisible. The dead water surfaces in the Indian Ocean later, and the monsoon notices.",
  "Marine Cloud Brightening":"Spray vessels thicken the cloud over one coast. Cool and wet, this season, for a year — small, cheap, and so quiet the ladder does not move. What the craft looks like once you have stopped needing to be loud.",
  "Orbital Mirror":"A constellation turns its face. Sunlight leaves one region and does not come back this season. <b>No lag and no meteorology to hide behind</b> — the anomaly appears with nothing in the record to explain it, and the file knows it.",
  "Engineered Biology":"A rust in the seed stock, released at sowing. <b>It does not care what the weather does next</b> — it persists for years, decaying slowly, and no rainfall record will ever account for the loss. What the analysts call an agronomic event.",
  "The AMOC Lever":"Freshwater at the sinking points until the Atlantic conveyor stops. Hemisphere-scale, permanent, and <b>you may do it once</b>. Requires everything you have ever built: the ocean wing, the Pacific wing, the polar wing. The archive will open with this.",
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
function whereToPoint(c){                  // the targets this tool still has room in
  const on=(ri)=>isOnline(ri);
  if(c.research && eng.knowledge.on){
    const left=REG.map((r,ri)=>({r,ri})).filter(x=>on(x.ri))
      .map(x=>{ const es=eng.knowledge.edges.filter(e=>e.ri===x.ri);
                return {name:x.r.name, unk:es.filter(e=>!eng.knowledge.isKnown(e.di,e.ri)).length}; })
      .filter(x=>x.unk>0).sort((a,b)=>b.unk-a.unk);
    const kc=eng.knowledge.count();
    if(!left.length) return `<div class="tc-w"><b>${kc.known}/${kc.total} wires known — the board is complete.</b></div>`;
    return `<div class="tc-w"><b>${kc.known}/${kc.total} wires known.</b> Most still dark: ${left.slice(0,3).map(x=>`${x.name} (${x.unk})`).join(", ")}</div>`;
  }
  if(c.resil>0){
    const res=(name)=>eng.state.ops.filter(o=>o.owner==="player"&&o.target===name&&o.resil>0).reduce((s,o)=>s+o.resil,0);
    const room=REG.map((r,ri)=>({r,ri})).filter(x=>on(x.ri)&&!x.r.kind).map(x=>({name:x.r.name, r:res(x.r.name)}));
    const full=room.filter(x=>x.r>=90).length;
    const thin=room.filter(x=>x.r<90).sort((a,b)=>a.r-b.r);
    const home=room.find(x=>x.name===REG.find(r2=>r2.homeland).name);
    return `<div class="tc-w">Homeland hardened <b>${Math.min(90,home?home.r:0)}%</b> of 90${full?` · ${full} region${full===1?"":"s"} at capacity`:""}${thin.length?` · thinnest: ${thin.slice(0,2).map(x=>`${x.name} (${x.r}%)`).join(", ")}`:""}</div>`;
  }
  return "";
}
function showToolCard(c){ const el=$("toolcard"); el.innerHTML=toolCard(c)+whereToPoint(c); el.style.display="block"; }
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
 "Hurricane Steering":"Cirrus seeded a hurricane in 1947 and it turned for the coast. Nobody will fund it on purpose until 1955.",
 "Engineered Bloom":"Ocean iron fertilisation is a series of ship experiments through the 1990s. A programme can run one from 2008.",
 "Marine Cloud Brightening":"Spray vessels are a 2020s technology. 2024.",
 "Orbital Mirror":"There is no constellation to turn until the 2030s. 2032.",
 "Engineered Biology":"The biology exists long before the delivery does. 2040.",
 "The AMOC Lever":"The conveyor is understood, and weak, by the 2040s. 2046 — and only behind the whole arsenal.",
};
function wingLine(c){
  const ws=eng.eras? eng.wingStatus(c.name) : null; if(!ws) return "";
  if(ws.spent) return `<i>spent — it was only ever going to happen once</i>`;
  if(ws.online) return (ws.once? `<i>one operation, ever</i>` : "")
    +(ws.upkeep? `<i>wing online · upkeep $${ws.upkeep}M/season</i><i>⏏ stands it down — the upkeep stops, it reopens at $${Math.round(ws.chest*0.75)}M</i>` : "");
  if(ws.requires && ws.requires.length) return `<i>needs first: ${ws.requires.map(n=>n.replace(" [T3]","")).join(", ")}</i>`;
  if(!ws.eligible) return `<i>arrives ${ws.from}</i>`;
  return `<i>${ws.canStand? "the wing can stand up" : `needs $${Math.round(ws.need)}M in the chest`} · upkeep $${ws.upkeep}M/season</i>`;
}
function buildTray(){
  const bar=$("toolbar"); bar.innerHTML="";
  // the tray IS the timeline: what you have, then everything the century
  // still owes you, in the order it arrives
  const ordered=CAPS.filter(c=>c.type!=="NONE").slice().sort((a,b)=>(a.from||1946)-(b.from||1946)||a.cost-b.cost);
  for(const c of ordered){
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
  if(typeof relayout==="function") relayout();     // the tray now has a height: give the globe its room
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
  if(freshWings.has(c.name)){ freshWings.delete(c.name); wingSeen.add(c.name); renderTray(); }
  if(readyWings.has(c.name)){ readyWings.delete(c.name); readySeen.add(c.name); renderTray(); }
  if(ws && !ws.online){                        // a wing that is not flying
    const i=wingOrders.standup.indexOf(c.name);
    if(i>=0){ wingOrders.standup.splice(i,1); renderTray(); sfxClick(); $("toolinfo").textContent=`${c.name} — the order is withdrawn.`; return; }
    if(ws.spent){ $("toolinfo").innerHTML=`<span style="color:var(--amber)">${c.name.replace(" [T3]","")}</span> — <b>spent.</b> It was only ever going to happen once.`; sfxAlert(); return; }
    if(ws.requires && ws.requires.length){ $("toolinfo").innerHTML=`<span style="color:var(--amber)">${c.name.replace(" [T3]","")}</span> — the committee will not hear of it until the programme has stood up: <b>${ws.requires.map(n=>n.replace(" [T3]","")).join(", ")}</b>.`; sfxAlert(); return; }
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
/* THE WING BAR — what the programme is paying for, on top of the tool box.
   One chip per wing: standing (with its upkeep), ready to stand up, or
   ordered either way. Click a chip to give the order. Fixed height, so the
   world below it never resizes when a wing comes or goes. */
function renderWingBar(){
  const bar=$("wingbar"); if(!bar) return;
  if(!eng.eras){ bar.style.display="none"; return; }
  const chips=[]; let upkeep=0;
  for(const c of CAPS){
    if(c.type==="NONE") continue;
    const ws=eng.wingStatus(c.name); if(!ws || !(c.upkeep>0)) continue;
    const nm=(TOOLICON[c.name]||"")+" "+c.name.replace(" [T3]","").replace(" Interference","").replace(" Investment","").replace(" Enablement","").replace(" Forcing","").replace(" Inj.","").replace("Destabilization","Destab.").toUpperCase();
    const down=wingOrders.mothball.includes(c.name), up=wingOrders.standup.includes(c.name);
    if(ws.online){ upkeep+=ws.upkeep;
      chips.push(`<button class="wc ${down?"down":"on"}" data-w="${escapeHTML(c.name)}">${nm} <i>${down?"STANDING DOWN":"$"+ws.upkeep+"M"}</i></button>`); }
    else if(up) chips.push(`<button class="wc ordered" data-w="${escapeHTML(c.name)}">${nm} <i>STANDING UP</i></button>`);
    else if(ws.eligible && ws.canStand && !ws.spent)
      chips.push(`<button class="wc up" data-w="${escapeHTML(c.name)}">${nm} <i>STAND UP · $${ws.upkeep}M/season</i></button>`);
  }
  const lbl=chips.length
    ? `<span class="wl">WINGS <b>$${upkeep}M</b>/season</span>`
    : `<span class="wl">WINGS <b>none standing</b></span>`;
  bar.innerHTML=lbl+chips.join("");
  for(const b of bar.querySelectorAll("button.wc")) b.addEventListener("click",()=>{
    if(!running||resolving) return;
    const name=b.dataset.w, ws=eng.wingStatus(name);
    const di=wingOrders.mothball.indexOf(name), ui=wingOrders.standup.indexOf(name);
    if(di>=0){ wingOrders.mothball.splice(di,1); $("toolinfo").textContent=`${name.replace(" [T3]","")} — the wing stays.`; }
    else if(ui>=0){ wingOrders.standup.splice(ui,1); $("toolinfo").textContent=`${name.replace(" [T3]","")} — the order is withdrawn.`; }
    else if(ws.online){ wingOrders.mothball.push(name);
      $("toolinfo").innerHTML=`<b>${name.replace(" [T3]","").toUpperCase()}</b> stands down at the next review — the $${ws.upkeep}M upkeep stops and the capability goes. It reopens at $${Math.round(ws.chest*0.75)}M. Click again to keep it.`; }
    else { wingOrders.standup.push(name);
      $("toolinfo").innerHTML=`<b>${name.replace(" [T3]","").toUpperCase()}</b> stands up at the next review — $${ws.upkeep}M a season for as long as you keep it.`; }
    sfxClick(); renderTray();
  });
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
    b.classList.toggle("fresh", freshWings.has(cap)||readyWings.has(cap));
    b.classList.toggle("standable", !!ws && !ws.online && ws.eligible && ws.canStand && !ordered);
    b.classList.toggle("ordered", ordered||moth);
    b.classList.toggle("wing", !!ws && ws.online && ws.upkeep>0);
    // a wing you can do nothing about yet takes an icon's worth of room;
    // anything you can act on this review stays full size
    const actionable = !ws || ws.online || ordered || moth || (ws.eligible && !ws.spent);
    b.classList.toggle("mini", !actionable);
    b.classList.toggle("funded", funded && !locked);
    b.classList.toggle("poor", !locked && !canAfford(c) && cap!==pendingTool);
    const pr=b.querySelector(".pr");
    if(pr) pr.textContent = ws&&ws.spent? "SPENT" : ordered? "STANDING UP" : moth? "STANDING DOWN"
      : locked? (ws.requires&&ws.requires.length? "GATED" : ws.eligible? (ws.canStand? "STAND UP" : "CHEST $"+Math.round(ws.need)+"M") : String(ws.from))
      : (funded? "FUNDED" : "$"+c.cost+"M");
  }
  renderWingBar();
  renderTab();
  $("armed").innerHTML = slots.map((s,i)=>
    `<span class="pill">${s.cap.toUpperCase()}${s.target? " · "+s.target:""}
     <button data-i="${i}" aria-label="cancel">✕</button></span>`).join("");
  for(const x of $("armed").querySelectorAll("button"))
    x.addEventListener("click",()=>{ slots.splice(+x.dataset.i,1); clampContainment(); renderTray(); });
}


/* ------------------------------------------------------------ tool tray */
const DESC={
  "Signals Research":"ship logs, station records, a room of analysts — learn one wire into a region",
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


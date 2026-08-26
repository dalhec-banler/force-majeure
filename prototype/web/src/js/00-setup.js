const MODEL = __MODEL__;
const LAND = __LAND__;
const HISTORY = __HISTORY__;     // the record: real storms, eruptions, quakes, disasters 1946–55 (ADR-0017)
__ENGINE__

/* ---------------------------------------------------------------- setup */
// the record's natural forcing: eruptions load the stratosphere and drop ash
const EXO=[];
for(const e of HISTORY.eruptions){
  if(e.climate) EXO.push({t:e.t, driver:"GLOBAL", mag:e.climate, dur:e.climDur||2, decay:0.6, cap:e.name+" (ash veil)"});
  for(const a of (e.ash||[])) EXO.push({t:e.t, region:a.region, mag:a.mag, dur:a.dur||1, cap:e.name+" (ashfall)"});
}
for(const q of HISTORY.quakes) for(const h of (q.hit||[]))
  EXO.push({t:q.t, region:h.region, mag:h.mag, dur:h.dur||1, cap:q.name+" earthquake"});
const eng = createEngine(MODEL, {rivals:true, idleTrim:0.6, jetstream:true, forensics:true, knowledge:true, budgetGate:true, exogenous:EXO, priceCap:300});
const DRVNAME = { ENSO:"the Pacific", IOD:"the Indian Ocean", NATL:"the Atlantic", GLOBAL:"the planet" };
let SHOW_WIRES=true;             // the known wiring, drawn on the globe
let newWires=[];                 // wires revealed recently: {di,ri,bornT}
let recordStopped=false;         // the geophysical record ends with the first lithospheric op
let histAltered=[], histAsRecorded=0;   // history on your watch
const REG = eng.regions, DRV = eng.drivers, CAPS = eng.capabilities;
const ND = DRV.length;
const REGPOS = { "North American Plains":[41.5,-100], "Black Sea Steppe":[48,34],
  "La Plata Basin":[-31,-60], "South Asia":[22,79], "Southeast Asia":[12,104],
  "Eastern Australia":[-29,147], "Sahel":[14,2], "Horn of Africa":[8,44],
  "Taiwan Strait Industrial":[24,121], "Persian Gulf Terminals":[26.5,52],
  "Andean Copper Belt":[-24,-69], "Congo Cobalt Belt":[-11,26],
  "North Sea Energy Shelf":[57,3], "Ganges Delta Ports":[22.5,90],
  "Siberian Gas Fields":[62,75], "Arctic Shelf":[76,20],
  "California Central Valley":[36.8,-119.8], "Canadian Prairies":[52,-106], "Gulf Coast Refineries":[29.7,-93.5],
  "North China Plain":[36.5,116], "Yangtze Basin":[30.5,114], "Manchurian Plain":[45,126],
  "Northern European Plain":[50.5,10], "Mediterranean Basin":[40,15], "Danube Basin":[46.5,20],
  "Nile Delta":[30.5,31], "Japan (Kanto–Kansai)":[35.7,139.7], "Mekong Delta":[10,105.8],
  "Cerrado":[-15.8,-47.9], "Southern African Maize Belt":[-27,27], "Kazakh Virgin Lands":[51,71],
  "Panama Canal":[9.1,-79.7], "Malacca Strait":[2.5,101.5],
  "Pilbara Iron Belt":[-20.3,118.6], "Murray–Darling Basin":[-34.5,143], "Hawaiian Islands":[21.3,-157.8] };
const DRVPOS = { ENSO:[-3,-135], IOD:[-4,68], NATL:[44,-38] };
const DATELINE = { "North American Plains":"OMAHA","Black Sea Steppe":"ODESSA",
  "La Plata Basin":"BUENOS AIRES","South Asia":"DELHI","Southeast Asia":"BANGKOK",
  "Eastern Australia":"SYDNEY","Sahel":"NIAMEY","Horn of Africa":"ADDIS ABABA",
  "Taiwan Strait Industrial":"TAIPEI","Persian Gulf Terminals":"DUBAI",
  "Andean Copper Belt":"ANTOFAGASTA","Congo Cobalt Belt":"LUBUMBASHI",
  "North Sea Energy Shelf":"ABERDEEN","Ganges Delta Ports":"DHAKA",
  "Siberian Gas Fields":"NOVOSIBIRSK","Arctic Shelf":"LONGYEARBYEN",
  "California Central Valley":"FRESNO","Canadian Prairies":"REGINA","Gulf Coast Refineries":"HOUSTON",
  "North China Plain":"JINAN","Yangtze Basin":"WUHAN","Manchurian Plain":"HARBIN",
  "Northern European Plain":"BERLIN","Mediterranean Basin":"ROME","Danube Basin":"BUDAPEST",
  "Nile Delta":"CAIRO","Japan (Kanto–Kansai)":"TOKYO","Mekong Delta":"SAIGON",
  "Cerrado":"BRASÍLIA","Southern African Maize Belt":"JOHANNESBURG","Kazakh Virgin Lands":"AKMOLINSK",
  "Panama Canal":"PANAMA CITY","Malacca Strait":"SINGAPORE",
  "Pilbara Iron Belt":"PORT HEDLAND","Murray–Darling Basin":"MILDURA","Hawaiian Islands":"HONOLULU" };
const TOOLICON = { "Climate Research":"🔬", "Cloud Seeding":"☁","Watershed Interference":"🚱",
  "Fire Enablement":"🔥","Adaptation Investment":"🛡","Ocean Thermal Forcing":"🌊",
  "Stratospheric Aerosol Inj.":"✈","ENSO Forcing":"🌀","Ionospheric Coupling [T3]":"⚡",
  "Polar Destabilization":"🧊" };
const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MONO_FONT='"IBM Plex Mono", Menlo, monospace';    // cached once: canvas font strings are parsed per call

let FLAT=false;                  // flat-map view toggle
let t = 0;                       // last resolved season
let flash = [];                  // travelling arcs
let shocks = [];                 // expanding event shockwaves
let effects = [];                // persistent spectacle: fire, smoke, storm...
let vehicles = [];               // planes and ships on mission
let running = true;
let telemetry = false;
let pendingTool = null;          // tool waiting for a globe click
let slots = [];                  // armed ops, max 2: {cap, target}
let sevStreak = REG.map(()=>0);  // consecutive severe seasons per region
let iceMelt = 0;                 // 0..1, ice-sheet loss: permanent — the sea stays where it rose to
let seaIce = 0;                  // 0..1, sea-ice loss: regrows over cold seasons (the white cap)
let cumDead = 0, cumDeadYours = 0;   // estimated excess mortality (information)
function devastation(){                 // 0..1 — how far gone the world is
  const row=lastRow(); if(!row) return 0;
  let failing=0;
  for(let i=0;i<REG.length;i++)
    failing += row.yields[i]<55?1 : row.yields[i]<85?0.35 : 0;
  return Math.min(1, failing/REG.length*1.1 + Math.min(0.35,cumDead/9e6) + iceMelt*0.2);
}
function fmtDead(n){
  if(n>=1e6) return (n/1e6).toFixed(1)+"M";
  if(n>=1e3) return Math.round(n/1e3)+"K";
  return Math.round(n).toString();
}

function fmt(n,d=1){ return n.toLocaleString("en-US",
  {minimumFractionDigits:d,maximumFractionDigits:d}); }
function lastRow(){ return eng.state.rows[t-1]; }
function placeName(dl){ return dl.toLowerCase().replace(/(^|[\s\-'])(\S)/g,(m,a,b)=>a+b.toUpperCase()); }
/* the purse: what is on hand, what is already committed, what is left */
function funds(){ const r=lastRow(); return r? r.treasury : eng.assumptions.startingTreasury; }
function capCost(name){ const c=CAPS.find(c2=>c2.name===name); if(!c) return 0;
  const funded = flagship && FLAGSHIP_CAPS.includes(name) && !slots.some(s=>FLAGSHIP_CAPS.includes(s.cap) && s.cap!==name);
  return funded? 0 : c.cost; }
function escapeHTML(x){ return String(x).replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch])); }
function armedCost(){ return slots.reduce((s,x)=>s+capCost(x.cap),0); }
function spendable(){ return Math.max(0, funds()-eng.assumptions.overhead); }   // after the overhead reserve
function available(){ return Math.max(0, spendable()-armedCost()); }
function canAfford(c){ if(capCost(c.name)===0 && c.cost>0) return funds()>=eng.assumptions.overhead; return capCost(c.name) <= available(); }
function renderTab(){
  const a=armedCost(), el=$("hTab"); if(!el) return;
  el.style.display = slots.length? "" : "none";
  $("hTabVal").textContent="$"+fmt(a,0)+"M";
  $("hTabVal").style.color = a>spendable()*0.8? "var(--amber)" : "var(--green)";
  $("hTabOf").textContent=`of $${fmt(spendable(),0)}M · ${slots.length} op${slots.length===1?"":"s"}`;
  $("hTabOf").className="d";
}
function clampContainment(){
  const el=$("containment"), mx=Math.max(0, Math.min(40, Math.floor(available())));
  el.max=mx; if(+el.value>mx){ el.value=mx; $("contval").textContent=el.value; }
}


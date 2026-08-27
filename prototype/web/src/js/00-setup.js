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
/* The record's droughts, famines, floods and plagues are FORCING, not
   narration (fix 2026-08-27): each pushes its region's anomaly for as long
   as the record says it ran, so the marker goes amber, the harvest falls,
   and the player can push back against it. Epidemics and tornadoes carry no
   weather anomaly — they are canon, and they are not the weather. */
const WEATHER_MAG={ famine:-1.7, drought:-1.2, fire:-0.8, cold:-0.7, blizzard:-0.6, avalanche:-0.3,
                    flood:1.5, typhoon:1.3, cyclone:1.3, locusts:1.6, epidemic:0, tornado:0 };
for(const w of HISTORY.weather){
  const base=WEATHER_MAG[w.kind]; if(!base) continue;
  const heavy=1+Math.min(0.45,(w.toll||0)/2e6);       // the ones the century remembers bite harder
  EXO.push({t:w.t, region:w.region, mag:+(base*heavy).toFixed(3), dur:w.dur||1, cap:`the ${w.date} ${w.kind}`, record:true});
}
/* Nation starts — the superpowers. The choice sets starting position only
   (homeland, the rival's home, the chest); never the systems available. */
/* Difficulty is the programme you take over. Strengths and weaknesses are
   read off the numbers: the homeland's weight in the traded index, how
   much its harvest swings (sigma) and how hard drought bites it (sens),
   how much of its grain reaches the market (export), the chest, and the
   committee's generosity (mandate). */
const STARTS={
 "North American Plains":{nation:"UNITED STATES", difficulty:"STANDARD", rank:1, dcol:"var(--green)", rival:"Black Sea Steppe", rivalName:"the Eastern Program", rivalShort:"the Steppe", treasury:90, mandate:0,
   blurb:"Wheat and maize exporter; the Soviet programme across the water.",
   plus:["largest harvest on the board — every price move pays","steady weather (σ 0.8), drought bites least","the biggest chest: $90M"],
   minus:["the rival works your watershed from 1976","everyone expects you to be the one doing it"]},
 "Black Sea Steppe":{nation:"SOVIET UNION", difficulty:"STANDARD", rank:2, dcol:"var(--green)", rival:"North American Plains", rivalName:"the Western Program", rivalShort:"the Plains", treasury:80, mandate:4,
   blurb:"Wheat exporter with a famine in its first year; the Americans across the water.",
   plus:["a committee that funds fear generously (+4 mandate)","a big exporter: the market feels your harvest","the Plains are one watershed away"],
   minus:["the 1946 famine is yours to survive","drought bites harder (sens 1.1) and swings wider (σ 0.9)"]},
 "Northern European Plain":{nation:"WESTERN EUROPE", difficulty:"HARDER", rank:4, dcol:"var(--amber)", rival:"Black Sea Steppe", rivalName:"the Eastern Program", rivalShort:"the Steppe", treasury:70, mandate:-2,
   blurb:"Wheat, sugar beet and dairy; a wet Atlantic to work with; the Soviet programme to the east.",
   plus:["the most robust harvest (sens 0.9) — hard to hurt","wired to the Atlantic: your own ocean tool reaches home"],
   minus:["a small harvest (weight 8): price moves pay less","a parsimonious committee (−2 mandate)","the Steppe is next door — and so is its programme"]},
 "North China Plain":{nation:"CHINA", difficulty:"HARD", rank:3, dcol:"var(--amber)", rival:"Black Sea Steppe", rivalName:"the Northern Program", rivalShort:"the Steppe", treasury:55, mandate:-2,
   blurb:"Wheat and maize for six hundred million; the Soviet programme to the north.",
   plus:["a harvest that feeds itself — the world price hurts you less","El Niño's wire into the plain is known from the start"],
   minus:["little of your grain is traded (export 0.3): windfalls are small","a thin chest ($55M) and a parsimonious committee","the 1959–61 famine is on the record"]},
 "South Asia":{nation:"INDIA", difficulty:"HARDEST", rank:5, dcol:"var(--red)", rival:"North China Plain", rivalName:"the Eastern Program", rivalShort:"the North China Plain", treasury:45, mandate:-4,
   blurb:"Rice and wheat at the monsoon's mercy; a programme across the Himalaya.",
   plus:["the second-largest harvest on the board","the steadiest weather (σ 0.7) — when the monsoon comes"],
   minus:["drought bites hardest (sens 1.2) and the monsoon is El Niño's to take","the thinnest chest ($45M) and the least generous committee (−4)","little of your grain reaches the market (export 0.4)"]},
};
let HOMELAND="North American Plains"; try{ const h=localStorage.getItem("fm.homeland"); if(h && STARTS[h]) HOMELAND=h; }catch(e){}
const START=STARTS[HOMELAND];
const eng = createEngine(MODEL, {homeland:HOMELAND, rivalHome:START.rival, startingTreasury:START.treasury, mandateBonus:START.mandate||0, rivals:true, idleTrim:0.6, jetstream:true, forensics:true, knowledge:true, budgetGate:true, exogenous:EXO, priceCap:300, scrutiny:true, grainSupply:true, priceElasticity:3.0, rivalEras:true, shadow:true, eras:true, envelopeWidening:0.0006, windfall:2, reserveCap:400});
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
  "Polar Destabilization":"🧊",
  "Hurricane Steering":"🌪","Engineered Bloom":"🦠","Marine Cloud Brightening":"🌫",
  "Orbital Mirror":"🛰","Engineered Biology":"🧬","The AMOC Lever":"🔱" };
const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MONO_FONT='"IBM Plex Mono", Menlo, monospace';    // cached once: canvas font strings are parsed per call

let FLAT=false;                  // flat-map view toggle
let t = 0;                       // last resolved season
/* The long campaign (ADR-0023): decisions come at REVIEWS — a year at a
   time while the programme is a lab with a budget line, a half-year from
   ENMOD, a season in the situation room. The engine ticks every season. */
const TIERS=(MODEL.tiers&&MODEL.tiers.length)? MODEL.tiers : [{from:0,every:1,name:"SEASON",clock:45}];
function yearOfSeason(s){ return MODEL.climate[Math.max(1,Math.min(s,MODEL.climate.length))-1].year; }
function curYear(){ return yearOfSeason(Math.max(1,t)); }
function tierFor(s){ const yr=yearOfSeason(s); let tt=TIERS[0]; for(const x of TIERS) if(yr>=x.from) tt=x; return tt; }
function tierStartT(tier){ const i=MODEL.climate.findIndex(c=>c.year>=tier.from); return i<0?1:i+1; }
function isReviewStart(s){ const tier=tierFor(s); return (s-tierStartT(tier))%tier.every===0; }
function nextBatch(){ const s=t+1, tier=tierFor(s), start=tierStartT(tier); return Math.min(tier.every-((s-start)%tier.every), eng.seasons-t); }
function clockMs(){ return (tierFor(t+1).clock||45)*1000; }
let rv=0;                        // reviews begun so far — directive fuses count these
let wingOrders={standup:[],mothball:[]};   // orders for the next review
const freshWings=new Set(), wingSeen=new Set();   // capabilities newly possible, until the player looks at them
const readyWings=new Set(), readySeen=new Set();   // wings the chest can now stand up, until the player looks at them
function isOnline(ri){ const r=lastRow(); return r? !!r.online[ri] : eng.regionOnline(ri,1); }
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
// PROFIT: what the programme made — homeland revenue over the shadow world where it never acted
function profitOf(rows){ return rows.reduce((s,r)=>s+r.revenue-(r.baseRevenue==null?85:r.baseRevenue),0); }
function seasonProfit(r){ return r.revenue-(r.baseRevenue==null?85:r.baseRevenue); }
function placeName(dl){ return dl.toLowerCase().replace(/(^|[\s\-'])(\S)/g,(m,a,b)=>a+b.toUpperCase()); }
/* the purse: what is on hand, what is already committed, what is left */
function funds(){ const r=lastRow(); return r? r.treasury : eng.assumptions.startingTreasury; }
function capCost(name){ const c=CAPS.find(c2=>c2.name===name); if(!c) return 0;
  const fc = flagship? (flagship.caps||FLAGSHIP_CAPS) : [];
  const funded = flagship && fc.includes(name) && !slots.some(s=>fc.includes(s.cap) && s.cap!==name);
  return funded? 0 : c.cost; }
function escapeHTML(x){ return String(x).replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch])); }
function armedCost(){ return slots.reduce((s,x)=>s+capCost(x.cap),0); }
function spendable(){ const r=lastRow(); return Math.max(0, funds()-(r&&r.overhead!==undefined? r.overhead : eng.assumptions.overhead)); }   // after the overhead reserve (rent plus the wings' upkeep)
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


const MODEL = __MODEL__;
const LAND = __LAND__;
__ENGINE__

/* ---------------------------------------------------------------- setup */
const eng = createEngine(MODEL, {rivals:true, idleTrim:0.6, jetstream:true, forensics:true});
const REG = eng.regions, DRV = eng.drivers, CAPS = eng.capabilities;
const ND = DRV.length;
const REGPOS = { "North American Plains":[41.5,-100], "Black Sea Steppe":[48,34],
  "La Plata Basin":[-31,-60], "South Asia":[22,79], "Southeast Asia":[12,104],
  "Eastern Australia":[-29,147], "Sahel":[14,2], "Horn of Africa":[8,44],
  "Taiwan Strait Industrial":[24,121], "Persian Gulf Terminals":[26.5,52],
  "Andean Copper Belt":[-24,-69], "Congo Cobalt Belt":[-11,26],
  "North Sea Energy Shelf":[57,3], "Ganges Delta Ports":[22.5,90],
  "Siberian Gas Fields":[62,75], "Arctic Shelf":[76,20] };
const DRVPOS = { ENSO:[-3,-135], IOD:[-4,68], NATL:[44,-38] };
const DATELINE = { "North American Plains":"OMAHA","Black Sea Steppe":"ODESSA",
  "La Plata Basin":"BUENOS AIRES","South Asia":"DELHI","Southeast Asia":"BANGKOK",
  "Eastern Australia":"SYDNEY","Sahel":"NIAMEY","Horn of Africa":"ADDIS ABABA",
  "Taiwan Strait Industrial":"TAIPEI","Persian Gulf Terminals":"DUBAI",
  "Andean Copper Belt":"ANTOFAGASTA","Congo Cobalt Belt":"LUBUMBASHI",
  "North Sea Energy Shelf":"ABERDEEN","Ganges Delta Ports":"DHAKA",
  "Siberian Gas Fields":"NOVOSIBIRSK","Arctic Shelf":"LONGYEARBYEN" };
const TOOLICON = { "Cloud Seeding":"☁","Watershed Interference":"🚱",
  "Fire Enablement":"🔥","Adaptation Investment":"🛡","Ocean Thermal Forcing":"🌊",
  "Stratospheric Aerosol Inj.":"✈","ENSO Forcing":"🌀","Ionospheric Coupling [T3]":"⚡",
  "Polar Destabilization":"🧊" };
const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
let iceMelt = 0;                 // 0..1, cumulative Arctic melt (visual + news)
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


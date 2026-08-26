/* --------------------------------------------------------- feed & drama */
function wire(html, cls){
  const row=lastRow(); const p=document.createElement("p");
  const stamp = row? `${row.year}·${row.qtr[0]}` : "1946·W";
  p.innerHTML=`<span class="stamp">${stamp}</span> ${cls?`<span class="${cls}">${html}</span>`:html}`;
  $("wire").prepend(p);
}
/* The newsroom: authored corpus + deterministic selection. Same event
   context always writes the same headline (replay-stable, no RNG). */
const POOL={
 droughtCrop:[
  "{CROP} harvest fails — down to {PCT}%.",
  "Third dry month running. {CROP} withers in the fields — {PCT}% of normal.",
  "Farmers plough under what did not come up. {CROP} at {PCT}%.",
  "Wells dry, rail yards idle. The {CROP} harvest lands at {PCT}%.",
  "Ministry lowers the {CROP} estimate again — {PCT}% and falling.",
 ],
 droughtOut:[" Meteorologists find no precedent.",
  " Nothing in the record compares.",
  " The oldest men in the district have no story like it."],
 floodCrop:[
  "Storm season beyond anything on file. {CROP} under water — harvest {PCT}%.",
  "Levees gone, roads gone. The {CROP} crop drowns at {PCT}%.",
  "Rivers take the bottomlands. {CROP} harvest written off at {PCT}%.",
 ],
 hubDry:[
  "Water and power fail across {NAME} — output at {PCT}%.",
  "Reservoirs at dead pool. {NAME} runs half-shifts — output {PCT}%.",
  "Turbines idle, lines down. {NAME} output falls to {PCT}%.",
 ],
 hubFlood:[
  "Flooding shuts {NAME} — output at {PCT}%. Shipments missed worldwide.",
  "Docks under water at {NAME}. Output {PCT}%; buyers scramble.",
  "{NAME} dark for the third day. Output {PCT}%.",
 ],
 unrest:[
  "Food prices triple in the capital. Unrest spreading province by province.",
  "Bread queues become marches. The garrison stays in barracks — for now.",
  "Second season of hunger. The government reshuffles; the crowds stay.",
 ],
 windfall:[
  "WINDFALL — +${AMT}M above baseline this season. Nobody asks why you were positioned.",
  "WINDFALL — +${AMT}M. The board minutes record 'favorable market conditions.'",
  "WINDFALL — +${AMT}M above baseline. Your forward contracts look prescient. They were.",
 ],
 filed:[
  "FILED — natural variability. No inquiry opened.",
  "FILED — within historical range. The record absorbs it.",
  "FILED — an act of God, per the assessors. Correct, in a sense.",
 ],
};
function pick(pool,seed){ const a=POOL[pool]; return a[Math.abs(seed)%a.length]; }
function newsFrom(pool,seed,dateline,vars,breaking,suffix){
  let h=pick(pool,seed);
  for(const k in vars) h=h.split("{"+k+"}").join(vars[k]);
  news(dateline,h+(suffix||""),breaking);
}
/* The precedent tree (brief §18): first use of a capability cites prior
   art, tagged like the codex — DECLASSIFIED / ALLEGED / [REDACTED]. */
const PRECEDENT={
 "Cloud Seeding":["tagd","DECLASSIFIED","Schaefer, General Electric, Nov 1946 — dry ice over Massachusetts. Legal signs off: prior art."],
 "Watershed Interference":["taga","ALLEGED","Internal assessment: the 1938 Yellow River breach demonstrates the principle. We do not cite it aloud."],
 "Fire Enablement":["taga","ALLEGED","Assessment of rumored wartime incendiary-forestry trials. Filed as rumor. Useful rumor."],
 "Adaptation Investment":["tagd","DECLASSIFIED","Civilian conservation precedent, 1935. The one line item nobody questions."],
 "Ocean Thermal Forcing":["taga","ALLEGED","Fleet weather logs suggest current-shifting trials, 1944. Unconfirmed. Promising."],
 "Stratospheric Aerosol Inj.":["tagd","DECLASSIFIED","Volcanic analogue: Tambora 1815, the year without a summer. Nature published the proof of concept."],
 "ENSO Forcing":["tagr","[REDACTED]","Annex C is not available at your clearance. Proceed."],
 "Ionospheric Coupling [T3]":["tagr","[REDACTED]","There is no prior art. You are the prior art."],
 "Polar Destabilization":["tagr","[REDACTED]","Feasibility study withdrawn from circulation, all copies. Including this one."],
};
const usedCaps=new Set();
let filedCount=0, punctureFired=false, briefSeason=0;

function showBriefing(title, text, img){
  if(briefSeason===t) return; briefSeason=t;
  $("bc-title").textContent=title;
  $("bc-text").textContent=text;
  $("bc-img").src=img;
  const c=$("briefcard"); c.style.display="block";
  clearTimeout(showBriefing._h);
  showBriefing._h=setTimeout(()=>c.style.display="none", 9000);
}

function news(dateline, headline, breaking){
  wire(`${breaking?'<span class="chip">BREAKING</span>':""}<b>${dateline}</b> — ${headline}`,"news");
  if(breaking) sfxTeletype();
}
function alertStrip(msg){
  const d=document.createElement("div"); d.className="alertstrip"; d.textContent=msg;
  $("alerts").appendChild(d); setTimeout(()=>d.remove(), 3000);
  sfxAlert();
}
function shakeNow(){ sfxBoom(); if(reduced) return;
  const w=$("globe-wrap"); w.classList.remove("shake"); void w.offsetWidth;
  w.classList.add("shake"); }
function alarm(){ sfxKlaxon(); if(reduced) return;
  const a=$("alarmflash"); a.classList.remove("on"); void a.offsetWidth;
  a.classList.add("on"); }


/* --------------------------------------------------------- feed & drama */
/* The wire is paced: lines arrive one at a time, teletype fashion, rather
   than thirty at once when a season resolves — a backlog drains faster so
   it never runs minutes behind. */
const wireQ=[]; let wireLast=0;
/* An operation is ONE card on the wire: SEALED at commit, then the same
   line grows — landed, filed, your share of the anomaly — instead of three
   more messages. wireUpdate finds the card (rendered or still queued). */
function wireUpdate(id, extra, cls){
  if(typeof replaying!=="undefined" && replaying) return;
  const q=wireQ.find(it=>it.id===id);
  if(q){ q.html+=` <span class="upd">— ${extra}</span>`; return; }
  const p=$("wire").querySelector(`p[data-op="${(typeof CSS!=="undefined"&&CSS.escape)? CSS.escape(id) : id.replace(/"/g,"")}"]`);
  if(p){ p.insertAdjacentHTML("beforeend", ` <span class="upd">— ${extra}</span>`); p.classList.add("grown"); return; }
  wire(extra, cls||"op");                       // no card (a resumed game): a line of its own
}
function wire(html, cls, id){
  if(typeof replaying!=="undefined" && replaying) return;
  const row=lastRow();
  const stamp = row? `${row.year}·${row.qtr[0]}` : "1946·W";
  // PRIORITY: the committee, your operations and their traces, hostile
  // action, wings, the ladder, memos, and BREAKING world events. Everything
  // else is on the wire but folded until ALL is chosen.
  const lo = cls==="ad" || cls==="cast" || (cls==="news" && !/class="chip"/.test(html)) || (!cls && !/class="tag/.test(html));
  wireQ.push({html:`<span class="stamp">${stamp}</span> ${cls?`<span class="${cls}">${html}</span>`:html}`, lo, id, t});
  if(reduced) pumpWire(true);
}
let WIRE_PRIORITY=true;
/* When a review begins, the wire folds: everything on it collapses into one
   line for the period just closed — open it to read back. You look at one
   review's worth of feed at a time. */
function foldWire(label){
  pumpWire(true);
  const w=$("wire"); const loose=[...w.children].filter(el=>el.tagName==="P"||el.classList.contains("szn"));
  if(!loose.length) return;
  const pri=loose.flatMap(el=>el.tagName==="P"? [el] : [...el.querySelectorAll("p")]).filter(p=>!p.classList.contains("lo"));
  const dirs=pri.filter(p=>/DIRECTIVE/.test(p.textContent)).length, ops=pri.filter(p=>/SEALED/.test(p.textContent)).length;
  const hot=pri.filter(p=>/INTERCEPT|HOSTILE|EXPOSED|MOTHBALLED|STANDS UP|WING|EARMARK|investigation/i.test(p.textContent)).length;
  const bits=[`${pri.length} line${pri.length===1?"":"s"}`]; if(ops) bits.push(`${ops} op${ops===1?"":"s"}`); if(dirs) bits.push(`${dirs} directive${dirs===1?"":"s"}`); if(hot) bits.push(`${hot} alert${hot===1?"":"s"}`);
  const d=document.createElement("details"); d.className="yr";
  d.innerHTML=`<summary><b>${label}</b> · ${bits.join(" · ")}</summary>`;
  for(const p of loose) d.appendChild(p);                       // keeps their order (newest first)
  w.prepend(d);
}
function pumpWire(all){
  const now=performance.now();
  const gap = all? 0 : wireQ.length>24? 140 : wireQ.length>10? 300 : (typeof brisk!=="undefined"&&brisk)? 260 : 650;
  while(wireQ.length && (all || now-wireLast>=gap)){
    const it=wireQ.shift(); const p=document.createElement("p"); p.innerHTML=it.html; if(it.lo) p.className="lo"; if(it.id) p.dataset.op=it.id;
    // seasons stack newest-first; inside a season the lines read downward,
    // in the order they happened — a story is never upside down
    const w=$("wire"); let blk=w.firstElementChild;
    if(!(blk && blk.classList && blk.classList.contains("szn") && +blk.dataset.t===it.t)){
      blk=document.createElement("div"); blk.className="szn"; blk.dataset.t=it.t; w.prepend(blk); }
    blk.appendChild(p); if(!it.lo || !WIRE_PRIORITY) wireLast=now;   // folded lines cost no time on the wire
    if(!all && (!it.lo || !WIRE_PRIORITY)) break;
  }
}
setInterval(()=>pumpWire(false), 80);
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
 "Hurricane Steering":["tagd","DECLASSIFIED","Project Cirrus, October 1947 — a seeded hurricane turned and came ashore in Georgia. The Bureau stopped answering questions. Prior art."],
 "Engineered Bloom":["tagd","DECLASSIFIED","Ocean iron fertilisation trials, published, peer-reviewed, twelve of them. Nobody thought to classify the results."],
 "Marine Cloud Brightening":["tagd","DECLASSIFIED","Reef-cooling trials off Queensland. The vessels are on the shipping register under their own names."],
 "Orbital Mirror":["tagr","[REDACTED]","Launch manifest sealed. The constellation is described in the budget as communications."],
 "Engineered Biology":["tagr","[REDACTED]","The programme has no name. The strain has a catalogue number and nothing else."],
 "The AMOC Lever":["tagr","[REDACTED]","There is no annex. There is no study. There is a valve and a decision."],
};
/* THE STORM WATCH — a cyclone the record is about to produce, and a wing
   that can be over it in days. A hurricane is the fastest thing in the game,
   so the offer is a flash, not a directive: take a coast or let it go. It
   stands for this review only. */
let stormOffer=null;
function hideStormCard(){ const el=$("stormcard"); if(el) el.style.display="none"; stormOffer=null; }
function stormWatch(){
  if(!running || !eng.eras || !eng.wingOnline("Hurricane Steering")) return hideStormCard();
  const cap=CAPS.find(c=>c.name==="Hurricane Steering"); if(!cap) return hideStormCard();
  const nx=t+1, f=atlanticForcing();
  const cand=HISTORY.storms.filter(s=>s.t===nx && s.cat>=2 && stormShown(s, basinFactor(s.basin)));
  if(!cand.length) return hideStormCard();
  const s=cand.slice().sort((a,b)=>b.peak-a.peak||b.cat-a.cat)[0];
  const pts=s.track||[];
  if(!pts.length) return hideStormCard();
  const near=REG.map((r,ri)=>({r,ri}))
    .filter(x=>isOnline(x.ri)&&REGPOS[x.r.name])
    .map(x=>{ const [la,lo]=REGPOS[x.r.name];
      const d=Math.min(...pts.map(p=>Math.hypot(p[0]-la,(p[1]-lo)*Math.cos(la*Math.PI/180))));
      return {name:x.r.name, d, home:x.r.homeland}; })
    .filter(x=>x.d<70).sort((a,b)=>a.d-b.d).slice(0,3);
  if(!near.length) return hideStormCard();
  stormOffer={s, near, cost:capCost("Hurricane Steering")};
  renderStormCard();
}
function renderStormCard(){
  if(!stormOffer) return hideStormCard();
  const {s, near, cost}=stormOffer, el=$("stormcard");
  const word=STORM_WORD[s.basin]||"Hurricane";
  const nm=s.name? `${word} ${s.name}` : `an unnamed ${word.toLowerCase()}`;
  $("sctitle").textContent=(s.name? `${word} ${s.name}` : `UNNAMED ${word}`).toUpperCase();
  $("sctext").innerHTML=`The record has ${nm} forming — <b>Category ${s.cat}</b>, ${s.peak?`${s.peak} knots at peak, `:""}making for ${placeName(s.dl)}.
    The seeding flights can be over the eyewall in days. <b>Choose a coast below — or click the storm on the globe and aim it yourself.</b>`;
  const armed=slots.some(x=>x.cap==="Hurricane Steering");
  $("scopts").innerHTML=near.map((n,i)=>
    `<button data-n="${i}"${armed?" disabled":""}>${n.name.toUpperCase()}${n.home?" · OURS":""}</button>`).join("");
  for(const b of $("scopts").querySelectorAll("button"))
    b.addEventListener("click",()=>{
      const n=near[+b.dataset.n];
      if(budgetRefuse(CAPS.find(c=>c.name==="Hurricane Steering"))) return;
      slots.push({cap:"Hurricane Steering", target:n.name});
      clampContainment(); renderTray(); sfxClick();
      wire(`<span class="tag tagd">FLASH</span> The flights are ordered onto ${nm}. It will cross at <b>${n.name}</b>.`,"op");
      hideStormCard();
    });
  $("sccost").textContent=armed? "flights already ordered" : `$${cost}M · the wing is standing`;
  el.style.display="block";
}
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
/* chyrons: a queue, not a firehose. At most three on screen, each held
   long enough to read, spaced apart, fading out; duplicates collapse. */
const ALERT_MAX=3, ALERT_LIFE=5200, ALERT_GAP=1000, ALERT_FADE=700;
const alertQ=[]; let alertLive=0, lastAlertAt=-1e9, alertTimer=null;
function alertStrip(msg){
  if(typeof replaying!=="undefined" && replaying) return;
  if(alertQ.includes(msg) || [...$("alerts").children].some(d=>d.textContent===msg)) return;
  alertQ.push(msg); pumpAlerts();
}
function pumpAlerts(){
  if(alertTimer){ clearTimeout(alertTimer); alertTimer=null; }
  if(!alertQ.length) return;
  const now=performance.now(), wait=ALERT_GAP-(now-lastAlertAt);
  if(alertLive>=ALERT_MAX) return;                       // a removal will pump again
  if(wait>0){ alertTimer=setTimeout(pumpAlerts, wait); return; }
  const msg=alertQ.shift(); lastAlertAt=now; alertLive++;
  const d=document.createElement("div"); d.className="alertstrip"; d.textContent=msg;
  $("alerts").prepend(d); sfxAlert();
  const gone=()=>{ d.remove(); alertLive--; pumpAlerts(); };
  setTimeout(()=>{ if(reduced){ gone(); return; } d.classList.add("out"); setTimeout(gone, ALERT_FADE); }, ALERT_LIFE);
  if(alertQ.length) alertTimer=setTimeout(pumpAlerts, ALERT_GAP);
}
function shakeNow(){ sfxBoom(); if(reduced) return;
  const w=$("globe-wrap"); w.classList.remove("shake"); void w.offsetWidth;
  w.classList.add("shake"); }
function alarm(){ sfxKlaxon(); if(reduced) return;
  const a=$("alarmflash"); a.classList.remove("on"); void a.offsetWidth;
  a.classList.add("on"); }


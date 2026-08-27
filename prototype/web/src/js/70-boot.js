/* --------------------------------------------------------------- misc */
buildTray(); clampContainment(); renderTray(); renderDirective(); renderReviewButton();
// the nation picker: choosing another programme stores the choice and reloads the console with it
{ const home=REG.find(r=>r.homeland);
  $("introHome").textContent="the "+home.name; $("introCrop").textContent=(home.crop||"").toLowerCase();
  const row=$("homepickrow");
  const crop=r=>(REG.find(x=>x.name===r)||{}).crop||"";
  for(const [region,st] of Object.entries(STARTS).sort((a,b)=>(a[1].rank||9)-(b[1].rank||9))){
    const b=document.createElement("button"); b.className="hp"+(region===HOMELAND?" on":"");
    b.innerHTML=`<div class="hp-top"><span class="hp-nation">${st.nation}</span><span class="hp-diff" style="color:${st.dcol};border-color:${st.dcol}">${st.difficulty}</span></div>
      <div class="hp-meta">${region} · ${crop(region).toLowerCase()}</div>
      <div class="hp-meta">chest <b>$${st.treasury}M</b> · committee <b>${(st.mandate||0)>=0?"+":""}${st.mandate||0}</b> · rival <b>${st.rivalName}</b></div>
      <div class="hp-cols"><div><div class="hp-h">STRENGTHS</div>${(st.plus||[]).map(x=>`<div class="hp-li p">${x}</div>`).join("")}</div>
      <div><div class="hp-h">WEAKNESSES</div>${(st.minus||[]).map(x=>`<div class="hp-li m">${x}</div>`).join("")}</div></div>`;
    b.addEventListener("click",()=>{ if(region===HOMELAND) return; try{ localStorage.setItem("fm.homeland", region); }catch(e){} location.reload(); });
    row.appendChild(b); } }
requestAnimationFrame(drawGlobe);            // every part has run; the loop may start
const savedLog=loadSave();
if(savedLog){ $("resume").style.display=""; $("begin").textContent="NEW PROGRAMME ▸"; }
let introDismissed=false;
$("begin").addEventListener("click",()=>{ introDismissed=true; $("intro").style.display="none";
  clearSave(); audioInit(); sfxClick();
  SEASON_MS=clockMs(); seasonDeadline=performance.now()+SEASON_MS; });
$("resume").addEventListener("click",async()=>{ introDismissed=true; $("intro").style.display="none";
  audioInit(); sfxClick(); $("resume").disabled=true;
  await replaySave(savedLog); });
$("intro").style.display="none";
// the boot screen holds until you click: link established, then CLICK TO START;
// the boot fades out and the operating brief fades in
setTimeout(()=>{ $("bootline").textContent="■ SECURE LINK ESTABLISHED"; $("bootgo").style.display="block"; }, 2400);
let bootDone=false;
function leaveBoot(){
  if(bootDone) return; bootDone=true;
  const b=$("boot"), i=$("intro");
  b.classList.add("out");
  setTimeout(()=>{ b.style.display="none"; if(introDismissed) return; i.style.display="flex"; i.classList.add("in");
    requestAnimationFrame(()=>requestAnimationFrame(()=>i.classList.add("shown"))); }, reduced?0:900);
}
$("boot").addEventListener("click",leaveBoot);
addEventListener("keydown",(e)=>{ if($("boot").style.display!=="none" && !bootDone && (e.key==="Enter"||e.key===" ")) leaveBoot(); });
function toggleView(){
  FLAT=!FLAT;
  $("viewtoggle").textContent="VIEW: "+(FLAT?"FLAT MAP":"GLOBE");
  $("viewbtn").textContent = FLAT? "▭ FLAT MAP · ◉ GLOBE" : "◉ GLOBE · ▭ FLAT MAP";
  sfxClick();
}
$("viewtoggle").addEventListener("click",toggleView);
$("viewbtn").addEventListener("click",toggleView);
$("wiretoggle").addEventListener("click",()=>{
  SHOW_WIRES=!SHOW_WIRES;
  $("wiretoggle").textContent="WIRES: "+(SHOW_WIRES?"ON":"OFF");
  sfxClick();
});
$("sndtoggle").addEventListener("click",()=>{
  sndMuted=!sndMuted;
  $("sndtoggle").textContent="SOUND: "+(sndMuted?"OFF":"ON");
  if(!sndMuted){ audioInit(); sfxClick(); }
});
$("wire").classList.add("priority");
$("dcclose").addEventListener("click",()=>{ hideDirCard(); renderDirective(); sfxClick(); });
$("diropen").addEventListener("click",()=>{ const d=curDir(); if(d&&!gated(d)) showDirCard(d); renderDirective(); sfxClick(); });
$("wiremode").addEventListener("click",()=>{
  WIRE_PRIORITY=!WIRE_PRIORITY;
  $("wire").classList.toggle("priority", WIRE_PRIORITY);
  $("wiremode").textContent=WIRE_PRIORITY?"PRIORITY":"ALL";
  sfxClick();
});
$("clocktoggle").addEventListener("click",()=>{
  CLOCK_AUTO=!CLOCK_AUTO;
  $("clocktoggle").textContent="CLOCK: "+(CLOCK_AUTO?"AUTO":"MANUAL");
  if(CLOCK_AUTO && running && seasonDeadline!==null && seasonDeadline<performance.now()) seasonDeadline=performance.now()+SEASON_MS;
  sfxClick();
});
$("teltoggle").addEventListener("click",()=>{
  telemetry=!telemetry;
  $("dosnum").style.display=telemetry?"inline":"none";
  $("teltoggle").textContent="TELEMETRY: "+(telemetry?"FULL (playtest)":"LADDER ONLY");
});

/* --------------------------------------------------------------- misc */
buildTray(); clampContainment(); renderTray(); renderDirective(); renderReviewButton();
// the nation picker: choosing another programme stores the choice and reloads the console with it
{ const home=REG.find(r=>r.homeland);
  $("introHome").textContent="the "+home.name; $("introCrop").textContent=(home.crop||"").toLowerCase();
  const row=$("homepickrow");
  const crop=r=>(REG.find(x=>x.name===r)||{}).crop||"";
  for(const [region,original] of Object.entries(STARTS).sort((a,b)=>(a[1].rank||9)-(b[1].rank||9))){
    const rr=REG.find(r=>r.name===region);
    const st=CRISIS?{...original,treasury:120,plus:[`Export participation ${Math.round(rr.export*100)}%`,`Production weight ${fmt(rr.weight,1)}`],minus:[`Drought sensitivity ${rr.sens}`,`Weather variability ${rr.sigma}`]}:original;
    const b=document.createElement("button"); b.className="hp"+(region===HOMELAND?" on":"");
    b.innerHTML=`<div class="hp-top"><span class="hp-nation">${st.nation}</span><span class="hp-diff" style="color:${st.dcol};border-color:${st.dcol}">${st.difficulty}</span></div>
      <div class="hp-meta">${region} · ${crop(region).toLowerCase()}</div>
      <div class="hp-meta">chest <b>$${st.treasury}M</b> · committee <b>${(st.mandate||0)>=0?"+":""}${st.mandate||0}</b> · rival <b>${st.rivalName}</b></div>
      <div class="hp-cols"><div><div class="hp-h">STRENGTHS</div>${(st.plus||[]).map(x=>`<div class="hp-li p">${x}</div>`).join("")}</div>
      <div><div class="hp-h">WEAKNESSES</div>${(st.minus||[]).map(x=>`<div class="hp-li m">${x}</div>`).join("")}</div></div>`;
    b.addEventListener("click",()=>{ if(region===HOMELAND) return;
      try{ localStorage.setItem("fm.homeland", region); sessionStorage.setItem("fm.skipboot","1"); }catch(e){}
      const i=$("intro"); if(!reduced) fadeTo(i,0,400);
      setTimeout(()=>location.reload(), reduced?0:420); });
    row.appendChild(b); } }
requestAnimationFrame(drawGlobe);            // every part has run; the loop may start
const savedLog=loadSave();
if(savedLog){ $("resume").style.display=""; $("begin").textContent="NEW PROGRAMME ▸"; }
if(savedLog && saveRulesChanged){
  $("saverules").hidden=false;
  $("resume").textContent="RESUME WITH UPDATED RULES ▸";
}
/* ---- the way in: boot → operating brief → the world, all of it a fade.
   Nothing ever cuts, and the dashboard is never shown before it is played.
   Picking a programme reloads the console (the engine is built around the
   homeland), so it comes back straight to the brief, never to the boot. */
const SKIP="fm.skipboot";
let introDismissed=false, bootDone=false;
/* the fades are inline: no cascade to argue with, and they cannot be
   overridden by a stylesheet rule added later */
const FADE=800;
/* A full-screen fade over a heavy page will stall if it runs on the main
   thread: the globe loop and a four-megabyte document saturate it and the
   transition sits half-finished. Promote the layer, and always snap to the
   final value when the time is up so a stalled fade can never leave the
   screen ghosted. */
function fadeTo(el, to, ms, done){
  el.style.willChange="opacity";
  el.style.transition=`opacity ${ms}ms ease`;
  void el.offsetWidth;                             // commit the start value, no frame loop needed
  el.style.opacity=String(to);
  clearTimeout(el._fadeT);
  el._fadeT=setTimeout(()=>{                       // the settle: no half-faded screens, ever
    el.style.transition="none"; el.style.opacity=String(to); el.style.willChange="";
    if(done) done();
  }, ms+120);
}
function showIntro(instant){                // fade the brief up
  const i=$("intro"); if(introDismissed) return;
  i.style.display="flex";
  if(reduced||instant){ i.style.transition="none"; i.style.opacity="1"; return; }
  i.style.transition="none"; i.style.opacity="0"; void i.offsetWidth;
  fadeTo(i,1,FADE);
}
function leaveIntro(then){                  // fade the brief down, revealing the world
  if(introDismissed) return; introDismissed=true;
  const i=$("intro"); i.style.pointerEvents="none";
  if(reduced){ i.style.display="none"; if(then) then(); return; }
  fadeTo(i,0,FADE,()=>{ i.style.display="none"; if(then) then(); });
}
function leaveBoot(){
  if(bootDone) return; bootDone=true;
  const b=$("boot");
  showIntro();                              // the brief is already rising as the boot goes
  if(reduced){ b.style.display="none"; return; }
  fadeTo(b,0,900,()=>{ b.style.display="none"; });
}
$("boot").addEventListener("click",leaveBoot);
addEventListener("keydown",(e)=>{ if(!bootDone && (e.key==="Enter"||e.key===" ")) leaveBoot(); });
$("begin").addEventListener("click",()=>{ audioInit(); sfxClick(); clearSave();
  leaveIntro(()=>{ SEASON_MS=clockMs(); seasonDeadline=performance.now()+SEASON_MS; }); });
$("resume").addEventListener("click",()=>{ audioInit(); sfxClick(); $("resume").disabled=true;
  leaveIntro(async()=>{ await replaySave(savedLog); }); });
$("intro").style.display="none";
let skipBoot=false; try{ skipBoot=sessionStorage.getItem(SKIP)==="1"; sessionStorage.removeItem(SKIP); }catch(e){}
if(skipBoot){                               // came back from choosing a programme
  $("boot").style.display="none"; bootDone=true; showIntro(true);   // you were just on this screen
} else {                                    // the boot holds until you click
  setTimeout(()=>{ $("bootline").textContent="■ SECURE LINK ESTABLISHED"; $("bootgo").style.display="block"; }, 2400);
}
function toggleView(){
  FLAT=!FLAT;
  $("viewtoggle").textContent="VIEW: "+(FLAT?"FLAT MAP":"GLOBE");
  $("viewbtn").textContent = FLAT? "▭ FLAT MAP · ◉ GLOBE" : "◉ GLOBE · ▭ FLAT MAP";
  sfxClick();
}
$("viewtoggle").addEventListener("click",toggleView);
$("viewbtn").addEventListener("click",toggleView);
$("wiretoggle").addEventListener("click",()=>{
  WIRE_MODE=WIRE_MODE==="selected"?"all":WIRE_MODE==="all"?"off":"selected"; SHOW_WIRES=WIRE_MODE!=="off";
  $("wiretoggle").textContent="WIRES: "+WIRE_MODE.toUpperCase();
  sfxClick();
});
$("sndtoggle").addEventListener("click",()=>{
  sndMuted=!sndMuted;
  $("sndtoggle").textContent="SOUND: "+(sndMuted?"OFF":"ON");
  if(!sndMuted){ audioInit(); sfxClick(); }
});
$("wire").classList.add("priority");
$("dcclose").addEventListener("click",()=>{ hideDirCard(); renderDirective(); sfxClick(); });
$("scclose").addEventListener("click",()=>{ hideStormCard(); sfxClick(); });
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

$("campaignbrief").textContent=CRISIS ? "THE SIXTEEN-REVIEW CRISIS · 2030–33. Failed rains, an export squeeze, then the floods. Finish sixteen reviews, average at least 85% homeland output over the last four, and retain $100M. Each nation has a $120M emergency chest. Eight wings are available; their upkeep still costs money. This scenario is fictional." : "THE LONG RECORD · 1946–2060. Or take command of a sixteen-review crisis with a defined recovery objective.";
$("campaignmode").textContent=CRISIS?"RETURN TO THE LONG RECORD ▸":"PLAY THE SIXTEEN-REVIEW CRISIS ▸";
$("campaignmode").addEventListener('click',()=>{try{localStorage.setItem('fm.mode',CRISIS?'long':'crisis');}catch(e){} location.reload();});

for(const r of REG){ const option=document.createElement('option');option.value=r.name;option.textContent=r.name;$("regionpick").appendChild(option); }
$("regionpick").addEventListener('change',()=>{focusObservation($("regionpick").value);});
$("regionarm").addEventListener('click',()=>armRegion($("regionpick").value));
renderRegionInspector();

if(CRISIS){
  $("longbrief").textContent='2030. An emergency directorate inherits a harvest crisis and a $120M chest. Choose your homeland below. Sixteen seasonal reviews: protect output, manage the cost of your wings, and retain enough money to keep the programme alive. The rival has limited funds and watches repeated interventions.';
  $("clock").textContent='2030 · WINTER · CRISIS';
  $("hFunds").textContent='$120.0M';$("hFree").textContent='$'+fmt(spendable(),0)+'M';
  $("wire").innerHTML='<p><span class="stamp">2030·W</span> Emergency authority established. Failed rains are expected next season. The committee requires recovery and a $100M closing reserve.</p>';
}

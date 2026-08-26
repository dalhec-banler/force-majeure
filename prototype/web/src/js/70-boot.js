/* --------------------------------------------------------------- misc */
buildTray(); clampContainment(); renderTray(); renderDirective(); renderReviewButton();
// the nation picker: choosing another programme stores the choice and reloads the console with it
{ const home=REG.find(r=>r.homeland);
  $("introHome").textContent="the "+home.name; $("introCrop").textContent=(home.crop||"").toLowerCase();
  const row=$("homepickrow");
  for(const [region,st] of Object.entries(STARTS)){
    const b=document.createElement("button"); b.className="hp"+(region===HOMELAND?" on":"");
    b.innerHTML=`<b>${st.nation} <em style="color:${st.dcol}">${st.difficulty}</em></b><span>${region} · chest $${st.treasury}M · rival: ${st.rivalName}</span><span>${st.blurb}</span>
      <span class="hp-pm">${(st.plus||[]).map(x=>`<i class="p">+ ${x}</i>`).join("")}${(st.minus||[]).map(x=>`<i class="m">− ${x}</i>`).join("")}</span>`;
    b.addEventListener("click",()=>{ if(region===HOMELAND) return; try{ localStorage.setItem("fm.homeland", region); }catch(e){} location.reload(); });
    row.appendChild(b); } }
requestAnimationFrame(drawGlobe);            // every part has run; the loop may start
const savedLog=loadSave();
if(savedLog){ $("resume").style.display=""; $("begin").textContent="NEW PROGRAMME ▸"; }
$("begin").addEventListener("click",()=>{ $("intro").style.display="none";
  clearSave(); audioInit(); sfxClick();
  SEASON_MS=clockMs(); seasonDeadline=performance.now()+SEASON_MS; });
$("resume").addEventListener("click",async()=>{ $("intro").style.display="none";
  audioInit(); sfxClick(); $("resume").disabled=true;
  await replaySave(savedLog); });
$("intro").style.display="none";
const bootT=setTimeout(()=>{ $("boot").style.display="none";
  $("intro").style.display="flex"; }, 2600);
$("boot").addEventListener("click",()=>{ clearTimeout(bootT);
  $("boot").style.display="none"; $("intro").style.display="flex"; });
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

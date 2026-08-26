/* --------------------------------------------------------------- misc */
buildTray(); clampContainment(); renderTray(); renderDirective(); renderReviewButton();
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

/* --------------------------------------------------------------- misc */
buildTray(); clampContainment(); renderTray(); renderDirective();
$("begin").addEventListener("click",()=>{ $("intro").style.display="none";
  audioInit(); sfxClick();
  seasonDeadline=performance.now()+SEASON_MS; });
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
$("teltoggle").addEventListener("click",()=>{
  telemetry=!telemetry;
  $("dosnum").style.display=telemetry?"inline":"none";
  $("teltoggle").textContent="TELEMETRY: "+(telemetry?"FULL (playtest)":"LADDER ONLY");
});

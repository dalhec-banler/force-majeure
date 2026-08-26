/* ---------------------------------------------------------------- globe */
const cv = $("globe"), cx = cv.getContext("2d");
let W=0,H=0,CXp=0,CYp=0,Rp=0,Rbase=0,zoom=1,
    rot = -30, tilt = -18, dragging=false, moved=0, lastX=0;
/* The globe is sized and centred on the FREE pane — the strip between the
   top instruments and the tool tray — not on the whole pane, so a short or
   narrow window shrinks the world instead of burying it under the tray. */
function sizeGlobe(){
  const rect = cv.parentElement.getBoundingClientRect();
  const dpr = devicePixelRatio||1;
  if(cv.width!==Math.round(rect.width*dpr)||cv.height!==Math.round(rect.height*dpr)){
    cv.width = Math.round(rect.width*dpr); cv.height = Math.round(rect.height*dpr); }
  cx.setTransform(dpr,0,0,dpr,0,0);
  W=rect.width; H=rect.height;
  const ts=$("topstrip"), tb=$("toolbar");
  const top = ts? Math.max(0,(ts.getBoundingClientRect().bottom-rect.top)) : 0;
  const bot = tb? Math.max(top+80, tb.getBoundingClientRect().top-rect.top-26) : H;   // the tray's own top (the hint line above it), never a floating card
  const free=Math.max(120, bot-top);
  CXp=W/2; CYp=top+free/2;
  Rbase=Math.min(W*0.44, free*0.5); Rp=Rbase*zoom;
}
addEventListener("resize", sizeGlobe); sizeGlobe();
if(typeof ResizeObserver!=="undefined"){ const ro=new ResizeObserver(()=>sizeGlobe()); ro.observe(cv.parentElement); const tb=$("toolbar"); if(tb) ro.observe(tb); }   // the tray itself, not the wrapper — the floating card must not move the globe
let lastY=0;
cv.addEventListener("pointerdown",e=>{dragging=true;moved=0;lastX=e.clientX;lastY=e.clientY;cv.setPointerCapture(e.pointerId)});
cv.addEventListener("pointerup",e=>{ dragging=false; if(moved<5) globeClick(e); });
cv.addEventListener("pointermove",e=>{
  if(dragging){
    const dx=e.clientX-lastX, dy=e.clientY-lastY;
    moved+=Math.abs(dx)+Math.abs(dy);
    rot+=dx*0.35;
    tilt=Math.max(-80,Math.min(80,tilt+dy*0.3));
    lastX=e.clientX; lastY=e.clientY;
  }
  else hoverCheck(e); });
cv.addEventListener("pointerleave",()=>$("hover").style.display="none");
cv.addEventListener("wheel",e=>{ e.preventDefault();
  zoom=Math.max(1,Math.min(5,zoom*Math.exp(-e.deltaY*0.0012)));
  Rp=Rbase*zoom; },{passive:false});

const D2R = Math.PI/180;
function project(lat,lon){
  if(FLAT){
    const lo=((((lon+rot)%360)+540)%360)-180;
    return { x:CXp+lo/360*(Rp*3.4), y:CYp-lat/180*(Rp*1.7),
             vis:Math.abs(lat)<=87 && Math.abs(lo)<=176, z:1 };
  }
  const la=lat*D2R, lo=(lon+rot)*D2R, ti=tilt*D2R;
  const x0=Math.cos(la)*Math.sin(lo), y0=Math.sin(la), z0=Math.cos(la)*Math.cos(lo);
  const y=y0*Math.cos(ti)-z0*Math.sin(ti), z=y0*Math.sin(ti)+z0*Math.cos(ti);
  return {x:CXp+Rp*x0, y:CYp-Rp*y, vis:z>0.02, z};
}

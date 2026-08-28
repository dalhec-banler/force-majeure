/* ---------------------------------------------------------------- globe */
const cv = $("globe"), cx = cv.getContext("2d");
let W=0,H=0,CXp=0,CYp=0,Rp=0,Rbase=0,zoom=1,
    rot = -30, tilt = -18, dragging=false, moved=0, lastX=0;
/* The globe is sized and centred on the FREE pane — the strip between the
   legend and the tool tray. The insets are CACHED and re-measured only when
   the layout itself changes: a chyron, a banner, a briefing card or an
   armed-op pill appears and disappears constantly, and the world must not
   resize every time one does. */
let insetTop=56, insetBot=112;
function measureInsets(){
  const rect = cv.parentElement.getBoundingClientRect();
  const lg=$("legend"), tb=$("toolbar");
  if(lg){ const b=lg.getBoundingClientRect(); if(b.height) insetTop=Math.max(24, b.bottom-rect.top+10); }
  if(tb){ const b=tb.getBoundingClientRect();
    // the tray plus the hint line above it; if the tray has not been built
    // yet, reserve what it will take rather than letting the globe run under it
    insetBot = b.height? Math.max(84, rect.bottom-b.top+28) : 112; }
}
function sizeGlobe(){
  const rect = cv.parentElement.getBoundingClientRect();
  const dpr = devicePixelRatio||1;
  const bw=Math.round(rect.width*dpr), bh=Math.round(rect.height*dpr);
  if(cv.width!==bw||cv.height!==bh){ cv.width=bw; cv.height=bh; }
  cx.setTransform(dpr,0,0,dpr,0,0);
  W=rect.width; H=rect.height;
  const free=Math.max(120, H-insetTop-insetBot);
  CXp=W/2; CYp=insetTop+free/2;
  Rbase=Math.min(W*0.44, free*0.5); Rp=Rbase*zoom;
}
function relayout(){ measureInsets(); sizeGlobe(); }
addEventListener("resize", relayout); relayout();
if(typeof ResizeObserver!=="undefined"){
  // the pane and the tray are the only things that may move the world;
  // #alerts, #banner, #briefcard and #armed come and go over the top of it
  const ro=new ResizeObserver(()=>relayout());
  ro.observe(cv.parentElement); const tb=$("toolbar"); if(tb) ro.observe(tb); const lg=$("legend"); if(lg) ro.observe(lg);
}
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

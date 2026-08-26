/* ---------------------------------------------------------------- globe */
const cv = $("globe"), cx = cv.getContext("2d");
let W=0,H=0,CXp=0,CYp=0,Rp=0,Rbase=0,zoom=1,
    rot = -30, tilt = -18, dragging=false, moved=0, lastX=0;
function sizeGlobe(){
  const rect = cv.parentElement.getBoundingClientRect();
  const dpr = devicePixelRatio||1;
  cv.width = rect.width*dpr; cv.height = rect.height*dpr;
  cx.setTransform(dpr,0,0,dpr,0,0);
  W=rect.width; H=rect.height; CXp=W/2; CYp=H/2-14;
  Rbase=Math.min(W,H)*0.40; Rp=Rbase*zoom;
}
addEventListener("resize", sizeGlobe); sizeGlobe();
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

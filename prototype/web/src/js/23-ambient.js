/* ambient life — cosmetic weather; the planet breathes on its own */
const VOLCANOES=[
  {name:"Etna", pos:[37.7,15.0], dl:"CATANIA",
   line:"Etna in full eruption. Ash closes Mediterranean air routes."},
  {name:"Popocatépetl", pos:[19.0,-98.6], dl:"MEXICO CITY",
   line:"Popocatépetl sends ash ten kilometres up. The city sweeps grey streets."},
  {name:"Merapi", pos:[-7.5,110.4], dl:"JAKARTA",
   line:"Merapi erupting. Villages on the slopes evacuated."},
  {name:"Kilauea", pos:[19.4,-155.3], dl:"HONOLULU",
   line:"Kilauea pours new land into the sea. Crowds gather at dusk to watch."},
];
const volcanoActive=(i,ts)=> ((ts + i*3) % 9) < 2;
const STORM_SRC="__STORM__";
const VOLCANO_SRC="__VOLCANO__"; const SMOKE_SRC="__SMOKE__";
const volcImg=new Image(); let volcReady=false;
volcImg.onload=()=>{volcReady=true;}; volcImg.src=VOLCANO_SRC;
const smokeImg=new Image(); let smokeReady=false;
smokeImg.onload=()=>{smokeReady=true;}; smokeImg.src=SMOKE_SRC;
/* A real hurricane (Isabel, NASA MODIS 2003, public domain), cut out of its
   ocean and rotated at a creep — the way storms actually turn from orbit. */
const stormImg=new Image(); let stormReady=false;
stormImg.onload=()=>{stormReady=true;}; stormImg.src=STORM_SRC;
function drawCyclone(p, diaFrac, nowMs, opts){
  if(!stormReady) return;
  const o=opts||{};
  const size=Rp*diaFrac*(o.scale||1);
  const sh=(o.lat!==undefined && o.lat<0);
  cx.save(); cx.translate(p.x,p.y);
  cx.rotate((sh?1:-1)*nowMs/60000 + (o.variant||0)*2.1);
  if(sh) cx.scale(-1,1);
  cx.globalAlpha=o.alpha!==undefined?o.alpha:1;
  cx.drawImage(stormImg,-size/2,-size/2,size,size);
  cx.restore();
}
function drawAmbient(nowMs){
  const k=Rp*0.055;
  // slow roaming cyclones, one per basin, drifting west
  const basins=[[15,-52],[13,138],[-13,72]];
  for(let i=0;i<3;i++){
    const lat=basins[i][0]+3*Math.sin(t*1.3+i*2.1);
    const lon=basins[i][1]-10-8*Math.sin(t*0.9+i*1.7)-6*Math.sin(nowMs*0.00002+i*2.4);
    const p=project(lat,lon); if(!p.vis) continue;
    drawCyclone(p, 0.17+i*0.02, nowMs+i*900, {alpha:0.9, lat, variant:i});
  }
  // volcanoes: vent glow + large slow smoke plume when active
  for(let i=0;i<VOLCANOES.length;i++){
    if(!volcanoActive(i, Math.max(1,t))) continue;
    const p=project(...VOLCANOES[i].pos); if(!p.vis) continue;
    const fl=0.6+0.4*Math.sin(nowMs/120+i);
    cx.fillStyle=`rgba(255,150,60,${0.9*fl})`;
    cx.beginPath(); cx.arc(p.x,p.y,1.8,0,7); cx.fill();
    if(volcReady){
      if(Math.sin(nowMs/97+i*7)>0.985){          // lightning in the column
        cx.strokeStyle="rgba(255,255,255,.9)"; cx.lineWidth=1.5;
        cx.beginPath(); cx.moveTo(p.x+2,p.y-k*2);
        cx.lineTo(p.x-2,p.y-k*1.2); cx.lineTo(p.x+3,p.y-k*0.5);
        cx.stroke(); cx.lineWidth=1;
      }
      const vw=k*8*(1+0.05*Math.sin(nowMs/3000+i));
      cx.save();
      cx.translate(p.x+vw*0.1,p.y-vw*0.12);
      cx.rotate(0.05*Math.sin(nowMs/4200+i));
      cx.globalAlpha=0.92;
      cx.drawImage(volcImg,-vw*0.38,-vw*0.62,vw,vw);
      cx.restore();
    }
  }
}
let stars=null, starsW=0, starsH=0;
function makeStars(){
  stars=[]; starsW=W; starsH=H;
  let sd=1013904223>>>0;
  const rnd=()=>((sd=(sd*1664525+1013904223)>>>0)/4294967296);
  for(let i=0;i<150;i++)
    stars.push({x:rnd()*W, y:rnd()*H, r:rnd()*1.1+0.3, tw:rnd()*6.28});
}
function drawStars(nowMs){
  if(!stars||starsW!==W||starsH!==H) makeStars();
  for(const st of stars){
    if(!FLAT){
      const d=Math.hypot(st.x-CXp,st.y-CYp);
      if(d<Rp*1.05) continue;
    } else if(Math.abs(st.x-CXp)<Rp*1.72 && Math.abs(st.y-CYp)<Rp*0.86) continue;
    const a=0.35+0.45*Math.abs(Math.sin(nowMs/1400+st.tw));
    cx.fillStyle=`rgba(210,225,240,${a})`;
    cx.beginPath(); cx.arc(st.x,st.y,st.r,0,7); cx.fill();
  }
}

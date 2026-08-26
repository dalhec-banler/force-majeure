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
      const vw=k*8*(1+0.05*Math.sin(nowMs/3000+i));
      cx.save();
      cx.translate(p.x+vw*0.1,p.y-vw*0.12);
      cx.rotate(0.05*Math.sin(nowMs/4200+i));
      cx.globalAlpha=0.92;
      cx.drawImage(volcImg,-vw*0.38,-vw*0.62,vw,vw);
      cx.restore();
      drawVolcanicLightning(p, vw, i, nowMs);
    }
  }
}
/* volcanic lightning — violet-white, branching, inside the ash column, lit
   from within, gone in a sixth of a second, never on a rhythm. Three
   authored strike variants, chosen per strike; every channel is a
   midpoint-displaced path with forks that fork again. */
function hash01(a,b){ let h=(Math.imul(a,374761393)+Math.imul(b,668265263))|0;
  h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; }
const BOLT_VARIANTS=[
  {name:"fork",  branches:3, spread:1.0, len:0.55, twin:false, amp:0.13},
  {name:"twin",  branches:2, spread:1.3, len:0.65, twin:true,  amp:0.10},
  {name:"crown", branches:4, spread:0.8, len:0.42, twin:false, amp:0.16},
];
// a jagged channel from (x0,y0) to (x1,y1): midpoint displacement, `amp`
// as a fraction of the channel length, `rnd(n)` a deterministic 0..1
function boltChannel(x0,y0,x1,y1,amp,rnd,depth){
  const pts=[[x0,y0],[x1,y1]], L=Math.hypot(x1-x0,y1-y0);
  let n=0;
  for(let d=0; d<depth; d++){
    for(let i=pts.length-1;i>0;i--){
      const [ax,ay]=pts[i-1],[bx,by]=pts[i];
      const mx=(ax+bx)/2, my=(ay+by)/2, nx=-(by-ay), ny=(bx-ax);
      const nl=Math.hypot(nx,ny)||1, off=(rnd(n++)-0.5)*2*amp*L/Math.pow(2,d);
      pts.splice(i,0,[mx+nx/nl*off, my+ny/nl*off]);
    }
  }
  return pts;
}
function drawVolcanicLightning(p, vw, i, nowMs){
  const BUCKET=450, LIFE=170;
  const b=Math.floor(nowMs/BUCKET);
  if(hash01(b,i*17+3)>0.10) return;                 // most buckets: nothing
  const age=(nowMs-b*BUCKET)/LIFE; if(age>1) return;
  // snap on, decay, and a re-strike flicker at mid-life
  let fade=age<0.12? age/0.12 : 1-(age-0.12)/0.88;
  if(age>0.5&&age<0.62) fade=Math.min(1,fade+0.5);
  let seed=0; const h=(n)=>hash01(b*131+n, i*7+1); const rnd=()=>h(seed++);
  const V=BOLT_VARIANTS[Math.floor(h(999)*BOLT_VARIANTS.length)];
  const lw=Math.max(0.9,vw/170);
  // the vent, and the top of the channel up in the ash (which rises up-right)
  const x1=p.x+vw*0.04, y1=p.y-vw*0.02;
  const x0=p.x+vw*(0.12+0.26*rnd()), y0=p.y-vw*(0.34+0.24*rnd());
  const channels=[];                                   // [{pts, w}]
  const main=boltChannel(x0,y0,x1,y1,V.amp,rnd,4);
  channels.push({pts:main,w:1});
  if(V.twin){
    const tx=x0+vw*0.14*(rnd()-0.5), ty=y0-vw*0.06*rnd();
    channels.push({pts:boltChannel(tx,ty,x1+vw*0.02,y1,V.amp,rnd,4),w:0.8});
  }
  // branches: fork off the main channel at different heights, angled away,
  // shorter, and each may fork once more
  const mainAngle=Math.atan2(y1-y0,x1-x0);
  const fork=(src,w,gen)=>{
    const nb=gen===0? V.branches : (rnd()<0.6?1:0);
    for(let k=0;k<nb;k++){
      const fi=1+Math.floor(rnd()*(src.length-3)*0.7);  // upper 70% of the channel
      const [fx,fy]=src[fi];
      const side=(k%2===0?1:-1)*(rnd()<0.85?1:-1);
      const ang=mainAngle+side*(0.45+0.5*rnd())*V.spread;
      const len=vw*(0.14+0.22*rnd())*V.len*(gen===0?1:0.55);
      const ex=fx+Math.cos(ang)*len, ey=fy+Math.sin(ang)*len;
      const br=boltChannel(fx,fy,ex,ey,V.amp*1.2,rnd,3);
      channels.push({pts:br,w:w*(gen===0?0.55:0.35)});
      if(gen<1) fork(br,w*0.55,gen+1);
    }
  };
  fork(main,1,0);
  const path=(arr)=>{ cx.beginPath(); cx.moveTo(arr[0][0],arr[0][1]); for(let q=1;q<arr.length;q++) cx.lineTo(arr[q][0],arr[q][1]); };
  cx.save(); cx.globalCompositeOperation="lighter"; cx.globalAlpha=fade; cx.lineJoin="round"; cx.lineCap="round";
  // the column lights from inside
  const gx=(x0+x1)/2, gy=(y0+y1)/2;
  const g=cx.createRadialGradient(gx,gy,0,gx,gy,vw*0.5);
  g.addColorStop(0,"rgba(190,160,255,.38)"); g.addColorStop(1,"rgba(190,160,255,0)");
  cx.fillStyle=g; cx.beginPath(); cx.arc(gx,gy,vw*0.5,0,7); cx.fill();
  // glow pass, core pass, filament pass — thickest channels first
  channels.sort((a,b2)=>b2.w-a.w);
  for(const c of channels){ path(c.pts); cx.strokeStyle=`rgba(170,130,255,${0.22*c.w+0.06})`; cx.lineWidth=(5*c.w+1)*lw; cx.stroke(); }
  for(const c of channels){ path(c.pts); cx.strokeStyle=`rgba(215,195,255,${0.45*c.w+0.2})`; cx.lineWidth=(2*c.w+0.4)*lw; cx.stroke(); }
  for(const c of channels){ path(c.pts); cx.strokeStyle=`rgba(255,255,255,${0.6*c.w+0.35})`; cx.lineWidth=(0.9*c.w+0.25)*lw; cx.stroke(); }
  cx.restore(); cx.lineWidth=1;
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

function drawGlobe(now){
  if(!dragging && !reduced && !FLAT) rot += 0.022;
  const nowMs=now||0;
  cx.clearRect(0,0,W,H);
  const FC=(running&&eng.knowledge.on&&lastRow())? eng.knowledge.forecast():null;
  drawStars(nowMs);
  const earthOn = drawEarth(nowMs);
  if(!earthOn){
    // fallback: the phosphor wireframe, if WebGL is unavailable
    const g = cx.createRadialGradient(CXp,CYp,Rp*0.1,CXp,CYp,Rp*1.06);
    g.addColorStop(0,"#0d1a12"); g.addColorStop(0.94,"#0b150e");
    g.addColorStop(1,"rgba(83,217,123,0)");
    cx.fillStyle=g; cx.beginPath(); cx.arc(CXp,CYp,Rp*1.06,0,7); cx.fill();
    cx.strokeStyle="rgba(83,217,123,.35)"; cx.lineWidth=1;
    cx.beginPath(); cx.arc(CXp,CYp,Rp,0,7); cx.stroke();
    cx.strokeStyle="rgba(83,217,123,.08)";
    for(let la=-60;la<=60;la+=30) strokePath(pts(90,i=>[la,-180+i*4]));
    for(let lo=-180;lo<180;lo+=30) strokePath(pts(60,i=>[-88+i*3,lo]));
    cx.strokeStyle="rgba(140,220,165,.55)"; cx.lineWidth=1;
    for(const ring of LAND) strokePath(ring.map(([lo,la])=>[la,lo]));
  }

  const row = lastRow();
  // aerosol color grade + drifting stratospheric veil
  const glob = row ? row.driverTotals[3] : 0;
  if(glob>0.05){
    if(!FLAT){
      cx.fillStyle=`rgba(224,164,88,${Math.min(0.22,glob*0.16)})`;
      cx.beginPath(); cx.arc(CXp,CYp,Rp,0,7); cx.fill();
    }
    for(const la of [22,0,-22]){
      cx.strokeStyle=`rgba(224,164,88,${Math.min(0.3,glob*0.2)})`; cx.lineWidth=5;
      strokePath(pts(90,i=>[la+3*Math.sin(i/7+nowMs/4200), -180+i*4]));
    }
    cx.lineWidth=1;
    if(!FLAT){
      cx.strokeStyle=`rgba(224,164,88,${Math.min(0.6,glob*0.4)})`;
      cx.beginPath(); cx.arc(CXp,CYp,Rp*1.05,0,7); cx.stroke();
    }
  }
  const DEVG=devastation();
  if(DEVG>0.4 && smokeReady){                    // the world smolders
    for(let hz=0;hz<3;hz++){
      const hw=Rp*(1.3+hz*0.5);
      const hx=CXp+Math.sin(nowMs/23000+hz*2.1)*Rp*0.5;
      const hy=CYp+Math.cos(nowMs/29000+hz*1.7)*Rp*0.35;
      cx.save(); cx.globalAlpha=0.10*(DEVG-0.3)*(hz+1);
      cx.translate(hx,hy); cx.rotate(nowMs/40000+hz);
      cx.drawImage(smokeImg,-hw/2,-hw/2,hw,hw);
      cx.restore();
    }
  }
  drawAmbient(nowMs);
  drawEffects(nowMs);
  drawWires(nowMs, row);

  for(const [d,[la,lo]] of Object.entries(DRVPOS)){
    const p=project(la,lo); if(!p.vis) continue;
    const v = row ? row.driverTotals[DRV.indexOf(d)] : MODEL.climate[0].drivers[DRV.indexOf(d)];
    cx.fillStyle="rgba(127,163,137,.9)";
    cx.font="9px "+getComputedStyle(document.body).getPropertyValue("--mono");
    cx.fillText(d, p.x-10, p.y-8);
    const col = v>=0? "rgba(224,164,88,.8)":"rgba(91,200,232,.8)";
    cx.strokeStyle=col; cx.strokeRect(p.x-9,p.y-3,18,4);
    cx.fillStyle=col;
    const w=Math.min(9,Math.abs(v)*5);
    cx.fillRect(v>=0?p.x:p.x-w, p.y-3, w, 4);
  }
  for(let ri=0;ri<REG.length;ri++){
    const r=REG[ri], p=project(...REGPOS[r.name]);
    if(!p.vis) continue;
    const sig = row? row.sigmas[ri] : r.sigma, a = row? row.anomalies[ri] : 0;
    const k = Rp*0.055;
    cx.strokeStyle="rgba(200,230,207,.4)"; cx.setLineDash([3,3]);
    cx.beginPath(); cx.arc(p.x,p.y,k*sig,0,7); cx.stroke(); cx.setLineDash([]);
    if(Math.abs(a)>0.03){
      cx.fillStyle=anomColor(a,0.34); cx.beginPath(); cx.arc(p.x,p.y,k*Math.abs(a),0,7); cx.fill();
      cx.strokeStyle=anomColor(a,0.9); cx.beginPath(); cx.arc(p.x,p.y,k*Math.abs(a),0,7); cx.stroke();
      if(Math.abs(a)>sig){ cx.strokeStyle="rgba(255,244,230,.9)"; cx.lineWidth=1.6;
        cx.beginPath(); cx.arc(p.x,p.y,k*Math.abs(a)+2,0,7); cx.stroke(); cx.lineWidth=1; }
    }
    // the forecast: what the known wiring says next season looks like
    if(FC && Math.abs(FC[ri].anomaly)>0.2){ const f=FC[ri].anomaly;
      cx.setLineDash([2,3]); cx.strokeStyle=anomColor(f,0.8);
      cx.beginPath(); cx.arc(p.x,p.y,k*Math.abs(f),0,7); cx.stroke(); cx.setLineDash([]); }
    // condition-coded target marker on a dark halo — visible on any terrain
    const yv = row? row.yields[ri] : 100;
    const cond = yv>=90? "#53d97b" : yv>=60? "#e0a458" : "#e05252";
    cx.fillStyle="rgba(3,7,5,.6)";
    cx.beginPath(); cx.arc(p.x,p.y,7.5,0,7); cx.fill();
    cx.save(); cx.translate(p.x,p.y); cx.rotate(Math.PI/4);
    cx.fillStyle=cond; cx.fillRect(-3.4,-3.4,6.8,6.8);
    cx.strokeStyle="rgba(3,7,5,.9)"; cx.lineWidth=1; cx.strokeRect(-3.4,-3.4,6.8,6.8);
    cx.restore();
    if(yv<60){                              // failing: pulsing distress ring
      const ph=(nowMs/900)%1;
      cx.strokeStyle=`rgba(224,82,82,${0.7*(1-ph)})`;
      cx.beginPath(); cx.arc(p.x,p.y,7+ph*9,0,7); cx.stroke();
    }
    if(r.homeland){ cx.strokeStyle="rgba(83,217,123,.9)"; cx.lineWidth=1.4;
      cx.beginPath(); cx.arc(p.x,p.y,10,0,7); cx.stroke(); cx.lineWidth=1; }
    if(zoom>=1.5){                          // zoomed in: name the target
      const label=r.name.length>18? r.name.slice(0,17)+"…" : r.name;
      cx.font="9px "+getComputedStyle(document.body).getPropertyValue("--mono");
      const tw=cx.measureText(label.toUpperCase()).width;
      cx.fillStyle="rgba(3,7,5,.65)";
      cx.fillRect(p.x-tw/2-3,p.y+11,tw+6,12);
      cx.fillStyle="rgba(220,240,225,.95)";
      cx.fillText(label.toUpperCase(),p.x-tw/2,p.y+20);
    }
    if(row && row.yields[ri]<60){       // famine indicator, pulsing
      const grave = row.yields[ri]<40;
      cx.font="11px "+getComputedStyle(document.body).getPropertyValue("--mono");
      cx.fillStyle=(grave? "rgba(224,82,82,":"rgba(224,164,88,")
        +(0.55+0.4*Math.sin(nowMs/280))+")";
      cx.fillText("⚠", p.x-4, p.y-k*sig-6-(zoom>=1.5?8:0));
    }
    if(pendingTool){ cx.strokeStyle=`rgba(83,217,123,${0.4+0.3*Math.sin(nowMs/300)})`;
      cx.beginPath(); cx.arc(p.x,p.y,8,0,7); cx.stroke(); }
  }
  flash = flash.filter(f=>nowMs<f.until);
  for(const f of flash){
    const a=project(...f.from), b=project(...f.to);
    if(!a.vis||!b.vis) continue;
    const mx=(a.x+b.x)/2, my=(a.y+b.y)/2, dx=b.x-a.x, dy=b.y-a.y;
    const nx=CXp-mx, ny=CYp-my, nl=Math.hypot(nx,ny)||1;
    const cxp=mx-(nx/nl)*Math.hypot(dx,dy)*0.35, cyp=my-(ny/nl)*Math.hypot(dx,dy)*0.35;
    const phase=1-(f.until-nowMs)/f.dur;
    cx.strokeStyle=f.red? `rgba(224,82,82,${0.9*(1-phase*0.5)})`
                        : `rgba(83,217,123,${0.85*(1-phase*0.6)})`;
    cx.lineWidth=f.red?2:1.4;
    cx.beginPath(); cx.moveTo(a.x,a.y); cx.quadraticCurveTo(cxp,cyp,b.x,b.y); cx.stroke();
    const tt=Math.min(1,phase*1.4);
    const px=(1-tt)*(1-tt)*a.x+2*(1-tt)*tt*cxp+tt*tt*b.x;
    const py=(1-tt)*(1-tt)*a.y+2*(1-tt)*tt*cyp+tt*tt*b.y;
    cx.fillStyle="#c8f5d5"; cx.beginPath(); cx.arc(px,py,2.6,0,7); cx.fill();
    cx.lineWidth=1;
  }
  // vehicles: your planes and ships, doing the job
  vehicles = vehicles.filter(v=>nowMs < v.start+v.dur+300);
  for(const v of vehicles){
    const a=project(...v.from), b=project(...v.to);
    if(!a.vis||!b.vis) continue;
    const mx=(a.x+b.x)/2, my=(a.y+b.y)/2, dx=b.x-a.x, dy=b.y-a.y;
    const nx=CXp-mx, ny=CYp-my, nl=Math.hypot(nx,ny)||1;
    const hi = v.kind==="plane"? 0.4 : 0.08;
    const cxp=mx-(nx/nl)*Math.hypot(dx,dy)*hi, cyp=my-(ny/nl)*Math.hypot(dx,dy)*hi;
    const tt=Math.min(1,(nowMs-v.start)/v.dur);
    const bz=(u)=>[ (1-u)*(1-u)*a.x+2*(1-u)*u*cxp+u*u*b.x,
                    (1-u)*(1-u)*a.y+2*(1-u)*u*cyp+u*u*b.y ];
    // contrail / wake
    cx.strokeStyle = v.kind==="plane"? "rgba(240,248,244,.5)":"rgba(180,225,240,.45)";
    cx.lineWidth=1.3; cx.beginPath();
    for(let u=Math.max(0,tt-0.3);u<=tt;u+=0.03){
      const [px,py]=bz(u); u<=Math.max(0,tt-0.3)+0.001? cx.moveTo(px,py):cx.lineTo(px,py);
    }
    cx.stroke(); cx.lineWidth=1;
    const [px,py]=bz(tt), [qx,qy]=bz(Math.min(1,tt+0.02));
    const hd=Math.atan2(qy-py,qx-px);
    cx.save(); cx.translate(px,py); cx.rotate(hd);
    if(v.kind==="plane"){
      cx.fillStyle="#eef6f0";
      cx.beginPath();
      cx.moveTo(5,0); cx.lineTo(-3,-1.2); cx.lineTo(-1,0); cx.lineTo(-3,1.2);
      cx.closePath(); cx.fill();
      cx.beginPath(); cx.moveTo(1.2,0); cx.lineTo(-1.5,-3.6); cx.lineTo(-0.2,0);
      cx.lineTo(-1.5,3.6); cx.closePath(); cx.fill();
    } else {
      cx.fillStyle="#dceee6";
      cx.fillRect(-3.5,-1.4,7,2.8);
      cx.fillRect(-1,-2.6,2,1.4);
    }
    cx.restore();
  }
  shocks = shocks.filter(s=>nowMs<s.until);
  for(const s of shocks){
    const p=project(...s.pos); if(!p.vis) continue;
    const ph=1-(s.until-nowMs)/s.dur;
    for(const m of [ph, Math.max(0,ph-0.22)]){
      cx.strokeStyle=`rgba(224,82,82,${(1-m)*0.85})`; cx.lineWidth=1.8;
      cx.beginPath(); cx.arc(p.x,p.y,Rp*0.028+Rp*0.13*m,0,7); cx.stroke();
    }
    cx.lineWidth=1;
  }
  requestAnimationFrame(drawGlobe);
}
function pts(n,f){ const out=[]; for(let i=0;i<=n;i++) out.push(f(i)); return out; }
function strokePath(arr){
  cx.beginPath(); let pen=false;
  for(const [la,lo] of arr){ const p=project(la,lo);
    if(p.vis){ pen? cx.lineTo(p.x,p.y): cx.moveTo(p.x,p.y); pen=true; } else pen=false; }
  cx.stroke();
}
/* the wiring you know — amber wires dry a region when their ocean warms,
   cyan wires wet it. Signal runs along a wire while its driver is loud. */
function drawWires(nowMs,row){
  if(!eng.knowledge.on || !SHOW_WIRES) return;
  const K=eng.knowledge;
  for(const e of K.edges){
    if(!K.isKnown(e.di,e.ri)) continue;
    const dp=DRVPOS[e.driver]; if(!dp) continue;
    const a=project(...dp), b=project(...REGPOS[e.region]);
    if(!a.vis||!b.vis) continue;
    const dv=row? row.driverTotals[e.di] : 0;
    const live=Math.abs(dv)>=0.8;
    const fresh=newWires.some(w=>w.di===e.di&&w.ri===e.ri);
    const str=Math.min(1,Math.abs(e.coeff)/0.9);
    const mx=(a.x+b.x)/2, my=(a.y+b.y)/2, dx=b.x-a.x, dy=b.y-a.y;
    const nx=CXp-mx, ny=CYp-my, nl=Math.hypot(nx,ny)||1;
    const cxp=mx-(nx/nl)*Math.hypot(dx,dy)*0.3, cyp=my-(ny/nl)*Math.hypot(dx,dy)*0.3;
    const al=(fresh? 0.8 : live? 0.45 : 0.16)*(0.5+0.5*str);
    const rgb=e.coeff<0? "224,164,88" : "91,200,232";
    cx.strokeStyle=`rgba(${rgb},${al})`;
    cx.lineWidth=fresh?1.6:0.8; cx.setLineDash(fresh?[]:[3,5]);
    cx.beginPath(); cx.moveTo(a.x,a.y); cx.quadraticCurveTo(cxp,cyp,b.x,b.y); cx.stroke();
    cx.setLineDash([]);
    if(live||fresh){
      const tt=((nowMs/1800)+e.ri*0.13)%1;
      const px=(1-tt)*(1-tt)*a.x+2*(1-tt)*tt*cxp+tt*tt*b.x, py=(1-tt)*(1-tt)*a.y+2*(1-tt)*tt*cyp+tt*tt*b.y;
      cx.fillStyle=`rgba(${rgb},.95)`; cx.beginPath(); cx.arc(px,py,1.8,0,7); cx.fill();
    }
  }
  cx.lineWidth=1;
}
function hoverCheck(e){
  const best=nearestRegion(e);
  const h=$("hover");
  if(best===null){ h.style.display="none"; return; }
  const rect=cv.getBoundingClientRect(), mx=e.clientX-rect.left, my=e.clientY-rect.top;
  const r=REG[best], row=lastRow();
  const a=row?row.anomalies[best]:0, s=row?row.sigmas[best]:r.sigma;
  const y=row?row.yields[best]:100, res=row?row.resil[best]:0;
  const read = a<-s? "Drought beyond anything in the record"
    : a<-0.5? "Drought building" : a>s? "Flooding beyond the record"
    : a>0.7? "Unusually wet season" : "Seasonal norms";
  h.innerHTML=`<b>${r.name.toUpperCase()}</b>${r.homeland?" · HOMELAND":""}<br>
    ${read}. ${r.crop} ${r.kind?"output":"harvest"} at <span class="num">${y.toFixed(0)}%</span>
    · ${r.weight.toFixed(1)}% of world supply${res?` · hardened`:""}<br>
    <span style="color:var(--ink-faint)">anomaly ${a.toFixed(2)} vs natural range ±${s.toFixed(2)}${Math.abs(a)>s?" — outside":""}</span>${(()=>{
      if(!eng.knowledge.on) return "";
      const fc=eng.knowledge.forecast(); if(!fc) return "";
      const f=fc[best], unk=f.total-f.known;
      return `<br><span style="color:var(--ink-faint)">wires: ${f.known} of ${f.total} on the board${unk?` · <span style="color:var(--amber)">${unk} unknown</span>`:""}
        · next season ${f.anomaly>0.2?"wet ":f.anomaly<-0.2?"dry ":""}${(f.anomaly>=0?"+":"")+f.anomaly.toFixed(2)} by known wiring</span>`; })()}`;
  h.style.display="block";
  h.style.left=Math.min(mx+14,W-250)+"px"; h.style.top=(my+10)+"px";
}
requestAnimationFrame(drawGlobe);


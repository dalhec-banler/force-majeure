/* persistent spectacle layer — fire you can see from orbit */
function drawEffects(nowMs){
  const k=Rp*0.055;
  for(const e of effects){
    const p=project(...e.pos); if(!p.vis) continue;
    if(e.type==="scar"){
      cx.fillStyle="rgba(35,24,20,.7)";
      cx.beginPath(); cx.arc(p.x,p.y,k*0.6,0,7); cx.fill();
      const fl=0.4+0.6*Math.abs(Math.sin(nowMs/300+e.pos[1]));
      cx.strokeStyle=`rgba(255,110,30,${0.5*fl})`;
      cx.beginPath(); cx.arc(p.x,p.y,k*0.45,0,7); cx.stroke();
    } else if(e.type==="tsunami"){
      const age=nowMs-(e.ms||0);
      for(let w=0;w<4;w++){
        const ph=(age/4200+w*0.22)%1;
        const rr=k*0.3+ph*Rp*0.42;
        cx.strokeStyle=`rgba(190,235,255,${0.75*(1-ph)})`;
        cx.lineWidth=3.5*(1-ph)+1;
        cx.beginPath(); cx.arc(p.x,p.y,rr,0,7); cx.stroke();
        cx.strokeStyle=`rgba(90,160,220,${0.4*(1-ph)})`;
        cx.beginPath(); cx.arc(p.x,p.y,rr+4,0,7); cx.stroke();
      }
      cx.lineWidth=1;
    } else if(e.type==="tornado"){
      for(let f=0;f<3;f++){
        const wob=Math.sin(nowMs/180+f*2.2)*3;
        const fx=p.x+(f-1)*k*0.9+wob, fy=p.y+Math.sin(f*1.4)*k*0.3;
        const h=k*1.5, ang=nowMs/140+f;
        cx.save(); cx.translate(fx,fy);
        for(let seg=0;seg<6;seg++){
          const sw=(1-seg/6)*k*0.42+1;
          const sx=Math.sin(ang+seg*0.9)*(seg/6)*4;
          cx.fillStyle=`rgba(225,228,232,${0.75-seg*0.09})`;
          cx.beginPath();
          cx.ellipse(sx,-h*(seg/6),sw,sw*0.4,0,0,7);
          cx.fill();
        }
        cx.restore();
      }
    } else if(e.type==="fire"){
      const ks=k*1.6*(e.scale||1);
      for(let i=0;i<5;i++){
        const fx=p.x+Math.sin(i*2.1+nowMs/90)*ks*0.5, fy=p.y+Math.cos(i*1.7+nowMs/110)*ks*0.4;
        const fl=0.55+0.45*Math.sin(nowMs/70+i*2.3);
        const g=cx.createRadialGradient(fx,fy,0,fx,fy,ks*0.55);
        g.addColorStop(0,`rgba(255,190,90,${0.85*fl})`);
        g.addColorStop(0.4,`rgba(224,90,52,${0.5*fl})`);
        g.addColorStop(1,"rgba(224,90,52,0)");
        cx.fillStyle=g; cx.beginPath(); cx.arc(fx,fy,ks*0.55,0,7); cx.fill();
      }
      if(smokeReady){                             // real MODIS smoke, downwind
        const sw=ks*7;
        cx.save();
        cx.translate(p.x+ks*2.2, p.y-ks*0.8);
        cx.rotate(-0.35+0.06*Math.sin(nowMs/2600));
        cx.globalAlpha=0.85;
        cx.drawImage(smokeImg,-sw*0.22,-sw*0.5,sw,sw);
        cx.restore();
      }
    } else if(e.type==="rain"){
      cx.fillStyle="rgba(190,225,210,.22)";
      cx.beginPath(); cx.arc(p.x,p.y-k*0.8,k*0.7,0,7); cx.fill();
      for(let i=0;i<8;i++){
        const ph=((nowMs/700)+i/8)%1;
        const rx=p.x+((i%4)-1.5)*k*0.5, ry=p.y-k*0.6+ph*k*1.1;
        cx.strokeStyle=`rgba(91,200,232,${0.7*(1-ph)})`;
        cx.beginPath(); cx.moveTo(rx,ry); cx.lineTo(rx-1.5,ry+4); cx.stroke();
      }
    } else if(e.type==="storm"){                  // hurricane, radar-painted
      drawCyclone(p, 0.30, nowMs, {variant:Math.abs(e.pos[0]|0)%3, lat:e.pos[0]});
    } else if(e.type==="beam"){
      const age=nowMs-(e.ms||0);
      if(age>=1400 && age<5200 && smokeReady){   // the mushroom afterwards
        const gr=(age-1400)/3800;
        const mw=k*(2+gr*4);
        cx.save(); cx.translate(p.x,p.y-mw*0.25);
        cx.rotate(0.1*Math.sin(nowMs/900));
        cx.globalAlpha=0.9*(1-gr*0.6);
        cx.drawImage(smokeImg,-mw/2,-mw/2,mw,mw);
        cx.restore();
      }
      if(age<1400){
        const hot=1-age/1400;
        const bw=3+10*hot;
        const grad=cx.createLinearGradient(p.x,0,p.x,p.y);
        grad.addColorStop(0,`rgba(255,255,255,0)`);
        grad.addColorStop(0.25,`rgba(200,230,255,${0.55*hot})`);
        grad.addColorStop(1,`rgba(255,255,255,${0.95*hot})`);
        cx.strokeStyle=grad; cx.lineWidth=bw;
        cx.beginPath(); cx.moveTo(p.x,0); cx.lineTo(p.x,p.y); cx.stroke();
        cx.lineWidth=1;
        const g2=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,k*4.2*hot+6);
        g2.addColorStop(0,`rgba(255,255,255,${0.98*hot})`);
        g2.addColorStop(0.25,`rgba(255,225,150,${0.85*hot})`);
        g2.addColorStop(0.55,`rgba(255,140,60,${0.6*hot})`);
        g2.addColorStop(1,"rgba(200,60,20,0)");
        cx.fillStyle=g2; cx.beginPath(); cx.arc(p.x,p.y,k*4.2*hot+6,0,7); cx.fill();
        for(let d2=0;d2<7;d2++){                 // debris streaks
          const da=d2*0.9+(e.pos[1]||0), dl=k*(1.5+2.5*(1-hot));
          cx.strokeStyle=`rgba(255,190,110,${0.8*hot})`;
          cx.beginPath(); cx.moveTo(p.x,p.y);
          cx.lineTo(p.x+Math.cos(da)*dl, p.y+Math.sin(da)*dl*0.7);
          cx.stroke();
        }
      } else {
        const fl=0.5+0.5*Math.sin(nowMs/90);
        cx.fillStyle=`rgba(255,170,90,${0.5*fl})`;
        cx.beginPath(); cx.arc(p.x,p.y,3.5,0,7); cx.fill();
      }
    } else if(e.type==="oceanheat"){
      const pulse=0.5+0.5*Math.sin(nowMs/350);
      const g=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,k*1.7);
      g.addColorStop(0,`rgba(224,120,70,${0.4*pulse})`);
      g.addColorStop(1,"rgba(224,120,70,0)");
      cx.fillStyle=g; cx.beginPath(); cx.arc(p.x,p.y,k*1.7,0,7); cx.fill();
    }
  }
}


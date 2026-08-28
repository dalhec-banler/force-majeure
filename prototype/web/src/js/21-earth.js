/* ------------------------- the earth itself: Blue Marble, live clouds */
const EARTH_SRC = "__EARTH__";
const CLOUD_SRC = "__CLOUDS__";
const ec = $("earth");
let gl=null, glU=null, texReady=0;
function initEarth(){
  gl = ec.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:false});
  if(!gl) return;
  const vs="attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}";
  const fs=`precision mediump float;
    uniform sampler2D uT,uCl;uniform vec2 uC;
    uniform float uR,uRot,uTilt,uClOff,uHasCl;
    uniform vec3 uRV[40];uniform float uRD[40];uniform float uDV[40];uniform float uRW[40];uniform float uIceEdge,uDevG,uT2,uFlat,uSunLon,uSea;
    float water(vec2 q){ vec3 c=texture2D(uT,q).rgb; return smoothstep(0.02,0.18,c.b-c.r); }
    float flooded(vec2 q, float r){ if(r<=0.0) return 0.0; float m=0.0; for(int i=0;i<8;i++){ float a=float(i)*0.785398; vec2 o=vec2(cos(a),sin(a))*r; m=max(m, water(q+o)); m=max(m, water(q+o*0.5)); } return m; }
    void main(){
      vec2 p=(gl_FragCoord.xy-uC)/uR;
      if(uFlat>0.5){
        if(abs(p.x)>1.75||abs(p.y)>0.875){ gl_FragColor=vec4(0.,0.,0.,0.); return; }
        float lat=p.y/0.85*1.5707963;
        float lon=p.x/1.7*3.14159265-uRot;
        if(abs(lat)>1.55){ gl_FragColor=vec4(0.02,0.03,0.05,1.); return; }
        vec2 uv=vec2(fract(lon/6.2831853+0.5),0.5-lat/3.14159265);
        vec3 col=texture2D(uT,uv).rgb;
        float wat=smoothstep(0.02,0.18,col.b-col.r);
        vec3 ve=vec3(cos(lat)*sin(lon),sin(lat),cos(lat)*cos(lon));
        float dry=0.0; float dev=0.0; float wet=0.0;
        for(int i=0;i<40;i++){
          float dd=acos(clamp(dot(ve,uRV[i]),-1.,1.));
          dry+=uRD[i]*smoothstep(0.40,0.08,dd);
          dev+=uDV[i]*smoothstep(0.42,0.10,dd);
          wet+=uRW[i]*smoothstep(0.36,0.08,dd);
        }
        dry=clamp(dry,0.,1.); dev=clamp(dev,0.,1.); wet=clamp(wet,0.,1.);
        col=mix(col, col*vec3(0.72,1.18,0.66), wet*0.65*(1.0-wat));
        col=mix(col, vec3(dot(col,vec3(.33)))*vec3(1.22,0.90,0.50), dry*0.95);
        { float fl=flooded(uv,uSea)*(1.0-wat); col=mix(col, vec3(0.06,0.16,0.30), fl*0.85); }
        col=mix(col, col*vec3(0.32,0.27,0.25), dev*0.8);
        float n=texture2D(uCl, vec2(fract(uv.x*3.0+0.13), fract(uv.y*3.0))).r;
        float ember=dev*smoothstep(0.5,0.85,n)*(0.55+0.45*sin(uT2*2.6+n*23.0));
        col+=vec3(1.0,0.34,0.05)*ember*0.9;
        col=mix(col, col*vec3(1.05,0.72,0.5)+vec3(0.10,0.02,0.0), uDevG*0.55);
        if(uHasCl>0.5){
          float c=texture2D(uCl,vec2(fract(uv.x+uClOff),uv.y)).r;
          col=mix(col,vec3(1.0),c*0.5);
        }
        if(lat>uIceEdge){
          float f=smoothstep(uIceEdge,uIceEdge+0.06,lat);
          col=mix(col, vec3(0.93,0.96,0.99), f*0.92);
        }
        vec3 sun=vec3(cos(0.1)*sin(uSunLon),sin(0.1),cos(0.1)*cos(uSunLon));
        float day=clamp(dot(ve,sun),-1.,1.);
        col*=0.42+0.58*smoothstep(-0.22,0.3,day);
        col+=vec3(1.0,0.95,0.8)*pow(max(day,0.0),24.0)*wat*0.35;
        gl_FragColor=vec4(col,1.0); return;
      }
      float r2=dot(p,p);
      if(r2>1.0){
        float d=sqrt(r2)-1.0;
        float a=exp(-d*14.0)*0.5;
        vec3 hal=mix(vec3(0.5,0.68,0.95), vec3(0.95,0.45,0.15), uDevG);
        gl_FragColor=vec4(hal,a);return;}
      float z=sqrt(1.0-r2);
      float ct=cos(uTilt),st=sin(uTilt);
      float y0=p.y*ct+z*st;
      float z0=-p.y*st+z*ct;
      float lat=asin(clamp(y0,-1.,1.));
      float lon=atan(p.x,z0)-uRot;
      vec2 uv=vec2(fract(lon/6.2831853+0.5),0.5-lat/3.14159265);
      vec3 col=texture2D(uT,uv).rgb;
      float wat=smoothstep(0.02,0.18,col.b-col.r);   // ocean mask, pre-tint
      // drought browns the land itself — green space disappearing
      vec3 ve=vec3(cos(lat)*sin(lon),sin(lat),cos(lat)*cos(lon));
      float dry=0.0; float dev=0.0; float wet=0.0;
      for(int i=0;i<40;i++){
        float dd=acos(clamp(dot(ve,uRV[i]),-1.,1.));
        float fall=smoothstep(0.34,0.08,dd);
        dry+=uRD[i]*fall; wet+=uRW[i]*fall;
        dev+=uDV[i]*smoothstep(0.42,0.10,dd);
      }
      dry=clamp(dry,0.,1.); dev=clamp(dev,0.,1.); wet=clamp(wet,0.,1.);
      col=mix(col, col*vec3(0.72,1.18,0.66), wet*0.65*(1.0-wat));
      col=mix(col, vec3(dot(col,vec3(.33)))*vec3(1.22,0.90,0.50), dry*0.95);
      { float fl=flooded(uv,uSea)*(1.0-wat); col=mix(col, vec3(0.06,0.16,0.30), fl*0.85); }
      // devastation: the land chars, then glows from within
      col=mix(col, col*vec3(0.32,0.27,0.25), dev*0.8);
      float n=texture2D(uCl, vec2(fract(uv.x*3.0+0.13), fract(uv.y*3.0))).r;
      float ember=dev*smoothstep(0.5,0.85,n)*(0.55+0.45*sin(uT2*2.6+n*23.0));
      col+=vec3(1.0,0.34,0.05)*ember*0.9;
      // global doom grade: smoke-choked sky
      col=mix(col, col*vec3(1.05,0.72,0.5)+vec3(0.10,0.02,0.0), uDevG*0.55);
      if(lat>uIceEdge){
        float f=smoothstep(uIceEdge,uIceEdge+0.06,lat);
        col=mix(col, vec3(0.93,0.96,0.99), f*0.92);
      }
      if(uHasCl>0.5){
        float c=texture2D(uCl,vec2(fract(uv.x+uClOff),uv.y)).r;
        col=mix(col,vec3(1.0),c*0.5);
      }
      // the sun: day/night terminator and a glint on the water
      vec3 sun=vec3(cos(0.1)*sin(uSunLon),sin(0.1),cos(0.1)*cos(uSunLon));
      float day=clamp(dot(ve,sun),-1.,1.);
      // night is dim, not black: the dark side keeps ~62% of its colour with a
      // cool cast, the terminator is wide, and the limb falls off gently
      float dayf=smoothstep(-0.35,0.35,day);
      col=mix(col*0.62+vec3(0.015,0.03,0.06), col, dayf);
      col+=vec3(1.0,0.95,0.8)*pow(max(day,0.0),24.0)*wat*0.4;
      col*=0.72+0.28*z;
      float rim=smoothstep(0.82,1.0,sqrt(r2));
      col=mix(col,vec3(0.55,0.7,0.95),rim*0.28);
      gl_FragColor=vec4(col,1.0);
    }`;
  function sh(type,src){ const s=gl.createShader(type); gl.shaderSource(s,src);
    gl.compileShader(s); return s; }
  const pr=gl.createProgram();
  gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));
  gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){ gl=null; return; }
  gl.useProgram(pr);
  const buf=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const aP=gl.getAttribLocation(pr,"aP");
  gl.enableVertexAttribArray(aP);
  gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);
  glU={ C:gl.getUniformLocation(pr,"uC"), R:gl.getUniformLocation(pr,"uR"),
        Rot:gl.getUniformLocation(pr,"uRot"), Tilt:gl.getUniformLocation(pr,"uTilt"),
        ClOff:gl.getUniformLocation(pr,"uClOff"), HasCl:gl.getUniformLocation(pr,"uHasCl"),
        T:gl.getUniformLocation(pr,"uT"), Cl:gl.getUniformLocation(pr,"uCl"),
        RV:gl.getUniformLocation(pr,"uRV[0]"), RD:gl.getUniformLocation(pr,"uRD[0]"),
        DV:gl.getUniformLocation(pr,"uDV[0]"), DevG:gl.getUniformLocation(pr,"uDevG"),
        RW:gl.getUniformLocation(pr,"uRW[0]"), Sea:gl.getUniformLocation(pr,"uSea"),
        T2:gl.getUniformLocation(pr,"uT2"),
        Flat:gl.getUniformLocation(pr,"uFlat"),
        SunLon:gl.getUniformLocation(pr,"uSunLon"),
        IceEdge:gl.getUniformLocation(pr,"uIceEdge") };
  const rv=new Float32Array(120);
  REG.forEach((r,i)=>{ const [la,lo]=REGPOS[r.name].map(x=>x*Math.PI/180);
    rv[i*3]=Math.cos(la)*Math.sin(lo); rv[i*3+1]=Math.sin(la);
    rv[i*3+2]=Math.cos(la)*Math.cos(lo); });
  gl.uniform3fv(glU.RV, rv);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  function loadTex(unit, src, flag){
    const img=new Image();
    img.onload=()=>{ const tx=gl.createTexture();
      gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,tx);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      texReady|=flag; };
    img.src=src;
  }
  loadTex(0, EARTH_SRC, 1);
  if(CLOUD_SRC.startsWith("data:")) loadTex(1, CLOUD_SRC, 2);
}
initEarth();
function drawEarth(nowMs){
  if(!gl || !(texReady&1)) return false;
  const dpr=devicePixelRatio||1;
  const w=Math.round(W*dpr), h=Math.round(H*dpr);
  if(ec.width!==w||ec.height!==h){ ec.width=w; ec.height=h; gl.viewport(0,0,w,h); }
  gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(glU.C, CXp*dpr, h-CYp*dpr);
  gl.uniform1f(glU.R, Rp*dpr);
  gl.uniform1f(glU.Rot, rot*D2R);
  gl.uniform1f(glU.Tilt, tilt*D2R);
  gl.uniform1f(glU.ClOff, (nowMs*0.000004)%1);
  gl.uniform1f(glU.HasCl, (texReady&2)?1:0);
  gl.uniform1i(glU.T,0); gl.uniform1i(glU.Cl,1);
  const row=lastRow(), dry=new Float32Array(40), dv=new Float32Array(40), wet=new Float32Array(40);
  if(row) for(let i=0;i<Math.min(40,REG.length);i++){
    dry[i]=Math.max(0,Math.min(1,-row.anomalies[i]/1.4));
    wet[i]=Math.max(0,Math.min(1,row.anomalies[i]/1.2));
    dv[i]=Math.max(0,Math.min(1,(78-row.yields[i])/45));
  }
  gl.uniform1fv(glU.RD, dry);
  gl.uniform1fv(glU.DV, dv);
  gl.uniform1fv(glU.RW, wet);
  gl.uniform1f(glU.Sea, 0.0066*Math.pow(iceMelt,0.8));   // the coasts go under as the ice goes
  gl.uniform1f(glU.DevG, devastation());
  gl.uniform1f(glU.T2, nowMs/1000);
  gl.uniform1f(glU.IceEdge, (66+18*seaIce)*Math.PI/180);
  gl.uniform1f(glU.Flat, FLAT?1:0);
  gl.uniform1f(glU.SunLon, (nowMs*0.000013)%(Math.PI*2)+2.6);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  return true;
}

function nearestRegion(e){
  const rect=cv.getBoundingClientRect(), mx=e.clientX-rect.left, my=e.clientY-rect.top;
  let best=null,bd=22;
  for(let ri=0;ri<REG.length;ri++){
    if(!isOnline(ri)) continue;
    const p=project(...REGPOS[REG[ri].name]); if(!p.vis) continue;
    const d=Math.hypot(p.x-mx,p.y-my); if(d<bd){bd=d;best=ri;}
  }
  return best;
}
function globeClick(e){
  if(resolving) return;
  // click the storm itself to pick the wing up, then click the coast to aim it
  if(!pendingTool && eng.eras && eng.wingOnline("Hurricane Steering")){
    const rc=cv.getBoundingClientRect();
    const hh=nearestHistory(e.clientX-rc.left, e.clientY-rc.top);
    if(hh && hh.type==="storm"){
      const c=CAPS.find(x=>x.name==="Hurricane Steering");
      if(budgetRefuse(c)) return;
      pendingTool="Hurricane Steering"; renderTray(); sfxClick();
      const s=hh.st.s, word=STORM_WORD[s.basin]||"Hurricane";
      $("toolinfo").innerHTML=`<b>${(s.name? word+" "+s.name : "the "+word.toLowerCase()).toUpperCase()}</b> — the flights are ready. <b>Click the coast you want it to cross.</b>`;
      return;
    }
  }
  if(!pendingTool) return;
  const c=CAPS.find(x=>x.name===pendingTool);
  if(budgetRefuse(c)) return;
  const ri=nearestRegion(e);
  if(ri===null){ $("toolinfo").textContent="Click closer to a region marker."; return; }
  slots.push({cap:pendingTool, target:REG[ri].name});
  clampContainment(); renderTray(); sfxClick();
  $("toolinfo").textContent=`${pendingTool} armed on ${REG[ri].name} — ${c.lag===0?"acts this season":`lands in ${c.lag} season${c.lag===1?"":"s"}`}. $${fmt(available(),0)}M left. Keep clicking, or put the tool down.`;
}
function anomColor(a, alpha){
  if(a<0){ const k=Math.min(1,-a/2);
    return `rgba(${224+31*k|0},${164-112*k|0},${88-6*k|0},${alpha})`; }
  return `rgba(91,200,232,${alpha})`;
}


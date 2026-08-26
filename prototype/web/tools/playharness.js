// Play harness: runs the REAL console page script headlessly.
// Strategies are per-season decision functions; the wire feed is captured
// as a play journal. Elements are cached and settable (containment etc).
const noop=()=>{};
const ctxStub=new Proxy({}, {get:(t,k)=>{
  if(k==="createRadialGradient"||k==="createLinearGradient") return ()=>({addColorStop:noop});
  if(k==="createImageData") return (w,h)=>({data:new Uint8ClampedArray(w*h*4)});
  if(k==="measureText") return ()=>({width:0});
  return noop; }, set:()=>true});
const elCache={};
function makeEl(){
  const t={style:{},classList:{add:noop,remove:noop,toggle:noop},dataset:{},
           value:"",textContent:"",innerHTML:""};
  return new Proxy(t,{get:(tt,k)=>{
    if(k in tt) return tt[k];
    if(k==="getContext") return ()=>ctxStub;
    if(["appendChild","prepend","addEventListener","removeEventListener",
        "setPointerCapture","remove"].includes(k)) return noop;
    if(k==="querySelectorAll") return ()=>[];
    if(k==="children") return [];
    if(k==="parentElement") return makeEl();
    if(k==="getBoundingClientRect") return ()=>({width:800,height:600,left:0,top:0});
    if(k==="clientWidth"||k==="clientHeight") return 100;
    return noop; }, set:(tt,k,v)=>{tt[k]=v;return true;}});
}
global.document={ createElement:()=>makeEl(),
  getElementById:(id)=>(elCache[id] ||= makeEl()),
  body:makeEl(), addEventListener:noop };
global.window=global; global.addEventListener=noop;
global.matchMedia=()=>({matches:true});     // reduced motion: instant seasons
global.devicePixelRatio=1;
global.requestAnimationFrame=noop; global.setInterval=noop;
global.Image=class{ set src(v){} };
global.performance={now:()=>Date.now()};
global.getComputedStyle=()=>({getPropertyValue:()=>"monospace"});
global.location={reload:noop};

const fs=require('fs');
const html=fs.readFileSync(process.env.HTML||(__dirname+'/../console.html'),'utf8');
const script=html.match(/<script>([\s\S]*)<\/script>/)[1];
const strategyPath=process.argv[2];
const strategy=require(strategyPath);

const driver=`
;(async function(){
  const journal=[];
  const _wire=wire;
  wire=(h,c)=>{ journal.push({t:t, c:c||"", h:String(h).replace(/<[^>]*>/g," ").replace(/\\s+/g," ").trim()}); };
  const _alert=alertStrip; alertStrip=(m)=>{ journal.push({t:t,c:"CHYRON",h:m}); };
  const api={
    view:()=>{
      const row=lastRow();
      return { t, running,
        regions:REG.map((r,i)=>({name:r.name,kind:r.kind||"crop",
          anomaly:row?+row.anomalies[i].toFixed(2):0,
          sigma:row?+row.sigmas[i].toFixed(2):r.sigma,
          yield:row?Math.round(row.yields[i]):100})),
        price:row?+row.price.toFixed(1):100, funds:row?+row.treasury.toFixed(1):90,
        mandate:row?Math.round(row.mandate):28,
        rung:row?eng.ladder.filter(l=>row.dossier>=l.threshold).length:1,
        ladder:row?row.ladderText:"", profit:+profitOf(eng.state.rows).toFixed(1),
        dead:Math.round(cumDead), deadYours:Math.round(cumDeadYours),
        ice:+iceMelt.toFixed(2), dev:+devastation().toFixed(2),
        directive:(curDir()&&dirActive(curDir()))? curDir().title : "none",
        directiveLeft:(curDir()&&dirActive(curDir()))? curDir().window-(t-(curDir().standing?curDir().issued:Math.max(dirIssued,curDir().from||0))) : 0,
        flagship: flagship? flagship.deadline-t : 0, lapses,
        wires: eng.knowledge.count(), history:{asRecorded:histAsRecorded, altered:histAltered.length},
        inflight:eng.state.ops.filter(o=>o.owner==="player"&&o.t+o.lag>t).length,
        status:row?row.status:"running" };
    },
    journalSince:(n)=>journal.slice(n),
    journalLen:()=>journal.length,
    arm:(cap,target)=>{ slots.push({cap,target}); },
    containment:(v)=>{ document.getElementById("containment").value=String(Math.max(0,Math.min(40,v))); },
    predict:(p)=>{ document.getElementById("predict").value=p; },
    season:async()=>{ await runSeason(false); try{ drawGlobeInner(0); }catch(e){ console.error("DRAW ERROR", e.stack); } },
    telemetryDossier:()=>lastRow()? +lastRow().dossier.toFixed(1):0,
  };
  const result=await (${strategy.play.toString()})(api);
  console.log("::RESULT::"+JSON.stringify({result, view:api.view(),
    dossierFinal:api.telemetryDossier(),
    journal: journal.filter(j=>${strategy.journalFilter||"true"})}));
})().catch(e=>{ console.error("HARNESS ERROR", e); process.exit(1); });
`;
eval(script+driver);

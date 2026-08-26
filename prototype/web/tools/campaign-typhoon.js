// typhoon — NOT YET RUN (session tooling was blocked before it could execute).
// Best-guess successor to campaign-monsoonF.js (493.0, the best valid score):
//   three aerosol waves ≥9 seasons apart (no repeat-forensics), each sized to a
//   dossier budget estimated from sig × repeats × envelope stress; a 9-deep
//   Adaptation shield bought from the wave-2 mandate windfall so the homeland
//   harvest survives (or profits from) the 9-SAI endgame; all spare cash after
//   the final wave goes to containment so the dossier stays under 200 at S40;
//   no seeding or sig-op directives in the endgame (they cost 15–22 dossier each).
// Run: cd prototype/web && node tools/playharness.js "$PWD/tools/campaign-typhoon.js"
exports.journalFilter = `j.c==="CHYRON"||/TREASURY|DIRECTIVE|INTERCEPT|investigation|WINDFALL|COUNTER|UNITED|EXPOSED/i.test(j.h)`;
exports.play = async (api) => {
  const COST={"Cloud Seeding":6,"Watershed Interference":14,"Fire Enablement":9,"Adaptation Investment":18,"Ocean Thermal Forcing":26,"Stratospheric Aerosol Inj.":32,"ENSO Forcing":45,"Ionospheric Coupling [T3]":60,"Climate Research":8,"Polar Destabilization":38};
  const HOME="North American Plains", BSS="Black Sea Steppe";
  const EXPORTERS=["Black Sea Steppe","South Asia","La Plata Basin","Southeast Asia","North China Plain","Eastern Australia","Yangtze Basin","Canadian Prairies","Kazakh Virgin Lands","Northern European Plain"];
  const log=[]; let jPtr=0, armedNow=0, v=null, s=0, cont=0;
  const hits=[];
  const purse=()=>v.funds-32-armedNow;
  const flagFree=(c)=>v.flagship>0&&["ENSO Forcing","Ionospheric Coupling [T3]","Polar Destabilization"].includes(c);
  // the harness's api.arm silently caps at 2 slots; the engine takes any number, so push the slot directly
  const arm=(c,t)=>{ const cost=flagFree(c)? COST[c]-60 : COST[c];
    if(cost>purse()) return false; slots.push({cap:c,target:t||null}); armedNow+=Math.max(0,cost); hits.push({cap:c,tgt:t,s}); return true; };
  const reg=(n)=>v.regions.find(r=>r.name===n);
  const home=()=>reg(HOME);
  const driest=(pool)=>v.regions.filter(r=>r.kind==="crop"&&(!pool||pool.includes(r.name))).sort((a,b)=>a.anomaly-b.anomaly)[0];
  const sinceOp=()=>{ const h=hits.filter(x=>x.cap!=="Climate Research"); return h.length? s-h[h.length-1].s : 99; };
  const directive=(opts={})=>{
    const d=v.directive; if(d==="none") return "";
    const dr=(typeof standing!=="undefined"&&standing&&standing.region)? standing.region : null;
    if(d==="Prove the concept"){ const r=driest(); return arm("Cloud Seeding",r.name)?"D:seed "+r.name:""; }
    if(d==="Stabilize a drought"){ const r=driest(); if(r.anomaly<-0.25) return arm("Cloud Seeding",r.name)?"D:seed dry "+r.name:""; return ""; }
    if(d==="Harden the homeland") return arm("Adaptation Investment",HOME)?"D:adapt home":"";
    if(d==="Read the wiring") return arm("Climate Research","Eastern Australia")?"D:research":"";
    if(d==="Map the world") { let n=0; for(const r of ["South Asia","Southeast Asia","La Plata Basin","Sahel","Horn of Africa","Cerrado","Mekong Delta","Nile Delta"]) if(n<2&&arm("Climate Research",r)) n++; return n?"D:research x"+n:""; }
    if(d==="Move the ocean, not the country"||d==="Show the flag"){ const c=opts.driver; if(!c) return ""; return arm(c)?"D:"+c:""; }
    if(d==="Move a market"||d==="Move the wheat number"){ const r=driest(EXPORTERS); const c=r.anomaly<-0.5?"Fire Enablement":"Watershed Interference"; return arm(c,r.name)?"D:"+c+" "+r.name:""; }
    if(d==="Answer them"||d==="Answer the Steppe"){ if(s<24&&d==="Answer them") return ""; const c=reg(BSS).anomaly<-0.5?"Fire Enablement":"Watershed Interference"; return arm(c,BSS)?"D:answer "+c:""; }
    if(d==="Protect the client"&&dr) return arm("Cloud Seeding",dr)?"D:protect "+dr:"";
    if(d==="Hold the line"){ if(home().anomaly<-0.3) return arm("Cloud Seeding",HOME)?"D:hold seed home":""; return ""; }
    return "";
  };
  const step=async(did)=>{
    api.containment(Math.max(0,Math.floor(Math.min(cont,purse()))));
    api.predict(did.join("; ").slice(0,80));
    await api.season();
    const nv=api.view();
    log.push({s,did:did.join("; ")||"held",f:nv.funds,p:nv.price,rev:+(nv.profit-(log.length?log[log.length-1].profit:0)+85).toFixed(1),
              r:nv.rung,dos:api.telemetryDossier(),profit:nv.profit,m:nv.mandate,dir:nv.directive,fl:nv.flagship,lap:nv.lapses,st:nv.status});
    armedNow=0; jPtr=api.journalLen();
  };
  const C={waves:[{s:9,cap:60},{s:24,cap:105},{s:35,keep:0}],keep:2,reserve:200,flag:"ENSO Forcing",d5:"Ocean Thermal Forcing",
    seedBelow:-0.6,seedMinPrice:115,seedAlways:-1.0,endQuiet:35,dirSig:true,finalMargin:20,
    shieldN:9,shieldFrom:26,shieldTo:33,preCont:0,preContAbove:60,preContMax:80};
  let adapt=0, waves=0;
  const SIGDIR=["Move a market","Move the wheat number","Answer them","Answer the Steppe","Protect the client","Hold the line","Show the flag","Move the ocean, not the country"];
  const stress=()=>v.regions.reduce((a,r)=>a+Math.max(0,Math.abs(r.anomaly)/r.sigma-1),0)/v.regions.length;
  const repeats=()=>hits.filter(h=>h.cap==="Stratospheric Aerosol Inj."&&h.s+1<s+1&&h.s+1>=s+1-8).length;
  const perSAI=()=>9*(1+0.4*Math.min(4,repeats()))*(1+0.8*stress());
  for(s=1;s<=40;s++){ v=api.view(); if(!v.running) break; const did=[];
    const dos=api.telemetryDossier();
    const w=C.waves.find(w=>w.s===s), wi=C.waves.findIndex(w=>w.s===s);
    const next=C.waves.find(w=>w.s>=s), toWave=next? next.s-s : 99;
    const isFinal=wi===C.waves.length-1, afterFinal=s>C.waves[C.waves.length-1].s;
    const dname=v.directive; const sigDir=SIGDIR.includes(dname);
    if(!sigDir || (C.dirSig && s<C.endQuiet)){
      const d5=(dname==="Move the ocean, not the country")? (toWave<=v.directiveLeft-1? null : C.d5) : (dname==="Show the flag"? (toWave<=v.directiveLeft-1? null:"Ocean Thermal Forcing") : null);
      const dd=directive({driver:d5}); if(dd) did.push(dd); }
    if(v.flagship>0 && arm(C.flag, "Arctic Shelf")) did.push("earmark "+C.flag);
    cont=0;
    if(w){
      const per=perSAI(); let budget=(w.cap||196)-dos; if(isFinal) budget=196-dos-C.finalMargin;
      let n=0; const cap=w.max||99;
      while(n<cap && purse()>=32+(w.keep??C.keep) && (n+1)*per<=budget && arm("Stratospheric Aerosol Inj.")) n++;
      if(n){ did.push("SAI x"+n+" (per "+per.toFixed(1)+", budget "+budget.toFixed(0)+")"); waves++; }
      if(isFinal){ cont=Math.floor(purse()); if(cont) did.push("cont "+cont); }
    } else if(afterFinal){ cont=Math.floor(purse()); if(cont) did.push("cont "+cont); }
    else {
      const reserve = next? (next.reserve??C.reserve) : 0;
      while(adapt<C.shieldN && s>=C.shieldFrom && s<=C.shieldTo && purse()-18>=reserve){ if(!arm("Adaptation Investment",HOME)) break; adapt++; did.push("adapt#"+adapt); }
      if(toWave>=1 && toWave<=C.preCont && dos>C.preContAbove){ cont=Math.max(0,Math.min(C.preContMax, Math.floor(purse()-reserve))); if(cont) did.push("pre-cont "+cont); }
    }
    const h=home();
    if(s<C.endQuiet && h.anomaly<C.seedBelow && (v.price>=C.seedMinPrice||h.anomaly<C.seedAlways) && purse()-cont>=6+C.keep && arm("Cloud Seeding",HOME)) did.push("seed home("+h.anomaly+")");
    if(s<C.endQuiet && sinceOp()>=3 && purse()-cont>=6+C.keep && arm("Cloud Seeding",driest().name)) did.push("keep-alive seed");
    await step(did); }
  return log;
};

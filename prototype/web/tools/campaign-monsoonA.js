// monsoonA — monsoon family: three spaced aerosol waves, all cash to the waves (gen4.js)
// CONFIG {"waves":[{"s":11},{"s":25},{"s":34,"keep":0}],"adapt":0,"keep":2,"saveWindow":99,"flag":"ENSO Forcing","cont":0,"contAbove":110,"d5":"Ocean Thermal Forcing","seedBelow":-0.4,"seedMinPrice":0,"seedAlways":-1}
exports.journalFilter = `j.c==="CHYRON"||/TREASURY|DIRECTIVE|INTERCEPT|investigation|WINDFALL|COUNTER|UNITED|EXPOSED/i.test(j.h)`;
exports.play = async (api) => {
  const COST={"Cloud Seeding":6,"Watershed Interference":14,"Fire Enablement":9,"Adaptation Investment":18,"Ocean Thermal Forcing":26,"Stratospheric Aerosol Inj.":32,"ENSO Forcing":45,"Ionospheric Coupling [T3]":60,"Climate Research":8,"Polar Destabilization":38};
  const HOME="North American Plains", BSS="Black Sea Steppe";
  const EXPORTERS=["Black Sea Steppe","South Asia","La Plata Basin","Southeast Asia","North China Plain","Eastern Australia","Yangtze Basin","Canadian Prairies","Kazakh Virgin Lands","Northern European Plain"];
  const log=[]; let jPtr=0, armedNow=0, v=null, s=0, cont=0;
  const hits=[];   // {cap,tgt,s}
  const purse=()=>v.funds-32-armedNow;                       // what the engine will accept
  const flagFree=(c)=>v.flagship>0&&["ENSO Forcing","Ionospheric Coupling [T3]","Polar Destabilization"].includes(c);
  const arm=(c,t)=>{ const cost=flagFree(c)? COST[c]-60 : COST[c];   // earmark lands as grant the same season
    if(cost>purse()) return false; slots.push({cap:c,target:t||null}); armedNow+=Math.max(0,cost); hits.push({cap:c,tgt:t,s}); return true; };
  const reg=(n)=>v.regions.find(r=>r.name===n);
  const home=()=>reg(HOME);
  const driest=(pool)=>v.regions.filter(r=>r.kind==="crop"&&(!pool||pool.includes(r.name))).sort((a,b)=>a.anomaly-b.anomaly)[0];
  const recent=(tgt,n)=>hits.filter(h=>h.tgt===tgt&&h.s>s-n&&COST[h.cap]&&h.cap!=="Adaptation Investment"&&h.cap!=="Climate Research").length;
  const sinceOp=()=>{ const h=hits.filter(x=>x.cap!=="Climate Research"); return h.length? s-h[h.length-1].s : 99; };
  // committee work: returns what it did (or "")
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
    api.containment(Math.max(0,Math.min(40,Math.floor(Math.min(cont,purse())))));
    api.predict(did.join("; ").slice(0,80));
    await api.season();
    const nv=api.view();
    log.push({s,did:did.join("; ")||"held",f:nv.funds,p:nv.price,hy:home().yield,rev:+(nv.profit-(log.length?log[log.length-1].profit:0)+85).toFixed(1),
              r:nv.rung,dos:api.telemetryDossier(),profit:nv.profit,m:nv.mandate,dir:nv.directive,fl:nv.flagship,lap:nv.lapses,st:nv.status});
    armedNow=0; jPtr=api.journalLen();
  };

  const C={"waves":[{"s":11},{"s":25},{"s":34,"keep":0}],"adapt":0,"keep":2,"saveWindow":99,"flag":"ENSO Forcing","cont":0,"contAbove":110,"d5":"Ocean Thermal Forcing","seedBelow":-0.4,"seedMinPrice":0,"seedAlways":-1};
  let adapt=0, waves=0;
  for(s=1;s<=40;s++){ v=api.view(); if(!v.running) break; const did=[];
    const dos=api.telemetryDossier();
    cont = (C.cont && dos>C.contAbove)? Math.min(C.cont, Math.floor(purse()*0.5)) : 0;
    const w=C.waves.find(w=>w.s===s);
    const next=C.waves.find(w=>w.s>=s), toWave=next? next.s-s : 99;
    // D5 "Move the ocean": answered by the wave itself if one is due inside the fuse, else Ocean Thermal
    const d5=(v.directive==="Move the ocean, not the country")? (toWave<=v.directiveLeft-1? null : C.d5) : (v.directive==="Show the flag"? (toWave<=v.directiveLeft-1? null:"Ocean Thermal Forcing") : null);
    const dd=directive({driver:d5}); if(dd) did.push(dd);
    if(v.flagship>0 && arm(C.flag, "Arctic Shelf")) did.push("earmark "+C.flag);
    if(w){ let n=0; const cap=w.max||99; while(n<cap && purse()>=32+(w.keep??C.keep) && arm("Stratospheric Aerosol Inj.")) n++; if(n){ did.push("SAI x"+n); waves++; } }
    else if(adapt<C.adapt && toWave>C.saveWindow){ while(adapt<C.adapt && purse()>=18+C.keep){ if(!arm("Adaptation Investment",HOME)) break; adapt++; did.push("adapt#"+adapt); } }
    const h=home();
    if(h.anomaly<C.seedBelow && (v.price>=C.seedMinPrice||h.anomaly<C.seedAlways) && purse()>=6+(toWave<=1?0:C.keep) && arm("Cloud Seeding",HOME)) did.push("seed home("+h.anomaly+")");
    if(sinceOp()>=3 && purse()>=6+C.keep && arm("Cloud Seeding",driest().name)) did.push("keep-alive seed");
    await step(did); }
  return log;
};

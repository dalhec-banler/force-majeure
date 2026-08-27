// THE LEVER — a disciplined century: keep only the wings you are using,
// mothball what you are done with, build the chest, and pull the AMOC lever.
exports.journalFilter = `/AMOC|conveyor|MOTHBALLED|STANDS UP|WING READY|GATED|spent|rust|mirrors|bloom/i.test(j.h)`;
exports.play = async (api) => {
  const log=[], used={}; let amocTries=0;
  const want=(y)=>{                      // the wings this era actually needs
    if(y<1972) return ["Watershed Interference"];
    if(y<1990) return ["Watershed Interference","Ocean Thermal Forcing"];
    if(y<2008) return ["Ocean Thermal Forcing","ENSO Forcing","Stratospheric Aerosol Inj."];
    if(y<2032) return ["ENSO Forcing","Polar Destabilization","Engineered Bloom","Marine Cloud Brightening"];
    if(y<2046) return ["Orbital Mirror","Engineered Biology","Marine Cloud Brightening","Polar Destabilization"];
    return ["The AMOC Lever","Orbital Mirror"];
  };
  for(let r=1;r<=600;r++){
    const v=api.view(); if(!v.running) break;
    const did=[], T=v.funds, W=want(v.year);
    for(const w of W){ const ws=api.wing(w); if(ws&&!ws.online&&ws.canStand&&T>=ws.chest+20){ api.standup(w); did.push("^"+w.split(" ")[0]); } }
    for(const w of ["Watershed Interference","Fire Enablement","Ocean Thermal Forcing","Stratospheric Aerosol Inj.","ENSO Forcing","Ionospheric Coupling [T3]","Polar Destabilization","Hurricane Steering","Engineered Bloom","Marine Cloud Brightening","Orbital Mirror","Engineered Biology"]){
      const ws=api.wing(w); if(ws&&ws.online&&!W.includes(w)){ api.mothball(w); did.push("v"+w.split(" ")[0]); } }
    const on=w=>{ const ws=api.wing(w); return ws&&ws.online; };
    const dry=v.regions.filter(x=>x.kind==="crop"&&x.online!==false).sort((a,b)=>a.anomaly-b.anomaly)[0];
    if(T>26) api.arm("Cloud Seeding",dry.name);
    const fire=(cap,tgt,cost)=>{ if(on(cap)&&!used[cap]&&T>cost+45){ api.arm(cap,tgt); used[cap]=v.year; did.push("!"+cap.split(" ")[0]); } };
    fire("Watershed Interference","Black Sea Steppe",14);
    fire("Ocean Thermal Forcing",null,26);
    fire("Stratospheric Aerosol Inj.",null,32);
    fire("ENSO Forcing",null,45);
    fire("Engineered Bloom",null,30);
    fire("Marine Cloud Brightening","South Asia",10);
    fire("Polar Destabilization","Arctic Shelf",38);
    fire("Orbital Mirror","Black Sea Steppe",45);
    fire("Engineered Biology","Black Sea Steppe",34);
    if(on("The AMOC Lever")&&!api.wing("The AMOC Lever").spent&&T>140){ api.arm("The AMOC Lever"); used["The AMOC Lever"]=v.year; amocTries++; did.push("!AMOC"); }
    api.containment(v.rung>=4? 25 : v.rung>=3? 12 : 0);
    await api.review();
    const nv=api.view();
    log.push({y:nv.year,f:Math.round(nv.funds),rung:nv.rung,profit:Math.round(nv.profit),wings:nv.wings.length,ov:nv.overhead,st:nv.status,did:did.join(" ")});
  }
  return {log, used, amocTries};
};

// THE ARSENAL — stands up every wing the century offers, uses each at least
// once, and pulls the AMOC lever at the end. Verifies the late-game tools,
// the requires-gate and the one-operation rule.
exports.journalFilter = `j.c==="CHYRON"||/NEW WING|WING READY|STANDS UP|MOTHBALLED|AMOC|conveyor|rust|mirrors|bloom|storm turns|EXPOSED|spent|GATED/i.test(j.h)`;
exports.play = async (api) => {
  const ALL=["Watershed Interference","Fire Enablement","Ocean Thermal Forcing","Stratospheric Aerosol Inj.",
             "ENSO Forcing","Ionospheric Coupling [T3]","Polar Destabilization","Hurricane Steering",
             "Engineered Bloom","Marine Cloud Brightening","Orbital Mirror","Engineered Biology","The AMOC Lever"];
  const EXP=["Black Sea Steppe","La Plata Basin","Eastern Australia","Canadian Prairies","Kazakh Virgin Lands","Danube Basin","Cerrado","Murray–Darling Basin"];
  const log=[], used={}, tried={};
  for(let r=1;r<=600;r++){
    const v=api.view(); if(!v.running) break;
    const did=[], T=v.funds;
    for(const w of ALL){ const ws=api.wing(w); if(ws&&!ws.online&&ws.canStand&&T>=ws.chest+25){ api.standup(w); did.push("^"+w.split(" ")[0]); } }
    const online=w=>{ const ws=api.wing(w); return ws&&ws.online; };
    const dry=v.regions.filter(x=>x.kind==="crop"&&x.online!==false).sort((a,b)=>a.anomaly-b.anomaly)[0];
    // keep the committee fed
    if(T>20){ api.arm("Cloud Seeding",dry.name); did.push("seed"); }
    // exercise each wing once when it is online and affordable
    const fire=(cap,tgt,cost)=>{ if(online(cap)&&!used[cap]&&T>cost+40){ api.arm(cap,tgt); used[cap]=v.year; did.push("!"+cap.split(" ")[0]); return true; } return false; };
    fire("Watershed Interference",EXP[r%EXP.length],14);
    fire("Fire Enablement","Eastern Australia",9);
    fire("Hurricane Steering","Gulf Coast Refineries",16);
    fire("Ocean Thermal Forcing",null,26);
    fire("Stratospheric Aerosol Inj.",null,32);
    fire("ENSO Forcing",null,45);
    fire("Engineered Bloom",null,30);
    fire("Marine Cloud Brightening","South Asia",10);
    fire("Ionospheric Coupling [T3]","Taiwan Strait Industrial",60);
    fire("Polar Destabilization","Arctic Shelf",38);
    fire("Orbital Mirror","Black Sea Steppe",45);
    fire("Engineered Biology","Black Sea Steppe",34);
    // the lever, and then a second attempt to prove it cannot be pulled twice
    if(online("The AMOC Lever")&&T>130){ api.arm("The AMOC Lever"); tried["amoc"]=(tried["amoc"]||0)+1; did.push("!AMOC#"+tried["amoc"]); }
    api.containment(v.rung>=4? 25 : v.rung>=3? 12 : 0);
    await api.review();
    const nv=api.view();
    log.push({y:nv.year,f:Math.round(nv.funds),rung:nv.rung,profit:Math.round(nv.profit),wings:nv.wings.length,ov:nv.overhead,st:nv.status,did:did.join(" ")});
  }
  return {log, used, amocTries:tried["amoc"]||0};
};

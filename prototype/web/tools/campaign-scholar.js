// CAMPAIGN 6 — "The Scholar". Follows directives, otherwise spends quiet
// seasons on Signals Research aimed at the region with the most unknown wires.
exports.journalFilter = `/RESEARCH|ANALYSIS|DIRECTIVE|Analysis desk|wire not on/.test(j.h)`;
exports.play = async (api) => {
  const log=[];
  const order=["Eastern Australia","Horn of Africa","Sahel","South Asia","Southeast Asia","La Plata Basin","Ganges Delta Ports","Taiwan Strait Industrial","Persian Gulf Terminals","Congo Cobalt Belt","Andean Copper Belt","North Sea Energy Shelf","Arctic Shelf","Siberian Gas Fields","Black Sea Steppe"];
  let i=0;
  for(let s=1;s<=40;s++){
    const v=api.view(); if(!v.running) break;
    let did="";
    const d=v.directive;
    if(d==="Prove the concept"){ api.arm("Cloud Seeding","Eastern Australia"); did="seed"; }
    else if(d==="Stabilize a drought"){ const r=v.regions.filter(r=>r.kind==="crop").sort((a,b)=>a.anomaly-b.anomaly)[0]; if(r.anomaly<-0.25){ api.arm("Cloud Seeding",r.name); did="seed dry "+r.name; } }
    else if(d==="Harden the homeland"){ api.arm("Adaptation Investment","North American Plains"); did="adapt"; }
    else if(d==="Move the ocean, not the country"&&v.funds>60){ api.arm("Ocean Thermal Forcing"); did="ocean"; }
    else if(d==="Move a market"&&v.funds>50){ api.arm("Watershed Interference","Black Sea Steppe"); did="watershed"; }
    else if(d==="Answer them"||d==="Answer the Steppe"){ api.arm("Watershed Interference","Black Sea Steppe"); did="answer"; }
    if(v.funds>40){ api.arm("Signals Research", order[i%order.length]); did+=" +research "+order[i%order.length]; i++; }
    api.containment(v.rung>=3?10:0);
    await api.season();
    const w=api.view();
    log.push({s,did:did.trim(),funds:w.funds,wires:w.wires.known+"/"+w.wires.total,dir:w.directive,lapses:w.lapses,status:w.status});
  }
  return log;
};

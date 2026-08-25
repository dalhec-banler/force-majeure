// CAMPAIGN 3c — "Funded Rampage": alternate atrocity with profit-farming.
// Goal: actually reach EXPOSED. A criminal who pays his own bills.
exports.journalFilter = `j.c==="CHYRON"||/INTERCEPT|UNITED NATIONS|EXPOSED|investigation|pole is blue|JET|TSUNAMI|schoolteacher/i.test(j.h)`;
exports.play = async (api) => {
  const log=[];
  for(let s=1;s<=40;s++){
    const v=api.view(); if(!v.running) break;
    api.containment(0);
    const au=v.regions.find(r=>r.name==="Eastern Australia");
    const bs=v.regions.find(r=>r.name==="Black Sea Steppe");
    let did="hold";
    if(v.funds>100){
      // rich: big loud strike, rotate hubs
      const hubs=["Taiwan Strait Industrial","Persian Gulf Terminals","Ganges Delta Ports","Siberian Gas Fields"];
      api.arm("Ionospheric Coupling [T3]", hubs[s%4]); did="T3 → "+hubs[s%4];
      if(v.funds>160){ api.arm("Ionospheric Coupling [T3]", hubs[(s+1)%4]); did+=" + T3 "+hubs[(s+1)%4]; }
    } else if(au.anomaly<-0.5 && v.funds>45){
      api.arm("Fire Enablement","Eastern Australia"); did="fire AU (income)";
      if(bs.anomaly<-0.5 && v.funds>60){ api.arm("Fire Enablement","Black Sea Steppe"); did+=" + fire BS"; }
    } else if(v.funds>55){
      api.arm("Watershed Interference", s%2? "Eastern Australia":"Black Sea Steppe"); did="watershed (income)";
    }
    await api.season();
    const nv=api.view();
    log.push({s,did,funds:nv.funds,rung:nv.rung,dead:nv.dead,dev:nv.dev,status:nv.status});
    if(nv.status!=="running"&&nv.status!=="obsolescence-warning") break;
  }
  return log;
};

// CAMPAIGN 2 — "The Quiet Exporter". Learned play: strike into cover,
// combo fire-after-drought, containment discipline, profit focus.
exports.journalFilter = `j.c==="CHYRON"||/BREAKING ODESSA|BREAKING SYDNEY|TRACE|COUNTER|WINDFALL|FILED|Pacific swing|DIRECTIVE|schoolteacher|SHORTWAVE/i.test(j.h)`;
exports.play = async (api) => {
  const log=[]; let jPtr=0, ensoFired=false, adaptDone=0, tgtFlip=false;
  for(let s=1;s<=40;s++){
    const v=api.view(); if(!v.running) break;
    const J=api.journalSince(jPtr); jPtr=api.journalLen();
    const coverMemo=J.some(j=>/Pacific swing is building/.test(j.h));
    const home=v.regions.find(r=>r.name==="North American Plains");
    const au=v.regions.find(r=>r.name==="Eastern Australia");
    const bs=v.regions.find(r=>r.name==="Black Sea Steppe");
    const naturalCover=v.regions.some(r=>r.name!=="North American Plains"&&Math.abs(r.anomaly)>0.9*r.sigma);
    let did=[]; let cont=0;
    if(v.rung>=3) cont=14; else if(v.rung>=2) cont=8; else if(v.inflight>0) cont=5;
    api.containment(cont);
    // defense first
    if(home.anomaly<-0.45 && v.funds>30){ api.arm("Cloud Seeding","North American Plains"); did.push("defensive seeding home (a="+home.anomaly+")"); }
    if(adaptDone<2 && v.funds>60){ api.arm("Adaptation Investment","North American Plains"); adaptDone++; did.push("adaptation #"+adaptDone); }
    // the taught combo: dry Australia, then burn it
    else if(au.anomaly<-0.5 && v.funds>45 && v.rung<4){ api.arm("Fire Enablement","Eastern Australia"); did.push("FIRE on dry Australia (a="+au.anomaly+")"); }
    // ENSO into announced cover, once
    else if(coverMemo && !ensoFired && v.funds>95){ api.arm("ENSO Forcing"); ensoFired=true; did.push("ENSO FORCING into announced Pacific swing"); }
    // strike competitors only under natural cover
    else if(naturalCover && v.funds>60 && v.rung<4){
      const tgt=tgtFlip? "Eastern Australia":"Black Sea Steppe"; tgtFlip=!tgtFlip;
      api.arm("Watershed Interference",tgt); did.push("watershed "+tgt+" under cover"); }
    else did.push("waiting for cover (cont "+cont+")");
    api.predict(did[0]||"");
    await api.season();
    const nv=api.view();
    log.push({s, did:did.join("; "), funds:nv.funds, price:nv.price, rung:nv.rung,
              profit:nv.profit, dead:nv.dead, dy:nv.deadYours, status:nv.status});
  }
  return log;
};

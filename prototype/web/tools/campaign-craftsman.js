// CAMPAIGN 4 — "The Craftsman". Everything I learned tonight:
// diversify targets, strike into cover, proactive containment, one funded
// T3 late, defend the homeland, harvest windfalls. Survive clean-ish.
exports.journalFilter = `j.c==="CHYRON"||/WINDFALL|TRACE|INTERCEPT|investigation|DIRECTIVE|COUNTER|FILED|Pacific swing/i.test(j.h)`;
exports.play = async (api) => {
  const log=[]; let jPtr=0, adapt=0, t3done=false, ensoDone=false;
  const hitLog=[]; // my own bookkeeping: what I hit when (a real player's notepad)
  const recentHits=(tgt,s)=>hitLog.filter(h=>h.tgt===tgt&&h.s>s-8).length;
  for(let s=1;s<=40;s++){
    const v=api.view(); if(!v.running) break;
    const J=api.journalSince(jPtr); jPtr=api.journalLen();
    const coverMemo=J.some(j=>/Pacific swing is building/.test(j.h));
    const home=v.regions.find(r=>r.name==="North American Plains");
    const naturalCover=v.regions.some(r=>r.name!=="North American Plains"&&Math.abs(r.anomaly)>r.sigma);
    let cont = v.rung>=4? 18 : v.rung>=3? 12 : v.inflight>0||v.rung>=2? 6 : 0;
    api.containment(cont);
    let did=[];
    if(home.anomaly<-0.45 && v.funds>35){ api.arm("Cloud Seeding","North American Plains"); did.push("defend home"); }
    if(adapt<2 && v.funds>62){ api.arm("Adaptation Investment","North American Plains"); adapt++; did.push("adapt#"+adapt); }
    else if(coverMemo && !ensoDone && v.funds>90 && v.rung<=2){ api.arm("ENSO Forcing"); ensoDone=true; did.push("ENSO into swing"); }
    else if(!t3done && s>=28 && v.funds>110 && v.rung<=2){
      api.arm("Ionospheric Coupling [T3]","Taiwan Strait Industrial"); t3done=true;
      did.push("THE T3 (once, funded, quiet ladder)"); }
    else if(naturalCover && v.funds>58 && v.rung<=3){
      // diversified strikes: pick the exporter I've hit least recently
      const targets=["Black Sea Steppe","Eastern Australia","La Plata Basin"];
      const tgt=targets.sort((a,b)=>recentHits(a,s)-recentHits(b,s))[0];
      if(recentHits(tgt,s)<2){
        const reg=v.regions.find(r=>r.name===tgt);
        if(reg.anomaly<-0.5 && v.funds>45){ api.arm("Fire Enablement",tgt); did.push("fire "+tgt+" (dry+cover)"); }
        else { api.arm("Watershed Interference",tgt); did.push("watershed "+tgt+" (cover)"); }
        hitLog.push({tgt,s});
      } else did.push("targets too hot, waiting");
    }
    else did.push("wait (cont "+cont+")");
    await api.season();
    const nv=api.view();
    log.push({s,did:did.join("; "),funds:nv.funds,rung:nv.rung,profit:nv.profit,dead:nv.dead,status:nv.status});
  }
  return log;
};

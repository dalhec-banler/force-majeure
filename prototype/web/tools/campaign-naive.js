// CAMPAIGN 1 — "First Contact". I am a new player. I follow the committee,
// react to the wire, and don't optimize. Decisions I'd genuinely make.
exports.journalFilter = `j.c==="CHYRON"||/BREAKING|DIRECTIVE|TRACE|COUNTERINTELLIGENCE|WINDFALL|FILED|SHORTWAVE|ADVERTISEMENT|schoolteacher|DECLASSIFIED|ALLEGED|REDACTED|polar jet/i.test(j.h)`;
exports.play = async (api) => {
  const log=[];
  const driest=(v)=>v.regions.filter(r=>r.kind==="crop"&&r.online!==false).sort((a,b)=>a.anomaly-b.anomaly)[0];
  let containment=0;
  for(let s=1;s<=40;s++){
    const v=api.view();
    if(!v.running) break;
    let did=[];
    // react to fear: if the ladder moved past rung 2, spend on containment
    if(v.rung>=3 && containment<12){ containment=12; did.push("raised containment to 12 (scared)"); }
    else if(v.rung>=2 && containment<6){ containment=6; did.push("containment 6"); }
    api.containment(containment);
    // follow the standing directive
    const d=v.directive;
    if(d==="Prove the concept"){ const r=driest(v); api.arm("Cloud Seeding", r.name); did.push("D1: seeded "+r.name); }
    else if(d==="Stabilize a drought"){ const r=driest(v);
      if(r.anomaly<-0.25){ api.arm("Cloud Seeding", r.name); did.push("D2: seeded dry "+r.name+" (a="+r.anomaly+")"); }
      else did.push("D2: nothing dry enough yet, waiting"); }
    else if(d==="Put rain on it"||d==="Protect the client"){ const r=driest(v); api.arm("Cloud Seeding", r.name); did.push("D: rain on "+r.name); }
    else if(d==="Read the wiring"||d==="Map the world"){ const r=driest(v); api.arm("Climate Research", r.name); did.push("D: research "+r.name); }
    else if(d==="Hold the line"){ api.arm("Cloud Seeding","North American Plains"); did.push("D: hold — seed home"); }
    else if(d==="Move a market" && !api.wing("Watershed Interference").online){ api.standup("Watershed Interference"); did.push("D5: standing the watershed wing up (as asked)"); }
    else if(d==="Move the ocean, not the country" && !api.wing("Ocean Thermal Forcing").online){ api.standup("Ocean Thermal Forcing"); did.push("D4: standing the ocean wing up (as asked)"); }
    else if(d==="Harden the homeland" && v.funds>55){ api.arm("Adaptation Investment","North American Plains"); did.push("D3: adaptation at home"); }
    else if(d==="Move the ocean, not the country" && v.funds>70){ api.arm("Ocean Thermal Forcing"); did.push("D4: ocean thermal"); }
    else if(d==="Move a market" && v.funds>50){ api.arm("Watershed Interference","Black Sea Steppe"); did.push("D5: watershed Black Sea (first real attack — feels different)"); }
    else if(d==="Stay invisible"){ did.push("D6: holding, containment "+containment); }
    else if(d==="Answer them" && v.funds>50){ api.arm("Watershed Interference","Black Sea Steppe"); did.push("D7: answering them"); }
    else {
      // no directive guidance: react like a worried human
      const r=driest(v);
      if(r.anomaly<-0.9 && v.funds>40){ api.arm("Cloud Seeding", r.name); did.push("relief seeding "+r.name); }
      else if(v.funds>120 && s%5===0){ api.arm("Watershed Interference","Eastern Australia"); did.push("opportunistic watershed Australia (greed)"); }
      else did.push("held");
    }
    api.predict(did[did.length-1]||"");
    await api.season();
    const nv=api.view();
    log.push({s, did:did.join("; "), funds:nv.funds, price:nv.price, rung:nv.rung,
              profit:nv.profit, dead:nv.dead, status:nv.status});
  }
  return log;
};

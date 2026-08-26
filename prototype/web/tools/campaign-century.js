// THE CENTURY — a competent builder through the real console, 1946→2060.
// Lab till the chest allows; stands wings up as the era and the chest permit;
// strikes exporters that are already dry (cover + convex price), never the
// same one twice in twelve seasons; a two-stack aerosol wave once a decade
// when the dossier is quiet; containment when questions circulate.
// Usage: node tools/playharness.js "$PWD/tools/campaign-century.js"  (env LAB=1 for the lab-only line)
exports.journalFilter = `j.c==="CHYRON"||/WING|MOTHBALLED|EARMARK|DIRECTIVE|INTERCEPT|investigation|EXPOSED|on the board|lapsed|Trade desk/i.test(j.h)`;
exports.play = async (api) => {
  const LAB=!!process.env.LAB;
  const EXP=["Black Sea Steppe","La Plata Basin","Eastern Australia","Canadian Prairies","Kazakh Virgin Lands","Northern European Plain","Danube Basin","Cerrado","Murray–Darling Basin","Southeast Asia","Mekong Delta"];
  const WINGS=["Watershed Interference","Fire Enablement","Ocean Thermal Forcing","Stratospheric Aerosol Inj.","ENSO Forcing"];
  const log=[]; const hits=[]; let lastWave=-99, decade=null;
  const reg=(v,n)=>v.regions.find(r=>r.name===n);
  for(let r=1;r<=600;r++){
    const v=api.view(); if(!v.running) break;
    const did=[]; const T=v.funds;
    // wings: stand up when the chest can carry it with $30M to spare
    if(!LAB) for(const w of WINGS){ const ws=api.wing(w); if(ws&&!ws.online&&ws.canStand&&T>=ws.chest+30){ api.standup(w); did.push("standup "+w.split(" ")[0]); } }
    // directive answers (cheap ones only; the committee's own asks)
    const d=v.directive;
    if(d==="Prove the concept"||d==="Stabilize a drought"||d==="Put rain on it"||d==="Protect the client"){
      const dry=v.regions.filter(x=>x.kind==="crop"&&x.online).sort((a,b)=>a.anomaly-b.anomaly)[0]; api.arm("Cloud Seeding",dry.name); did.push("D:seed "+dry.name); }
    else if(d==="Harden the homeland"||d==="Hold the line"){ api.arm("Adaptation Investment","North American Plains"); did.push("D:adapt"); }
    else if(d==="Read the wiring"||d==="Map the world"){ api.arm("Climate Research", v.regions.filter(x=>x.kind==="crop"&&x.online)[r%6].name); did.push("D:research"); }
    else if(d==="Move the ocean, not the country"||d==="Show the flag"){ if(api.wing("Ocean Thermal Forcing").online&&T>60){ api.arm("Ocean Thermal Forcing"); did.push("D:ocean"); } }
    else if(!did.length){ // keep the committee fed: a seed a year is the lab's tithe
      const dry=v.regions.filter(x=>x.kind==="crop"&&x.online).sort((a,b)=>a.anomaly-b.anomaly)[0]; api.arm("Cloud Seeding",dry.name); did.push("seed "+dry.name); }
    if(!LAB && v.rung<=3 && T>60){
      const ws=api.wing("Watershed Interference"), fs=api.wing("Fire Enablement");
      if(ws.online){
        const dry=EXP.map(n=>reg(v,n)).filter(x=>x&&x.online&&x.anomaly<-0.35&&!hits.some(h=>h.n===x.name&&h.r>r-3)).sort((a,b)=>a.anomaly-b.anomaly).slice(0,2);
        for(const x of dry){ const fire=fs.online&&x.anomaly<-0.6; api.arm(fire?"Fire Enablement":"Watershed Interference",x.name); hits.push({n:x.name,r}); did.push((fire?"fire ":"dry ")+x.name); }
      }
      const sai=api.wing("Stratospheric Aerosol Inj.");
      if(sai.online && v.year-lastWave>=10 && T>120 && v.rung<=2){ api.arm("Stratospheric Aerosol Inj."); api.arm("Stratospheric Aerosol Inj."); lastWave=v.year; did.push("WAVE x2"); }
    }
    if(!LAB && v.flagship>0 && T>60){ api.arm(v.year<1990? "Stratospheric Aerosol Inj." : "ENSO Forcing"); did.push("earmark demo"); }
    api.containment(v.rung>=4? Math.min(30,Math.max(0,T-80)) : v.rung>=3? Math.min(15,Math.max(0,T-80)) : 0);
    await api.review();
    const nv=api.view();
    log.push({r,year:nv.year,did:did.join("; ")||"held",f:nv.funds,rung:nv.rung,profit:nv.profit,m:nv.mandate,wings:nv.wings.length,ov:nv.overhead,dir:nv.directive,st:nv.status});
  }
  return log;
};

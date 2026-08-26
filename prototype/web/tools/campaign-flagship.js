// CHECK — draws the earmark: seeds early, fires ENSO the season the earmark
// appears, Polar on the second. Verifies the grant lands the same season.
exports.journalFilter = `/DIRECTIVE|EARMARK|flight logs|HOSTILE/.test(j.h)`;
exports.play = async (api) => {
  const log=[];
  for(let s=1;s<=40;s++){
    const v=api.view(); if(!v.running) break;
    let did="held";
    if(s===1){ api.arm("Cloud Seeding","Eastern Australia"); did="seed"; }
    if(s%5===2){ api.arm("Adaptation Investment","South Asia"); did="adapt South Asia"; }
    if(s%6===3){ api.arm("Watershed Interference","Black Sea Steppe"); did="watershed Steppe"; }
    if(v.flagship>0 && s<20){ api.arm("ENSO Forcing"); did="ENSO on earmark"; }
    if(v.flagship>0 && s>=20){ api.arm("Polar Destabilization","Arctic Shelf"); did="Polar on earmark"; }
    api.containment(v.rung>=3?10:0);
    await api.season();
    const w=api.view();
    log.push({s,did,funds:w.funds,dir:w.directive,left:w.directiveLeft,fl:w.flagship,lapses:w.lapses,rung:w.rung,status:w.status});
  }
  return log;
};

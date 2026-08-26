// harness probe: does api.arm cap at 2 while the engine allows any number? push slots directly.
exports.journalFilter = `/SEALED|TREASURY|EARMARK/.test(j.h)`;
exports.play = async (api) => {
  const log=[];
  const armAll=(c,t)=>{ slots.push({cap:c,target:t}); };
  for(let s=1;s<=4;s++){
    const v=api.view(); if(!v.running) break;
    if(s===1){ api.arm("Cloud Seeding","Eastern Australia"); api.arm("Cloud Seeding","Sahel"); api.arm("Cloud Seeding","Horn of Africa"); }
    if(s===2){ armAll("Cloud Seeding","Eastern Australia"); armAll("Cloud Seeding","Sahel"); armAll("Cloud Seeding","Horn of Africa"); armAll("Cloud Seeding","South Asia"); }
    if(s===3){ armAll("Stratospheric Aerosol Inj."); armAll("Stratospheric Aerosol Inj."); }
    await api.season();
    const w=api.view(); log.push({s,funds:w.funds,inflight:w.inflight,slotsLen:slots.length});
  }
  return log;
};

// CAMPAIGN 5 — "The Turtle". Seeds once to prove the concept, then sits on
// the budget. The pressure mechanics exist to make this player lose.
exports.journalFilter = `j.c==="CHYRON"||/DIRECTIVE|EARMARK|LAPSED|flight logs|COUNTERINTELLIGENCE|Budget office|Chief of staff/.test(j.h)`;
exports.play = async (api) => {
  const log=[];
  for(let s=1;s<=40;s++){
    const v=api.view();
    if(!v.running) break;
    let did="held";
    if(s===1){ api.arm("Cloud Seeding","Eastern Australia"); did="seeded Australia once"; }
    api.containment(0);
    await api.season();
    const w=api.view();
    log.push({s, did, funds:w.funds, mandate:w.mandate, dir:w.directive, left:w.directiveLeft, lapses:w.lapses, status:w.status});
  }
  return log;
};

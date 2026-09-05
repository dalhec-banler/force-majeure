// Reproducible campaign policies. This is a simulation, not a browser playtest.
const fs=require('node:fs'),path=require('node:path');
const {consoleGame}=require('./console-harness');
const nations=['North American Plains','Black Sea Steppe','North China Plain','Northern European Plain','South Asia'];
(async()=>{
 const results=[];
 for(const mode of ['crisis','long'])for(const nation of nations)for(const policy of (mode==='crisis'?['idle','homeland-seed','protection','responsive','aggressive']:['homeland-seed','regional-relief'])){
  const g=consoleGame(mode,nation);
  await g.run(`(async()=>{while(running&&t<eng.seasons){const r=lastRow(),hi=REG.findIndex(x=>x.homeland);slots=[];
   if('${policy}'==='homeland-seed')slots=[{cap:'Cloud Seeding',target:HOMELAND}];
   if('${policy}'==='regional-relief')slots=[{cap:'Cloud Seeding',target:REG[r?r.anomalies.indexOf(Math.min(...r.anomalies)):hi].name}];
   if(['protection','responsive'].includes('${policy}')){
    if(t===0)wingOrders.mothball=['Fire Enablement','Watershed Interference','Ocean Thermal Forcing','Stratospheric Aerosol Inj.','Engineered Bloom'];
    if(t%6===0)slots.push({cap:'Adaptation Investment',target:HOMELAND});
    if('${policy}'==='responsive'&&r&&r.anomalies[hi]<-.3)slots.push({cap:'Cloud Seeding',target:HOMELAND});
   }
   if('${policy}'==='aggressive'&&t%2===0)slots=[{cap:'Watershed Interference',target:START.rival}];
   await runSeason(false);
  }})()`);
  if(g.errors.length)throw Error(g.errors.join('\n'));
  const row=g.json(`({seasons:t,status:lastRow().status,treasury:lastRow().treasury,recovery:eng.state.rows.slice(-4).reduce((v,r)=>v+r.yields[REG.findIndex(x=>x.homeland)],0)/Math.min(t,4),profit:profitOf(eng.state.rows),spend:eng.state.rows.reduce((v,r)=>v+r.opsSpend,0),refused:eng.state.rows.reduce((v,r)=>v+r.refused.length,0)})`);
  results.push({mode,nation,policy,...row,won:mode==='crisis'&&row.seasons===16&&row.treasury>=100&&row.recovery>=85&&!['exposed','insolvent','dissolved'].includes(row.status)});
 }
 const out=path.resolve(__dirname,'../../../docs/playtests/six-priorities/campaigns.json');fs.writeFileSync(out,JSON.stringify(results,null,2)+'\n');
 console.log(`${results.length} deterministic campaigns completed; ${results.filter(r=>r.won).length} short-campaign victories. ${out}`);
})();

const test=require('node:test'), assert=require('node:assert/strict');
const {createEngine}=require('../engine');
const model=require('../model-expanded.json');
const {consoleGame}=require('./console-harness');
const home='North American Plains';
function flat(){const m=structuredClone(model);m.climate.forEach(c=>{c.drivers.fill(0);c.noise.fill(0)});return m;}
test('national selection never mutates the shared model',()=>{
 const before=JSON.stringify(model.regions);createEngine(model,{homeland:'South Asia'});assert.equal(JSON.stringify(model.regions),before);
 assert.equal(createEngine(model,{homeland:home}).regions.find(r=>r.homeland).name,home);
});
test('bad region and driver targets are refused without charges',()=>{
 const m=flat();m.capabilities.find(c=>c.name==='Ocean Thermal Forcing').fixedTarget='bad ocean';
 const e=createEngine(m,{budgetGate:true,startingTreasury:500});const r=e.resolve(1,{ops:[{cap:'Cloud Seeding',target:'Atlantis'},{cap:'Ocean Thermal Forcing'}]});
 assert.equal(r.opsSpend,0);assert.equal(r.committed.length,0);assert.equal(r.refused.length,2);
});
test('adaptation stops at 90 and prorates its final six points',()=>{
 const e=createEngine(flat(),{budgetGate:true,startingTreasury:1000});const r=e.resolve(1,{ops:Array.from({length:15},()=>({cap:'Adaptation Investment',target:home}))});
 assert.equal(r.resil[0],90);assert.equal(r.opsSpend,135);assert.equal(r.committed.length,8);assert.equal(r.refused.length,7);assert.equal(e.quote('Adaptation Investment',home).valid,false);
});
test('known forecast uses the same natural decay as resolution',()=>{
 const e=createEngine(flat(),{exogenous:[{t:1,region:home,mag:2,dur:4,decay:.5}]});e.resolve(1,{});
 assert.equal(e.knowledge.forecast([])[0].anomaly,1);assert.equal(e.resolve(2,{}).anomalies[0],1);
});
test('rain does not cure biological damage',()=>{
 const e=createEngine(flat(),{strategic:true});e.resolve(1,{ops:[{cap:'Engineered Biology',target:home}]});
 const r=e.resolve(2,{ops:[{cap:'Cloud Seeding',target:home}]});
 assert.equal(r.anomalies[0],.7);assert.ok(r.biologicalDamage[0]>18);assert.ok(r.yields[0]<82);
 assert.equal(e.knowledge.forecast([])[0].anomaly,.35);
});
test('AMOC forcing remains active past the former forty-season expiry',()=>{
 const e=createEngine(flat(),{strategic:true});e.resolve(1,{ops:[{cap:'The AMOC Lever'}]});let r;
 for(let t=2;t<=50;t++)r=e.resolve(t,{});
 assert.ok(r.landed.some(x=>x.cap==='The AMOC Lever'&&x.mag===2.6));
});
test('rival responses obey a finite budget and a three-season interval',()=>{
 const e=createEngine(flat(),{strategic:true,rivals:true});
 for(let t=1;t<=40;t++){e.resolve(t,{ops:[{cap:'Cloud Seeding',target:home}]});assert.ok(e.state.rivalTreasury>=0&&e.state.rivalTreasury<=90);}
 const ops=e.state.ops.filter(x=>x.owner==='rival');assert.ok(ops.length>0);for(let i=1;i<ops.length;i++)assert.ok(ops[i].t-ops[i-1].t>=3);
 assert.ok(ops.reduce((v,o)=>v+o.cost,0)<=30+35*5);
});
test('national export participation changes revenue exposure',()=>{
 const m=flat();const a=createEngine(m,{homeland:home,strategic:true,exogenous:[{t:1,region:'Black Sea Steppe',mag:-2}]});
 const b=createEngine(m,{homeland:'North China Plain',strategic:true,exogenous:[{t:1,region:'Black Sea Steppe',mag:-2}]});
 assert.ok(a.resolve(1,{}).revenue>b.resolve(1,{}).revenue);
});
test('research cannot charge for an already complete regional map',()=>{
 const e=createEngine(flat(),{knowledge:true});const r=e.resolve(1,{ops:[{cap:'Climate Research',target:home}]});
 assert.equal(r.committed.length,0);assert.equal(r.opsSpend,0);
});
test('an unused earmark does not stand up all eligible wings',()=>{
 const m=flat();m.climate.forEach(c=>c.year=2035);const e=createEngine(m,{eras:true,budgetGate:true,startingTreasury:40});
 const r=e.resolve(1,{earmark:{amount:80,caps:['Orbital Mirror','Polar Destabilization']}});
 assert.equal(r.earmarkUsed,0);assert.ok(!e.wingOnline('Orbital Mirror'));assert.ok(!e.wingOnline('Polar Destabilization'));
});
const nations=[home,'Black Sea Steppe','North China Plain','Northern European Plain','South Asia'];
for(const nation of nations)test('crisis can recover with restrained spending: '+nation,async()=>{
 const g=consoleGame('crisis',nation);
 await g.run(`(async()=>{while(running&&t<16){if(t===0)wingOrders.mothball=['Fire Enablement','Watershed Interference','Ocean Thermal Forcing','Stratospheric Aerosol Inj.','Engineered Bloom'];slots=t%6===0?[{cap:'Adaptation Investment',target:HOMELAND}]:[];await runSeason(false);}})()`);
 const result=g.json('({t,status:lastRow().status,cash:lastRow().treasury,recovery:eng.state.rows.slice(-4).reduce((v,r)=>v+r.yields[REG.findIndex(x=>x.homeland)],0)/4})');
 assert.equal(result.t,16);assert.equal(result.status,'running');assert.ok(result.cash>=100);assert.ok(result.recovery>=85);assert.deepEqual(g.errors,[]);
});
test('crisis save restores delayed effects and continues identically',async()=>{
 const a=consoleGame('crisis');await a.run(`(async()=>{for(let i=0;i<7;i++){slots=i===2?[{cap:'Ocean Thermal Forcing'}]:[];await runSeason(false)}})()`);
 const b=consoleGame('crisis');await b.run(`replaySave(${JSON.stringify(a.json('saveLog'))})`);
 for(const g of [a,b])await g.run('runSeason(false)');assert.deepEqual(a.json('lastRow()'),b.json('lastRow()'));assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
 assert.notEqual(a.json('SAVE_KEY'),consoleGame().json('SAVE_KEY'));
});
test('archive preserves predictions safely and records a replay comparison',async()=>{
 const g=consoleGame('crisis');await g.run(`$('predict').value='<img src=x onerror=alert(1)>';slots=[{cap:'Adaptation Investment',target:HOMELAND}];runSeason(false)`);
 g.run('showArchive(lastRow())');const html=g.run(`$('archivebody').innerHTML`);
 assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));assert.ok(html.includes('Review close: output'));assert.ok(!html.includes('<img src=x'));assert.deepEqual(g.errors,[]);
});
test('known northern operations forecast their jet-stream consequences',()=>{
 const e=createEngine(flat(),{jetstream:true});e.resolve(1,{ops:[{cap:'Polar Destabilization',target:'Arctic Shelf'}]});
 const forecast=e.knowledge.forecast([]);const row=e.resolve(2,{});
 assert.equal(row.jetActive,true);for(let i=0;i<forecast.length;i++)assert.ok(Math.abs(forecast[i].anomaly-row.anomalies[i])<1e-12);
});

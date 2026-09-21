const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {createEngine}=require('../engine.js');
const model=require('../model-expanded.json');
const home='North American Plains';
function flat(){const m=structuredClone(model);m.climate.forEach(c=>{c.drivers.fill(0);c.noise.fill(0)});return m;}

test('spreadsheet no-op conformance remains exact',()=>{
  const e=createEngine(require('../model-data.json'));let r;
  for(let t=1;t<=40;t++)r=e.resolve(t,{});
  assert.ok(Math.abs(r.treasury-302.4039803274202)<1e-10);
});
test('unspent restricted appropriation cannot pay containment',()=>{
  const e=createEngine(flat(),{budgetGate:true,startingTreasury:33});
  const r=e.resolve(1,{earmark:{amount:80,caps:['Orbital Mirror']},containment:40});
  assert.equal(r.earmarkUsed,0);assert.equal(r.containment,1);assert.ok(r.treasury>=0);
});
test('drawn appropriation can pay the operation and remaining obligations',()=>{
  const e=createEngine(flat(),{budgetGate:true,startingTreasury:33});
  const r=e.resolve(1,{earmark:{amount:80,caps:['Cloud Seeding']},ops:[{cap:'Cloud Seeding',target:home}],containment:40});
  assert.equal(r.earmarkUsed,80);assert.equal(r.committed.length,1);assert.equal(r.containment,40);
});
test('positive hurricane forcing is not treated as public relief',()=>{
  const opts={forensics:true,scrutiny:true};
  const one=createEngine(flat(),opts).resolve(1,{ops:[{cap:'Hurricane Steering',target:home}]});
  const four=createEngine(flat(),opts).resolve(1,{ops:Array.from({length:4},()=>({cap:'Hurricane Steering',target:home}))});
  assert.ok(four.attribution>one.attribution*4,'repeated same-target strikes compound');
  const rain=createEngine(flat(),opts).resolve(1,{ops:[{cap:'Cloud Seeding',target:home}]});
  assert.ok(rain.attribution<one.attribution);
});
test('driver saturation persists through every season of burn-down',()=>{
  const e=createEngine(flat(),{forensics:true});
  for(let t=1;t<=4;t++){
    const r=e.resolve(t,t===1?{ops:[{cap:'Stratospheric Aerosol Inj.'},{cap:'Stratospheric Aerosol Inj.'}]}:{});
    const a=r.landed.filter(x=>x.owner==='player'&&x.kind==='driver'&&!x.cap.includes('displacement'));
    if(t===1){assert.equal(a.length,0);continue;}
    assert.equal(a.length,2);assert.ok(Math.abs(a[1].mag/a[0].mag-0.65)<1e-12);
  }
});

// DOM/canvas stubs exercise campaign state only; visual behavior is checked
// separately in the real browser. No timers or rendering affect game state.
const {consoleGame}=require('./console-harness.js');
test('annual rain observation survives batching, reload, then clears next review',async()=>{
  const a=consoleGame();
  await a.run(`slots=[{cap:'Cloud Seeding',target:HOMELAND}]; runSeason(false)`);
  assert.equal(a.json('t'),4);assert.equal(a.json('rainObservations.length'),1);
  assert.equal(a.json('rainObservations[0].season'),1);
  const b=consoleGame();await b.run(`replaySave(${JSON.stringify(a.json('saveLog'))})`);
  assert.equal(b.json('rainObservations[0].season'),1);
  await a.run('runSeason(false)');assert.equal(a.json('rainObservations.length'),0);
  assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
});
test('late-game save continues identically, including pending wing orders',async()=>{
  const a=consoleGame();
  await a.run(`(async()=>{while(t<398&&running){slots=[{cap:'Cloud Seeding',target:REG[lastRow()?lastRow().anomalies.indexOf(Math.min(...lastRow().anomalies)):0].name}];await runSeason(false)}
    wingOrders.standup.push('ENSO Forcing');slots=[{cap:'Cloud Seeding',target:REG[lastRow()?lastRow().anomalies.indexOf(Math.min(...lastRow().anomalies)):0].name}];await runSeason(false)})()`);
  assert.equal(a.json('t'),399);
  const b=consoleGame();await b.run(`replaySave(${JSON.stringify(a.json('saveLog'))})`);
  assert.deepEqual(b.json('wingOrders'),a.json('wingOrders'));
  for(const g of [a,b])await g.run(`slots=[{cap:'Cloud Seeding',target:HOMELAND}];runSeason(false)`);
  assert.deepEqual(b.json('lastRow()'),a.json('lastRow()'));
  assert.deepEqual(b.json('eng.wings()'),a.json('eng.wings()'));
  assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
});
test('a save cut mid-review finishes that review on resume, and the next orders commit',async()=>{
  const a=consoleGame();
  await a.run(`slots=[{cap:'Cloud Seeding',target:HOMELAND}]; runSeason(false)`);
  assert.equal(a.json('t'),4);
  const cut=a.json('saveLog').slice(0,2);                  // the tab closed two seasons into the year
  const b=consoleGame();await b.run(`replaySave(${JSON.stringify(cut)})`);
  assert.equal(b.json('t'),4);                             // the year closed before the desk came back
  assert.deepEqual(b.json('lastRow()'),a.json('lastRow()'));
  await b.run(`slots=[{cap:'Adaptation Investment',target:HOMELAND}]; runSeason(false)`);
  assert.equal(b.json(`eng.state.ops.filter(o=>o.owner==='player'&&o.t===5&&o.cap==='Adaptation Investment').length`),1);
  assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
});
test('orders armed mid-review wait for the next review instead of vanishing',async()=>{
  const g=consoleGame();
  await g.run(`(async()=>{await runSeasonInner(false);await runSeasonInner(false)})()`);   // interrupted after two seasons
  assert.equal(g.json('t'),2);
  await g.run(`slots=[{cap:'Cloud Seeding',target:HOMELAND}]; runSeason(false)`);
  assert.equal(g.json('t'),4);assert.equal(g.json('slots.length'),1);
  await g.run(`runSeason(false)`);
  assert.equal(g.json(`eng.state.ops.filter(o=>o.owner==='player'&&o.t===5).length`),1);
  assert.deepEqual(g.errors,[]);
});
test('a live earmark stands up a wing the chest cannot carry, through the tray',async()=>{
  const g=consoleGame();
  await g.run(`(async()=>{while(running&&!(flagship&&earmarkCovers('ENSO Forcing'))&&t<260){
    slots=[{cap:'Cloud Seeding',target:REG[lastRow()?lastRow().anomalies.indexOf(Math.min(...lastRow().anomalies)):0].name}];await runSeason(false)}})()`);
  assert.ok(g.json('!!flagship'),'the 1990 earmark is live');
  g.run(`lastRow().treasury=70`);          // a lean programme: the chest cannot carry the wing on its own
  const ws=g.json(`eng.wingStatus('ENSO Forcing')`);
  assert.equal(ws.online,false);assert.equal(ws.canStand,false,'the chest alone cannot stand it up');
  g.run(`slots=[]; toolClick(CAPS.find(c=>c.name==='ENSO Forcing'))`);      // a driver aims itself at its ocean
  assert.equal(g.json(`slots.filter(s=>s.cap==='ENSO Forcing').length`),1,'the tray arms the earmarked wing');
  const tBefore=g.json('t');
  await g.run(`toolClick(CAPS.find(c=>c.name==='ENSO Forcing'))`);          // a second demonstration is refused
  assert.equal(g.json(`slots.filter(s=>s.cap==='ENSO Forcing').length`),1);
  await g.run('runSeason(false)');
  assert.equal(g.json(`eng.wingStatus('ENSO Forcing').online`),true);
  assert.equal(g.json(`eng.state.ops.filter(o=>o.owner==='player'&&o.cap==='ENSO Forcing'&&o.t===${tBefore+1}).length`),1);
  assert.deepEqual(g.errors,[]);
});
test('containment is capped by what the whole review can carry',()=>{
  const g=consoleGame();
  assert.equal(g.json('nextBatch()'),4);
  const cap=g.json(`(clampContainment(), +$("containment").max)`);
  assert.equal(cap,Math.min(40,Math.floor(g.json('spendable()')/4)));
  g.run(`$("containment").value="40"; clampContainment()`);
  assert.ok(g.json(`+$("containment").value*4<=spendable()`));
  assert.deepEqual(g.errors,[]);
});

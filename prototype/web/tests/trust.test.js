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

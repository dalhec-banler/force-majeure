const { createEngine } = require('./engine.js');
const MODEL = require('./model-data.json');
const script = JSON.parse(process.argv[2] || '{}');
const eng = createEngine(MODEL);
const out = [];
for (let t = 1; t <= 40; t++) {
  const cmd = script[t] || {};
  const r = eng.resolve(t, cmd);
  out.push([t, r.anomalies[5], r.anomalies[6], r.price, r.treasury, r.mandate, r.dossier, r.status]);
}
console.log(JSON.stringify(out));

const fs = require('fs');
const orch = fs.readFileSync('orchestrate.js', 'utf8');

const idx = orch.indexOf('FASE 6');
console.log(orch.substring(idx, idx + 1500));

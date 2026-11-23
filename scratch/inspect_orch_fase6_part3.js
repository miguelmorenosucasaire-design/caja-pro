const fs = require('fs');
const orch = fs.readFileSync('orchestrate.js', 'utf8');

const idx = orch.indexOf('FASE 6');
console.log(orch.substring(idx + 3500, idx + 5500));

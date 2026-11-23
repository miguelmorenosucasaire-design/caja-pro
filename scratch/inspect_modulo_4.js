const fs = require('fs');
const content = fs.readFileSync('tests/run_100_percent_tests.js', 'utf8');
const lines = content.split('\n');

const idx = lines.findIndex(l => l.includes('MÓDULO 4'));
console.log(lines.slice(idx, idx + 100).join('\n'));

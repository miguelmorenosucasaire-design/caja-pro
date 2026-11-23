const fs = require('fs');
const content = fs.readFileSync('tests/run_100_percent_tests.js', 'utf8');

const lines = content.split('\n');
lines.filter(l => l.includes('ESTUDIANTES') || l.includes('filasEst')).forEach(l => console.log(l));

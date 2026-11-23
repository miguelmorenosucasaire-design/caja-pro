const fs = require('fs');
const content = fs.readFileSync('tests/run_100_percent_tests.js', 'utf8');
const lines = content.split('\n');
lines.filter(l => l.includes('estudiantes') || l.includes('alumnos')).forEach(l => console.log(l));

const fs = require('fs');
const content = fs.readFileSync('tests/run_100_percent_tests.js', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(200, 255).join('\n'));

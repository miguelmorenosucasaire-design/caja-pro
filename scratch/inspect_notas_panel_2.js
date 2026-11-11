const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

console.log('--- Lines 2300 to 2370 ---');
console.log(lines.slice(2300, 2370).join('\n'));

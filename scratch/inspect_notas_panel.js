const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

console.log('--- Lines 2240 to 2300 ---');
console.log(lines.slice(2240, 2300).join('\n'));

const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

console.log('--- Lines 2040 to 2100 ---');
console.log(lines.slice(2040, 2100).join('\n'));

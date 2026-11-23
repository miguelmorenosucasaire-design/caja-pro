const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

console.log('--- Lines 3050-3110 ---');
console.log(lines.slice(3050, 3110).join('\n'));

console.log('--- Lines 3170-3250 ---');
console.log(lines.slice(3170, 3250).join('\n'));

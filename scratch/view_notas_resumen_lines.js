const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');
const lines = s.split('\n');
console.log('--- Lines 4825-4840 ---');
console.log(lines.slice(4825, 4840).join('\n'));
console.log('--- Lines 4890-4905 ---');
console.log(lines.slice(4890, 4905).join('\n'));
console.log('--- Lines 5065-5075 ---');
console.log(lines.slice(5065, 5075).join('\n'));

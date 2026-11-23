const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');

const lines = content.split('\n');
console.log('--- Lines 2375-2420 ---');
console.log(lines.slice(2374, 2430).join('\n'));

const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');

const lines = content.split('\n');
console.log('--- Lines 1820-1880 ---');
console.log(lines.slice(1819, 1880).join('\n'));

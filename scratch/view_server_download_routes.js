const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');
const lines = s.split('\n');
console.log('--- Lines 895 to 940 in server.js ---');
console.log(lines.slice(895, 940).join('\n'));

const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');
const lines = s.split('\n');
const start = lines.findIndex(l => l.includes('/detalle'));
console.log('Line in server.js:', start);
console.log(lines.slice(start - 5, start + 45).join('\n'));

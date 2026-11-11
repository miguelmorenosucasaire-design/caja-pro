const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');
const lines = s.split('\n');
const start = lines.findIndex(l => l.includes("pathname === '/api/grupos'") || l.includes("pathname.startsWith('/api/grupos'"));
console.log('Line in server.js:', start);
console.log(lines.slice(start, start + 40).join('\n'));

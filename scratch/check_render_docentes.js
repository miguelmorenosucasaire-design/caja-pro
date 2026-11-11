const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');
const lines = s.split('\n');
const start = lines.findIndex(l => l.includes('function renderDocentes'));
console.log('Line in index.html:', start);
console.log(lines.slice(start, start + 50).join('\n'));

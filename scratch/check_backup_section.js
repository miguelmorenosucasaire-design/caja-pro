const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');
const lines = s.split('\n');
const start = lines.findIndex(l => l.includes('id="section-backup"'));
console.log(lines.slice(start, start + 80).join('\n'));

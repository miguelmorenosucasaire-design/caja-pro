const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');
const lines = s.split('\n');
console.log(lines.slice(4020, 4100).join('\n'));

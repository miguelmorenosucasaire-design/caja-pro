const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');
const lines = s.split('\n');
console.log(lines.slice(6405, 6465).join('\n'));

const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');
const lines = s.split('\n');
console.log(lines.slice(4540, 4590).join('\n'));

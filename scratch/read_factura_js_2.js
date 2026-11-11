const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

console.log(lines.slice(4380, 4460).join('\n'));

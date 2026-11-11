const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');
console.log(lines.slice(2050, 2180).join('\n'));

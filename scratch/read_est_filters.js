const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

console.log(lines.slice(1345, 1385).join('\n'));

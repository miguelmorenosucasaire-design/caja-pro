const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');
console.log(lines.slice(2230, 2290).join('\n'));

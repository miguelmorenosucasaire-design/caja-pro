const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

console.log(lines.slice(6485, 6535).join('\n'));

const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(3170, 3350).join('\n'));

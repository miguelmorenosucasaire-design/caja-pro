const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(3070, 3110).join('\n'));

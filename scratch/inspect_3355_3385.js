const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

console.log(lines.slice(3355, 3385).join('\n'));

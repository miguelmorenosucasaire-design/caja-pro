const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8').replace(/\r\n/g, '\n');
const lines = content.split('\n');
console.log(lines.slice(6935, 6965).join('\n'));

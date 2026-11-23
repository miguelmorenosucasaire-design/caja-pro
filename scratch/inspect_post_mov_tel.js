const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');

const lines = content.split('\n');
console.log(lines.slice(1620, 1680).join('\n'));

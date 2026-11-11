const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');

console.log(lines.slice(1780, 1835).join('\n'));

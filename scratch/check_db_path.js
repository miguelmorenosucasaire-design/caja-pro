const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');
const lines = content.split('\n');
lines.slice(0, 30).forEach((l, i) => console.log(i + 1, l));

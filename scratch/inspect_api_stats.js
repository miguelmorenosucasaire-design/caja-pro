const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');

const idx = code.indexOf('/api/stats');
console.log(code.substring(idx, idx + 2500));

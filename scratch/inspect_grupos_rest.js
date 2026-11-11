const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');

const idx = code.indexOf('/api/grupos');
console.log(code.substring(idx + 1000, idx + 2500));

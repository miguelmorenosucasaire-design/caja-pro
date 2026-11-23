const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const idx = code.indexOf('CAJA_DIARIO');
console.log(code.slice(idx - 200, idx + 1500));

const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

const idx = s.indexOf('function generarRespaldoCompleto');
console.log(s.slice(idx, idx + 600));

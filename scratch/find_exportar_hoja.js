const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const idx = code.indexOf('/api/exportar/hoja');
console.log(code.slice(idx, idx + 2000));

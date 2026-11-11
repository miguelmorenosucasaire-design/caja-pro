const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');

const idx = code.indexOf('/api/exportar');
console.log(code.substring(idx, idx + 1500));

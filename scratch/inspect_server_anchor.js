const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');
const idx = s.indexOf('// 3. API: SISTEMA DE RESPALDOS');
console.log('Index:', idx);
console.log(s.substring(idx - 200, idx + 200));

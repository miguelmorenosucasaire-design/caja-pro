const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const idx = code.indexOf('// 3. Hoja ESTUDIANTES');
console.log(code.slice(idx, idx + 1000));

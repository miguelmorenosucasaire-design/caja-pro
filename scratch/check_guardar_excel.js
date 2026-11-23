const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const idx = code.indexOf('function guardarLibroExcelEnDisco');
console.log(code.slice(idx, idx + 1500));

const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');

const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('function guardarLibroExcelEnDisco'));
console.log('guardarLibroExcelEnDisco at line', idx + 1);
console.log(lines.slice(idx, idx + 80).join('\n'));

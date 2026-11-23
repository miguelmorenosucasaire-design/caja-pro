const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');

const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('function generarLibroExcelActualizado'));
console.log('generarLibroExcelActualizado at line', idx + 1);
console.log(lines.slice(idx, idx + 60).join('\n'));

const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

const start = lines.findIndex(l => l.includes('id="contenedor-impresion-factura"'));
const end = lines.findIndex(l => l.includes('id="factura-vista-pdf-iframe"'));

console.log(`From line ${start + 1} to ${end + 1}`);
console.log(lines.slice(start, start + 120).join('\n'));

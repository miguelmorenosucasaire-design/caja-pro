const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

const start = lines.findIndex(l => l.includes('id="contenedor-impresion-factura"'));
const end = lines.findIndex(l => l.includes('<!-- PANEL LATERAL DERECHO'));
console.log('Start:', start, 'End:', end);
console.log(lines.slice(start, start + 70).join('\n'));

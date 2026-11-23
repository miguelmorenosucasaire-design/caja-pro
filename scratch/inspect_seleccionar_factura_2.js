const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

const idx = lines.findIndex(l => l.includes('function seleccionarFacturaRecibo'));
console.log(lines.slice(idx + 100, idx + 180).join('\n'));

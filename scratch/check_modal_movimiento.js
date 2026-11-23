const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('Registrar Movimiento en Caja') || l.includes('id="modal-movimiento"'));
console.log('Modal line:', idx + 1);
console.log(lines.slice(idx, idx + 100).join('\n'));

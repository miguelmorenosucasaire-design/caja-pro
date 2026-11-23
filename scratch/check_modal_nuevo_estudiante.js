const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('modal-nuevo-estudiante') || l.includes('Modal: Nuevo Estudiante'));
console.log('Modal line:', idx + 1);
console.log(lines.slice(idx, idx + 80).join('\n'));

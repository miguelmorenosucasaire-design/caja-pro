const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('function actualizarPrevisualizadorPDF') || l.includes('async function actualizarPrevisualizadorPDF'));
console.log('actualizarPrevisualizadorPDF line:', idx + 1);
console.log(lines.slice(idx, idx + 40).join('\n'));

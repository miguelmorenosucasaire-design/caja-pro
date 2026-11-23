const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('function generarBlobPDF') || l.includes('async function generarBlobPDF'));
console.log('generarBlobPDF line:', idx + 1);
if (idx !== -1) {
    console.log(lines.slice(idx, idx + 60).join('\n'));
}

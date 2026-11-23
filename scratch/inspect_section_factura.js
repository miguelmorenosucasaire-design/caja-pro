const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('id="section-factura"'));
console.log('section-factura HTML line:', idx + 1);
if (idx !== -1) {
    console.log(lines.slice(idx, idx + 80).join('\n'));
}

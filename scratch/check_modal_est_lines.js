const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
    if (l.includes('modal-nuevo-estudiante') && !l.includes('factura')) {
        console.log(`Line ${i+1}: ${l}`);
    }
});

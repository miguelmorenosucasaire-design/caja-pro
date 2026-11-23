const fs = require('fs');
const content = fs.readFileSync('templates/index.html.bak_recibo', 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
    if (l.includes('factura-dni') || l.includes('factura-telefono')) {
        console.log(`Line ${i+1}: ${l}`);
    }
});

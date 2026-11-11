const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');
const lines = s.split('\n');

lines.forEach((l, idx) => {
    if (l.includes('imprimirFactura') || l.includes('contenedor-comprobante-oficial')) {
        console.log(`${idx + 1}: ${l.trim()}`);
    }
});

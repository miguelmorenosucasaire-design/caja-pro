const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const b3Idx = content.indexOf('Bloque 3: Parámetros de Facturación y Comprobantes');
console.log('Bloque 3 at:', b3Idx);
if (b3Idx !== -1) {
    console.log(content.slice(b3Idx, b3Idx + 3000));
}

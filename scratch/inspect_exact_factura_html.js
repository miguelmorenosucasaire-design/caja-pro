const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx1 = 234079;
console.log('=== SECCION FACTURA ORIGINAL ===');
console.log(html.substring(idx1 - 120, idx1 + 180));

const idx2 = 241294;
console.log('=== SECCION FACTURA COPIA ===');
console.log(html.substring(idx2 - 120, idx2 + 180));

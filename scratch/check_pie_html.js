const fs = require('fs');
const html = fs.readFileSync('scratch/test_print_page.html', 'utf8');

const idx1 = html.indexOf('id="contenedor-comprobante-oficial"');
console.log('--- Top voucher pie & closing ---');
console.log(html.substring(idx1 + 2200, idx1 + 3200));

const idx2 = html.indexOf('id="contenedor-comprobante-copia"');
console.log('--- Bottom voucher pie & closing ---');
console.log(html.substring(idx2 + 2200, idx2 + 3200));

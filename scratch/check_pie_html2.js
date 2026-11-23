const fs = require('fs');
const html = fs.readFileSync('scratch/test_print_page.html', 'utf8');

const idx1 = html.indexOf('id="contenedor-comprobante-oficial"');
console.log('--- Top voucher pie & closing ---');
console.log(html.substring(idx1 + 3000, idx1 + 4500));

const idx2 = html.indexOf('id="contenedor-comprobante-copia"');
console.log('--- Bottom voucher pie & closing ---');
console.log(html.substring(idx2 + 3000, idx2 + 4500));

const fs = require('fs');
const { execSync } = require('child_process');

// Run headless edge to get computed styles or inspect element positions
const html = fs.readFileSync('scratch/test_print_page.html', 'utf8');

// Check line 2994 vs line 3098
console.log('Top voucher tarjeta definition:');
const idx1 = html.indexOf('id="contenedor-comprobante-oficial"');
console.log(html.substring(idx1 + 650, idx1 + 1800));

console.log('Bottom voucher tarjeta definition:');
const idx2 = html.indexOf('id="contenedor-comprobante-copia"');
console.log(html.substring(idx2 + 650, idx2 + 1800));

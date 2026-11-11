const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('1. Has btn-estilo-combinado:', html.includes('id="btn-estilo-combinado"'));
console.log('2. Has voucher-estilo-azul on copia:', html.includes('id="contenedor-comprobante-copia" class="voucher-media-carta voucher-estilo-azul'));
console.log('3. Has setEstiloVoucher combined:', html.includes("estilo === 'combinado'"));
console.log('4. Media print single page fit:', html.includes('max-height: 12mm') && html.includes('gap: 1.5mm'));

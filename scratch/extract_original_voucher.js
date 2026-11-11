const fs = require('fs');
const c = fs.readFileSync('scratch/apply_voucher_update.js', 'utf8');
const target = 'id="contenedor-comprobante-oficial"';
const idx = c.indexOf(target);
console.log('Found at:', idx);
const endMarker = '<!-- COLUMNA LATERAL (xl:col-span-4): SECCIÓN AHÍ MISMO PARA EDITAR NOTAS -->';
const endIdx = c.indexOf(endMarker);
console.log('End at:', endIdx);
console.log(c.substring(idx - 100, endIdx));

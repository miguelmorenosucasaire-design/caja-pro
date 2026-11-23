const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('=== 1. DEUDORES ===');
let idx = html.indexOf('id="section-deudores"');
if (idx !== -1) {
  console.log(html.substring(idx, idx + 800));
}

console.log('=== 2. CALENDARIO DIARIO ===');
idx = html.indexOf('diario-cal-dias-container');
if (idx !== -1) {
  console.log(html.substring(idx - 200, idx + 800));
}

console.log('=== 3. CONCEPTO MODAL ===');
idx = html.indexOf('form-concepto');
if (idx !== -1) {
  console.log(html.substring(idx - 100, idx + 800));
}

console.log('=== 4. BOTONES MODULO Y NOTAS BOLETA ===');
idx = html.indexOf('+ Módulo I');
if (idx !== -1) {
  console.log(html.substring(idx - 100, idx + 800));
}

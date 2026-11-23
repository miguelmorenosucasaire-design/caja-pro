const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function abrirModalConMovimiento');
const sub = html.substring(idx, idx + 2500);
console.log(sub.substring(sub.indexOf('form-estado') - 20, sub.indexOf('actualizarBoletaModalEnVivo') + 60));

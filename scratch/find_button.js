const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('Ver Boletas y Plantilla Completa');
console.log('Index:', idx);
if (idx !== -1) {
    console.log(html.substring(idx - 100, idx + 400));
}

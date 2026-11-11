const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function seleccionarFacturaRecibo');
console.log(html.substring(idx + 3500, idx + 5500));

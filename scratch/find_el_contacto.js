const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('const elContacto = document.getElementById(\'factura-contacto-row\');');
console.log('Index:', idx);
console.log(html.substring(idx - 400, idx + 1000));

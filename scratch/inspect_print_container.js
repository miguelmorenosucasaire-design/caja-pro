const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const target = 'id="contenedor-impresion-factura"';
const idx = html.indexOf(target);
console.log('Index:', idx);
console.log(html.substring(idx - 50, idx + 1000));
